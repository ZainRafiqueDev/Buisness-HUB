"use client";

import { useEffect, useRef, useState } from "react";
import type { AssistantAction, Business, Item } from "@/lib/businesses";
import type { AssistantReply } from "@/lib/assistant";
import { act, fmtSlot, getState, loadVisitor, money, saveVisitor } from "@/lib/client";
import type { Lead } from "@/lib/types";

type Msg =
  | { from: "user"; text: string }
  | { from: "bot"; text: string; source?: string; actions?: AssistantAction[]; slots?: string[] };

export default function ChatWidget({ biz, onBuy }: { biz: Business; onBuy: (i: Item) => void }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: `Hi! I'm the ${biz.name} assistant. Ask me anything about ${biz.industry.toLowerCase()}, prices or booking.` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setBusy(true);
    try {
      const r = await act<AssistantReply>(biz.id, "chat", { message: text, leadId: loadVisitor(biz.id).leadId });
      const slots = r.actions.some((a) => a.type === "offer_booking") ? (await getState(biz.id)).slots.slice(0, 4) : undefined;
      setMsgs((m) => [...m, { from: "bot", text: r.reply, source: r.source, actions: r.actions, slots }]);
    } catch {
      setMsgs((m) => [...m, { from: "bot", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-xl hover:brightness-110"
      >
        {open ? "✕ Close chat" : "💬 Chat with us"}
      </button>
      {open && (
        <div className="card fixed bottom-24 right-6 z-40 flex h-[min(620px,calc(100vh-8rem))] w-[min(420px,calc(100vw-3rem))] flex-col overflow-hidden shadow-2xl">
          <div className="flex items-center gap-3 bg-accent px-5 py-4 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-lg font-bold">{biz.initial}</span>
            <div>
              <div className="font-semibold">{biz.name}</div>
              <div className="text-sm text-white/80">Typically replies instantly</div>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto bg-stone-50 p-5">
            {msgs.map((m, i) =>
              m.from === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[15px] text-white">
                  {m.text}
                </div>
              ) : (
                <BotMessage key={i} biz={biz} msg={m} onBuy={onBuy} />
              ),
            )}
            {busy && <div className="text-sm text-stone-500">Typing…</div>}
            {msgs.length === 1 && (
              <div className="flex flex-col items-start gap-2">
                {biz.starters.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-stone-300 bg-white px-4 py-1.5 text-[15px] hover:border-accent">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={end} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-stone-200 bg-white p-3"
          >
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question…" />
            <button className="btn" disabled={busy}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}

function BotMessage({ biz, msg, onBuy }: { biz: Business; msg: Extract<Msg, { from: "bot" }>; onBuy: (i: Item) => void }) {
  const capture = msg.actions?.find((a) => a.type === "capture_lead");
  const rec = msg.actions?.find((a) => a.type === "recommend");
  const item = rec ? biz.catalog.find((c) => c.sku === rec.sku) : undefined;
  return (
    <div className="max-w-[92%] space-y-2">
      <div className="rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[15px] shadow-sm">{msg.text}</div>
      {msg.source && <div className="pl-1 text-xs text-stone-500">Source: {msg.source}</div>}
      {item && (
        <button onClick={() => onBuy(item)} className="block w-full rounded-xl border border-stone-200 bg-white p-3 text-left text-[15px] hover:border-accent">
          <span className="font-semibold">{item.title}</span> · {money(item.price)}
          <span className="block text-sm text-accent">View and buy →</span>
        </button>
      )}
      {msg.slots && <SlotPicker biz={biz} slots={msg.slots} />}
      {capture && <InlineCapture biz={biz} interest={capture.interest} />}
    </div>
  );
}

function SlotPicker({ biz, slots }: { biz: Business; slots: string[] }) {
  const [picked, setPicked] = useState<string>();
  const [done, setDone] = useState("");
  const [v, setV] = useState(() => loadVisitor(biz.id));
  const [err, setErr] = useState("");
  const svc = biz.services[0];

  async function book() {
    try {
      const b = await act<{ leadId: string }>(biz.id, "book", { ...v, slot: picked, service: svc.id, consent: true });
      saveVisitor(biz.id, { ...v, leadId: b.leadId });
      setDone(`You're booked for ${fmtSlot(picked!)}. Confirmation sent to ${v.email}.`);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  if (done) return <div className="rounded-xl bg-emerald-50 p-3 text-[15px] text-emerald-900">✓ {done}</div>;
  return (
    <div className="space-y-2.5 rounded-xl border border-stone-200 bg-white p-3">
      <div className="text-sm font-semibold">{svc.title}</div>
      <div className="grid grid-cols-2 gap-1.5">
        {slots.map((s) => (
          <button
            key={s}
            onClick={() => setPicked(s)}
            className={`rounded-lg border px-2 py-1.5 text-sm ${picked === s ? "border-accent bg-accent text-white" : "border-stone-300 hover:border-accent"}`}
          >
            {fmtSlot(s)}
          </button>
        ))}
      </div>
      {picked && (
        <div className="space-y-2">
          <input className="input" placeholder="Your name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
          <input className="input" placeholder="Email address" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
          {err && <div className="text-sm text-red-700">{err}</div>}
          <button className="btn w-full" onClick={book}>Confirm booking</button>
        </div>
      )}
    </div>
  );
}

function InlineCapture({ biz, interest }: { biz: Business; interest: string }) {
  const [v, setV] = useState(() => loadVisitor(biz.id));
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const lead = await act<Lead>(biz.id, "lead", { ...v, interest, source: "ai assistant", consent });
      saveVisitor(biz.id, { ...v, leadId: lead.id });
      setDone(true);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  if (done) return <div className="rounded-xl bg-emerald-50 p-3 text-[15px] text-emerald-900">✓ Thanks! We&apos;ll be in touch by email.</div>;
  return (
    <form onSubmit={submit} className="space-y-2 rounded-xl border border-stone-200 bg-white p-3">
      <div className="text-sm text-stone-700">
        {interest === "question" ? "Where should the team reply?" : "Want a personal recommendation by email?"}
      </div>
      <input className="input" placeholder="Your name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      <input className="input" placeholder="Email address" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
      <label className="flex items-start gap-2 text-sm text-stone-600">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        Also send me helpful tips and offers.
      </label>
      {err && <div className="text-sm text-red-700">{err}</div>}
      <button className="btn w-full">Send</button>
    </form>
  );
}

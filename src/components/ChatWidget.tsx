"use client";

import { useEffect, useRef, useState } from "react";
import { CATALOG } from "@/lib/catalog";
import type { AssistantAction, AssistantReply } from "@/lib/assistant";
import { fmtSlot, getState, loadVisitor, post, saveVisitor } from "@/lib/client";
import type { Lead } from "@/lib/types";

type Msg =
  | { from: "user"; text: string }
  | { from: "bot"; text: string; source?: string; actions?: AssistantAction[]; slots?: string[] };

const STARTERS = ["Which course is right for me?", "How much is coaching?", "Can I book a call this week?"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: "Hi! I'm the Northlight assistant. Ask me about coaching, courses, pricing or booking." },
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
      const r = await post<AssistantReply>("/api/chat", { message: text, leadId: loadVisitor().leadId });
      const slots = r.actions.some((a) => a.type === "offer_booking") ? (await getState()).slots.slice(0, 3) : undefined;
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
        className="fixed bottom-5 right-5 z-40 rounded-full bg-emerald-700 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-emerald-800"
      >
        {open ? "Close" : "💬 Ask Northlight"}
      </button>
      {open && (
        <div className="card fixed bottom-20 right-5 z-40 flex h-[560px] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden">
          <div className="border-b border-stone-200 bg-stone-900 px-4 py-3 text-white">
            <div className="text-sm font-semibold">Northlight assistant</div>
            <div className="text-xs text-stone-300">Answers from approved business content · hands off when unsure</div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) =>
              m.from === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-emerald-700 px-3 py-2 text-sm text-white">
                  {m.text}
                </div>
              ) : (
                <BotMessage key={i} msg={m} />
              ),
            )}
            {busy && <div className="text-xs text-stone-400">Assistant is typing…</div>}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-stone-300 px-3 py-1 text-xs hover:bg-stone-50">
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
            className="flex gap-2 border-t border-stone-200 p-3"
          >
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a question…" />
            <button className="btn" disabled={busy}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function BotMessage({ msg }: { msg: Extract<Msg, { from: "bot" }> }) {
  const capture = msg.actions?.find((a) => a.type === "capture_lead");
  const rec = msg.actions?.find((a) => a.type === "recommend");
  const item = rec ? CATALOG.find((c) => c.sku === rec.sku) : undefined;
  return (
    <div className="max-w-[90%] space-y-2">
      <div className="rounded-2xl rounded-bl-sm bg-stone-100 px-3 py-2 text-sm">{msg.text}</div>
      {msg.source && <div className="text-[11px] text-stone-400">Source: {msg.source}</div>}
      {item && (
        <a href="#shop" className="block rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-xs">
          <span className="font-medium">{item.title}</span> · ${item.price} → view
        </a>
      )}
      {msg.slots && <SlotPicker slots={msg.slots} />}
      {capture && <InlineCapture interest={capture.interest} />}
    </div>
  );
}

function SlotPicker({ slots }: { slots: string[] }) {
  const [picked, setPicked] = useState<string>();
  const [done, setDone] = useState("");
  const [v, setV] = useState(loadVisitor);
  const [err, setErr] = useState("");

  async function book() {
    try {
      const b = await post<{ leadId: string }>("/api/bookings", { ...v, slot: picked, service: "discovery", consent: true });
      setDone(`Booked: ${fmtSlot(picked!)}. A confirmation is on its way to ${v.email}.`);
      saveVisitor({ ...v, leadId: b.leadId });
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  if (done) return <div className="rounded-xl bg-emerald-50 p-2 text-xs text-emerald-800">✓ {done}</div>;
  return (
    <div className="space-y-2 rounded-xl border border-stone-200 p-2">
      <div className="flex flex-wrap gap-1.5">
        {slots.map((s) => (
          <button
            key={s}
            onClick={() => setPicked(s)}
            className={`rounded-lg border px-2 py-1 text-xs ${picked === s ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-300"}`}
          >
            {fmtSlot(s)}
          </button>
        ))}
      </div>
      {picked && (
        <div className="space-y-1.5">
          <input className="input" placeholder="Name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
          <input className="input" placeholder="Email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
          {err && <div className="text-xs text-red-600">{err}</div>}
          <button className="btn w-full" onClick={book}>
            Book free discovery call
          </button>
        </div>
      )}
    </div>
  );
}

function InlineCapture({ interest }: { interest: string }) {
  const [v, setV] = useState(loadVisitor);
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const lead = await post<Lead>("/api/leads", { ...v, interest, source: "ai assistant", consent });
      saveVisitor({ ...v, leadId: lead.id });
      setDone(true);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  if (done) return <div className="rounded-xl bg-emerald-50 p-2 text-xs text-emerald-800">✓ Thanks! We&apos;ve saved your details.</div>;
  return (
    <form onSubmit={submit} className="space-y-1.5 rounded-xl border border-stone-200 p-2">
      <div className="text-xs text-stone-600">Want a personal recommendation by email?</div>
      <input className="input" placeholder="Name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      <input className="input" placeholder="Email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
      <label className="flex items-start gap-2 text-[11px] text-stone-500">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        Yes, send me helpful emails. I can unsubscribe anytime.
      </label>
      {err && <div className="text-xs text-red-600">{err}</div>}
      <button className="btn w-full">Send it to me</button>
    </form>
  );
}

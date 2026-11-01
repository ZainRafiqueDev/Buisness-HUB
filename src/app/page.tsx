"use client";

import { useEffect, useState } from "react";
import ChatWidget from "@/components/ChatWidget";
import { BUSINESS, CATALOG, SERVICES } from "@/lib/catalog";
import { fmtSlot, getState, loadVisitor, post, saveVisitor, type Visitor } from "@/lib/client";
import type { Lead } from "@/lib/types";

export default function Home() {
  const [visitor, setVisitor] = useState<Visitor>({ name: "", email: "" });

  useEffect(() => {
    const sync = () => setVisitor(loadVisitor());
    sync();
    window.addEventListener("visitor", sync);
    return () => window.removeEventListener("visitor", sync);
  }, []);

  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-emerald-700">Coaching · Courses · Tools</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Plan calmer weeks. Focus on what matters.</h1>
          <p className="mt-4 text-lg text-stone-600">{BUSINESS.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#book" className="btn">Book a free discovery call</a>
            <a href="#shop" className="btn-ghost">Explore courses</a>
          </div>
        </div>
        <LeadMagnet visitor={visitor} />
      </section>

      <section id="book" className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold">Book a session</h2>
          <p className="mt-1 text-stone-600">Pick a time that suits you. Confirmation and reminders arrive by email.</p>
          <Booking visitor={visitor} />
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold">Courses & products</h2>
        <p className="mt-1 text-stone-600">Courses are delivered in the member area; the planner ships from our store.</p>
        <Shop visitor={visitor} />
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-xs text-stone-500">
        Northlight Coaching is a fictional business created for this demo.
      </footer>
      <ChatWidget />
    </main>
  );
}

function LeadMagnet({ visitor }: { visitor: Visitor }) {
  const [v, setV] = useState(visitor);
  const [consent, setConsent] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    setV(visitor);
  }, [visitor]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const lead = await post<Lead>("/api/leads", { ...v, interest: "checklist", source: "lead magnet", consent });
      saveVisitor({ ...v, leadId: lead.id });
      setMsg(`Sent! Check ${lead.email} for your Focus checklist.`);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-6">
      <div className="text-xs font-medium uppercase tracking-wide text-stone-500">Free download</div>
      <h3 className="text-xl font-semibold">The 10-minute Weekly Focus Checklist</h3>
      <p className="text-sm text-stone-600">The same checklist our clients use every Monday morning.</p>
      <input className="input" placeholder="First name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      <input className="input" placeholder="Email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
      <label className="flex items-start gap-2 text-xs text-stone-500">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        Send me the checklist and occasional helpful emails. Unsubscribe anytime.
      </label>
      {err && <div className="text-sm text-red-600">{err}</div>}
      {msg ? <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">✓ {msg}</div> : <button className="btn w-full">Get the checklist</button>}
    </form>
  );
}

function Booking({ visitor }: { visitor: Visitor }) {
  const [slots, setSlots] = useState<string[]>([]);
  const [service, setService] = useState(SERVICES[0].id);
  const [slot, setSlot] = useState<string>();
  const [v, setV] = useState(visitor);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    setV(visitor);
  }, [visitor]);
  useEffect(() => {
    getState().then((s) => setSlots(s.slots));
  }, [msg]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const b = await post<{ leadId: string }>("/api/bookings", { ...v, slot, service, consent: true });
      saveVisitor({ ...v, leadId: b.leadId });
      setMsg(`Booked for ${fmtSlot(slot!)}. Confirmation sent to ${v.email}.`);
      setSlot(undefined);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setService(s.id)}
              className={`rounded-lg border px-3 py-2 text-sm ${service === s.id ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-stone-300"}`}
            >
              {s.title} · {s.price ? `$${s.price}` : "Free"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.slice(0, 12).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setSlot(s)}
              className={`rounded-lg border px-3 py-2 text-sm ${slot === s ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-300 hover:bg-stone-50"}`}
            >
              {fmtSlot(s)}
            </button>
          ))}
        </div>
      </div>
      <div className="card space-y-3 p-5">
        <div className="text-sm text-stone-600">{slot ? `Selected: ${fmtSlot(slot)}` : "Choose a time on the left"}</div>
        <input className="input" placeholder="Name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        <input className="input" placeholder="Email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        {err && <div className="text-sm text-red-600">{err}</div>}
        {msg && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">✓ {msg}</div>}
        <button className="btn w-full" disabled={!slot}>Confirm booking</button>
      </div>
    </form>
  );
}

function Shop({ visitor }: { visitor: Visitor }) {
  const [checkout, setCheckout] = useState<(typeof CATALOG)[number]>();
  const [v, setV] = useState(visitor);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    setV(visitor);
  }, [visitor]);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const o = await post<{ id: string; leadId: string }>("/api/purchase", { ...v, sku: checkout!.sku });
      saveVisitor({ ...v, leadId: o.leadId });
      setMsg(
        checkout!.kind === "course"
          ? `Order ${o.id} paid. Course access is ready, login details sent to ${v.email}.`
          : `Order ${o.id} paid. We'll email tracking when it ships.`,
      );
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {CATALOG.map((c) => (
          <div key={c.sku} className="card flex flex-col p-5">
            <span className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${c.kind === "course" ? "bg-violet-100 text-violet-800" : "bg-sky-100 text-sky-800"}`}>
              {c.kind === "course" ? "Online course · Kajabi" : "Product · Shopify"}
            </span>
            <h3 className="mt-3 font-semibold">{c.title}</h3>
            <p className="mt-1 flex-1 text-sm text-stone-600">{c.blurb}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-semibold">${c.price}</span>
              <button className="btn" onClick={() => { setCheckout(c); setMsg(""); setErr(""); }}>
                {c.kind === "course" ? "Enroll" : "Buy"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {checkout && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setCheckout(undefined)}>
          <form onSubmit={pay} onClick={(e) => e.stopPropagation()} className="card w-full max-w-md space-y-3 p-6">
            <div className="text-xs font-medium uppercase tracking-wide text-stone-500">Checkout (simulated Shopify)</div>
            <div className="flex justify-between font-semibold">
              <span>{checkout.title}</span>
              <span>${checkout.price}</span>
            </div>
            {msg ? (
              <>
                <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">✓ {msg}</div>
                <button type="button" className="btn-ghost w-full" onClick={() => setCheckout(undefined)}>Close</button>
              </>
            ) : (
              <>
                <input className="input" placeholder="Name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
                <input className="input" placeholder="Email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
                <div className="rounded-lg border border-dashed border-stone-300 p-3 text-xs text-stone-500">
                  Payment step skipped in the demo. In production this is Shopify&apos;s hosted checkout, so card data never touches our site.
                </div>
                {err && <div className="text-sm text-red-600">{err}</div>}
                <button className="btn w-full">Pay ${checkout.price} (demo)</button>
              </>
            )}
          </form>
        </div>
      )}
    </>
  );
}

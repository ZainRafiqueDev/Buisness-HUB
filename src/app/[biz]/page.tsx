"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import ChatWidget from "@/components/ChatWidget";
import CountUp from "@/components/fx/CountUp";
import Reveal from "@/components/fx/Reveal";
import { getBusiness, type Business, type Item } from "@/lib/businesses";
import { act, fmtSlot, getState, money, saveVisitor, useVisitor, type Visitor } from "@/lib/client";
import type { Lead } from "@/lib/types";

export default function Site() {
  const { biz: id } = useParams<{ biz: string }>();
  const biz = getBusiness(id)!;
  const visitor = useVisitor(id);
  const [checkoutItem, setCheckoutItem] = useState<Item>();

  return (
    <main className="bg-white">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <a href="#top" className="flex items-center gap-2.5 text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white">{biz.initial}</span>
            {biz.name}
          </a>
          <nav className="hidden gap-6 text-[15px] font-medium text-stone-700 md:flex">
            <a href="#quiz" className="hover:text-accent">{biz.quiz.title.split(" ").slice(0, 3).join(" ")}</a>
            <a href="#book" className="hover:text-accent">Book</a>
            <a href="#shop" className="hover:text-accent">{biz.shop.title}</a>
            <a href="#faq" className="hover:text-accent">FAQ</a>
          </nav>
          <a href="#book" className="btn btn-sm">{biz.services[0].price ? "Book now" : biz.services[0].title}</a>
        </div>
      </header>

      <section id="top" className="bg-accent-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.15fr_1fr] md:py-20">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
            <motion.p variants={rise} className="label">{biz.hero.eyebrow}</motion.p>
            <motion.h1 variants={rise} className="mt-4 text-4xl font-bold md:text-[3.2rem]">{biz.hero.title}</motion.h1>
            <motion.p variants={rise} className="mt-5 text-xl text-stone-700">{biz.hero.sub}</motion.p>
            <motion.div variants={rise} className="mt-8 flex flex-wrap gap-3">
              <a href={biz.id === "ember" ? "#shop" : "#book"} className="btn">{biz.hero.primary}</a>
              <a href={biz.id === "ember" ? "#quiz" : "#shop"} className="btn-ghost">{biz.hero.secondary}</a>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <LeadMagnet biz={biz} visitor={visitor} />
          </motion.div>
        </div>
      </section>

      <section className="border-b border-stone-200">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-5 py-8 text-center">
          {biz.stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold md:text-3xl"><CountUp value={s.value} /></div>
              <div className="text-[15px] text-stone-600">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Quiz biz={biz} visitor={visitor} onBuy={setCheckoutItem} />

      <section id="book" className="bg-stone-50">
        <Reveal className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-3xl font-bold">{biz.booking.title}</h2>
          <p className="mt-2 text-lg text-stone-600">{biz.booking.text}</p>
          <Booking biz={biz} visitor={visitor} />
        </Reveal>
      </section>

      <section id="shop" className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <h2 className="text-3xl font-bold">{biz.shop.title}</h2>
          <p className="mt-2 text-lg text-stone-600">{biz.shop.text}</p>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {biz.catalog.map((item, i) => (
            <motion.div
              key={item.sku}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="card flex flex-col p-6 transition-shadow hover:shadow-xl"
            >
              <div className="grid h-36 place-items-center rounded-xl bg-accent-soft text-5xl font-bold text-accent/70">{item.title.charAt(0)}</div>
              <span className="mt-4 text-sm font-semibold text-accent">{item.badge}</span>
              <h3 className="mt-1 text-xl font-bold">{item.title}</h3>
              <p className="mt-2 flex-1 text-stone-600">{item.blurb}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {money(item.price)}
                  {item.kind === "membership" && <span className="text-base font-medium text-stone-500">/mo</span>}
                </span>
                <button className="btn" onClick={() => setCheckoutItem(item)}>
                  {item.kind === "course" ? "Enroll" : item.kind === "membership" ? "Join" : "Add to cart"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-stone-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-2">
          {biz.testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="rounded-2xl bg-white/5 p-7"
            >
              <div className="text-amber-300">★★★★★</div>
              <blockquote className="mt-3 text-xl leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-4 font-semibold text-stone-300">{t.name}</figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      <Reveal>
      <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-3xl font-bold">Frequently asked questions</h2>
        <div className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
          {biz.kb.slice(0, 5).map((d) => (
            <details key={d.title} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold">
                {d.title}
                <span className="text-2xl text-stone-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-stone-700">{d.answer.replace(/:$/, ".")}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-stone-600">Still have a question? Use the chat in the corner. It answers instantly.</p>
      </section>
      </Reveal>

      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-[15px] text-stone-600">
          <span className="font-semibold text-stone-800">{biz.name}</span>
          <span>© {new Date().getFullYear()} · Privacy · Terms</span>
        </div>
      </footer>

      {checkoutItem && <Checkout biz={biz} item={checkoutItem} visitor={visitor} onClose={() => setCheckoutItem(undefined)} />}
      <ChatWidget biz={biz} onBuy={setCheckoutItem} />
    </main>
  );
}

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

function ContactFields({ v, setV }: { v: Visitor; setV: (v: Visitor) => void }) {
  return (
    <>
      <input className="input" placeholder="Your name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      <input className="input" type="email" placeholder="Email address" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
    </>
  );
}

function useForm(visitor: Visitor) {
  const [v, setV] = useState(visitor);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setV(visitor);
  }, [visitor]);
  async function run(fn: () => Promise<void>) {
    setErr("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return { v, setV, err, busy, run };
}

const ErrorText = ({ msg }: { msg: string }) => (msg ? <p className="text-[15px] font-medium text-red-700">{msg}</p> : null);
const Success = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[15px] font-medium text-emerald-900">✓ {children}</div>
);

function LeadMagnet({ biz, visitor }: { biz: Business; visitor: Visitor }) {
  const f = useForm(visitor);
  const [consent, setConsent] = useState(true);
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        f.run(async () => {
          const lead = await act<Lead>(biz.id, "lead", { ...f.v, consent, source: "lead form", interest: "newsletter" });
          saveVisitor(biz.id, { ...f.v, leadId: lead.id });
          setDone(true);
        });
      }}
      className="card space-y-4 p-7"
    >
      <p className="label">{biz.leadMagnet.eyebrow}</p>
      <h2 className="text-2xl font-bold">{biz.leadMagnet.title}</h2>
      <p className="text-stone-600">{biz.leadMagnet.text}</p>
      {done ? (
        <Success>{biz.leadMagnet.success}</Success>
      ) : (
        <>
          <ContactFields v={f.v} setV={f.setV} />
          <label className="flex items-start gap-2.5 text-[15px] text-stone-600">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            Email me helpful tips and offers. Unsubscribe anytime.
          </label>
          <ErrorText msg={f.err} />
          <button className="btn w-full" disabled={f.busy}>{biz.leadMagnet.cta}</button>
        </>
      )}
    </form>
  );
}

function Quiz({ biz, visitor, onBuy }: { biz: Business; visitor: Visitor; onBuy: (i: Item) => void }) {
  const f = useForm(visitor);
  const [answer, setAnswer] = useState<string>();
  const [done, setDone] = useState(false);
  const result = answer ? biz.quiz.results[answer] : undefined;
  const item = result?.sku ? biz.catalog.find((c) => c.sku === result.sku) : undefined;

  return (
    <section id="quiz" className="mx-auto max-w-6xl px-5 py-16">
      <Reveal className="card grid gap-10 p-8 md:grid-cols-2 md:p-10">
        <div>
          <p className="label">Quick quiz</p>
          <h2 className="mt-2 text-3xl font-bold">{biz.quiz.title}</h2>
          <p className="mt-2 text-lg text-stone-600">{biz.quiz.text}</p>
          <p className="mt-6 text-lg font-semibold">{biz.quiz.question}</p>
          <div className="mt-3 space-y-2.5">
            {biz.quiz.options.map((o) => (
              <button
                key={o.result}
                onClick={() => {
                  setAnswer(o.result);
                  setDone(false);
                }}
                className={`w-full rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition ${answer === o.result ? "border-accent bg-accent-soft" : "border-stone-200 hover:border-stone-300"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-2xl bg-stone-50 p-7">
          {!result ? (
            <p className="text-center text-lg text-stone-500">Choose an answer to see your recommendation.</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                f.run(async () => {
                  const r = await act<{ lead: Lead }>(biz.id, "quiz", { ...f.v, consent: true, result: answer });
                  saveVisitor(biz.id, { ...f.v, leadId: r.lead.id });
                  setDone(true);
                });
              }}
              className="space-y-4"
            >
              <p className="label">We recommend</p>
              <h3 className="text-2xl font-bold">{result.label}</h3>
              <p className="text-lg text-stone-700">{result.text}</p>
              {done ? (
                <>
                  <Success>Your personalised plan is on its way by email.</Success>
                  {item ? (
                    <button type="button" className="btn w-full" onClick={() => onBuy(item)}>
                      Get {item.title} · {money(item.price)}
                    </button>
                  ) : (
                    <a href="#book" className="btn w-full">Book {result.label}</a>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[15px] text-stone-600">Where should we send your personalised plan?</p>
                  <ContactFields v={f.v} setV={f.setV} />
                  <ErrorText msg={f.err} />
                  <button className="btn w-full" disabled={f.busy}>Send my plan</button>
                </>
              )}
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}

function Booking({ biz, visitor }: { biz: Business; visitor: Visitor }) {
  const f = useForm(visitor);
  const [slots, setSlots] = useState<string[]>([]);
  const [service, setService] = useState(biz.services[0].id);
  const [slot, setSlot] = useState<string>();
  const [done, setDone] = useState("");
  const svc = biz.services.find((s) => s.id === service)!;

  useEffect(() => {
    getState(biz.id).then((s) => setSlots(s.slots));
  }, [biz.id, done]);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <p className="mb-3 font-semibold">1. Choose a service</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {biz.services.map((s) => (
            <button
              key={s.id}
              onClick={() => setService(s.id)}
              className={`rounded-xl border-2 bg-white p-4 text-left transition ${service === s.id ? "border-accent" : "border-stone-200 hover:border-stone-300"}`}
            >
              <div className="font-semibold">{s.title}</div>
              <div className="text-[15px] text-stone-600">
                {s.minutes} min · {s.price ? money(s.price) : "Free"}
                {s.deposit ? ` · ${money(s.deposit)} deposit` : ""}
              </div>
            </button>
          ))}
        </div>
        <p className="mb-3 mt-7 font-semibold">2. Pick a time</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {slots.slice(0, 12).map((s) => (
            <button
              key={s}
              onClick={() => setSlot(s)}
              className={`rounded-xl border-2 px-3 py-2.5 text-[15px] font-medium transition ${slot === s ? "border-accent bg-accent text-white" : "border-stone-200 bg-white hover:border-stone-300"}`}
            >
              {fmtSlot(s)}
            </button>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          f.run(async () => {
            const b = await act<{ leadId: string }>(biz.id, "book", { ...f.v, slot, service, consent: true });
            saveVisitor(biz.id, { ...f.v, leadId: b.leadId });
            setDone(`${svc.title} booked for ${fmtSlot(slot!)}. Confirmation sent to ${f.v.email}.`);
            setSlot(undefined);
          });
        }}
        className="card h-fit space-y-4 p-6"
      >
        <p className="font-semibold">3. Your details</p>
        <div className="rounded-xl bg-stone-50 p-4 text-[15px]">
          <div className="font-semibold">{svc.title}</div>
          <div className="text-stone-600">{slot ? fmtSlot(slot) : "No time selected yet"}</div>
          {svc.deposit ? <div className="mt-1 text-stone-600">Deposit due today: {money(svc.deposit)}</div> : null}
        </div>
        <ContactFields v={f.v} setV={f.setV} />
        <ErrorText msg={f.err} />
        {done && <Success>{done}</Success>}
        <button className="btn w-full" disabled={!slot || f.busy}>
          {svc.deposit ? `Pay ${money(svc.deposit)} deposit & book` : "Confirm booking"}
        </button>
      </form>
    </div>
  );
}

function Checkout({ biz, item, visitor, onClose }: { biz: Business; item: Item; visitor: Visitor; onClose: () => void }) {
  const f = useForm(visitor);
  const [checkoutId, setCheckoutId] = useState<string>();
  const [order, setOrder] = useState<string>();

  const message =
    item.kind === "course"
      ? `You're enrolled! Your login details are on their way to ${f.v.email}.`
      : item.kind === "membership"
        ? `Welcome aboard! Your membership is active and a receipt is on its way to ${f.v.email}.`
        : `Thank you! We'll email ${f.v.email} as soon as it ships.`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card w-full max-w-md p-7">
        <div className="flex items-center justify-between">
          <p className="label">Secure checkout</p>
          <button onClick={onClose} className="text-2xl leading-none text-stone-400 hover:text-stone-700" aria-label="Close">×</button>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4 rounded-xl bg-stone-50 p-4">
          <div>
            <div className="text-lg font-bold">{item.title}</div>
            <div className="text-[15px] text-stone-600">{item.badge}</div>
          </div>
          <div className="text-lg font-bold">
            {money(item.price)}
            {item.kind === "membership" && <span className="text-sm font-medium text-stone-500">/mo</span>}
          </div>
        </div>

        <div className="mt-5 flex gap-2 text-sm font-semibold">
          <span className={`flex-1 rounded-full py-1 text-center ${!checkoutId ? "bg-accent text-white" : "bg-stone-100 text-stone-500"}`}>1. Contact</span>
          <span className={`flex-1 rounded-full py-1 text-center ${checkoutId && !order ? "bg-accent text-white" : "bg-stone-100 text-stone-500"}`}>2. Payment</span>
          <span className={`flex-1 rounded-full py-1 text-center ${order ? "bg-accent text-white" : "bg-stone-100 text-stone-500"}`}>3. Done</span>
        </div>

        <div className="mt-5 space-y-4">
          {order ? (
            <>
              <Success>
                Order {order} confirmed. {message}
              </Success>
              <button className="btn-ghost w-full" onClick={onClose}>Continue browsing</button>
            </>
          ) : !checkoutId ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                f.run(async () => {
                  const co = await act<{ id: string; leadId: string }>(biz.id, "checkout", { ...f.v, sku: item.sku });
                  saveVisitor(biz.id, { ...f.v, leadId: co.leadId });
                  setCheckoutId(co.id);
                });
              }}
            >
              <ContactFields v={f.v} setV={f.setV} />
              <ErrorText msg={f.err} />
              <button className="btn w-full" disabled={f.busy}>Continue to payment</button>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                f.run(async () => {
                  const o = await act<{ id: string }>(biz.id, "purchase", { checkoutId });
                  setOrder(o.id);
                });
              }}
            >
              <div className="space-y-2.5">
                <input className="input" value="4242 4242 4242 4242" readOnly aria-label="Card number" />
                <div className="grid grid-cols-2 gap-2.5">
                  <input className="input" value="12 / 30" readOnly aria-label="Expiry" />
                  <input className="input" value="123" readOnly aria-label="CVC" />
                </div>
                <p className="text-sm text-stone-500">Test mode: no card is charged.</p>
              </div>
              <ErrorText msg={f.err} />
              <button className="btn w-full" disabled={f.busy}>
                Pay {money(item.price)}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

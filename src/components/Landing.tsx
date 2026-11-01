"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import Aurora from "./fx/Aurora";
import BlurText from "./fx/BlurText";
import CountUp from "./fx/CountUp";
import LiveFeed from "./fx/LiveFeed";
import Magnetic from "./fx/Magnetic";
import Marquee from "./fx/Marquee";
import Reveal from "./fx/Reveal";
import ScrollJourney from "./fx/ScrollJourney";
import SplitText from "./fx/SplitText";
import SpotlightCard from "./fx/SpotlightCard";
import { BUSINESSES, platformLabel } from "@/lib/businesses";
import type { Platform } from "@/lib/types";
import { WORKFLOWS } from "@/lib/workflows";

export interface LandingStats {
  contacts: number;
  revenue: number;
  messages: number;
  bookings: number;
  workflows: number;
}

const TOOLS = ["Shopify", "Kajabi", "HubSpot", "GoHighLevel", "Klaviyo", "Stripe", "Calendly", "Acuity", "Cal.com", "Twilio", "Slack", "Cloudflare", "Replit", "OpenAI", "Claude"];

export default function Landing({ stats }: { stats: LandingStats }) {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 120], ["rgba(12,10,9,0)", "rgba(12,10,9,0.78)"]);
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);

  return (
    <main className="min-h-screen overflow-x-clip bg-stone-950 text-white">
      <motion.header style={{ backgroundColor: navBg }} className="fixed inset-x-0 top-0 z-50 border-b border-white/5 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-400 via-pink-500 to-orange-400 text-stone-950">◆</span>
            Connected Hub
          </Link>
          <nav className="hidden gap-8 text-[15px] font-medium text-white/70 md:flex">
            <a href="#businesses" className="hover:text-white">Businesses</a>
            <a href="#journey" className="hover:text-white">How it works</a>
            <a href="#features" className="hover:text-white">Features</a>
          </nav>
          <Link href="/northlight" className="rounded-full bg-white px-5 py-2 text-[15px] font-semibold text-stone-950 transition hover:bg-white/90">
            Explore
          </Link>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative isolate pt-36 pb-24 md:pt-44">
        <Aurora />
        <motion.div style={{ y: heroY }} className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
             
            </motion.div>
            <SplitText
              text="Turn every visitor into a booked, paying customer."
              highlight={["booked,", "paying"]}
              className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl"
              delay={0.15}
            />
            <BlurText
              text="One connected system for your website, bookings, store, courses and CRM. The AI answers questions, captures the lead, and automations follow up until they buy."
              className="mt-7 max-w-xl text-xl leading-relaxed text-white/70"
              delay={0.6}
            />
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6 }} className="mt-10 flex flex-wrap gap-4">
              <Magnetic>
                <a href="#businesses" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-bold text-stone-950 shadow-[0_0_40px_rgba(255,255,255,0.25)]">
                  See it running <span aria-hidden>→</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#journey" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-base font-semibold text-white hover:bg-white/5">
                  How it works
                </a>
              </Magnetic>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, x: 40, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <LiveFeed />
          </motion.div>
        </motion.div>
      </section>

      {/* Tools */}
      <section className="border-y border-white/5 py-10">
        <p className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/45">Works with the tools businesses already use</p>
        <Marquee items={TOOLS} />
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-4">
          {[
            { v: stats.contacts.toLocaleString("en-US"), l: "contacts captured this month" },
            { v: `$${stats.revenue.toLocaleString("en-US")}`, l: "revenue through the system" },
            { v: stats.messages.toLocaleString("en-US"), l: "follow-ups sent automatically" },
            { v: String(stats.workflows), l: "ready-made workflows" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.08} className="bg-stone-950 p-8">
              <div className="text-5xl font-extrabold tracking-tight"><CountUp value={s.v} /></div>
              <div className="mt-2 text-lg text-white/60">{s.l}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Businesses */}
      <section id="businesses" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-28">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">Three businesses, one engine</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">Same workflows. Different tools. Every business running live.</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {BUSINESSES.map((b, i) => (
            <Reveal key={b.id} delay={i * 0.1}>
              <SpotlightCard color={`${b.accent}55`} className="h-full rounded-3xl border border-white/10 bg-white/[0.03]">
                <div className="flex h-full flex-col p-7">
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl text-xl font-bold" style={{ background: b.accent }}>{b.initial}</span>
                    <div>
                      <h3 className="text-xl font-bold">{b.name}</h3>
                      <p className="text-[15px] text-white/55">{b.industry}</p>
                    </div>
                  </div>
                  <p className="mt-6 text-2xl font-semibold leading-snug text-white/90">“{b.hero.title}”</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {(Object.keys(b.stack) as Platform[]).filter((p) => p !== "assistant").map((p) => (
                      <span key={p} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-sm font-medium text-white/80">{platformLabel(b, p)}</span>
                    ))}
                  </div>
                  <ul className="mt-6 flex-1 space-y-2 text-[15px] text-white/65">
                    {b.workflows.slice(0, 4).map((w) => (
                      <li key={w} className="flex gap-2"><span style={{ color: b.accent }}>●</span>{WORKFLOWS[w].name}</li>
                    ))}
                    <li className="text-white/40">+ {b.workflows.length - 4} more automations</li>
                  </ul>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <Link href={`/${b.id}`} className="rounded-xl py-3 text-center font-semibold text-white transition hover:brightness-110" style={{ background: b.accent }}>Website</Link>
                    <Link href={`/${b.id}/crm`} className="rounded-xl border border-white/15 py-3 text-center font-semibold hover:bg-white/5">CRM</Link>
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section id="journey" className="relative scroll-mt-24 border-t border-white/5 bg-gradient-to-b from-stone-950 to-stone-900 py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="lg:sticky lg:top-32 lg:h-fit">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-300">The customer journey</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">No one falls through the gaps between your tools.</h2>
            <p className="mt-5 text-xl text-white/60">Every action becomes one event. The CRM updates, the next step starts, and anything that no longer applies stops.</p>
          </div>
          <ScrollJourney />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-28">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Everything in one place</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">Built to run the business, not just the website.</h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-6">
          <Feature className="md:col-span-4" title="AI assistant that knows when to stop" text="Answers from your approved content only, shows its source, captures the lead and books the call. Anything it isn't sure about goes to your team.">
            <ChatMock />
          </Feature>
          <Feature className="md:col-span-2" title="Lead scoring" text="Every action adds points. Hot leads ping your team in Slack.">
            <ScoreMock />
          </Feature>
          <Feature className="md:col-span-2" title="Automations with an off switch" text="Turn any workflow on or off. Nothing breaks.">
            <ToggleMock />
          </Feature>
          <Feature className="md:col-span-4" title="Insights you can act on" text="Funnel, lead sources, sales by item, recovered checkouts and assistant answer rate, updating live.">
            <BarsMock />
          </Feature>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden border-t border-white/5 py-32">
        <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-teal-500/30 via-pink-500/30 to-orange-500/30 blur-[120px]" />
        <Reveal className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl">Pick a business and click around.</h2>
          <p className="mx-auto mt-5 max-w-xl text-xl text-white/65">Use the website in one tab and watch the CRM update in another.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {BUSINESSES.map((b) => (
              <Magnetic key={b.id}>
                <Link href={`/${b.id}`} className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-bold text-white" style={{ background: b.accent }}>
                  {b.name} <span aria-hidden>→</span>
                </Link>
              </Magnetic>
            ))}
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/5 py-10 text-center text-[15px] text-white/40">© {new Date().getFullYear()} Connected Hub</footer>
    </main>
  );
}

function Feature({ title, text, className = "", children }: { title: string; text: string; className?: string; children: React.ReactNode }) {
  return (
    <Reveal className={className}>
      <SpotlightCard className="h-full rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="flex h-full flex-col p-7">
          <div className="min-h-44 flex-1">{children}</div>
          <h3 className="mt-6 text-2xl font-bold">{title}</h3>
          <p className="mt-2 text-lg text-white/60">{text}</p>
        </div>
      </SpotlightCard>
    </Reveal>
  );
}

function ChatMock() {
  const lines = [
    { me: true, t: "Which course is right for me?" },
    { me: false, t: "If you're new, Mindful Mornings is a 7-lesson starter. For a full reset, Focus Reset runs 4 weeks." },
    { me: false, t: "Want a personal recommendation by email?", chip: true },
  ];
  return (
    <div className="space-y-2.5">
      {lines.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.45 }}
          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] ${l.me ? "ml-auto rounded-br-md bg-teal-500 text-stone-950" : "rounded-bl-md bg-white/10 text-white/90"}`}
        >
          {l.t}
          {l.chip && <span className="mt-2 block w-fit rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-900">Send it to me</span>}
        </motion.div>
      ))}
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.6 }} className="pl-1 text-sm text-white/40">
        Source: Course comparison
      </motion.p>
    </div>
  );
}

function ScoreMock() {
  return (
    <div className="space-y-4 pt-2">
      {[
        { n: "Olivia B.", s: 72 },
        { n: "Noah K.", s: 45 },
        { n: "Mia T.", s: 20 },
      ].map((p, i) => (
        <div key={p.n}>
          <div className="mb-1.5 flex justify-between text-[15px]">
            <span>{p.n} {p.s >= 40 && "🔥"}</span>
            <span className="font-semibold tabular-nums">{p.s}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={`h-full rounded-full ${p.s >= 40 ? "bg-gradient-to-r from-pink-500 to-orange-400" : "bg-white/40"}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${p.s}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ToggleMock() {
  return (
    <div className="space-y-3 pt-2">
      {["Abandoned checkout", "Review requests", "Hot-lead alerts"].map((t, i) => (
        <div key={t} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
          <span className="text-[15px]">{t}</span>
          <motion.span
            className="relative h-6 w-11 rounded-full"
            initial={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            whileInView={{ backgroundColor: i === 1 ? "rgba(255,255,255,0.15)" : "#14b8a6" }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.25 }}
          >
            <motion.span
              className="absolute top-1 h-4 w-4 rounded-full bg-white"
              initial={{ left: 4 }}
              whileInView={{ left: i === 1 ? 4 : 24 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.25, type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.span>
        </div>
      ))}
    </div>
  );
}

function BarsMock() {
  const bars = [38, 62, 45, 80, 58, 92, 74, 100, 86, 70, 95, 88];
  return (
    <div className="flex h-44 items-end gap-2">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-lg bg-gradient-to-t from-teal-500/40 via-pink-500/70 to-orange-400"
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

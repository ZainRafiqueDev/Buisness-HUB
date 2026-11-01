"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const EVENTS = [
  { tool: "Website", color: "bg-stone-200 text-stone-900", text: "Olivia downloaded the Weekly Focus Checklist" },
  { tool: "HubSpot", color: "bg-emerald-300 text-emerald-950", text: "New contact created and tagged interest:course" },
  { tool: "AI assistant", color: "bg-amber-300 text-amber-950", text: "Answered “Which course is right for me?”" },
  { tool: "Calendly", color: "bg-blue-300 text-blue-950", text: "Discovery call booked for Tue 10:00 AM" },
  { tool: "Email", color: "bg-pink-300 text-pink-950", text: "Welcome series stopped: she booked a call" },
  { tool: "Shopify", color: "bg-lime-300 text-lime-950", text: "Order #1042 paid: Focus Reset ($149)" },
  { tool: "Kajabi", color: "bg-violet-300 text-violet-950", text: "Course access granted, login sent" },
  { tool: "Slack", color: "bg-orange-300 text-orange-950", text: "🔥 Hot lead: Olivia reached 55 points" },
];

// A looping stream of automation events, newest on top.
export default function LiveFeed() {
  const [tick, setTick] = useState(4);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 2200);
    return () => clearInterval(t);
  }, []);

  const visible = Array.from({ length: 4 }, (_, i) => ({ ...EVENTS[(tick - i) % EVENTS.length], key: tick - i }));

  return (
    <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          Live automation feed
        </div>
        <span className="text-sm text-white/50">Northlight Coaching</span>
      </div>
      <div className="relative h-[19rem] overflow-hidden">
        <AnimatePresence initial={false}>
          {visible.map((e, i) => (
            <motion.div
              key={e.key}
              layout
              initial={{ opacity: 0, y: -40, scale: 0.96 }}
              animate={{ opacity: 1 - i * 0.18, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="mb-3 rounded-2xl border border-white/10 bg-stone-900/80 p-4"
            >
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${e.color}`}>{e.tool}</span>
              <p className="mt-2 text-[15px] leading-snug text-white/90">{e.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

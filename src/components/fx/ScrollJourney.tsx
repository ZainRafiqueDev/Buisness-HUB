"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STEPS = [
  { title: "Visitor arrives", text: "Search, social or ads bring them to a fast site on your own domain." },
  { title: "Guided, not lost", text: "A quiz or the AI assistant answers questions and points to the right offer." },
  { title: "Captured once", text: "One contact in the CRM, de-duplicated by email, tagged by interest and scored." },
  { title: "Books or buys", text: "Calendar, checkout or course enrolment, with deposits and payments handled." },
  { title: "Followed up for you", text: "Reminders, onboarding, review requests and win-backs. Each stops when it should." },
];

// Vertical timeline whose line draws itself and whose steps light up as you scroll (GSAP ScrollTrigger).
export default function ScrollJourney() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(".journey-line", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 60%", scrub: true } });
      gsap.utils.toArray<HTMLElement>(".journey-step").forEach((el) => {
        gsap.fromTo(el, { opacity: 0.25, x: 30 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none reverse" } });
        gsap.fromTo(el.querySelector(".journey-dot"), { scale: 0.4, backgroundColor: "#44403c" }, { scale: 1, backgroundColor: "#ffffff", scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none reverse" } });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative mx-auto max-w-3xl pl-14">
      <div className="absolute bottom-6 left-[1.15rem] top-6 w-[3px] rounded-full bg-white/10" />
      <div className="journey-line absolute bottom-6 left-[1.15rem] top-6 w-[3px] origin-top rounded-full bg-gradient-to-b from-teal-400 via-pink-500 to-orange-400" />
      <ol className="space-y-12">
        {STEPS.map((s, i) => (
          <li key={s.title} className="journey-step relative">
            <span className="journey-dot absolute -left-[2.85rem] top-1 grid h-7 w-7 place-items-center rounded-full text-sm font-bold text-stone-900">{i + 1}</span>
            <h3 className="text-2xl font-bold text-white">{s.title}</h3>
            <p className="mt-1.5 text-lg text-white/65">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

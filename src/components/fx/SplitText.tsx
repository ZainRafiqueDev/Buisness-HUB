"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Headline that rises in letter by letter (GSAP stagger). Words never break mid-word.
export default function SplitText({ text, className = "", delay = 0, highlight = [] }: { text: string; className?: string; delay?: number; highlight?: string[] }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const chars = ref.current!.querySelectorAll(".char");
      gsap.matchMedia().add(
        { motion: "(prefers-reduced-motion: no-preference)" },
        () => {
          gsap.from(chars, { yPercent: 110, opacity: 0, rotate: 6, duration: 0.9, ease: "expo.out", stagger: 0.018, delay });
        },
      );
    },
    { scope: ref },
  );

  return (
    <h1 ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((word, w) => (
        <span key={w} aria-hidden className={`inline-block overflow-hidden whitespace-nowrap pb-[0.08em] align-bottom ${highlight.includes(word) ? "text-gradient" : ""}`}>
          {word.split("").map((ch, i) => (
            <span key={i} className="char inline-block">
              {ch}
            </span>
          ))}
          {" "}
        </span>
      ))}
    </h1>
  );
}

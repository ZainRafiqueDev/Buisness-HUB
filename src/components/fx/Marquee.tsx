"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Endless horizontal loop (GSAP). Slows down while hovered.
export default function Marquee({ items, speed = 40 }: { items: string[]; speed?: number }) {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current!;
      const tween = gsap.to(el, { xPercent: -50, ease: "none", duration: speed, repeat: -1 });
      const slow = () => gsap.to(tween, { timeScale: 0.25, duration: 0.6 });
      const fast = () => gsap.to(tween, { timeScale: 1, duration: 0.6 });
      el.addEventListener("mouseenter", slow);
      el.addEventListener("mouseleave", fast);
      return () => {
        el.removeEventListener("mouseenter", slow);
        el.removeEventListener("mouseleave", fast);
      };
    },
    { scope: track },
  );

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div ref={track} className="flex w-max gap-4">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-6 py-2.5 text-lg font-semibold text-white/80">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

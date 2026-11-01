"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

// Counts from 0 to the number inside `value` ("1,200+", "4.9/5", "$12k") when scrolled into view.
export default function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    const match = value.match(/[\d,.]+/);
    if (!inView || !match || !ref.current) return;
    const raw = match[0];
    const target = parseFloat(raw.replace(/,/g, ""));
    const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
    const before = value.slice(0, match.index);
    const after = value.slice(match.index! + raw.length);
    const el = ref.current;
    const controls = animate(0, target, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = before + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + after;
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
    </span>
  );
}

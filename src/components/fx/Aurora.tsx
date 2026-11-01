"use client";

import { motion } from "motion/react";

const BLOBS = [
  { color: "#14b8a6", size: 620, x: ["-10%", "15%", "-5%"], y: ["-20%", "5%", "-20%"], left: "5%", top: "-10%", d: 18 },
  { color: "#db2777", size: 560, x: ["10%", "-15%", "10%"], y: ["0%", "15%", "0%"], left: "55%", top: "-15%", d: 22 },
  { color: "#ea580c", size: 480, x: ["0%", "20%", "0%"], y: ["10%", "-10%", "10%"], left: "30%", top: "20%", d: 26 },
];

// Slow-moving blurred colour fields behind the hero.
export default function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-[0.28] blur-[110px]"
          style={{ width: b.size, height: b.size, left: b.left, top: b.top, background: b.color }}
          animate={{ x: b.x, y: b.y }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0c0a09_75%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
    </div>
  );
}

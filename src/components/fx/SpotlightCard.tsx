"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

// Card with a soft light that follows the cursor and a slight 3D tilt.
export default function SpotlightCard({ children, className = "", color = "rgba(255,255,255,0.14)", style }: { children: React.ReactNode; className?: string; color?: string; style?: React.CSSProperties }) {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const rx = useSpring(0, { stiffness: 150, damping: 18 });
  const ry = useSpring(0, { stiffness: 150, damping: 18 });
  const background = useMotionTemplate`radial-gradient(420px circle at ${x}px ${y}px, ${color}, transparent 70%)`;

  return (
    <motion.div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
        rx.set(((e.clientY - r.top) / r.height - 0.5) * -6);
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 6);
      }}
      onMouseLeave={() => {
        x.set(-200);
        y.set(-200);
        rx.set(0);
        ry.set(0);
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900, ...style }}
      className={`group relative overflow-hidden ${className}`}
    >
      <motion.div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background }} />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}

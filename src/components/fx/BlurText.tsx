"use client";

import { motion } from "motion/react";

// Paragraph whose words fade in from a blur, one after another.
export default function BlurText({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <p className={className}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, filter: "blur(10px)", y: 8 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + i * 0.03, ease: "easeOut" }}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </p>
  );
}

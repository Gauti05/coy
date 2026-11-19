"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = [
  "var(--primary)",
  "var(--success)",
  "#fbbf24",
  "#38bdf8",
  "#f472b6",
];

type Particle = {
  id: number;
  left: string;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
  x: number;
};

type ConfettiProps = {
  active: boolean;
};

export function Confetti({ active }: ConfettiProps) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 30 }, (_, id) => ({
        id,
        left: `${4 + ((id * 17) % 92)}%`,
        delay: (id % 8) * 0.04,
        duration: 1.1 + (id % 5) * 0.12,
        color: COLORS[id % COLORS.length]!,
        rotate: (id % 2 === 0 ? 1 : -1) * (120 + (id % 7) * 20),
        x: ((id % 9) - 4) * 10,
      })),
    [],
  );

  if (!active) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute top-1/3 h-2 w-2 rounded-sm"
          style={{
            left: particle.left,
            backgroundColor: particle.color,
          }}
          initial={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
          animate={{
            opacity: 0,
            y: 220 + (particle.id % 5) * 18,
            x: particle.x,
            rotate: particle.rotate,
            scale: 0.6,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

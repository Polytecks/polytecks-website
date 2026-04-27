"use client";

import { motion, useTransform, cubicBezier, type MotionValue, type EasingFunction } from "framer-motion";
import { type ReactNode } from "react";
import styles from "./proof-section.module.css";

export type ProofCardData = {
  number: ReactNode;
  label: string;
};

type EasingMode = "linear" | "eased" | "aggressive";

const EASE_FN: Record<EasingMode, EasingFunction | undefined> = {
  linear:     undefined,
  // Premium ease-out — slow finish, smooth feel.
  eased:      cubicBezier(0.16, 1, 0.3, 1),
  // Sharp/snappy — quick at both ends, plateau in the middle.
  aggressive: cubicBezier(0.85, 0, 0.15, 1),
};

// Slot positions as a percentage of the .cardsRoot container width, so cards
// always land at thirds of the (max-1400px) content area regardless of
// viewport. Using vw would push the right card past the viewport edge when
// the number text is wide (e.g. "Days–Weeks" at 120px font).
const SLOT_LEFT_PCT = ["16.67%", "50%", "83.33%"];

export function ProofCard({
  data,
  index,
  scrollProgress,
  easing,
  phaseOverlap,
}: {
  data: ProofCardData;
  index: 0 | 1 | 2;
  scrollProgress: MotionValue<number>;
  easing: EasingMode;
  phaseOverlap: number;       // 0 → 0.25
}) {
  const phaseLen = 1 / 3;
  const overlap = phaseOverlap * phaseLen;
  const phaseStart = Math.max(0, index * phaseLen - overlap);
  // Most of the phase is the appear animation; the last ~10% is a "rest" beat.
  const appearEnd = phaseStart + (phaseLen - overlap) * 0.9;

  const easeFn = EASE_FN[easing];
  const easeOpt = easeFn ? { ease: easeFn } : undefined;

  // Opacity: 0 before phaseStart, 1 by appearEnd. Stays 1 throughout the rest.
  const opacity = useTransform(
    scrollProgress,
    [phaseStart, appearEnd, 1],
    [0, 1, 1],
    easeOpt,
  );

  // Scale: 0.85 → 1 across the appear phase.
  const scale = useTransform(
    scrollProgress,
    [phaseStart, appearEnd, 1],
    [0.85, 1, 1],
    easeOpt,
  );

  // Subtle Y rise: 12px below baseline → 0.
  const yOffset = useTransform(
    scrollProgress,
    [phaseStart, appearEnd, 1],
    [12, 0, 0],
    easeOpt,
  );
  // Compose with the -50% centering transform via calc().
  const y = useTransform(yOffset, (v) => `calc(-50% + ${v}px)`);

  // Blur: 8px → 0 (focus-pull).
  const blur = useTransform(
    scrollProgress,
    [phaseStart, appearEnd, 1],
    [8, 0, 0],
    easeOpt,
  );
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  // Horizontal slot — handled via `left` (set inline below) plus a constant
  // -50% translateX to center the card on its slot anchor. No x animation.
  const left = SLOT_LEFT_PCT[index];

  return (
    <motion.div
      className={styles.card}
      style={{
        left,
        zIndex: 1,
        opacity,
        scale,
        x: "-50%",
        y,
        filter,
      }}
    >
      <p className={styles.cardNumber}>{data.number}</p>
      <p className={styles.cardLabel}>{data.label}</p>
    </motion.div>
  );
}

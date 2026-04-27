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
  eased:      cubicBezier(0.16, 1, 0.3, 1),
  aggressive: cubicBezier(0.85, 0, 0.15, 1),
};

// Settled-row slot positions as percentages of the .cardsRoot container width.
// Cards land at thirds of the (max-1400px) content area regardless of viewport.
const SLOT_LEFT_PCT = ["16.67%", "50%", "83.33%"];

// Settled row sits 15vh below the emergence center, so a giant card emerging
// in the center never visually overlaps already-settled cards in the row.
const SETTLED_Y_VH = 15;

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
  // Phase A (emerge) takes 70% of the phase; phase B (slide to slot) takes the rest.
  const emergeEnd = phaseStart + (phaseLen - overlap) * 0.65;
  const slideEnd  = phaseStart + (phaseLen - overlap);

  const easeFn = EASE_FN[easing];
  const easeOpt = easeFn ? { ease: easeFn } : undefined;

  // Opacity: locked at 0 from progress 0 → phaseStart, then animates 0→1.
  const opacity = useTransform(
    scrollProgress,
    [0, phaseStart, phaseStart + (emergeEnd - phaseStart) * 0.5, 1],
    [0, 0, 1, 1],
    easeOpt,
  );

  // Scale: locked at 0.4 from 0 → phaseStart, then 0.4 → 1.
  const scale = useTransform(
    scrollProgress,
    [0, phaseStart, emergeEnd, 1],
    [0.4, 0.4, 1, 1],
    easeOpt,
  );

  // Blur: locked at 12 from 0 → phaseStart, then 12 → 0.
  const blur = useTransform(
    scrollProgress,
    [0, phaseStart, emergeEnd, 1],
    [12, 12, 0, 0],
    easeOpt,
  );
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  // X (slot offset, percent of container): 0 (center) during emerge, slides
  // to its slot during phase B. Slot 0 → -33.33%, slot 1 → 0%, slot 2 → +33.33%.
  // (These percentages are relative to the .cardsRoot container width because
  // we set them via the `left` CSS property below — but the motion x is still
  // in % units of the element's own width. So we use a calc that bakes the
  // container-thirds offset into the centering translate.)
  // Approach: keep x as the centering -50% always; animate `left` via a motion
  // value that interpolates from "50%" to the slot percentage.
  const slotPct = SLOT_LEFT_PCT[index];
  // Left: locked at "50%" from 0 → phaseStart, then animates to slot.
  const left = useTransform(
    scrollProgress,
    [0, phaseStart, emergeEnd, slideEnd, 1],
    ["50%", "50%", "50%", slotPct, slotPct],
    easeOpt,
  );

  // Y: emergence at center (y = -50% of card), slide to settled row at
  // -50% + SETTLED_Y_VH (so the card's center is at viewport center + 15vh).
  // Locked at "-50%" from 0 → phaseStart.
  const y = useTransform(
    scrollProgress,
    [0, phaseStart, emergeEnd, slideEnd, 1],
    [
      "-50%",
      "-50%",
      "-50%",
      `calc(-50% + ${SETTLED_Y_VH}vh)`,
      `calc(-50% + ${SETTLED_Y_VH}vh)`,
    ],
    easeOpt,
  );

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, scale: 0.4, x: "-50%", y: "-50%" }}
      style={{
        zIndex: 1,
        left,
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

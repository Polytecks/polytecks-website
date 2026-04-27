"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { cubicBezier, type EasingFunction } from "motion-utils";
import { type ReactNode } from "react";
import styles from "./proof-section.module.css";

export type ProofCardData = {
  number: ReactNode;
  label: string;
};

type EasingMode = "linear" | "eased" | "aggressive";

// EasingFunction = (v: number) => number — store callables, not tuples.
const EASE_FN: Record<EasingMode, EasingFunction | undefined> = {
  linear:     undefined,
  eased:      cubicBezier(0.2, 0.7, 0.2, 1),
  aggressive: cubicBezier(0.85, 0, 0.15, 1),
};

const SLOT_X_VW = [-33, 0, 33];

export function ProofCard({
  data,
  index,
  scrollProgress,
  easing,
  phaseOverlap,
  settleScale,
}: {
  data: ProofCardData;
  index: 0 | 1 | 2;
  scrollProgress: MotionValue<number>;
  easing: EasingMode;
  phaseOverlap: number;       // 0 → 0.25
  settleScale: number;        // 0.15 → 0.45
}) {
  const phaseLen = 1 / 3;
  const overlap = phaseOverlap * phaseLen;
  const phaseStart = Math.max(0, index * phaseLen - overlap);
  const zoomEnd = (index + 0.7) * phaseLen;
  const phaseEnd = (index + 1) * phaseLen;

  const easeFn = EASE_FN[easing];
  const easeOpt = easeFn ? { ease: easeFn } : undefined;

  // Opacity: 0 before phaseStart, 1 by mid-zoom, stays 1.
  const opacity = useTransform(
    scrollProgress,
    [phaseStart, phaseStart + (zoomEnd - phaseStart) * 0.4, 1],
    [0, 1, 1],
    easeOpt,
  );

  // Scale: 0.5 → 1 across zoom, → settleScale across move-to-slot.
  const scale = useTransform(
    scrollProgress,
    [phaseStart, zoomEnd, phaseEnd],
    [0.5, 1, settleScale],
    easeOpt,
  );

  // X: 0 (centered) during zoom, → slot during move-to-slot.
  const xVw = useTransform(
    scrollProgress,
    [zoomEnd, phaseEnd],
    [0, SLOT_X_VW[index]],
    easeOpt,
  );

  const x = useTransform(xVw, (vw: number) => `calc(-50% + ${vw}vw)`);

  return (
    <motion.div
      className={styles.card}
      style={{
        zIndex: 1,
        opacity,
        scale,
        x,
        y: "-50%",
      }}
    >
      <p className={styles.cardNumber}>{data.number}</p>
      <p className={styles.cardLabel}>{data.label}</p>
    </motion.div>
  );
}

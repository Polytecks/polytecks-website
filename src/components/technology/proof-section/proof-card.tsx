"use client";

import {
  useMotionValueEvent,
  useTransform,
  cubicBezier,
  type MotionValue,
  type EasingFunction,
} from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./proof-section.module.css";

export type ProofCardData = {
  number: ReactNode;
  label: ReactNode;
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

// Phase order: card 0 first, card 2 second, card 1 last.
// Maps [card index] → [phase order slot]
const PHASE_ORDER = [0, 2, 1];

export function ProofCard({
  data,
  index,
  scrollProgress,
  easing,
  phaseOverlap,
  hasCompleted,
}: {
  data: ProofCardData;
  index: 0 | 1 | 2;
  scrollProgress: MotionValue<number>;
  easing: EasingMode;
  phaseOverlap: number;       // 0 → 0.25
  hasCompleted: boolean;
}) {
  const phaseLen = 1 / 3;
  const overlap = phaseOverlap * phaseLen;
  const order = PHASE_ORDER[index];
  const phaseStart = Math.max(0, order * phaseLen - overlap);
  // Phase A (emerge) takes 70% of the phase; phase B (slide to slot) takes the rest.
  const emergeEnd = phaseStart + (phaseLen - overlap) * 0.65;
  const slideEnd  = phaseStart + (phaseLen - overlap);

  const easeFn = EASE_FN[easing];
  const easeOpt = easeFn ? { ease: easeFn } : undefined;

  // Drop the explicit 0→phaseStart lockup keyframes — when phaseStart=0 they
  // produce a degenerate [0, 0, …] input range, which Framer's interpolator
  // handles via division-by-zero and silently returns NaN for opacity. (NaN
  // opacity falls back to 1, leaving cards faintly visible at scroll-top.)
  // useTransform clamps at the input bounds by default, so progress<phaseStart
  // simply returns the first output value.
  const opacity = useTransform(
    scrollProgress,
    [phaseStart, phaseStart + (emergeEnd - phaseStart) * 0.5, 1],
    [0, 1, 1],
    easeOpt,
  );

  const scale = useTransform(
    scrollProgress,
    [phaseStart, emergeEnd, 1],
    [0.4, 1, 1],
    easeOpt,
  );

  const blur = useTransform(
    scrollProgress,
    [phaseStart, emergeEnd, 1],
    [12, 0, 0],
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
  const left = useTransform(
    scrollProgress,
    [phaseStart, emergeEnd, slideEnd, 1],
    ["50%", "50%", slotPct, slotPct],
    easeOpt,
  );

  // Framer's <motion.div style={{...motionValues}}> creates WAAPI animations
  // that on this codebase end up running on their own time-based clock instead
  // of being scroll-linked, which means cards advance to opacity 1 within
  // ~1s of mount regardless of scroll position. Bypass that by writing inline
  // styles directly on a plain <div> via useMotionValueEvent.
  const cardRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(opacity, "change", (v) => {
    if (cardRef.current && !hasCompleted) cardRef.current.style.opacity = String(v);
  });
  useMotionValueEvent(scale, "change", (v) => {
    if (cardRef.current && !hasCompleted) {
      cardRef.current.style.setProperty("--card-scale", String(v));
    }
  });
  useMotionValueEvent(filter, "change", (v) => {
    if (cardRef.current && !hasCompleted) cardRef.current.style.filter = String(v);
  });
  useMotionValueEvent(left, "change", (v) => {
    if (cardRef.current && !hasCompleted) cardRef.current.style.left = String(v);
  });

  // When hasCompleted flips true: lock card at final state.
  useEffect(() => {
    if (hasCompleted && cardRef.current) {
      cardRef.current.style.opacity = "1";
      cardRef.current.style.filter = "none";
      cardRef.current.style.left = SLOT_LEFT_PCT[index];
      cardRef.current.style.setProperty("--card-scale", "1");
    }
  }, [hasCompleted, index]);

  return (
    <div
      ref={cardRef}
      className={styles.card}
      style={{
        zIndex: 1,
        opacity: 0,
        left: "50%",
        ["--card-scale" as string]: 0.4,
        ["--card-y" as string]: "-50%",  // permanent center — cards stay on horizontal axis
        filter: "blur(12px)",
      }}
    >
      <p className={styles.cardNumber}>{data.number}</p>
      <p className={styles.cardLabel}>{data.label}</p>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

/**
 * Hand-authored signal trace. The path data approximates an idealized
 * cardiac waveform (P, QRS, T). Replace with real captured data when
 * available.
 */
const TRACE_PATH =
  "M0 60 L40 60 L60 58 L80 60 L120 60 L130 56 L140 60 L150 22 L156 92 L162 60 L180 60 L200 50 L220 60 L260 60 L280 56 L300 60 L320 60";

export function SignalTrace({ animate = true }: { animate?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 100"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        <pattern id="signal-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        </pattern>
      </defs>
      <rect width="320" height="100" fill="url(#signal-grid)" />

      <motion.path
        d={TRACE_PATH}
        fill="none"
        stroke="var(--indigo-bright)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px rgba(106,116,220,0.6))" }}
        initial={animate ? { pathLength: 0, opacity: 0.2 } : { pathLength: 1, opacity: 1 }}
        animate={animate ? {
          pathLength: 1,
          opacity: [0.2, 1, 0.85, 1, 0.85],
        } : undefined}
        transition={animate ? {
          pathLength: { duration: 2, ease: [0.2, 0.7, 0.2, 1] },
          opacity: { duration: 4, repeat: Infinity, repeatType: "reverse", delay: 2 },
        } : undefined}
      />
    </svg>
  );
}

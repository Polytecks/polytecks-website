"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./stack-entry.module.css";

/**
 * Wraps a child element so it animates in on mount with the "stack" reveal:
 * the inner content slides up from below with a fade. Used for page-level
 * elements that should appear staggered on page load.
 *
 * `index` controls the stagger order — element with index 0 fires first,
 * each subsequent index waits `--stack-stagger-ms` longer (default 80ms).
 *
 * The `.wrap` has `overflow: hidden` so the rising content is clipped,
 * matching the existing AnimatedTitle "stack" variant on subpage titles.
 */
export function StackEntry({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const [replayKey, setReplayKey] = useState(0);
  useEffect(() => {
    const handler = () => setReplayKey((k) => k + 1);
    window.addEventListener("polytecks:replay-page", handler);
    return () => window.removeEventListener("polytecks:replay-page", handler);
  }, []);

  return (
    <div
      key={replayKey}
      className={`${styles.wrap} ${className ?? ""}`.trim()}
      style={{ ["--stack-i" as string]: index } as CSSProperties}
    >
      <div className={styles.inner}>{children}</div>
    </div>
  );
}

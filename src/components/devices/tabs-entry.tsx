"use client";

import { useEffect, useState, type ReactNode } from "react";
import { StackEntry } from "@/components/stack-entry";
import { getApplicationsStripEndMs } from "./applications-strip";

/**
 * Wraps a child (typically DevicesTabs) in a StackEntry whose entry delay
 * is anchored to the moment the ApplicationsStrip's last icon settles —
 * eliminates the page-wide gap between the icons and whatever sits below.
 */
export function TabsEntry({ children }: { children: ReactNode }) {
  // Tight tail gap — fire the tabs the moment the last icon's entry
  // duration finishes, not 200ms after it. Eliminates the pause the user
  // reported between the icons settling and the tabs appearing.
  const TAIL_GAP_MS = 0;
  const [delayMs, setDelayMs] = useState(() => 1800);

  useEffect(() => {
    const compute = () => setDelayMs(getApplicationsStripEndMs() + TAIL_GAP_MS);
    compute();
    const replay = () => compute();
    window.addEventListener("polytecks:replay-page", replay);
    const raf = requestAnimationFrame(compute);
    return () => {
      window.removeEventListener("polytecks:replay-page", replay);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <StackEntry delayMs={delayMs}>{children}</StackEntry>;
}

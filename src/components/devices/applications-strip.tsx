"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { StackEntry } from "@/components/stack-entry";
import styles from "./applications-strip.module.css";

type Application = { label: string; src: string };

const APPLICATIONS: readonly Application[] = [
  { label: "Cardiac Signals",         src: "/assets/heartpoly (1).png" },
  { label: "Neural Activity",         src: "/assets/brainpoly (1).png" },
  { label: "Muscle Function",         src: "/assets/musclepoly (1).png" },
  { label: "Gut Electrophysiology",   src: "/assets/gutpoly (1).png" },
  { label: "Autonomic Control",       src: "/assets/autonomicpoly (1).png" },
  { label: "Oncological Signatures",  src: "/assets/ribbonpoly (1).png" },
] as const;

/**
 * Anchor for the icon cascade. Fires when the lede has STARTED its entry
 * + a small overlap, so the icons begin appearing while the lede is still
 * settling — eliminates the dead pause the user reported between
 * subtitle and icons.
 */
function readHeaderEndMs(): number {
  if (typeof window === "undefined") return 900;
  const cs = getComputedStyle(document.body);
  const stagger = parseFloat(cs.getPropertyValue("--stack-stagger-ms")) || 420;
  const duration = parseFloat(cs.getPropertyValue("--stack-duration-ms")) || 600;
  // Lede begins entering at 2 × stagger. Add ~30% of its duration so the
  // icons start as the lede settles, not after it fully completes.
  return 2 * stagger + duration * 0.3;
}

function readIconStaggerMs(): number {
  if (typeof window === "undefined") return 80;
  const cs = getComputedStyle(document.body);
  const tweakStagger = parseFloat(cs.getPropertyValue("--devices-icon-stagger-ms")) || 80;
  // Per MOBILE_STRATEGY.md §4.15: compress the icon cascade on touch
  // viewports. Six icons at 150ms each = 900ms of waiting; on a phone
  // that feels deliberate-slow. Cap at 80ms below 720px.
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches) {
    return Math.min(tweakStagger, 80);
  }
  return tweakStagger;
}

export function ApplicationsStrip() {
  // Compute absolute delays once on mount, then again when the stagger var
  // changes. Polls cheaply via requestAnimationFrame on first paint to ensure
  // the body's CSS vars (set by useTweaks) are already applied.
  const [delays, setDelays] = useState<number[]>(() =>
    APPLICATIONS.map((_, i) => 1500 + i * 80),
  );

  useEffect(() => {
    const compute = () => {
      const base = readHeaderEndMs();
      const step = readIconStaggerMs();
      setDelays(APPLICATIONS.map((_, i) => base + i * step));
    };
    compute();
    // Re-compute when tweaks change (use-tweaks emits no event, so we listen
    // to the same replay-page event for consistency with StackEntry).
    const replay = () => compute();
    window.addEventListener("polytecks:replay-page", replay);
    // Also re-read after a microtask so any post-mount tweak application catches.
    const raf = requestAnimationFrame(compute);
    return () => {
      window.removeEventListener("polytecks:replay-page", replay);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={styles.strip}>
      {APPLICATIONS.map((app, i) => (
        <StackEntry key={app.label} delayMs={delays[i]}>
          <div className={styles.item}>
            <div className={styles.iconWrap}>
              <Image
                src={app.src}
                alt=""
                width={256}
                height={256}
                className={styles.iconImg}
              />
            </div>
            <p className={styles.label}>
              {app.label.split(" ").map((word, idx, arr) => (
                <span key={idx} className={styles.labelLine}>
                  {word}
                  {idx < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          </div>
        </StackEntry>
      ))}
    </div>
  );
}

/**
 * Anchor for the next element below the strip (DevicesTabs). Returns a
 * delay just before the LAST icon finishes its entry, so the next
 * element starts fading in WHILE the final icon is still settling — the
 * two animations overlap and the user perceives no gap between them.
 */
export function getApplicationsStripEndMs(): number {
  if (typeof window === "undefined") return 1500 + 5 * 80 + 200;
  const cs = getComputedStyle(document.body);
  const duration = parseFloat(cs.getPropertyValue("--stack-duration-ms")) || 600;
  // Last icon STARTS at headerEnd + 5*stagger; we kick the next element
  // ~30% of the way through that icon's fade so they overlap cleanly.
  return readHeaderEndMs() + 5 * readIconStaggerMs() + duration * 0.3;
}

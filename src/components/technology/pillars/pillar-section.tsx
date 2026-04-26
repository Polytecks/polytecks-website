"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pillar } from "./pillar";
import { PILLARS } from "./pillar-data";
import styles from "./pillar-section.module.css";

function readTweakNumber(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.body).getPropertyValue(name).trim();
  if (!raw) return fallback;
  const num = parseFloat(raw);
  return Number.isFinite(num) ? num : fallback;
}

export function PillarSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Re-sample tweak values when document.body's style attr changes
  // (i.e., when the TweakPanel writes a new value).
  useEffect(() => {
    const obs = new MutationObserver(() => setTick((t) => t + 1));
    obs.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => obs.disconnect();
  }, []);

  const tweaks = useMemo(() => ({
    popRatio: readTweakNumber("--tw-pillar-pop", 1.6),
    siblingDim: readTweakNumber("--tw-sibling-dim", 0.5),
    animMs: readTweakNumber("--tw-anim-ms", 350),
  }), [tick]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setActiveId(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  return (
    <section className={styles.section} aria-label="Three pillars of the technology">
      <div className={styles.eyebrow}>Three Pillars</div>
      <p className={styles.lede}>
        Materials, form, and intelligence — rebuilt from first principles.
      </p>
      <div className={styles.row}>
        {PILLARS.map((p) => (
          <Pillar
            key={p.id}
            content={p}
            isActive={activeId === p.id}
            anyActive={activeId !== null}
            popRatio={tweaks.popRatio}
            siblingDim={tweaks.siblingDim}
            animMs={tweaks.animMs}
            onActivate={() => setActiveId(p.id)}
            onDeactivate={() => {
              setActiveId((curr) => (curr === p.id ? null : curr));
            }}
          />
        ))}
      </div>
    </section>
  );
}

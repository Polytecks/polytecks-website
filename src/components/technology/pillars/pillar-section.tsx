"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
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
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // Re-render when document.body's style attr changes (TweakPanel writes a
  // new value). Reading via getComputedStyle on each render is cheap for 3
  // elements.
  useEffect(() => {
    const obs = new MutationObserver(() => forceUpdate());
    obs.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => obs.disconnect();
  }, []);

  const popRatio = readTweakNumber("--tw-pillar-pop", 1.6);
  const siblingDim = readTweakNumber("--tw-sibling-dim", 0.5);
  const animMs = readTweakNumber("--tw-anim-ms", 350);

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
            popRatio={popRatio}
            siblingDim={siblingDim}
            animMs={animMs}
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

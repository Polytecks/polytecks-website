"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Pillar } from "./pillar";
import { PILLARS } from "./pillar-data";
import styles from "./pillar-section.module.css";

const POP_BY_VARIANT = {
  card: 1.0,
  split: 1.6,
} as const;

const SIBLING_DIM = 0.4;
const ANIM_MS = 550;

function readVariant(): "card" | "split" {
  if (typeof window === "undefined") return "card";
  const v = document.body.dataset.pillarVariant;
  return v === "split" ? "split" : "card";
}

export function PillarSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const rowRef = useRef<HTMLDivElement>(null);

  // Re-render when document.body's dataset.pillarVariant changes (TweakPanel writes it).
  useEffect(() => {
    const obs = new MutationObserver(() => forceUpdate());
    obs.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-pillar-variant", "style"],
    });
    return () => obs.disconnect();
  }, []);

  const variant = readVariant();
  const popRatio = POP_BY_VARIANT[variant];

  // Cursor-closest activation: whichever pillar's horizontal center is nearest
  // to the cursor x while the cursor is anywhere in the row.
  const onRowPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    if (!row) return;
    const pillars = row.querySelectorAll<HTMLElement>("[data-pillar-id]");
    let nearestId: string | null = null;
    let nearestDist = Infinity;
    pillars.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const d = Math.abs(center - e.clientX);
      if (d < nearestDist) {
        nearestDist = d;
        nearestId = el.dataset.pillarId ?? null;
      }
    });
    if (nearestId !== null && nearestId !== activeId) setActiveId(nearestId);
  }, [activeId]);

  const onRowPointerLeave = useCallback(() => setActiveId(null), []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setActiveId(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  return (
    <section className={styles.section} aria-label="Three pillars of the technology">
      <p className={styles.lede}>Rebuilt from first principles.</p>
      <div
        ref={rowRef}
        className={styles.row}
        data-variant={variant}
        onPointerMove={onRowPointerMove}
        onPointerLeave={onRowPointerLeave}
      >
        {PILLARS.map((p) => (
          <Pillar
            key={p.id}
            content={p}
            variant={variant}
            isActive={activeId === p.id}
            anyActive={activeId !== null}
            popRatio={popRatio}
            siblingDim={SIBLING_DIM}
            animMs={ANIM_MS}
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

"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
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

function readImageStyle(): "framed" | "banner" | "background" {
  if (typeof window === "undefined") return "framed";
  const v = document.body.dataset.imageStyle;
  if (v === "banner" || v === "background") return v;
  return "framed";
}

export function PillarSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const rowRef = useRef<HTMLDivElement>(null);

  // Re-render when document.body's style or dataset attrs change (TweakPanel writes them).
  useEffect(() => {
    const obs = new MutationObserver(() => forceUpdate());
    obs.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "data-image-style"],
    });
    return () => obs.disconnect();
  }, []);

  const popRatio = readTweakNumber("--tw-pillar-pop", 1.6);
  const siblingDim = readTweakNumber("--tw-sibling-dim", 0.5);
  const animMs = readTweakNumber("--tw-anim-ms", 350);
  const imageStyle = readImageStyle();

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
        onPointerMove={onRowPointerMove}
        onPointerLeave={onRowPointerLeave}
      >
        {PILLARS.map((p) => (
          <Pillar
            key={p.id}
            content={p}
            imageStyle={imageStyle}
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

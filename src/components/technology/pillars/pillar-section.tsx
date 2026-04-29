"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTweaks, type CardId } from "@/lib/use-tweaks";
import { StackEntry } from "@/components/stack-entry";
import { Pillar } from "./pillar";
import { PILLARS } from "./pillar-data";
import styles from "./pillar-section.module.css";

export function PillarSection() {
  const { values } = useTweaks();
  const [activeId, setActiveId] = useState<string | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  // Cursor-closest activation by fixed horizontal zone (thirds of the row).
  // Measuring each pillar's live rect would flicker because the active card's
  // width animation shifts every pillar's center mid-transition; the cursor's
  // "nearest" then flips back and forth, never settling. The row's width is
  // stable, so dividing it into three equal zones gives a stable mapping.
  const onRowPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    if (!row) return;
    const rect = row.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = e.clientX - rect.left;
    const zone = Math.min(2, Math.max(0, Math.floor((x / rect.width) * 3)));
    const ids = row.querySelectorAll<HTMLElement>("[data-pillar-id]");
    const nearestId = ids[zone]?.dataset.pillarId ?? null;
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

  // Title fires after the hero's lede (~1500ms with default timing).
  // Cards cascade left-to-right starting after the title is mid-fade.
  const TITLE_DELAY_MS = 1500;
  const CARDS_BASE_DELAY_MS = 1750;

  return (
    <section className={styles.section} aria-label="Three pillars of the technology">
      <StackEntry delayMs={TITLE_DELAY_MS}>
        <h2 className={styles.title}>
          The electrode. <em>Reimagined from first principles.</em>
        </h2>
      </StackEntry>
      <div
        ref={rowRef}
        className={styles.row}
        onPointerMove={onRowPointerMove}
        onPointerLeave={onRowPointerLeave}
      >
        {PILLARS.map((p, i) => (
          <Pillar
            key={p.id}
            content={p}
            imageStyle={values.imageStyle}
            imageTweaks={values.imageTweaks[p.id as CardId]}
            isActive={activeId === p.id}
            anyActive={activeId !== null}
            popRatio={values.pillarPop}
            siblingDim={values.siblingDim}
            animMs={values.animMs}
            // Left-to-right stagger: leftmost card (i=0) appears first (entryIndex=0).
            entryIndex={i}
            staggerMs={values.pillarCardStaggerMs}
            baseDelayMs={CARDS_BASE_DELAY_MS}
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

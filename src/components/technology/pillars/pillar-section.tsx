"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTweaks, type CardId } from "@/lib/use-tweaks";
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
            imageStyle={values.imageStyle}
            imageTweaks={values.imageTweaks[p.id as CardId]}
            isActive={activeId === p.id}
            anyActive={activeId !== null}
            popRatio={values.pillarPop}
            siblingDim={values.siblingDim}
            animMs={values.animMs}
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

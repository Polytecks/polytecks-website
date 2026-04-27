"use client";

import { useTweaks, type TitleAnim } from "@/lib/use-tweaks";
import { Slider } from "./slider";
import styles from "../tweak-panel.module.css";

const TITLE_ANIMS: { id: TitleAnim; label: string }[] = [
  { id: "wipe",    label: "Wipe" },
  { id: "cascade", label: "Cascade" },
  { id: "stack",   label: "Stack" },
];

export function PageFxTab() {
  const { values, setValue } = useTweaks();

  return (
    <>
      <div className={styles.row}>
        <div className={styles.rowLabel}>
          <span>Title anim</span>
          <span className={styles.value}>{values.titleAnim}</span>
        </div>
        <div className={styles.segmented}>
          {TITLE_ANIMS.map((a) => (
            <button key={a.id} type="button" className={styles.segment}
              data-active={values.titleAnim === a.id}
              onClick={() => setValue("titleAnim", a.id)}>{a.label}</button>
          ))}
        </div>
      </div>

      <Slider label="Title duration" value={values.titleDurationMs} min={300} max={1500} step={50}
        format={(v) => `${v}ms`}
        onChange={(v) => setValue("titleDurationMs", v)} />
      <Slider label="Title stagger" value={values.titleStaggerMs} min={0} max={200} step={5}
        format={(v) => `${v}ms`}
        onChange={(v) => setValue("titleStaggerMs", v)} />

      <div className={styles.divider} />

      <div className={styles.row}>
        <div className={styles.rowLabel}>
          <span>Topo on white</span>
          <span className={styles.value}>{values.topoLinesOnWhite ? "ON" : "OFF"}</span>
        </div>
        <div className={styles.segmented}>
          <button type="button" className={styles.segment}
            data-active={values.topoLinesOnWhite}
            onClick={() => setValue("topoLinesOnWhite", true)}>On</button>
          <button type="button" className={styles.segment}
            data-active={!values.topoLinesOnWhite}
            onClick={() => setValue("topoLinesOnWhite", false)}>Off</button>
        </div>
      </div>

      <div className={styles.divider} />

      <Slider label="Cambridge cb top" value={values.cambridgeCalloutTop} min={8} max={80} step={2}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("cambridgeCalloutTop", v)} />
      <Slider label="Cambridge cb right" value={values.cambridgeCalloutRight} min={8} max={120} step={2}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("cambridgeCalloutRight", v)} />
      <Slider label="Cambridge cp top" value={values.cambridgeOverlayTop} min={0} max={120} step={2}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("cambridgeOverlayTop", v)} />
      <Slider label="Cambridge cp left" value={values.cambridgeOverlayLeft} min={-100} max={100} step={2}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("cambridgeOverlayLeft", v)} />
    </>
  );
}

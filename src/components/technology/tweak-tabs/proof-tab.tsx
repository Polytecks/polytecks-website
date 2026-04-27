"use client";

import { useTweaks, type EasingMode, type LabelWeight, type PanelTone } from "@/lib/use-tweaks";
import { Slider } from "./slider";
import styles from "../tweak-panel.module.css";

const EASINGS: { id: EasingMode; label: string }[] = [
  { id: "linear",     label: "Linear" },
  { id: "eased",      label: "Eased" },
  { id: "aggressive", label: "Snap" },
];

const TONES: { id: PanelTone; label: string }[] = [
  { id: "pure",      label: "Pure" },
  { id: "off-white", label: "Off" },
  { id: "paper",     label: "Paper" },
];

const WEIGHTS: { id: LabelWeight; label: string }[] = [
  { id: 300, label: "300" },
  { id: 400, label: "400" },
  { id: 500, label: "500" },
];

export function ProofTab() {
  const { values, setValue } = useTweaks();

  return (
    <>
      <Slider label="Pin scroll" value={values.pinScrollMult} min={1.5} max={4} step={0.1}
        format={(v) => `${v.toFixed(1)}×`}
        onChange={(v) => setValue("pinScrollMult", v)} />
      <Slider label="Number size" value={values.cardNumberSize} min={60} max={200} step={2}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("cardNumberSize", v)} />
      <Slider label="Label size" value={values.cardLabelSize} min={14} max={32} step={1}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("cardLabelSize", v)} />

      <div className={styles.row}>
        <div className={styles.rowLabel}>
          <span>Easing</span>
          <span className={styles.value}>{values.easing}</span>
        </div>
        <div className={styles.segmented}>
          {EASINGS.map((e) => (
            <button key={e.id} type="button" className={styles.segment}
              data-active={values.easing === e.id}
              onClick={() => setValue("easing", e.id)}>{e.label}</button>
          ))}
        </div>
      </div>

      <Slider label="Phase overlap" value={values.phaseOverlap} min={0} max={0.25} step={0.01}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => setValue("phaseOverlap", v)} />
      <Slider label="Vignette" value={values.vignette} min={0} max={0.6} step={0.02}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => setValue("vignette", v)} />

      <div className={styles.row}>
        <div className={styles.rowLabel}>
          <span>Bg tone</span>
          <span className={styles.value}>{values.panelTone}</span>
        </div>
        <div className={styles.segmented}>
          {TONES.map((t) => (
            <button key={t.id} type="button" className={styles.segment}
              data-active={values.panelTone === t.id}
              onClick={() => setValue("panelTone", t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.rowLabel}>
          <span>Label weight</span>
          <span className={styles.value}>{values.labelWeight}</span>
        </div>
        <div className={styles.segmented}>
          {WEIGHTS.map((w) => (
            <button key={w.id} type="button" className={styles.segment}
              data-active={values.labelWeight === w.id}
              onClick={() => setValue("labelWeight", w.id)}>{w.label}</button>
          ))}
        </div>
      </div>
    </>
  );
}

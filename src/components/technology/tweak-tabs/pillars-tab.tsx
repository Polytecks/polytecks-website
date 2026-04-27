"use client";

import { useState } from "react";
import {
  useTweaks,
  type ActiveTheme,
  type CardId,
  type ImageState,
  type ImageStyle,
  type TweakAccent,
} from "@/lib/use-tweaks";
import { Slider } from "./slider";
import styles from "../tweak-panel.module.css";

const ACCENT_PREVIEW: Record<TweakAccent, string> = {
  indigo: "#6a74dc",
  cyan: "#5cd9e8",
  green: "#34d399",
};

const ACTIVE_THEMES: { id: ActiveTheme; label: string; swatch: string }[] = [
  { id: "indigo",  label: "Indigo",  swatch: "rgba(74, 84, 192, 0.6)" },
  { id: "lighter", label: "Lighter", swatch: "rgba(142, 152, 238, 0.85)" },
  { id: "cool",    label: "Cool",    swatch: "rgba(255, 255, 255, 0.5)" },
];

const IMAGE_STYLES: { id: ImageStyle; label: string }[] = [
  { id: "framed",     label: "Framed" },
  { id: "banner",     label: "Banner" },
  { id: "background", label: "Bg" },
];

const CARDS: { id: CardId; label: string }[] = [
  { id: "materials",    label: "Materials" },
  { id: "form",         label: "Form" },
  { id: "intelligence", label: "Intelligence" },
];

export function PillarsTab() {
  const { values, setValue, setCardImageTweak } = useTweaks();
  const [editingCard, setEditingCard] = useState<CardId>("materials");
  const [editingState, setEditingState] = useState<ImageState>("rest");
  const editing = values.imageTweaks[editingCard][editingState];

  return (
    <>
      <Slider label="Pillar pop" value={values.pillarPop} min={1} max={1.8} step={0.05}
        format={(v) => `${v.toFixed(2)}×`}
        onChange={(v) => setValue("pillarPop", v)} />
      <Slider label="Sibling dim" value={values.siblingDim} min={0} max={0.7} step={0.05}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => setValue("siblingDim", v)} />
      <Slider label="Transition" value={values.animMs} min={200} max={600} step={25}
        format={(v) => `${v}ms`}
        onChange={(v) => setValue("animMs", v)} />

      <div className={styles.row}>
        <div className={styles.rowLabel}>
          <span>Accent</span>
          <span className={styles.value}>{values.accent}</span>
        </div>
        <div className={styles.swatches}>
          {(Object.keys(ACCENT_PREVIEW) as TweakAccent[]).map((accent) => (
            <button key={accent} type="button" className={styles.swatch}
              aria-label={`Accent: ${accent}`}
              data-active={values.accent === accent}
              style={{ background: ACCENT_PREVIEW[accent] }}
              onClick={() => setValue("accent", accent)} />
          ))}
        </div>
      </div>

      <Slider label="Rhythm" value={values.rhythm} min={0.7} max={1.4} step={0.05}
        format={(v) => `${v.toFixed(2)}×`}
        onChange={(v) => setValue("rhythm", v)} />

      <div className={styles.row}>
        <div className={styles.rowLabel}>
          <span>Active color</span>
          <span className={styles.value}>{values.activeTheme}</span>
        </div>
        <div className={styles.swatches}>
          {ACTIVE_THEMES.map((t) => (
            <button key={t.id} type="button" className={styles.swatch}
              aria-label={`Active theme: ${t.label}`}
              data-active={values.activeTheme === t.id}
              style={{ background: t.swatch }}
              onClick={() => setValue("activeTheme", t.id)} />
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.row}>
        <div className={styles.rowLabel}>
          <span>Image style</span>
          <span className={styles.value}>{values.imageStyle}</span>
        </div>
        <div className={styles.segmented}>
          {IMAGE_STYLES.map((s) => (
            <button key={s.id} type="button" className={styles.segment}
              data-active={values.imageStyle === s.id}
              onClick={() => setValue("imageStyle", s.id)}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.rowLabel}><span>Card</span></div>
        <div className={styles.segmented}>
          {CARDS.map((c) => (
            <button key={c.id} type="button" className={styles.segment}
              data-active={editingCard === c.id}
              onClick={() => setEditingCard(c.id)}>{c.label}</button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.rowLabel}><span>State</span></div>
        <div className={styles.segmented}>
          {(["rest", "active"] as ImageState[]).map((s) => (
            <button key={s} type="button" className={styles.segment}
              data-active={editingState === s}
              onClick={() => setEditingState(s)}>{s}</button>
          ))}
        </div>
      </div>

      <Slider label="Image scale" value={editing.scale} min={1} max={2.5} step={0.05}
        format={(v) => `${v.toFixed(2)}×`}
        onChange={(v) => setCardImageTweak(editingCard, editingState, { scale: v })} />
      <Slider label="Position X" value={editing.posX} min={0} max={100} step={2}
        format={(v) => `${v}%`}
        onChange={(v) => setCardImageTweak(editingCard, editingState, { posX: v })} />
      <Slider label="Position Y" value={editing.posY} min={0} max={100} step={2}
        format={(v) => `${v}%`}
        onChange={(v) => setCardImageTweak(editingCard, editingState, { posY: v })} />

      {editingState === "active" ? (
        <>
          <Slider label="Active width" value={editing.widthPct} min={40} max={100} step={2}
            format={(v) => `${v}%`}
            onChange={(v) => setCardImageTweak(editingCard, editingState, { widthPct: v })} />
          <Slider label="Active height" value={editing.heightPx} min={120} max={400} step={5}
            format={(v) => `${v}px`}
            onChange={(v) => setCardImageTweak(editingCard, editingState, { heightPx: v })} />
          <Slider label="Active card height" value={editing.cardHeightPx} min={480} max={800} step={10}
            format={(v) => `${v}px`}
            onChange={(v) => setCardImageTweak(editingCard, editingState, { cardHeightPx: v })} />
        </>
      ) : null}
    </>
  );
}

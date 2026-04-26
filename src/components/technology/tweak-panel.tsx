"use client";

import { useEffect, useState } from "react";
import {
  useTweaks,
  type ActiveTheme,
  type CardId,
  type ImageState,
  type ImageStyle,
  type TweakAccent,
} from "@/lib/use-tweaks";
import styles from "./tweak-panel.module.css";

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

export function TweakPanel() {
  const [enabled, setEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [editingCard, setEditingCard] = useState<CardId>("materials");
  const [editingState, setEditingState] = useState<ImageState>("rest");
  const [snapshotMsg, setSnapshotMsg] = useState<string | null>(null);
  const { values, setValue, setCardImageTweak, reset } = useTweaks();

  useEffect(() => {
    const check = () => {
      const params = new URLSearchParams(window.location.search);
      setEnabled(params.get("tweaks") === "1");
    };
    check();
    window.addEventListener("popstate", check);
    return () => window.removeEventListener("popstate", check);
  }, []);

  if (!enabled) return null;

  const editing = values.imageTweaks[editingCard][editingState];

  const saveSnapshot = async () => {
    setSnapshotMsg("Saving…");
    try {
      const res = await fetch("/api/tweaks/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (res.ok) {
        setSnapshotMsg(`Saved → ${json.path ?? "tweaks-snapshot.json"}`);
      } else {
        setSnapshotMsg(`Error: ${json.error ?? res.status}`);
      }
    } catch (e) {
      setSnapshotMsg(`Error: ${e instanceof Error ? e.message : "unknown"}`);
    }
    setTimeout(() => setSnapshotMsg(null), 4000);
  };

  return (
    <div className={styles.panel} role="dialog" aria-label="Design tweaks">
      <div className={styles.bar}>
        <span className={styles.title}>Tweaks</span>
        <div>
          <button type="button" className={styles.reset} onClick={reset}>Reset</button>
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
          >
            {collapsed ? "Show" : "Hide"}
          </button>
        </div>
      </div>

      <div className={styles.body} data-collapsed={collapsed}>
        <Slider
          label="Pillar pop"
          value={values.pillarPop}
          min={1} max={1.8} step={0.05}
          format={(v) => `${v.toFixed(2)}×`}
          onChange={(v) => setValue("pillarPop", v)}
        />
        <Slider
          label="Sibling dim"
          value={values.siblingDim}
          min={0} max={0.7} step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => setValue("siblingDim", v)}
        />
        <Slider
          label="Transition"
          value={values.animMs}
          min={200} max={600} step={25}
          format={(v) => `${v}ms`}
          onChange={(v) => setValue("animMs", v)}
        />

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Accent</span>
            <span className={styles.value}>{values.accent}</span>
          </div>
          <div className={styles.swatches}>
            {(Object.keys(ACCENT_PREVIEW) as TweakAccent[]).map((accent) => (
              <button
                key={accent}
                type="button"
                className={styles.swatch}
                aria-label={`Accent: ${accent}`}
                data-active={values.accent === accent}
                style={{ background: ACCENT_PREVIEW[accent] }}
                onClick={() => setValue("accent", accent)}
              />
            ))}
          </div>
        </div>

        <Slider
          label="Rhythm"
          value={values.rhythm}
          min={0.7} max={1.4} step={0.05}
          format={(v) => `${v.toFixed(2)}×`}
          onChange={(v) => setValue("rhythm", v)}
        />

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Active color</span>
            <span className={styles.value}>{values.activeTheme}</span>
          </div>
          <div className={styles.swatches}>
            {ACTIVE_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={styles.swatch}
                aria-label={`Active theme: ${t.label}`}
                data-active={values.activeTheme === t.id}
                style={{ background: t.swatch }}
                onClick={() => setValue("activeTheme", t.id)}
              />
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
              <button
                key={s.id}
                type="button"
                className={styles.segment}
                data-active={values.imageStyle === s.id}
                onClick={() => setValue("imageStyle", s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Card</span>
          </div>
          <div className={styles.segmented}>
            {CARDS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles.segment}
                data-active={editingCard === c.id}
                onClick={() => setEditingCard(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>State</span>
          </div>
          <div className={styles.segmented}>
            {(["rest", "active"] as ImageState[]).map((s) => (
              <button
                key={s}
                type="button"
                className={styles.segment}
                data-active={editingState === s}
                onClick={() => setEditingState(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Slider
          label="Image scale"
          value={editing.scale}
          min={1} max={2.5} step={0.05}
          format={(v) => `${v.toFixed(2)}×`}
          onChange={(v) => setCardImageTweak(editingCard, editingState, { scale: v })}
        />
        <Slider
          label="Position X"
          value={editing.posX}
          min={0} max={100} step={2}
          format={(v) => `${v}%`}
          onChange={(v) => setCardImageTweak(editingCard, editingState, { posX: v })}
        />
        <Slider
          label="Position Y"
          value={editing.posY}
          min={0} max={100} step={2}
          format={(v) => `${v}%`}
          onChange={(v) => setCardImageTweak(editingCard, editingState, { posY: v })}
        />

        <div className={styles.divider} />

        <div className={styles.row}>
          <button type="button" className={styles.snapshot} onClick={saveSnapshot}>
            💾 Save snapshot
          </button>
          {snapshotMsg ? (
            <div className={styles.snapshotMsg}>{snapshotMsg}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Slider({
  label, value, min, max, step, format, onChange,
}: {
  label: string;
  value: number;
  min: number; max: number; step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        <span>{label}</span>
        <span className={styles.value}>{format(value)}</span>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

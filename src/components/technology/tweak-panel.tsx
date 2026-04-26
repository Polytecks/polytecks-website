"use client";

import { useEffect, useState } from "react";
import {
  useTweaks,
  type ActiveTheme,
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

const IMAGE_STYLES: { id: ImageStyle; label: string; hint: string }[] = [
  { id: "framed",     label: "Framed",     hint: "Curved corners, margin around" },
  { id: "banner",     label: "Banner",     hint: "Full-width strip, no margin" },
  { id: "background", label: "Background", hint: "Fills card, fades behind title" },
];

export function TweakPanel() {
  const [enabled, setEnabled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { values, setValue, reset } = useTweaks();

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
        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Pillar pop</span>
            <span className={styles.value}>{values.pillarPop.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={1}
            max={1.8}
            step={0.05}
            value={values.pillarPop}
            onChange={(e) => setValue("pillarPop", Number(e.target.value))}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Sibling dim</span>
            <span className={styles.value}>{Math.round(values.siblingDim * 100)}%</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={0.7}
            step={0.05}
            value={values.siblingDim}
            onChange={(e) => setValue("siblingDim", Number(e.target.value))}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Transition</span>
            <span className={styles.value}>{values.animMs}ms</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={200}
            max={600}
            step={25}
            value={values.animMs}
            onChange={(e) => setValue("animMs", Number(e.target.value))}
          />
        </div>

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

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Rhythm</span>
            <span className={styles.value}>{values.rhythm.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={0.7}
            max={1.4}
            step={0.05}
            value={values.rhythm}
            onChange={(e) => setValue("rhythm", Number(e.target.value))}
          />
        </div>

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
                title={s.hint}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Image scale</span>
            <span className={styles.value}>{values.imageScale.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={1}
            max={2}
            step={0.05}
            value={values.imageScale}
            onChange={(e) => setValue("imageScale", Number(e.target.value))}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <span>Image position</span>
            <span className={styles.value}>{values.imagePosY}%</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={100}
            step={5}
            value={values.imagePosY}
            onChange={(e) => setValue("imagePosY", Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  useTweaks,
  type ActiveTheme,
  type PillarVariant,
} from "@/lib/use-tweaks";
import styles from "./tweak-panel.module.css";

const VARIANTS: { id: PillarVariant; label: string; hint: string }[] = [
  { id: "card",  label: "Card",  hint: "Three separate cards, gaps between" },
  { id: "split", label: "Split", hint: "One rectangle in three sections" },
];

const ACTIVE_THEMES: { id: ActiveTheme; label: string; swatch: string }[] = [
  { id: "indigo",  label: "Indigo",  swatch: "rgba(74, 84, 192, 0.6)" },
  { id: "lighter", label: "Lighter", swatch: "rgba(142, 152, 238, 0.85)" },
  { id: "cool",    label: "Cool",    swatch: "rgba(255, 255, 255, 0.5)" },
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
            <span>Variant</span>
            <span className={styles.value}>{values.variant}</span>
          </div>
          <div className={styles.segmented}>
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                className={styles.segment}
                data-active={values.variant === v.id}
                onClick={() => setValue("variant", v.id)}
                title={v.hint}
              >
                {v.label}
              </button>
            ))}
          </div>
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
      </div>
    </div>
  );
}

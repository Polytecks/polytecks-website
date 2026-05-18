"use client";

import { useState } from "react";
import { useTweaks, type TitleAnim } from "@/lib/use-tweaks";
import { Slider } from "./slider";
import styles from "../tweak-panel.module.css";

/** Inline colour-picker row — matches the Slider row layout so the
 *  Cambridge glow section reads as a single coherent group. Native
 *  `<input type="color">` so we don't ship a custom palette UI. */
function ColorInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        <span>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
      <input
        type="color"
        className={styles.colorInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const TITLE_ANIMS: { id: TitleAnim; label: string }[] = [
  { id: "wipe",    label: "Wipe" },
  { id: "cascade", label: "Cascade" },
  { id: "stack",   label: "Stack" },
];

export function PageFxTab() {
  const { values, setValue } = useTweaks();
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const copyGlowSnapshot = async () => {
    const tsBlock = [
      "/* Paste into use-tweaks.tsx — TWEAK_DEFAULTS */",
      `cambridgeGlowEnabled: ${values.cambridgeGlowEnabled},`,
      `cambridgeGlowOpacity: ${values.cambridgeGlowOpacity},`,
      `cambridgeGlowCenterXPct: ${values.cambridgeGlowCenterXPct},`,
      `cambridgeGlowCenterYPct: ${values.cambridgeGlowCenterYPct},`,
      `cambridgeGlowRadiusPct: ${values.cambridgeGlowRadiusPct},`,
      `cambridgeGlowColor1: "${values.cambridgeGlowColor1}",`,
      `cambridgeGlowColor2: "${values.cambridgeGlowColor2}",`,
      `cambridgeGlowDriftS: ${values.cambridgeGlowDriftS},`,
      `cambridgeGlowBreatheS: ${values.cambridgeGlowBreatheS},`,
      `cambridgeGlowBreatheAmp: ${values.cambridgeGlowBreatheAmp},`,
      `cambridgeGlowMottle: ${values.cambridgeGlowMottle},`,
      `cambridgeGlowBottomCutPct: ${values.cambridgeGlowBottomCutPct},`,
      `cambridgeGlowBottomAngleDeg: ${values.cambridgeGlowBottomAngleDeg},`,
    ].join("\n");
    const amp = values.cambridgeGlowBreatheAmp;
    const cssBlock = [
      "/* Paste into cambridge-section.module.css fallback defaults */",
      `--tw-cb-glow-enabled: ${values.cambridgeGlowEnabled ? 1 : 0};`,
      `--tw-cb-glow-opacity: ${values.cambridgeGlowOpacity};`,
      `--tw-cb-glow-cx: ${values.cambridgeGlowCenterXPct}%;`,
      `--tw-cb-glow-cy: ${values.cambridgeGlowCenterYPct}%;`,
      `--tw-cb-glow-radius: ${values.cambridgeGlowRadiusPct}%;`,
      `--tw-cb-glow-color-1: ${values.cambridgeGlowColor1};`,
      `--tw-cb-glow-color-2: ${values.cambridgeGlowColor2};`,
      `--tw-cb-glow-drift-s: ${values.cambridgeGlowDriftS}s;`,
      `--tw-cb-glow-breathe-s: ${values.cambridgeGlowBreatheS}s;`,
      `--tw-cb-glow-scale-min: ${(1 - amp).toFixed(4)};`,
      `--tw-cb-glow-scale-max: ${(1 + amp).toFixed(4)};`,
      `--tw-cb-glow-mottle: ${values.cambridgeGlowMottle};`,
      `--tw-cb-glow-bottom-cut: ${values.cambridgeGlowBottomCutPct}%;`,
      `--tw-cb-glow-bottom-angle: ${values.cambridgeGlowBottomAngleDeg}deg;`,
    ].join("\n");
    const snapshot = `${tsBlock}\n\n${cssBlock}\n`;
    try {
      await navigator.clipboard.writeText(snapshot);
      setCopyMsg("Copied glow values to clipboard");
    } catch {
      setCopyMsg("Clipboard blocked — open devtools console");
      // eslint-disable-next-line no-console
      console.log(snapshot);
    }
    setTimeout(() => setCopyMsg(null), 3000);
  };

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

      <Slider label="Stack speed" value={values.stackDurationMs} min={200} max={1500} step={50}
        format={(v) => `${v}ms`}
        onChange={(v) => setValue("stackDurationMs", v)} />
      <Slider label="Stack overlap" value={values.stackOverlapPct} min={0} max={100} step={5}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("stackOverlapPct", v)} />
      <Slider label="Pillar cards stagger" value={values.pillarCardStaggerMs} min={0} max={500} step={20}
        format={(v) => `${v}ms`}
        onChange={(v) => setValue("pillarCardStaggerMs", v)} />
      <Slider label="Devices icons stagger" value={values.devicesIconStaggerMs} min={20} max={250} step={10}
        format={(v) => `${v}ms`}
        onChange={(v) => setValue("devicesIconStaggerMs", v)} />

      <div className={styles.divider} />

      <Slider label="Landing duration" value={values.landingElemDurationMs} min={200} max={2000} step={50}
        format={(v) => `${v}ms`}
        onChange={(v) => setValue("landingElemDurationMs", v)} />
      <Slider label="Landing arm delay" value={values.landingArmDelayMs} min={0} max={3000} step={50}
        format={(v) => `${v}ms`}
        onChange={(v) => setValue("landingArmDelayMs", v)} />
      <Slider label="Landing sub delay" value={values.landingSubDelayMs} min={0} max={3000} step={50}
        format={(v) => `${v}ms`}
        onChange={(v) => setValue("landingSubDelayMs", v)} />
      <Slider label="Landing CTA1 delay" value={values.landingCta1DelayMs} min={0} max={3000} step={50}
        format={(v) => `${v}ms`}
        onChange={(v) => setValue("landingCta1DelayMs", v)} />
      <Slider label="Landing CTA2 delay" value={values.landingCta2DelayMs} min={0} max={3000} step={50}
        format={(v) => `${v}ms`}
        onChange={(v) => setValue("landingCta2DelayMs", v)} />
      <Slider label="Landing header shift" value={values.landingHeroShiftPx} min={0} max={200} step={4}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("landingHeroShiftPx", v)} />

      <div className={styles.row}>
        <button
          type="button"
          className={styles.snapshot}
          onClick={() => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("polytecks:replay-page"));
            }
          }}
        >
          ▶ Replay page anim
        </button>
      </div>

      <div className={styles.divider} />

      <Slider label="Cambridge ECG callout top" value={values.cambridgeCalloutTopVh} min={0} max={100} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("cambridgeCalloutTopVh", v)} />
      <Slider label="Cambridge ECG callout left" value={values.cambridgeCalloutLeftVw} min={0} max={100} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("cambridgeCalloutLeftVw", v)} />
      <Slider label="Cambridge body callout top" value={values.cambridgeBodyCalloutTopVh} min={0} max={100} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("cambridgeBodyCalloutTopVh", v)} />
      <Slider label="Cambridge body callout left" value={values.cambridgeBodyCalloutLeftVw} min={0} max={100} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("cambridgeBodyCalloutLeftVw", v)} />
      <Slider label="Callout font (cqw)" value={values.cambridgeCalloutFontCqw} min={0.4} max={1.5} step={0.01}
        format={(v) => `${v.toFixed(2)}cqw`}
        onChange={(v) => setValue("cambridgeCalloutFontCqw", v)} />
      <Slider label="Callout max-width" value={values.cambridgeCalloutMaxWidthPct} min={20} max={80} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("cambridgeCalloutMaxWidthPct", v)} />
      <Slider label="Cambridge scale" value={values.cambridgeImgScale} min={0.4} max={1.5} step={0.02}
        format={(v) => `${v.toFixed(2)}×`}
        onChange={(v) => setValue("cambridgeImgScale", v)} />
      <Slider label="Cambridge crop bottom" value={values.cambridgeCropBottom} min={0} max={0.6} step={0.02}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => setValue("cambridgeCropBottom", v)} />
      <Slider label="Cambridge crop sides" value={values.cambridgeCropSides} min={0} max={0.4} step={0.02}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(v) => setValue("cambridgeCropSides", v)} />
      <Slider label="Cambridge side fade" value={values.cambridgeSideFadePct} min={0} max={30} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("cambridgeSideFadePct", v)} />

      <div className={styles.divider} />

      <div className={styles.row}>
        <div className={styles.rowLabel}><span>CAMBRIDGE GLOW</span></div>
      </div>
      <div className={styles.row}>
        <div className={styles.rowLabel}>
          <span>Glow on</span>
          <span className={styles.value}>{values.cambridgeGlowEnabled ? "on" : "off"}</span>
        </div>
        <div className={styles.segmented}>
          <button type="button" className={styles.segment}
            data-active={values.cambridgeGlowEnabled === true}
            onClick={() => setValue("cambridgeGlowEnabled", true)}>On</button>
          <button type="button" className={styles.segment}
            data-active={values.cambridgeGlowEnabled === false}
            onClick={() => setValue("cambridgeGlowEnabled", false)}>Off</button>
        </div>
      </div>
      <Slider label="Glow opacity" value={values.cambridgeGlowOpacity} min={0} max={1} step={0.02}
        format={(v) => v.toFixed(2)}
        onChange={(v) => setValue("cambridgeGlowOpacity", v)} />
      <Slider label="Glow centre X" value={values.cambridgeGlowCenterXPct} min={0} max={100} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("cambridgeGlowCenterXPct", v)} />
      <Slider label="Glow centre Y" value={values.cambridgeGlowCenterYPct} min={0} max={100} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("cambridgeGlowCenterYPct", v)} />
      <Slider label="Glow radius" value={values.cambridgeGlowRadiusPct} min={10} max={150} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("cambridgeGlowRadiusPct", v)} />
      <ColorInput label="Glow base colour" value={values.cambridgeGlowColor1}
        onChange={(v) => setValue("cambridgeGlowColor1", v)} />
      <ColorInput label="Glow shift colour" value={values.cambridgeGlowColor2}
        onChange={(v) => setValue("cambridgeGlowColor2", v)} />
      <Slider label="Colour drift" value={values.cambridgeGlowDriftS} min={5} max={80} step={1}
        format={(v) => `${v}s`}
        onChange={(v) => setValue("cambridgeGlowDriftS", v)} />
      <Slider label="Breathe duration" value={values.cambridgeGlowBreatheS} min={5} max={40} step={1}
        format={(v) => `${v}s`}
        onChange={(v) => setValue("cambridgeGlowBreatheS", v)} />
      <Slider label="Breathe amplitude" value={values.cambridgeGlowBreatheAmp} min={0} max={0.2} step={0.005}
        format={(v) => `±${(v * 100).toFixed(1)}%`}
        onChange={(v) => setValue("cambridgeGlowBreatheAmp", v)} />
      <Slider label="Mottle intensity" value={values.cambridgeGlowMottle} min={0} max={1} step={0.02}
        format={(v) => v.toFixed(2)}
        onChange={(v) => setValue("cambridgeGlowMottle", v)} />
      <Slider label="Glow bottom cut" value={values.cambridgeGlowBottomCutPct} min={0} max={40} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("cambridgeGlowBottomCutPct", v)} />
      <Slider label="Glow bottom angle" value={values.cambridgeGlowBottomAngleDeg} min={-10} max={10} step={0.5}
        format={(v) => `${v}°`}
        onChange={(v) => setValue("cambridgeGlowBottomAngleDeg", v)} />

      <div className={styles.row}>
        <button type="button" className={styles.snapshot} onClick={copyGlowSnapshot}>
          📋 Save current glow values
        </button>
        {copyMsg ? <div className={styles.snapshotMsg}>{copyMsg}</div> : null}
      </div>

      <div className={styles.divider} />

      {/* Contact image — scale, offset, and spotlight are fully independent. */}
      <div className={styles.row}>
        <div className={styles.rowLabel}><span>CONTACT IMAGE</span></div>
      </div>
      <Slider label="Image scale" value={values.contactImgScale} min={0.5} max={2} step={0.05}
        format={(v) => `${v.toFixed(2)}×`}
        onChange={(v) => setValue("contactImgScale", v)} />
      <Slider label="Image offset X" value={values.contactImgOffsetXPct} min={0} max={40} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("contactImgOffsetXPct", v)} />
      <Slider label="Spotlight X" value={values.contactSpotXPct} min={30} max={100} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("contactSpotXPct", v)} />
      <Slider label="Spotlight Y" value={values.contactSpotYPct} min={20} max={80} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("contactSpotYPct", v)} />
      <Slider label="Spotlight size" value={values.contactSpotSizePct} min={30} max={120} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("contactSpotSizePct", v)} />
    </>
  );
}

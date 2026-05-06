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
      <Slider label="Cambridge bottom fade" value={values.cambridgeBottomFadePct} min={0} max={50} step={1}
        format={(v) => `${v}%`}
        onChange={(v) => setValue("cambridgeBottomFadePct", v)} />


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

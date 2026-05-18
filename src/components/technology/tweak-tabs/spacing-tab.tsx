"use client";

import { useTweaks } from "@/lib/use-tweaks";
import { Slider } from "./slider";
import styles from "../tweak-panel.module.css";

export function SpacingTab() {
  const { values, setValue } = useTweaks();
  return (
    <>
      <div className={styles.row}>
        <div className={styles.rowLabel}><span>HOME</span></div>
      </div>
      <Slider label="Home — mission top" value={values.homeMissionMargin} min={0} max={200} step={4}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("homeMissionMargin", v)} />
      <Slider label="Home — ribbon top" value={values.homeRibbonMargin} min={0} max={200} step={4}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("homeRibbonMargin", v)} />

      <div className={styles.divider} />

      <div className={styles.row}>
        <div className={styles.rowLabel}><span>ABOUT</span></div>
      </div>
      <Slider label="Header → Cambridge" value={values.aboutHeaderToCambridge} min={100} max={600} step={10}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("aboutHeaderToCambridge", v)} />
      <Slider label="Cambridge → Team" value={values.aboutCambridgeToTeam} min={-200} max={300} step={10}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("aboutCambridgeToTeam", v)} />
      <Slider label="Team top gap" value={values.aboutTeamGap} min={-200} max={200} step={10}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("aboutTeamGap", v)} />

      <div className={styles.divider} />

      <div className={styles.row}>
        <div className={styles.rowLabel}><span>TECHNOLOGY</span></div>
      </div>
      <Slider label="Hero → Pillars" value={values.techHeroToPillars} min={0} max={200} step={4}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("techHeroToPillars", v)} />
      <Slider label="Pillars → Proof" value={values.techPillarsToProof} min={0} max={200} step={4}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("techPillarsToProof", v)} />
      <Slider label="Proof → Philosophy" value={values.techProofToPhilosophy} min={0} max={200} step={4}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("techProofToPhilosophy", v)} />

      <div className={styles.divider} />

      <div className={styles.row}>
        <div className={styles.rowLabel}><span>DEVICES</span></div>
      </div>
      <Slider label="Header → Icons" value={values.devicesHeaderToStrip} min={0} max={160} step={4}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("devicesHeaderToStrip", v)} />
      <Slider label="Icons → Tabs" value={values.devicesStripGapBelow} min={0} max={160} step={4}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("devicesStripGapBelow", v)} />
      <Slider label="Icon ↔ label gap" value={values.devicesIconRowGapY} min={4} max={48} step={2}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("devicesIconRowGapY", v)} />

      <div className={styles.divider} />

      <div className={styles.row}>
        <div className={styles.rowLabel}><span>CAREERS</span></div>
      </div>
      <Slider label="Values bottom panel" value={values.careersValuesBottom} min={80} max={480} step={8}
        format={(v) => `${v}px`}
        onChange={(v) => setValue("careersValuesBottom", v)} />
    </>
  );
}

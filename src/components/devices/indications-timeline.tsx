"use client";

import { useEffect, useRef } from "react";
import { StackEntry } from "@/components/stack-entry";
import styles from "./indications-timeline.module.css";

/**
 * Future Indications timeline + coda.
 *
 * The scroll-driven dot tracking, ECG SMIL waves, and the alternating-
 * side card layout are ported verbatim from the redesign hand-off
 * (Devices_Redesign_Handoff.md). The lerp factor (0.22), the snap
 * threshold (0.2), and the negative `begin` offsets on each ECG
 * <animateTransform> are tuned values — do not improve them.
 *
 * The `.indication` cards do NOT get a load-in fade. Their appearance
 * is the scroll-driven `.isActive` activation.
 */
type Indication = {
  title: string;
  descriptor: string;
  body: string;
  side: "left" | "right";
  wavePath: string;
  /** Negative begin offsets stagger the start of each card's wave loop
   *  so they don't all sync. */
  begin: string;
  screenLabel: string;
};

const INDICATIONS: Indication[] = [
  {
    title: "Arrhythmia Mapping",
    descriptor: "Cardiac · spatial reconstruction",
    body: "Detecting arrhythmias often requires extended monitoring or specialist investigation. Polytecks enables high-resolution reconstruction of how cardiac electrical activity propagates across the chest, supporting earlier and more accessible rhythm assessment.",
    side: "left",
    wavePath:
      "M0 36 L60 36 L72 26 L82 50 L94 30 L108 42 L122 36 L180 36 L196 14 L210 56 L222 28 L240 46 L252 36 L320 36 L334 22 L348 50 L360 32 L400 36",
    begin: "-1.5s",
    screenLabel: "02 Arrhythmia Mapping",
  },
  {
    title: "Fetal Monitoring",
    descriptor: "Continuous · maternal abdomen",
    body: "Monitoring fetal health is limited by access, intermittency, and the difficulty of separating maternal and fetal signals. Polytecks supports continuous, non-invasive abdominal measurement for earlier and more longitudinal insight during pregnancy.",
    side: "right",
    wavePath:
      "M0 38 C 30 38, 40 22, 60 22 C 80 22, 90 38, 110 38 C 130 38, 140 22, 160 22 C 180 22, 190 38, 220 38 C 250 38, 260 22, 280 22 C 300 22, 310 38, 340 38 C 370 38, 380 22, 400 22",
    begin: "-3s",
    screenLabel: "03 Fetal Monitoring",
  },
  {
    title: "Neuromuscular & Autonomic",
    descriptor: "Surface electrophysiology · longitudinal",
    body: "Many disorders of the nervous system and muscles are difficult to quantify outside specialist settings. Polytecks opens a path to higher-resolution surface electrophysiology for monitoring neuromuscular and autonomic function over time.",
    side: "left",
    wavePath:
      "M0 36 L40 36 L48 28 L54 44 L60 30 L68 42 L76 36 L120 36 L128 24 L136 48 L142 32 L150 40 L158 36 L210 36 L218 28 L226 44 L234 32 L242 40 L250 36 L300 36 L308 26 L316 46 L324 32 L334 40 L344 36 L400 36",
    begin: "-4.5s",
    screenLabel: "04 Neuromuscular & Autonomic",
  },
  {
    title: "EEG Research",
    descriptor: "Neural · high-density acquisition",
    body: "Current EEG workflows can be cumbersome, sparse, or difficult to scale outside dedicated environments. Polytecks offers a route toward more flexible, high-density neural signal capture for research settings.",
    side: "right",
    wavePath:
      "M0 36 Q 12 18 24 36 T 48 36 T 72 36 T 96 36 T 120 36 T 144 36 T 168 36 T 192 36 T 216 36 T 240 36 T 264 36 T 288 36 T 312 36 T 336 36 T 360 36 T 400 36",
    begin: "-6s",
    screenLabel: "05 EEG Research",
  },
  {
    title: "GI Disease Diagnostics & Monitoring",
    descriptor: "Gastrointestinal · functional measurement",
    body: "Many gastrointestinal disorders lack simple tools for functional measurement over time. Polytecks could support new approaches to capturing electrophysiological signatures linked to GI disease and motility.",
    side: "left",
    wavePath:
      "M0 36 C 50 36, 70 18, 110 18 C 150 18, 170 50, 220 50 C 270 50, 290 22, 330 22 C 370 22, 390 36, 400 36",
    begin: "-7.5s",
    screenLabel: "06 GI Disease",
  },
  {
    title: "Prosthetic Control",
    descriptor: "Human-machine interface",
    body: "Advanced prosthetic control depends on reliable acquisition of muscular and neural intent. Polytecks could help capture richer surface bioelectrical data to support more responsive human-machine interfaces.",
    side: "right",
    wavePath:
      "M0 36 L40 36 L52 18 L62 50 L72 26 L86 44 L98 36 L150 36 L162 16 L172 52 L184 28 L198 46 L212 36 L260 36 L272 20 L284 50 L296 30 L310 44 L322 36 L400 36",
    begin: "-9s",
    screenLabel: "07 Prosthetic Control",
  },
  {
    title: "Cancer Screening",
    descriptor: "Bioelectrical signatures · early signal",
    body: "Certain cancers may present measurable bioelectrical signatures before symptoms become obvious. Polytecks is exploring how high-resolution sensing may contribute to new non-invasive screening approaches.",
    side: "left",
    wavePath:
      "M0 38 L80 38 L100 28 L120 38 L200 38 L220 16 L240 38 L320 38 L340 30 L360 38 L400 38",
    begin: "-10.5s",
    screenLabel: "08 Cancer Screening",
  },
  {
    title: "Epilepsy Monitoring",
    descriptor: "Neural · continuous, episodic capture",
    body: "Epileptic activity can be episodic and difficult to characterise in everyday settings. Polytecks could support more continuous and accessible monitoring of neural activity over time.",
    side: "right",
    wavePath:
      "M0 36 L60 36 L66 32 L74 40 L82 32 L92 40 L100 36 L160 36 L168 16 L176 56 L184 18 L192 54 L200 22 L210 50 L220 36 L280 36 L288 30 L296 42 L304 30 L312 42 L320 36 L400 36",
    begin: "-12s",
    screenLabel: "09 Epilepsy Monitoring",
  },
];

function IndicationWave({ d, begin }: { d: string; begin: string }) {
  return (
    <div className={styles.wave} aria-hidden="true">
      <svg viewBox="0 0 400 64" preserveAspectRatio="none">
        <g>
          <path
            className={`${styles.wavePath} ${styles.ghost}`}
            d={d}
            transform="translate(0 4)"
          />
          <path className={`${styles.wavePath} ${styles.lead}`} d={d} />
          <path
            className={`${styles.wavePath} ${styles.ghost}`}
            d={d}
            transform="translate(400 4)"
          />
          <path
            className={`${styles.wavePath} ${styles.lead}`}
            d={d}
            transform="translate(400 0)"
          />
          <animateTransform
            attributeName="transform"
            type="translate"
            from="0 0"
            to="-400 0"
            dur="9s"
            begin={begin}
            repeatCount="indefinite"
            additive="replace"
          />
        </g>
      </svg>
    </div>
  );
}

function IndicationCard({ ind }: { ind: Indication }) {
  const sideClass = ind.side === "left" ? styles.indicationLeft : styles.indicationRight;
  const card = (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{ind.title}</h3>
      <div className={styles.descriptor}>{ind.descriptor}</div>
      <IndicationWave d={ind.wavePath} begin={ind.begin} />
      <p className={styles.body}>{ind.body}</p>
    </div>
  );

  return (
    <article
      className={`${styles.indication} ${sideClass}`}
      data-screen-label={ind.screenLabel}
    >
      {ind.side === "left" ? (
        <>
          {card}
          <div className={styles.spacer} />
        </>
      ) : (
        <>
          <div className={styles.spacer} />
          {card}
        </>
      )}
      <div className={styles.connector} aria-hidden="true" />
    </article>
  );
}

export function IndicationsTimeline() {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  /**
   * Scroll-driven timeline with lerp smoothing — ported verbatim from
   * the hand-off file's IIFE. The dot's TARGET position is recomputed
   * on each scroll (where it should be given current scroll). Its
   * actual displayed position EASES toward that target each animation
   * frame. This eliminates the 1px-vibration that happens when the dot
   * is pinned to viewport centre — micro-scroll jitter is filtered by
   * the lerp.
   */
  useEffect(() => {
    const timeline = timelineRef.current;
    const fill = fillRef.current;
    const dot = dotRef.current;
    if (!timeline || !fill || !dot) return;
    const indications = Array.from(
      timeline.querySelectorAll<HTMLElement>(`.${styles.indication}`),
    );

    let targetOffset = 0; // where the dot should be (timeline-relative px)
    let currentOffset = 0; // where it actually is, eased
    let rafId = 0;
    let needsTarget = true;

    function readTarget() {
      if (!timeline) return;
      needsTarget = false;
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const tlTop = rect.top;
      const tlHeight = rect.height;
      const center = vh / 2;

      let dotViewportY;
      if (tlTop > center) {
        dotViewportY = tlTop;
      } else if (tlTop + tlHeight < center) {
        dotViewportY = tlTop + tlHeight;
      } else {
        dotViewportY = center;
      }
      targetOffset = Math.max(0, Math.min(tlHeight, dotViewportY - tlTop));
    }

    function updateActive() {
      if (!timeline) return;
      const rect = timeline.getBoundingClientRect();
      const dotViewportY = rect.top + currentOffset;
      indications.forEach((el) => {
        const r = el.getBoundingClientRect();
        const elCenter = r.top + r.height / 2;
        if (elCenter <= dotViewportY + 40) {
          el.classList.add(styles.isActive);
        } else {
          el.classList.remove(styles.isActive);
        }
      });
    }

    function tick() {
      if (needsTarget) readTarget();
      // Ease 22% per frame — feels alive but not laggy
      const next = currentOffset + (targetOffset - currentOffset) * 0.22;
      // Snap when very close to avoid sub-pixel jitter
      currentOffset = Math.abs(next - targetOffset) < 0.2 ? targetOffset : next;

      if (dot) dot.style.transform = "translateY(" + currentOffset.toFixed(2) + "px)";
      if (fill) fill.style.height = currentOffset.toFixed(2) + "px";

      updateActive();
      rafId = requestAnimationFrame(tick);
    }

    function onScroll() {
      needsTarget = true;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Initial sync — snap to target immediately so first paint isn't off
    readTarget();
    currentOffset = targetOffset;
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <StackEntry index={9}>
        <div className={styles.sectionHead}>
          <div className={styles.kicker}>Future indications</div>
          <h2 className={styles.heading}>
            The same platform, applied across <em>adjacent</em> areas of health.
          </h2>
          <p className={styles.support}>
            A look at the directions we are exploring beyond the first device — across cardiology, neurophysiology, and other domains where high-resolution surface electrophysiology can change what is possible at the point of care.
          </p>
        </div>
      </StackEntry>

      <div ref={timelineRef} className={styles.timeline} id="timeline">
        <div className={styles.track} aria-hidden="true" />
        <div ref={fillRef} className={styles.fill} aria-hidden="true" />
        <div ref={dotRef} className={styles.dot} aria-hidden="true" />

        {INDICATIONS.map((ind) => (
          <IndicationCard key={ind.title} ind={ind} />
        ))}
      </div>

      <StackEntry index={10}>
        <div className={styles.coda} data-screen-label="10 And many more">
          <p>
            And <em>many more</em>, across cardiology, neurophysiology, autonomic systems, and musculoskeletal health.
          </p>
        </div>
      </StackEntry>
    </>
  );
}

"use client";

import { FadeImage as Image } from "@/components/fade-image";
import { motion } from "framer-motion";
import { useRef, useState, type CSSProperties } from "react";
import type { CardImageTweaks } from "@/lib/use-tweaks";
import type { PillarContent, PillarVisual } from "./pillar-data";
import styles from "./pillar.module.css";

function Visual({ visual }: { visual: PillarVisual }) {
  if (visual.kind === "video") {
    return (
      <video
        src={visual.src}
        autoPlay
        loop
        muted
        playsInline
        aria-label={visual.alt}
      />
    );
  }
  return (
    <Image
      src={visual.src}
      alt={visual.alt}
      width={visual.width}
      height={visual.height}
      sizes="(max-width: 720px) 100vw, 33vw"
    />
  );
}

export function Pillar({
  content,
  imageStyle,
  imageTweaks,
  isActive,
  anyActive,
  popRatio,
  siblingDim,
  animMs,
  entryIndex,
  staggerMs = 120,
  baseDelayMs = 0,
  onActivate,
  onDeactivate,
}: {
  content: PillarContent;
  imageStyle: "framed" | "banner" | "background";
  imageTweaks: CardImageTweaks;
  isActive: boolean;
  anyActive: boolean;
  popRatio: number;
  siblingDim: number;
  animMs: number;
  /** Left-to-right stagger order index (0 = first to appear). If undefined, no entry animation. */
  entryIndex?: number;
  /** Per-card stagger in ms (passed from parent so the entry delay is computed
   *  synchronously at first render, before Framer's animation kicks off). */
  staggerMs?: number;
  /** Absolute delay (ms) added to every card's entry — anchors the cascade
   *  to fire after preceding page elements (hero + section title) finish. */
  baseDelayMs?: number;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  // Track when the entry animation has completed so subsequent hover/active
  // opacity transitions don't carry the entry delay.
  const [entryDone, setEntryDone] = useState(entryIndex === undefined);

  // Compute the entry delay synchronously from props so Framer's first-render
  // transition uses the correct delay. (Reading CSS vars in useEffect was racy
  // with TweaksProvider's effect timing — the entry animation would start at
  // delay 0 before the effect ran.)
  const delay = (baseDelayMs + (entryIndex ?? 0) * staggerMs) / 1000;

  const flexGrow = !anyActive ? 1 : isActive ? popRatio : (3 - popRatio) / 2;
  const opacity = !anyActive ? 1 : isActive ? 1 : 1 - siblingDim;
  const scale = !anyActive ? 1 : isActive ? 1 : 0.96;

  const styleVars: CSSProperties = {
    flexGrow,
    // Per-card per-state image positioning consumed in pillar.module.css.
    ["--img-rest-pos" as string]: `${imageTweaks.rest.posX}% ${imageTweaks.rest.posY}%`,
    ["--img-rest-scale" as string]: String(imageTweaks.rest.scale),
    ["--img-active-pos" as string]: `${imageTweaks.active.posX}% ${imageTweaks.active.posY}%`,
    ["--img-active-scale" as string]: String(imageTweaks.active.scale),
    // Active-state image-window size — width as multiplier of available, height in px.
    ["--img-active-width-mult" as string]: String(imageTweaks.active.widthPct / 100),
    ["--img-active-height" as string]: `${imageTweaks.active.heightPx}px`,
    // Active-state card min-height — drives how far down the card extends.
    ["--card-active-height" as string]: `${imageTweaks.active.cardHeightPx}px`,
  };

  // Entry animation: fade up from below on mount (left-to-right stagger via entryIndex).
  // After the entry completes, onAnimationComplete clears the entry delay so subsequent
  // opacity/scale transitions (hover interactions) respond without lag.
  // `delay` is derived from the --stack-stagger-ms CSS var (set by applyToBody).

  return (
    <motion.button
      ref={ref}
      type="button"
      className={`${styles.pillar} pillar-root`}
      data-active={isActive}
      data-style={imageStyle}
      data-pillar-id={content.id}
      onFocus={onActivate}
      onBlur={onDeactivate}
      onClick={onActivate}
      aria-expanded={isActive}
      style={styleVars}
      initial={entryIndex !== undefined ? { opacity: 0, y: 28 } : false}
      animate={{ opacity, scale, y: 0 }}
      transition={
        entryDone
          ? { duration: animMs / 1000, ease: [0.2, 0.7, 0.2, 1] }
          : {
              opacity: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
              scale: { duration: animMs / 1000, ease: [0.2, 0.7, 0.2, 1] },
              y: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
            }
      }
      onAnimationComplete={() => { if (!entryDone) setEntryDone(true); }}
    >
      <div className={styles.titleZone}>
        <h3 className={styles.title}>{content.title}</h3>
        <p className={styles.subtitle}>{content.subtitle}</p>
      </div>

      <div className={styles.descriptionZone} aria-hidden={!isActive}>
        <p className={styles.body}>{content.body}</p>
      </div>

      <div className={styles.imageZone}>
        <Visual visual={content.visual} />
        {content.visual.kind !== "video" ? (
          <span className={styles.imageOverlay} aria-hidden="true" />
        ) : null}
      </div>
    </motion.button>
  );
}

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, type CSSProperties } from "react";
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
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

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
      animate={{ opacity, scale }}
      transition={{ duration: animMs / 1000, ease: [0.2, 0.7, 0.2, 1] }}
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

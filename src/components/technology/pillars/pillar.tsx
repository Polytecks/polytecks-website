"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef } from "react";
import type { PillarContent, PillarVisual } from "./pillar-data";
import { SignalTrace } from "./signal-trace";
import styles from "./pillar.module.css";

function Visual({ visual, signalAnimate }: { visual: PillarVisual; signalAnimate: boolean }) {
  if (visual.kind === "signal") return <SignalTrace animate={signalAnimate} />;
  return (
    <Image
      src={visual.src}
      alt={visual.alt}
      width={1600}
      height={1000}
      sizes="(max-width: 720px) 100vw, 33vw"
      style={{
        objectPosition: visual.objectPosition ?? "center center",
        filter: visual.filter,
      }}
    />
  );
}

export function Pillar({
  content,
  isActive,
  anyActive,
  popRatio,
  siblingDim,
  animMs,
  onActivate,
  onDeactivate,
}: {
  content: PillarContent;
  isActive: boolean;
  anyActive: boolean;
  popRatio: number;
  siblingDim: number;
  animMs: number;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isActive || reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--cursor-x", `${x}%`);
    el.style.setProperty("--cursor-y", `${y}%`);
  }, [isActive, reduced]);

  const flexGrow = !anyActive ? 1 : isActive ? popRatio : (2 - popRatio) / 2;
  const opacity = !anyActive ? 1 : isActive ? 1 : 1 - siblingDim;
  const scale = !anyActive ? 1 : isActive ? 1 : 0.96;

  return (
    <motion.button
      ref={ref}
      type="button"
      className={styles.pillar}
      data-active={isActive}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      onPointerMove={onPointerMove}
      onClick={onActivate}
      aria-expanded={isActive}
      style={{ flexGrow }}
      animate={{ opacity, scale }}
      transition={{ duration: animMs / 1000, ease: [0.2, 0.7, 0.2, 1] }}
      layout
    >
      <span className={styles.cursorOutline} aria-hidden="true" />

      <div className={styles.persistent}>
        <span className={styles.number}>{content.number}</span>
        <h3 className={styles.title}>{content.title}</h3>
        <p className={styles.subtitle}>{content.subtitle}</p>
      </div>

      <div className={styles.restVisual}>
        <Visual visual={content.restVisual} signalAnimate={false} />
        <span className={styles.restVisualOverlay} aria-hidden="true" />
      </div>

      <motion.div
        className={styles.reveal}
        initial={false}
        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 16 }}
        transition={{
          duration: 0.25,
          delay: isActive ? 0.2 : 0,
          ease: [0.2, 0.7, 0.2, 1],
        }}
        aria-hidden={!isActive}
      >
        <p className={styles.body}>{content.body}</p>
        <div className={styles.detailVisual}>
          <Visual visual={content.detailVisual} signalAnimate={isActive && content.id === "intelligence"} />
        </div>
      </motion.div>
    </motion.button>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./university-mark.module.css";

/**
 * Renders a university affiliation as a logo or text fallback inside
 * bracket registration marks.
 *
 * Looks for an SVG/PNG at /assets/universities/<name-lowercase>.svg.
 * If the request 404s (no asset present yet), falls back to the styled
 * text-only mark.
 */
export function UniversityMark({ name }: { name: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const slug = name.toLowerCase();

  return (
    <div className={styles.mark}>
      <span className={styles.bracketTL} aria-hidden="true" />
      <span className={styles.bracketTR} aria-hidden="true" />
      <span className={styles.bracketBL} aria-hidden="true" />
      <span className={styles.bracketBR} aria-hidden="true" />
      <div className={styles.content}>
        {imgFailed ? (
          <span className={styles.text}>{name}</span>
        ) : (
          <Image
            src={`/assets/universities/${slug}.svg`}
            alt={name}
            width={120}
            height={40}
            className={styles.logo}
            onError={() => setImgFailed(true)}
            unoptimized
          />
        )}
      </div>
    </div>
  );
}

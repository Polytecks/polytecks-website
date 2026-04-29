"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./university-mark.module.css";

/** Real logo asset paths added to /public/assets. Each is a greyscale PNG
 *  that can render as-is without further processing. */
const LOGO_SRC: Record<string, string> = {
  cambridge: "/assets/Grey_University_of_Cambridge-Logo.wine.png",
  imperial:  "/assets/grey_Imperial_College_London_new_logo.png",
  durham:    "/assets/grey_durham.png",
  ucl:       "/assets/ucllogo.svg.png",
};

/**
 * Renders a university affiliation as a logo (with text fallback if the
 * PNG fails to load) inside bracket registration marks.
 */
export function UniversityMark({ name }: { name: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const slug = name.toLowerCase();
  const src = LOGO_SRC[slug];

  return (
    <div className={styles.mark}>
      <span className={styles.bracketTL} aria-hidden="true" />
      <span className={styles.bracketTR} aria-hidden="true" />
      <span className={styles.bracketBL} aria-hidden="true" />
      <span className={styles.bracketBR} aria-hidden="true" />
      <div className={styles.content}>
        {imgFailed || !src ? (
          <span className={styles.text}>{name}</span>
        ) : (
          <Image
            src={src}
            alt={name}
            width={240}
            height={80}
            className={styles.logo}
            onError={() => setImgFailed(true)}
            unoptimized
          />
        )}
      </div>
    </div>
  );
}

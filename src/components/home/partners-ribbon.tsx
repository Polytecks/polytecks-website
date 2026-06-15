"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./partners-ribbon.module.css";

// `scale` boosts logos whose source PNG has heavy intrinsic padding so
// they don't read smaller than their neighbours after object-fit: contain.
// `square: true` swaps to a taller item box for square logos (e.g. 5050)
// which would otherwise be vertically constrained against wide wordmarks.
// `extraGap: true` adds a little side margin for logos that read tight
// against their neighbours under the default track gap.
// `lightSrc` is a dedicated light-mode asset for logos whose default mark
// doesn't survive the light-theme invert filter — both variants render and
// CSS shows the right one per theme (see partners-ribbon.module.css).
type Partner = {
  name: string;
  src: string;
  lightSrc?: string;
  scale?: number;
  square?: boolean;
  extraGap?: boolean;
};
const PARTNERS: Partner[] = [
  { name: "Innovate UK",                                              src: "/assets/afil_UKRI.png", lightSrc: "/assets/afil_UKRI_lightmode.png", scale: 0.92 },
  { name: "Cambridge Enterprise",                                     src: "/assets/afil_CE.png", lightSrc: "/assets/afil_CE_lightmode.png", scale: 1.5 },
  { name: "EPSRC Photonic & Electronic Systems CDT",                  src: "/assets/afil_EPSRC.png" },
  { name: "King's E-Lab",                                             src: "/assets/afil_elab (1).png", extraGap: true },
  { name: "5050",                                                     src: "/assets/afil_5050 (1).png", lightSrc: "/assets/afil_5050_lightmode.png", square: true, extraGap: true },
  { name: "SPARK",                                                    src: "/assets/afil_SPARK.png" },
  { name: "Royce Institute",                                          src: "/assets/afil_royce (1).png", scale: 1.4 },
  { name: "Impulse Maxwell Centre",                                   src: "/assets/afil_impulse.png", lightSrc: "/assets/afil_impulse_lightmode.png", scale: 1.25 },
  { name: "University of Cambridge",                                  src: "/assets/afil_cambridge.png", lightSrc: "/assets/afil_cambridge_lightmode.png" },
  { name: "Worshipful Company of Scientific Instrument Makers",       src: "/assets/afil_worshipful.png", lightSrc: "/assets/afil_worshipful_lightmode.png", scale: 1.2 },
  { name: "21toWatch",                                                src: "/assets/afil_21towatch.webp" },
  { name: "Bioelectronics Lab",                                       src: "/assets/afil_bioelectronics.png" },
];

export function PartnersRibbon() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Measure the width of one duplicate set so the slide animation translates
  // by an exact integer-pixel amount, not 50% (which can land off-pixel and
  // produce a visible jump at the loop reset).
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const itemEls = track.querySelectorAll<HTMLElement>(`.${styles.item}`);
      if (itemEls.length === 0) return;
      const half = itemEls.length / 2;
      // Half-set width = position of the (half)-th item's left edge minus
      // the position of the 0th item's left edge, both in track-local coords.
      const first = itemEls[0].offsetLeft;
      const halfStart = itemEls[Math.floor(half)].offsetLeft;
      const offset = Math.round(halfStart - first);
      track.style.setProperty("--ribbon-loop-offset", `${offset}px`);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const items = [...PARTNERS, ...PARTNERS];

  return (
    <div className={styles.ribbon}>
      <div className={styles.label}>Affiliations and Partners</div>
      <div className={styles.trackWrap}>
        <div ref={trackRef} className={styles.track}>
          {items.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className={[
                styles.item,
                p.square && styles.itemSquare,
                p.extraGap && styles.itemExtraGap,
              ]
                .filter(Boolean)
                .join(" ")}
              style={p.scale ? { ["--logo-scale" as string]: p.scale } : undefined}
            >
              <Image
                src={p.src}
                alt={p.name}
                width={400}
                height={160}
                className={[styles.logo, p.lightSrc && styles.logoDark]
                  .filter(Boolean)
                  .join(" ")}
                unoptimized
              />
              {p.lightSrc && (
                <Image
                  src={p.lightSrc}
                  alt=""
                  width={400}
                  height={160}
                  className={`${styles.logo} ${styles.logoLight}`}
                  unoptimized
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

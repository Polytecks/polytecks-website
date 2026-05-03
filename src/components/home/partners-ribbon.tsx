"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./partners-ribbon.module.css";

// `scale` boosts logos whose source PNG has heavy intrinsic padding so
// they don't read smaller than their neighbours after object-fit: contain.
// `square: true` swaps to a taller item box for square logos (e.g. 5050)
// which would otherwise be vertically constrained against wide wordmarks.
type Partner = { name: string; src: string; scale?: number; square?: boolean };
const PARTNERS: Partner[] = [
  { name: "Innovate UK",                                              src: "/assets/afil_UKRI.png", scale: 0.92 },
  { name: "Cambridge Enterprise",                                     src: "/assets/afil_CE.png", scale: 1.4 },
  { name: "EPSRC Photonic & Electronic Systems CDT",                  src: "/assets/afil_EPSRC.png" },
  { name: "King's E-Lab",                                             src: "/assets/afil_elab (1).png" },
  { name: "5050",                                                     src: "/assets/afil_5050 (1).png", square: true },
  { name: "SPARK",                                                    src: "/assets/afil_SPARK.png" },
  { name: "Royce Institute",                                          src: "/assets/afil_royce (1).png", scale: 1.25 },
  { name: "Impulse Maxwell Centre",                                   src: "/assets/afil_impulse.png", scale: 1.12 },
  { name: "University of Cambridge",                                  src: "/assets/afil_cambridge.png" },
  { name: "Worshipful Company of Scientific Instrument Makers",       src: "/assets/afil_worshipful.png", scale: 1.2 },
  { name: "21toWatch",                                                src: "/assets/afil_21towatch.webp" },
  { name: "Bioelectronics Lab",                                       src: "/assets/afil_bioelectronics.png" },
];

export function PartnersRibbon() {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ribbon = ribbonRef.current;
    const track = trackRef.current;
    if (!ribbon || !track) return;

    // Cache the items NodeList once — it's constant after mount.
    const items = Array.from(track.querySelectorAll<HTMLElement>(`.${styles.item}`));

    let raf = 0;

    const resetBaseline = () => {
      for (const el of items) {
        el.classList.remove(styles.isCenter, styles.isNear);
      }
    };

    const tick = () => {
      const wrapRect = ribbon.getBoundingClientRect();
      const center = wrapRect.left + wrapRect.width / 2;
      let nearest: HTMLElement | null = null;
      let nearestDist = Infinity;
      const measured: { el: HTMLElement; d: number }[] = [];
      for (const el of items) {
        const r = el.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - center);
        measured.push({ el, d });
        if (d < nearestDist) {
          nearestDist = d;
          nearest = el;
        }
      }
      for (const { el, d } of measured) {
        el.classList.toggle(styles.isCenter, el === nearest);
        el.classList.toggle(styles.isNear, el !== nearest && d < 220);
      }
      raf = requestAnimationFrame(tick);
    };

    // Only run the rAF loop while the ribbon is in the viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          raf = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(raf);
          resetBaseline();
        }
      },
      { threshold: 0 },
    );

    observer.observe(ribbon);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

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
    <div ref={ribbonRef} className={styles.ribbon}>
      <div className={styles.label}>Affiliations and Partners</div>
      <div className={styles.trackWrap}>
        <div ref={trackRef} className={styles.track}>
          {items.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className={p.square ? `${styles.item} ${styles.itemSquare}` : styles.item}
            >
              <Image
                src={p.src}
                alt={p.name}
                width={400}
                height={160}
                className={styles.logo}
                style={p.scale ? { transform: `scale(${p.scale})` } : undefined}
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

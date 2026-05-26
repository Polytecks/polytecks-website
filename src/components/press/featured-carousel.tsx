"use client";

import Image from "next/image";
import { useState } from "react";
import { type PressItem } from "@/data/press";
import { SectionEyebrow } from "./section-eyebrow";
import styles from "./featured-carousel.module.css";

type Props = {
  items: PressItem[];
};

/**
 * Two-up carousel. Shows 2 cards at a time on desktop, 1 on mobile. Track
 * translates by one card per arrow click (translate by `idx * (50% + 12px)`
 * so the gap stays constant). `clamp` prevents over-scrolling past the end.
 *
 * The hover halo is preserved verbatim from the prototype: card has
 * `padding: 24px; margin: -24px;` so the hover background extends 24px
 * beyond each side, and the viewport mirrors the same offsets so the halo
 * isn't clipped at the start/end of the row.
 */
export function FeaturedCarousel({ items }: Props) {
  const [idx, setIdx] = useState(0);
  const featured = items.filter((i) => i.featured);
  const visible = 2;
  const max = Math.max(0, featured.length - visible);
  const clamp = (n: number) => Math.max(0, Math.min(max, n));
  const canPrev = idx > 0;
  const canNext = idx < max;

  return (
    <div className={styles.fc}>
      <div className={styles.eyebrowWrap}>
        <SectionEyebrow>Featured</SectionEyebrow>
      </div>
      <div className={styles.head}>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.btn}
            aria-label="Previous"
            onClick={() => setIdx((i) => clamp(i - 1))}
            disabled={!canPrev}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 2 L4 7 L9 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.btn}
            aria-label="Next"
            onClick={() => setIdx((i) => clamp(i + 1))}
            disabled={!canNext}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 2 L10 7 L5 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translateX(calc(-${idx} * (50% + 12px)))` }}
        >
          {featured.map((item) => (
            <a key={item.id} className={styles.card} href={item.href}>
              {/* Wrapper holds the 16:9 contract for both the real image
                  and the striped placeholder fallback. <Image fill /> +
                  object-fit: cover in CSS handles the photo case. */}
              <div
                className={styles.imgPh}
                data-label={item.image ? undefined : `IMAGE · ${item.outlet.toUpperCase()}`}
                aria-hidden="true"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(max-width: 720px) 100vw, 50vw"
                    className={styles.img}
                  />
                ) : null}
              </div>
              <div className={styles.meta}>
                <span className={styles.outlet}>{item.outlet}</span>
                <span className={styles.dot}>·</span>
                <span className={styles.date}>{item.date}</span>
                {item.fabricated ? <span className={styles.fab}>FABRICATED</span> : null}
              </div>
              <h3 className={styles.title}>{item.title}</h3>
              <span className={styles.read}>
                Read article <span className={styles.arrow}>→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
      <div className={styles.progress}>
        {featured.map((_, i) => (
          <span
            key={i}
            className={`${styles.tick} ${i >= idx && i < idx + visible ? styles.tickOn : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

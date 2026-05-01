"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./mobile-proof-section.module.css";

type ProofStat = { number: ReactNode; label: ReactNode };

const STATS: ProofStat[] = [
  { number: <>10x</>,   label: <><strong>increase in spatial resolution</strong> relative to standard electrodes</> },
  { number: <>0</>,     label: <>skin preparation needed —<br /><strong>no electrode gel required</strong></> },
  { number: <>Weeks</>, label: <>of <strong>continuous wear</strong> on the body</> },
];

/**
 * Mobile rebuild of the proof section per MOBILE_STRATEGY.md §4.12.
 *
 * Desktop is a scroll-pinned 100vh "showcase" with three cards animating
 * into slots. That experience doesn't translate to a small screen — pinning
 * fights against natural scroll. Mobile gets a horizontal scroll-snap
 * carousel instead, plus:
 *
 *  - A 3-dot scroll-position indicator below the row (active dot tracks
 *    the most-visible card via IntersectionObserver, threshold 0.6).
 *  - Tap-to-scroll on each dot (smooth scrollIntoView with inline:center).
 *
 * No peek animation — card 1 always loads centred. (The peek-on-first-
 * visibility pattern was removed: the user perceived the smooth scroll
 * back to 0 as "card 1 loading off-centre then drifting in", which read
 * as a layout glitch rather than a scrollability hint.)
 */
export function MobileProofSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = cardRefs.current.filter((c): c is HTMLElement => c !== null);
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = cards.indexOf(entry.target as HTMLElement);
            if (index !== -1) setActiveIndex(index);
          }
        }
      },
      { root: scroller, threshold: [0.6] },
    );

    for (const card of cards) observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const scrollToCard = (i: number) => {
    const card = cardRefs.current[i];
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <section className={styles.section} aria-label="Three reasons the technology matters">
      <div className={styles.scroller} ref={scrollerRef}>
        {STATS.map((stat, i) => (
          <motion.article
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={styles.card}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <p className={styles.number}>{stat.number}</p>
            <p className={styles.label}>{stat.label}</p>
          </motion.article>
        ))}
      </div>
      <div className={styles.dots} role="tablist" aria-label="Proof cards">
        {STATS.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.dot}${i === activeIndex ? ` ${styles.dotActive}` : ""}`}
            onClick={() => scrollToCard(i)}
            aria-label={`Go to proof card ${i + 1}`}
            aria-current={i === activeIndex ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}

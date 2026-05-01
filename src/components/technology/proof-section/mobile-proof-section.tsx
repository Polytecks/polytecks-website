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

const PEEK_PX = 60;
const PEEK_DELAY_MS = 400;

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
 *  - A peek animation on mount: scroll-left starts with ~60 px of card 2
 *    visible, then animates back to 0 after 400 ms — telegraphs scroll-
 *    ability without forcing the user to discover it. Skipped under
 *    prefers-reduced-motion.
 *  - Tap-to-scroll on each dot (smooth scrollIntoView with inline:center).
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scroller = scrollerRef.current;
    const card2 = cardRefs.current[1];
    if (!scroller || !card2) return;

    // Defer the peek until the section actually enters the viewport.
    // Mount fires while the section is well below the fold (the proof
    // section sits halfway down /technology); peeking at mount means the
    // user never sees it. Fire on first 30 % visibility instead, then
    // disconnect so it never re-fires.
    let hasPeeked = false;
    let scrollBackTimer = 0;
    let restoreSnapTimer = 0;
    const visObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || !entry.isIntersecting || hasPeeked) return;
        hasPeeked = true;
        const peekScrollLeft = Math.max(
          0,
          card2.offsetLeft - scroller.clientWidth + PEEK_PX,
        );
        // Disable snap during the peek — `scroll-snap-type: x mandatory`
        // snaps scrollLeft back to the nearest snap point (0) the
        // moment we try to set it to a between-snap value like 39.
        scroller.style.scrollSnapType = "none";
        scroller.scrollLeft = peekScrollLeft;
        scrollBackTimer = window.setTimeout(() => {
          scroller.scrollTo({ left: 0, behavior: "smooth" });
          // Restore snap after the smooth scroll-back completes
          // (~600 ms is the platform default for behavior:'smooth').
          // Restoring sooner would re-snap mid-animation.
          restoreSnapTimer = window.setTimeout(() => {
            scroller.style.scrollSnapType = "";
          }, 700);
        }, PEEK_DELAY_MS);
        visObserver.disconnect();
      },
      { threshold: 0.3 },
    );
    visObserver.observe(scroller);

    return () => {
      visObserver.disconnect();
      if (scrollBackTimer) window.clearTimeout(scrollBackTimer);
      if (restoreSnapTimer) window.clearTimeout(restoreSnapTimer);
      // Defensive: if peek was mid-flight, restore snap immediately.
      scroller.style.scrollSnapType = "";
    };
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

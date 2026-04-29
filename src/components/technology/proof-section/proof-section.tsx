"use client";

import { motion, useScroll, useReducedMotion, useMotionValueEvent } from "framer-motion";
import { useRef, useState, useSyncExternalStore } from "react";
import { useTweaks } from "@/lib/use-tweaks";
import { ProofCard, type ProofCardData } from "./proof-card";
import styles from "./proof-section.module.css";

const STATS: ProofCardData[] = [
  { number: <>10x</>,   label: <><strong>increase in spatial resolution</strong> relative to standard electrodes</> },
  { number: <>0</>,     label: <>skin preparation needed —<br /><strong>no electrode gel required</strong></> },
  { number: <>Weeks</>, label: <>of <strong>continuous wear</strong> on the body</> },
];

export function ProofSection() {
  const outerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { values } = useTweaks();
  const [hasCompleted, setHasCompleted] = useState(false);
  const isMobile = useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(max-width: 720px)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia("(max-width: 720px)").matches,
    () => false, // SSR fallback
  );

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  // Lock-in trigger: fire as soon as the third (last) card has finished
  // its emerge phase. With PHASE_ORDER [0, 2, 1], card 1 is last; its
  // emerge ends at scrollProgress ≈ phaseStart + (phaseLen - overlap)*0.65
  //   = 2/3 + 1/3 * 0.65 ≈ 0.884.
  // Firing here (instead of at v > 0.99) eliminates the ~17vh of "dead
  // scroll" between card 3 settling and the panel collapsing.
  //
  // After the section's height collapses from pinScrollMult*100vh to
  // 100vh, we scrollTo the section's document-Y so the white panel stays
  // pinned at the viewport top — the user sees no visible jump even
  // though the surrounding document has shifted up by ~176vh.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (hasCompleted) return;
    if (v >= 0.88) {
      const outer = outerRef.current;
      if (!outer) {
        setHasCompleted(true);
        return;
      }
      const sectionTopDocY = window.scrollY + outer.getBoundingClientRect().top;
      setHasCompleted(true);
      // Wait one frame for the data-locked rule to recompute layout,
      // then snap scroll position so the panel still fills the viewport.
      requestAnimationFrame(() => {
        window.scrollTo({ top: sectionTopDocY, behavior: "auto" });
      });
    }
  });

  // Mobile or reduced motion: render a non-pinned stack with simple
  // whileInView reveals. data-static makes the static layout fire even on
  // wide viewports for reduced-motion users.
  if (isMobile || reducedMotion) {
    return (
      <section className={styles.outer} data-static="true">
        <div className={styles.sticky}>
          <div className={styles.panel}>
            <div className="whiteVignette" aria-hidden="true" />
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                className={styles.card}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <p className={styles.cardNumber}>{stat.number}</p>
                <p className={styles.cardLabel}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={outerRef}
      className={styles.outer}
      data-locked={hasCompleted ? "true" : "false"}
    >
      <div className={styles.sticky}>
        <div className={styles.panel}>
          <div className="whiteVignette" aria-hidden="true" />
          <div className={styles.cardsRoot}>
            {STATS.map((stat, i) => (
              <ProofCard
                key={i}
                data={stat}
                index={i as 0 | 1 | 2}
                scrollProgress={scrollYProgress}
                easing={values.easing}
                phaseOverlap={values.phaseOverlap}
                hasCompleted={hasCompleted}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

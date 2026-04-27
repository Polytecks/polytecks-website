"use client";

import { motion, useScroll, useReducedMotion } from "framer-motion";
import { useRef, useSyncExternalStore } from "react";
import { useTweaks } from "@/lib/use-tweaks";
import { ProofCard, type ProofCardData } from "./proof-card";
import styles from "./proof-section.module.css";

const STATS: ProofCardData[] = [
  { number: <>10x</>,  label: "increase in spatial resolution relative to standard electrodes" },
  { number: <>0</>,     label: "Skin preparation needed — no electrode gel required" },
  { number: <>Weeks</>, label: "of continuous wear on the body" },
];

export function ProofSection() {
  const outerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { values } = useTweaks();
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
    <section ref={outerRef} className={styles.outer}>
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
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

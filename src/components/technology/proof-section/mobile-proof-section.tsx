"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
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
 * carousel instead: still feels like a discrete showcase, but uses the
 * platform's native touch-scroll behaviour.
 *
 * Each card 80vw wide, snap-aligns to centre. First/last cards center via
 * 10vw scroll-padding so they don't sit flush at the edges.
 */
export function MobileProofSection() {
  return (
    <section className={styles.section} aria-label="Three reasons the technology matters">
      <div className={styles.scroller}>
        {STATS.map((stat, i) => (
          <motion.article
            key={i}
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
    </section>
  );
}

"use client";

import Image from "next/image";
import { StackEntry } from "@/components/stack-entry";
import { PILLARS } from "./pillar-data";
import styles from "./mobile-pillar-section.module.css";

/**
 * Mobile rebuild of the pillar section per MOBILE_STRATEGY.md §4.11.
 *
 * Desktop relies on hover-to-expand: the user mouses over a card and a
 * description fades in. Touch has no equivalent — tap-to-expand would
 * hide information behind an interaction step that mobile users won't
 * take. Instead, render three vertical cards with the body copy always
 * visible.
 *
 * - Image full-bleed at top of each card.
 * - Title + subtitle below the image.
 * - Body paragraph always visible (no hover, no Framer Motion expand).
 * - Cards are static — only the entry animation (StackEntry) runs.
 * - Indigo-italic accents preserved by passing titles through the same
 *   typographic hierarchy as desktop.
 */
export function MobilePillarSection() {
  return (
    <section className={styles.section} aria-label="Three pillars of the technology">
      <h2 className={styles.title}>
        The electrode. <em>Reimagined from first principles.</em>
      </h2>

      <div className={styles.stack}>
        {PILLARS.map((p, i) => (
          <StackEntry key={p.id} index={i + 1}>
            <article className={styles.card}>
              <div className={styles.media}>
                {p.visual.kind === "video" ? (
                  <video
                    src={p.visual.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-label={p.visual.alt}
                  />
                ) : (
                  <Image
                    src={p.visual.src}
                    alt={p.visual.alt}
                    width={p.visual.width}
                    height={p.visual.height}
                    sizes="100vw"
                  />
                )}
              </div>
              <div className={styles.copy}>
                <h3 className={styles.cardTitle}>{p.title}</h3>
                <p className={styles.cardSubtitle}>{p.subtitle}</p>
                <p className={styles.cardBody}>{p.body}</p>
              </div>
            </article>
          </StackEntry>
        ))}
      </div>
    </section>
  );
}

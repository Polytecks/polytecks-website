import { SubpageHeader } from "@/components/subpage";
import styles from "./hero.module.css";

export function TechnologyHero() {
  return (
    <section className={styles.hero}>
      {/* Subtle dark overlay for legibility — sits on top of the bg
          image and beneath the heading. */}
      <div className={styles.overlay} aria-hidden="true" />
      {/* Bottom dissolve into the dark panel that follows. */}
      <div className={styles.bottomFade} aria-hidden="true" />

      <div className={styles.header}>
        <SubpageHeader
          eyebrow="Technology"
          title={
            <>
              The <em>Mosaic</em>
              <sup className={styles.tm}>™</sup> Platform
            </>
          }
        />
        <div className={styles.scrollHint} aria-hidden="true">
          <svg viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 6 L70 26 L134 6"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

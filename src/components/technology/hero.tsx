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
          lede="A new frontier in bioelectrical mapping."
        />
      </div>
    </section>
  );
}

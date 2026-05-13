import { FadeImage } from "@/components/fade-image";
import { SubpageHeader } from "@/components/subpage";
import styles from "./hero.module.css";

export function TechnologyHero() {
  return (
    <section className={styles.hero}>
      {/* Bg photo — promoted from CSS background-image to <FadeImage>
          so Next.js can priority-preload it on route navigation AND
          fade it in on actual decode rather than letting it pop into
          existence when the browser gets around to fetching it. */}
      <FadeImage
        src="/assets/mosiac technology page background real.png"
        alt=""
        fill
        sizes="100vw"
        priority
        className={styles.bgImage}
      />
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
              <sup className={styles.tm}>™</sup> Pla<span className={styles.kernT}>t</span>form
            </>
          }
        />
      </div>
    </section>
  );
}

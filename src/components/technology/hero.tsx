import Image from "next/image";
import styles from "./hero.module.css";

export function TechnologyHero() {
  return (
    <div className={styles.hero}>
      <div className={styles.mosaic}>
        <Image
          src="/assets/array-mosaic.jpg"
          alt="Polytecks electrode array mosaic sheet"
          width={2400}
          height={1600}
          sizes="100vw"
          priority
        />
        <div className={styles.fade} aria-hidden="true" />
        <div className={styles.inner}>
          <div className={styles.copy}>
            <h1 className={styles.headline}>
              The electrode, <em>reinvented</em>.
            </h1>
            <p className={styles.subtitle}>
              The electrode hasn&apos;t fundamentally changed in 80 years.
              We&apos;ve reinvented it.
            </p>
          </div>
          <div className={styles.anchor} aria-hidden="true">
            <span>01 / Materials</span>
            <span>02 / Form</span>
            <span>03 / Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
}

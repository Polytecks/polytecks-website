import Image from "next/image";
import styles from "./tech-hero.module.css";

export function TechHero() {
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
        <div className={styles.fade} />
        <div className={styles.inner}>
          <div className={styles.eyebrow}>Technology</div>
          <h2 className={styles.title}>
            A <em>hexagonal</em> lattice of soft electrodes, imaged in real
            time.
          </h2>
          <p className={styles.lede}>
            Our proprietary sensor geometry samples at millimeter resolution
            across the skin surface, producing a live spatial map of
            bioelectric activity.
          </p>
        </div>
      </div>
    </div>
  );
}

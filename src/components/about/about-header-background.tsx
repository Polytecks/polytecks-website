import Image from "next/image";
import styles from "./about-header-background.module.css";

export function AboutHeaderBackground() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={styles.blackPanel} />
      <div className={styles.imageWrap}>
        <Image
          src="/assets/about-us-background.png"
          alt=""
          fill
          sizes="(max-width: 720px) 100vw, min(60vw, 1100px)"
          className={styles.image}
          priority
        />
        <div className={styles.overlay} />
      </div>
    </div>
  );
}

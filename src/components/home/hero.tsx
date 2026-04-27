import Image from "next/image";
import { ChargeLink } from "./charge-link";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.gridOverlay} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={styles.content}>
        <div>
          <h1 className={styles.headline}>
            <span className={styles.nowrap}>
              <span className={styles.word} style={{ ["--wi" as string]: 0 }}>Making</span>{" "}
              <span className={styles.word} style={{ ["--wi" as string]: 1 }}>the</span>{" "}
              <span className={styles.word} style={{ ["--wi" as string]: 2 }}>Skin</span>
            </span>
            <br />
            <span className={styles.nowrap}>
              <span className={styles.word} style={{ ["--wi" as string]: 3 }}>a</span>{" "}
              <span
                className={`${styles.word} ${styles.window}`}
                style={{ ["--wi" as string]: 4 }}
              >
                Window
              </span>
            </span>{" "}
            <span className={styles.word} style={{ ["--wi" as string]: 5 }}>into</span>
            <br />
            <span className={styles.word} style={{ ["--wi" as string]: 6 }}>the</span>{" "}
            <span className={styles.word} style={{ ["--wi" as string]: 7 }}>Body</span>
          </h1>

          <p className={styles.sub}>
            Advanced bioelectrical mapping for enhanced diagnostics
          </p>

          <div className={styles.ctas}>
            <ChargeLink href="/technology" label="The Technology" />
            <ChargeLink href="/devices" label="View Devices" />
          </div>
        </div>

        <div className={styles.arm}>
          <Image
            src="/assets/polytecks-arm-v2.png"
            alt="Polytecks hexagonal electrode array on forearm"
            width={1920}
            height={1661}
            priority
            sizes="(max-width: 960px) 100vw, 48vw"
          />
        </div>
      </div>
    </section>
  );
}

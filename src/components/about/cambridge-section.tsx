import Image from "next/image";
import styles from "./cambridge-section.module.css";

export function CambridgeSection() {
  return (
    <section className={styles.section}>
      <div className={styles.eyebrow}>Origins</div>
      <h3 className={styles.title}>
        From <em>Cambridge</em> origins
      </h3>
      <div className={styles.body}>
        <div className={styles.media}>
          <Image
            src="/assets/cambridge.png"
            alt="King's College, University of Cambridge"
            width={2400}
            height={1350}
            sizes="100vw"
            priority
          />
          <div className={styles.mediaCaption}>King&apos;s College, Cambridge</div>
        </div>
        <div className={styles.copy}>
          <p>
            Our founding team met while studying at Cambridge, and Polytecks
            maintains strong research links with the university.
          </p>
          <p className={styles.pull}>
            The first ECG was produced in Cambridge over 100 years ago — fitting
            that the next evolution of bioelectrical diagnostics should come
            from the same city.
          </p>
          <div className={styles.meta}>
            <div>
              <div className={styles.metaLabel}>Founded</div>
              <div className={styles.metaValue}>Cambridge, UK</div>
            </div>
            <div>
              <div className={styles.metaLabel}>ECG Legacy</div>
              <div className={styles.metaValue}>
                100<span>+ years</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

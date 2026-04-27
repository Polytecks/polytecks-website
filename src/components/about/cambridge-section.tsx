import Image from "next/image";
import styles from "./cambridge-section.module.css";

export function CambridgeSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        From Origins at the <em>University of Cambridge</em>
      </h2>

      <div className={styles.body}>
        <p className={styles.imageOverlayText}>
          Polytecks grew out of the Cambridge ecosystem, and maintains strong research links with the university.
        </p>
        <div className={styles.media}>
          <Image
            src="/assets/cambridge.png"
            alt="King's College, University of Cambridge"
            width={2400}
            height={1350}
            sizes="100vw"
            priority
          />
          <div className={styles.calloutBadge}>
            <p>The ECG was first made in Cambridge over a century ago. The next chapter starts here too.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

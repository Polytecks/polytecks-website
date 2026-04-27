import Image from "next/image";
import styles from "./cambridge-section.module.css";

export function CambridgeSection() {
  return (
    <section className={styles.section}>
      <div className={styles.eyebrow}>Origins</div>
      <h2 className={styles.title}>
        From Origins at the <em>University of Cambridge</em>
      </h2>
      <p className={styles.intro}>
        Our founding team met while studying at Cambridge, and Polytecks
        maintains strong research links with the university.
      </p>

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
          <div className={styles.calloutBadge}>
            <p>The ECG was born in Cambridge over a century ago. The next chapter starts here too.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

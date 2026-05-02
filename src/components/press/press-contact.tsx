import { SectionEyebrow } from "./section-eyebrow";
import styles from "./press-contact.module.css";

/**
 * Press Enquiries strip. Two-column grid: italic-indigo emphasis on the
 * second sentence of the headline (left), email link at the same display
 * size (right). The handoff intentionally drops the lede paragraph and
 * the "Cambridge, UK · GMT" meta — keep them out.
 */
export function PressContact() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.eyebrowWrap}>
          <SectionEyebrow>Press Enquiries</SectionEyebrow>
        </div>
        <div className={styles.grid}>
          <div>
            <h3 className={styles.headline}>
              Working on a story? <em>Get in touch.</em>
            </h3>
          </div>
          <div className={styles.actions}>
            <a className={styles.email} href="mailto:contact@polytecks.com">
              contact@polytecks.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

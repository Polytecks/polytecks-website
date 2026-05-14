"use client";

import { FadeImage as Image } from "@/components/fade-image";
import styles from "./mobile-cambridge-section.module.css";

/**
 * Mobile rebuild of the Cambridge section per MOBILE_STRATEGY.md §4.7.
 *
 * The desktop version has an absolute-positioned ECG callout floating
 * over the image at viewport-relative offsets — fragile on small
 * screens. Here:
 *
 * - Title and body paragraph render normally (same content as desktop).
 * - Image renders constrained to 4/3 aspect (more square than the
 *   desktop 16:9 cinematic crop) so it doesn't dominate the scroll on a
 *   tall phone.
 * - The ECG line ("The ECG was first made in Cambridge…") becomes a
 *   normal flow <p> directly below the image — same indigo-bright
 *   accent on the lead phrase that headings use elsewhere on the site.
 *   No absolute positioning, no viewport offsets.
 * - Side + bottom mask fades on the image are preserved (identity).
 */
export function MobileCambridgeSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        From Origins at the <em>University of Cambridge</em>
      </h2>

      <p className={styles.body}>
        Polytecks grew out of the Cambridge ecosystem, and maintains
        strong research links with the university.
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
      </div>

      <p className={styles.callout}>
        The ECG was first made in Cambridge over a century ago.{" "}
        <em>The next chapter starts here too.</em>
      </p>
    </section>
  );
}

"use client";

import { FadeImage as Image } from "@/components/fade-image";
import { useIsMobile } from "@/lib/use-is-mobile";
import { MobileCambridgeSection } from "./mobile-cambridge-section";
import styles from "./cambridge-section.module.css";

export function CambridgeSection() {
  // Tier 3 component branching per MOBILE_STRATEGY.md §4.7.
  const isMobile = useIsMobile();
  if (isMobile) return <MobileCambridgeSection />;
  return <DesktopCambridgeSection />;
}

function DesktopCambridgeSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        From Origins at the <em>University of Cambridge</em>
      </h2>

      <div className={styles.body}>
        <div className={styles.media}>
          <div className={styles.glow} aria-hidden="true">
            <div className={styles.glowInner}>
              <span className={styles.glowLayer1} />
              <span className={styles.glowLayer2} />
              <span className={styles.glowLayer3} />
            </div>
          </div>
          <Image
            src="/assets/cambridge-new.png"
            alt="King's College, University of Cambridge"
            width={3840}
            height={2560}
            sizes="100vw"
            priority
          />
          <p className={styles.bodyText}>
            Polytecks grew out of the Cambridge ecosystem, and maintains strong
            research links with the university.
          </p>
          <p className={styles.calloutText}>
            The ECG was first made in Cambridge over a century ago.{" "}
            <em>The next chapter starts here too.</em>
          </p>
        </div>
      </div>
    </section>
  );
}

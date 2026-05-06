import Link from "next/link";
import { StackEntry } from "@/components/stack-entry";
import styles from "./platform-cta.module.css";

/**
 * Platform section + CTA — the page's outro after the timeline.
 *
 * Copy is preserved verbatim from Devices_Redesign_Handoff.md
 * (lines 947-968). Both buttons in the CTA route to /contact —
 * "Follow updates" → /contact#newsletter (matches the status block in
 * FirstDevice). "Explore collaborations" was a `#` placeholder in the
 * template; routed to /contact for now (handoff flagged this as TBC).
 */
export function PlatformCta() {
  return (
    <>
      <StackEntry index={11}>
        <section className={styles.platform} data-screen-label="11 Platform">
          <div className={styles.kicker}>Platform</div>
          <h2 className={styles.platformHeading}>
            One sensing platform, applied across many{" "}
            <em>physiological systems</em>.
          </h2>
        </section>
      </StackEntry>

      <StackEntry index={12}>
        <section className={styles.cta} data-screen-label="12 CTA">
          <div>
            <h3>Partner with us on what comes next.</h3>
            <p>
              We work with clinicians, research groups, and institutions exploring high-resolution surface electrophysiology in their own area of practice.
            </p>
          </div>
          <div className={styles.actions}>
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/contact">
              Explore collaborations <span className={styles.arrow}>→</span>
            </Link>
            <Link
              className={`${styles.btn} ${styles.btnSecondary}`}
              href="/contact#newsletter"
            >
              Follow updates
            </Link>
          </div>
        </section>
      </StackEntry>
    </>
  );
}

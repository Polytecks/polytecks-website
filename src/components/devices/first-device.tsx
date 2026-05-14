import { FadeImage as Image } from "@/components/fade-image";
import Link from "next/link";
import { StackEntry } from "@/components/stack-entry";
import styles from "./first-device.module.css";

/**
 * "Our first device" section — replaces the prior Clinical/Veterinary
 * tabs region. Two-column block: device-visual placeholder on the left,
 * copy + summary cells + trial-ongoing status block on the right.
 *
 * Copy is preserved verbatim from the redesign hand-off
 * (Devices_Redesign_Handoff.md, lines 717-757). Em dashes inside the
 * copy are part of the existing locked text — only newly-authored copy
 * is bound by the no-em-dash rule.
 */
export function FirstDevice() {
  return (
    <>
      <StackEntry index={6}>
        <div className={styles.sectionHead}>
          <div className={styles.kicker}>Our first device</div>
          <h2 className={styles.heading}>
            <em>SwiftStage:</em> Veterinary Cardiovascular Staging in Primary Care
          </h2>
        </div>
      </StackEntry>

      <section
        className={styles.firstDevice}
        data-screen-label="01 First device — Veterinary"
      >
        <StackEntry index={7} className={styles.visualSlot}>
          <div className={styles.deviceVisual}>
            {/* Top box — dog photo edge-to-edge, with the kit
                overlay (swiftstage2) sitting directly on the photo
                centred at the bottom. */}
            <div className={styles.dogBox}>
              <Image
                src="/assets/swiftstage1.jpg"
                alt="Dog patient receiving a Polytecks point-of-care measurement"
                fill
                sizes="(max-width: 960px) 100vw, 50vw"
                className={styles.dogImage}
              />
              <div className={styles.kitOverlayWrap} aria-hidden="true">
                <Image
                  src="/assets/swiftstage2.png"
                  alt=""
                  fill
                  sizes="(max-width: 960px) 40vw, 22vw"
                  className={styles.kitOverlay}
                />
              </div>
            </div>
            {/* Bottom box — looping clip in its own bordered
                frame. The video is a WebM with baked-in VP9
                alpha: the right ~36% of the frame was processed
                offline with ffmpeg (colorkey + alpha-channel
                erosion/dilation/blur to clean specks and feather
                edges), so the clip plays natively with proper
                transparency where the white background, red
                lines, and hexagon live. The left ~64% of the
                frame is the untouched dog photo. No realtime
                filter is needed — the browser composites the
                alpha directly. Source aspect 1888×796 ≈ 2.37:1. */}
            <div className={styles.videoBox}>
              <video
                className={styles.kitVideo}
                src="/assets/swiftstage3-clean.webm"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                disablePictureInPicture
                controlsList="nodownload noremoteplayback nofullscreen"
                aria-hidden="true"
              />
            </div>
          </div>
        </StackEntry>

        <StackEntry index={8}>
          <div className={styles.deviceCopy}>
            <p className={styles.lead}>
              Our first device is designed for veterinary cardiovascular
              staging at the point of care, where early and accurate
              classification determines whether a dog should be monitored,
              referred, or treated.
            </p>
            <p>
              In canine heart disease this decision often depends on
              referral imaging: costly, capacity-limited, and not always
              immediately accessible in primary care.
            </p>
            <p>
              Polytecks enables a short, non-invasive measurement to be
              taken directly in the clinic, capturing spatial patterns of
              cardiac bioelectrical activity that are not accessible
              through standard tools alone.
            </p>
            <p>
              These signals are reconstructed into a structured output
              that supports earlier clinical decision-making, without
              requiring specialist imaging at the first step.
            </p>

            <div className={styles.deviceSummary}>
              <div className={styles.cell}>
                <span className={styles.k}>Format</span>
                <span className={styles.v}>Non-invasive</span>
              </div>
              <div className={styles.cell}>
                <span className={styles.k}>Measurement time</span>
                <span className={styles.v}>~2 min</span>
              </div>
              <div className={styles.cell}>
                <span className={styles.k}>Setting</span>
                <span className={styles.v}>Point of care</span>
              </div>
            </div>

            <div className={styles.statusBlock}>
              <div className={styles.statusRow}>
                <span className={styles.statusPulse} aria-hidden="true" />
                <div className={styles.statusText}>
                  <span className={styles.top}>Trial ongoing</span>
                  <span className={styles.bot}>
                    Active in-clinic study with first-opinion veterinary
                    partners.
                  </span>
                </div>
              </div>
              <Link
                className={`${styles.btn} ${styles.btnPrimary}`}
                href="/contact#newsletter"
              >
                Follow updates <span className={styles.arrow}>→</span>
              </Link>
            </div>
          </div>
        </StackEntry>
      </section>
    </>
  );
}

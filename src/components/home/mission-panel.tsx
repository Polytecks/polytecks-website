import { UniversityMark } from "./university-mark";
import styles from "./mission-panel.module.css";

const UNIVERSITIES = ["Cambridge", "Imperial", "Durham", "UCL"] as const;

export function MissionPanel() {
  return (
    <section className={styles.panel} data-topo-invert>
      <div className={styles.fill} aria-hidden="true" />
      <div className="whiteVignette" aria-hidden="true" />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Our Mission</p>
        <h2 className={styles.headline}>Make the body legible.</h2>
        <p className={styles.lede}>
          We are turning the skin into a high-resolution interface to the body&apos;s
          electrical activity — so clinicians can see, earlier and more clearly,
          what the heart, the muscles, and the nervous system are saying.
        </p>
      </div>

      <hr className={styles.divider} aria-hidden="true" />

      <div className={styles.teamTease}>
        <p className={styles.teamEyebrow}>Team</p>
        <h3 className={styles.teamTitle}>
          Brought to you by world-leading researchers, engineers, and scientists{" "}
          <em>united by our mission.</em>
        </h3>
        <div className={styles.logos}>
          {UNIVERSITIES.map((name) => (
            <UniversityMark key={name} name={name} />
          ))}
        </div>
      </div>
    </section>
  );
}

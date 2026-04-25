import styles from "./mission-panel.module.css";

export function MissionPanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.fill} aria-hidden="true" />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Our Mission</p>
        <h2 className={styles.headline}>Make the body legible.</h2>
        <p className={styles.lede}>
          We are turning the skin into a high-resolution interface to the body&apos;s
          electrical activity — so clinicians can see, earlier and more clearly,
          what the heart, the muscles, and the nervous system are saying.
        </p>
        <div className={styles.meta}>
          <span>Cambridge, UK</span>
          <span className={styles.metaDot} aria-hidden="true" />
          <span>Founded 2024</span>
        </div>
      </div>
    </section>
  );
}

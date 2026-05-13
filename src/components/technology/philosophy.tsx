import styles from "./philosophy.module.css";

export function Philosophy() {
  return (
    <section className={styles.section}>
      <div className={styles.copyStack}>
        <p className={styles.copy}>
          The future of diagnostics will not look like a machine beside the
          bed. It will be <strong>soft</strong>, <strong>wearable</strong> and{" "}
          <strong>almost invisible</strong>, sensing the body’s electrical
          patterns with the spatial detail and long-term stability needed to
          reveal disease earlier.
        </p>
        <p className={styles.copy}>
          Polytecks is building that future through flexible electrode
          technology: a new foundation for diagnostics that can work across
          the body, over weeks at a time, and far beyond specialist settings.
        </p>
      </div>
    </section>
  );
}

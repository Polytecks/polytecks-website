import styles from "./proof-strip.module.css";

type Stat = {
  value: React.ReactNode;
  label: string;
};

const STATS: Stat[] = [
  // TODO: confirm exact figure (~10× claim)
  { value: <>~10<sup>×</sup></>, label: "Non-invasive spatial resolution relative to standard electrodes" },
  // TODO: confirm wording (gel-free is the substantive claim)
  { value: <>0</>,                label: "Skin preparation needed — no electrode gel required" },
  // TODO: confirm range (days–weeks span)
  { value: <>Days–Weeks</>,       label: "Continuous wear on the body" },
];

export function ProofStrip() {
  return (
    <section className={styles.section} aria-label="Performance claims">
      <div className={styles.row}>
        {STATS.map((stat, i) => (
          <div key={i} className={styles.block}>
            <div className={styles.value}>{stat.value}</div>
            <p className={styles.label}>{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

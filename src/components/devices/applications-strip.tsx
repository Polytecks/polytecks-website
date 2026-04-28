import { StackEntry } from "@/components/stack-entry";
import styles from "./applications-strip.module.css";

const APPLICATIONS = [
  "Cardiac Signals",
  "Neural Activity",
  "Muscle Function",
  "Gut Electrophysiology",
  "Autonomic Control",
  "Oncological Signatures",
] as const;

export function ApplicationsStrip() {
  return (
    <div className={styles.strip}>
      {APPLICATIONS.map((label, i) => (
        <StackEntry key={label} index={i + 3}>
          <div className={styles.item}>
            <div className={styles.icon} aria-hidden="true" />
            <p className={styles.label}>{label}</p>
          </div>
        </StackEntry>
      ))}
    </div>
  );
}

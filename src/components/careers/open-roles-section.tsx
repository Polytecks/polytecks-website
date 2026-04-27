import { StackEntry } from "@/components/stack-entry";
import styles from "./open-roles-section.module.css";

export function OpenRolesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <StackEntry index={0}>
          <h2 className={styles.heading}>Open Roles</h2>
        </StackEntry>
        <StackEntry index={1}>
          <div className={styles.list} role="list">
            <p className={styles.empty}>
              Currently no open roles &mdash; check back later.
            </p>
          </div>
        </StackEntry>
      </div>
    </section>
  );
}

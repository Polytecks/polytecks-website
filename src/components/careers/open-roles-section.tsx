import { StackEntry } from "@/components/stack-entry";
import styles from "./open-roles-section.module.css";

export function OpenRolesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <StackEntry index={0}>
          <p className={styles.eyebrow}>Open Roles</p>
        </StackEntry>
        <StackEntry index={1}>
          <p className={styles.message}>
            Currently no open roles &mdash; check back later.
          </p>
        </StackEntry>
      </div>
    </section>
  );
}

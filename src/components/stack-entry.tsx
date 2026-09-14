import type { ReactNode } from "react";
import styles from "./stack-entry.module.css";

/**
 * Static block wrapper (.wrap > .inner > children). It used to animate its
 * content in on mount; that was removed so body copy and titles are simply
 * present on load. The two-level DOM is kept because several layouts
 * (first-device .visualSlot, latest-news .slot) style these wrappers.
 */
export function StackEntry({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.wrap} ${className ?? ""}`.trim()}>
      <div className={styles.inner}>{children}</div>
    </div>
  );
}

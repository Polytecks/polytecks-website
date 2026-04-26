import type { ReactNode } from "react";
import styles from "./app-block.module.css";

export function AppBlock({
  imageLabel,
  eyebrow,
  title,
  children,
  reverse = false,
}: {
  imageLabel: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  reverse?: boolean;
}) {
  const className = reverse ? `${styles.block} ${styles.reverse}` : styles.block;
  return (
    <div className={className}>
      <div className={styles.image}>
        <div className={styles.placeholder}>
          <span className={styles.label}>{imageLabel}</span>
        </div>
      </div>
      <div className={styles.copy}>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h3 className={styles.title}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

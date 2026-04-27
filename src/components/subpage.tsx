import type { ReactNode } from "react";
import { AnimatedTitle } from "./animated-title";
import styles from "./subpage.module.css";

export function Subpage({ children }: { children: ReactNode }) {
  return <section className={styles.subpage}>{children}</section>;
}

export function SubpageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <h1 className={styles.title}><AnimatedTitle>{title}</AnimatedTitle></h1>
      {lede ? <p className={styles.lede}>{lede}</p> : null}
    </>
  );
}

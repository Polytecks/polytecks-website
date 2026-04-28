import type { ReactNode } from "react";
import { AnimatedTitle } from "./animated-title";
import { StackEntry } from "./stack-entry";
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
      <StackEntry index={0}>
        <div className={styles.eyebrow}>{eyebrow}</div>
      </StackEntry>
      <StackEntry index={1}>
        <h1 className={styles.title}><AnimatedTitle>{title}</AnimatedTitle></h1>
      </StackEntry>
      {lede ? (
        <StackEntry index={2}>
          <p className={styles.lede}>{lede}</p>
        </StackEntry>
      ) : null}
    </>
  );
}

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
  boldLede = false,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Opt-in heavier (600) lede weight. Used on about + devices where the
   *  lede should read with more emphasis than the default 300. */
  boldLede?: boolean;
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
          <p className={`${styles.lede} ${boldLede ? styles.ledeBold : ""}`.trim()}>
            {lede}
          </p>
        </StackEntry>
      ) : null}
    </>
  );
}

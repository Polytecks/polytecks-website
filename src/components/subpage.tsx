import type { ReactNode } from "react";
import { StackEntry } from "./stack-entry";
import styles from "./subpage.module.css";

export function Subpage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${styles.subpage} ${className ?? ""}`.trim()}>
      {children}
    </section>
  );
}

export function SubpageHeader({
  title,
  lede,
  boldLede = false,
  editorialLede = false,
}: {
  title: ReactNode;
  lede?: ReactNode;
  /** Opt-in heavier (600) lede weight. Used on devices where the
   *  lede should read with more emphasis than the default 300. */
  boldLede?: boolean;
  /** Opt-in editorial lede variant — dark-neutral body with an
   *  indigo accent on an inline <em>. Mutually exclusive with
   *  boldLede in practice; the about page uses this for a more
   *  restrained, supporting subhead instead of a full-indigo
   *  block. */
  editorialLede?: boolean;
}) {
  const ledeClass = [
    styles.lede,
    boldLede ? styles.ledeBold : "",
    editorialLede ? styles.ledeEditorial : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <>
      <StackEntry>
        <h1 className={styles.title}>{title}</h1>
      </StackEntry>
      {lede ? (
        <StackEntry>
          <p className={ledeClass}>
            {lede}
          </p>
        </StackEntry>
      ) : null}
    </>
  );
}

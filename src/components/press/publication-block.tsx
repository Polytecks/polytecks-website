import { type Publication } from "@/data/press";
import styles from "./publications-section.module.css";

type Props = {
  pub: Publication;
  /** 1-based index across all publications, used for the "01" leading number. */
  n: number;
};

/**
 * One numbered bibliography block on the paper-tone publications surface.
 * 80px / 1fr two-column grid: ordinal number on the left, body on the right.
 * Source Serif 4 on the title intentionally signals the "scholarly record"
 * register — different from the display sans used in the press section
 * above.
 */
export function PublicationBlock({ pub, n }: Props) {
  return (
    <article className={styles.block}>
      <div className={styles.num}>{String(n).padStart(2, "0")}</div>
      <div className={styles.body}>
        <div className={styles.authors}>
          {pub.authors.join(", ")}
          {pub.fabricated ? <span className={styles.fabTag}>FAB</span> : null}
        </div>
        <h3 className={styles.title}>{pub.title}</h3>
        <div className={styles.foot}>
          <em className={styles.journal}>{pub.journal}</em>
          <span className={styles.vol}>
            Vol. {pub.volume} · {pub.pages} · {pub.year}
          </span>
          <a
            className={styles.doi}
            href={`https://doi.org/${pub.doi}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            doi:{pub.doi} ↗
          </a>
        </div>
        <div className={styles.aff}>{pub.affiliation}</div>
        {/* Mobile-only arrow that mirrors the press list's bottom-right
            chevron, also routing to the DOI. Hidden on desktop where the
            inline DOI text link in .foot above is the affordance. */}
        <a
          className={styles.mobileArrow}
          href={`https://doi.org/${pub.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open DOI for ${pub.title}`}
        >
          →
        </a>
      </div>
    </article>
  );
}

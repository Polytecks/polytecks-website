import { type PressItem } from "@/data/press";
import styles from "./press-section.module.css";

type Props = {
  item: PressItem;
};

/**
 * One row in the "In the conversation." list. 200px / 1fr / 32px three-column
 * grid: date+outlet on the left, title+tag in the middle, → on the right.
 * The whole row is the link; padding-left animates 0 → 16 on hover (matches
 * the rest of the site's "row reveals on hover" vocabulary).
 */
export function PressRow({ item }: Props) {
  return (
    <a className={styles.row} href={item.href}>
      <div className={styles.left}>
        <span className={styles.date}>{item.date}</span>
        <span className={styles.outlet}>{item.outlet}</span>
      </div>
      <div className={styles.mid}>
        <h3 className={styles.title}>
          {item.fabricated ? <span className={styles.fabTag}>FAB</span> : null}
          {item.title}
        </h3>
        <span
          className={`${styles.tag} ${item.type === "podcast" ? styles.tagPodcast : ""}`}
        >
          {item.type === "podcast" ? "Podcast" : "Article"}
        </span>
      </div>
      <div className={styles.arrow} aria-hidden="true">
        →
      </div>
    </a>
  );
}

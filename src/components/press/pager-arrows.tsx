import styles from "./pager-arrows.module.css";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** `light` switches border + hover colours for the inverted publications surface. */
  variant?: "dark" | "light";
};

/**
 * Reusable prev/next pager. 40×40 hairline-bordered circles with chevron SVGs.
 * Disabled state when there's nothing to page to (single-page lists render
 * both buttons greyed out, which is the intended affordance).
 */
export function PagerArrows({ page, totalPages, onChange, variant = "dark" }: Props) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const btnClass = `${styles.btn} ${variant === "light" ? styles.btnLight : ""}`;

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={btnClass}
        aria-label="Previous page"
        disabled={!canPrev}
        onClick={() => canPrev && onChange(page - 1)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2 L4 7 L9 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      <button
        type="button"
        className={btnClass}
        aria-label="Next page"
        disabled={!canNext}
        onClick={() => canNext && onChange(page + 1)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 2 L10 7 L5 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
    </div>
  );
}

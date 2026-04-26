import Link from "next/link";
import styles from "./charge-link.module.css";

export type ChargeLinkVariant = "stacked" | "inline";

export function ChargeLink({
  href,
  label,
  variant = "stacked",
}: {
  href: string;
  label: string;
  variant?: ChargeLinkVariant;
}) {
  return (
    <Link href={href} className={styles.link} data-variant={variant}>
      <span className={styles.label}>
        <span>{label}</span>
        <span className={styles.arrow} aria-hidden="true">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5" />
          </svg>
        </span>
      </span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.fill} />
      </span>
    </Link>
  );
}

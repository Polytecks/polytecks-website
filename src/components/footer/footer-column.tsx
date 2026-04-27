import Link from "next/link";
import styles from "./footer.module.css";

export type FooterLink = {
  label: string;
  href: string;
};

export function FooterColumn({
  label,
  links,
}: {
  label: string;
  links: FooterLink[];
}) {
  return (
    <div className={styles.column}>
      <div className={styles.columnLabel}>{label}</div>
      <ul className={styles.columnLinks}>
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <Link href={link.href} className={styles.columnLink}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

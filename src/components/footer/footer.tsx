import Link from "next/link";
import Image from "next/image";
import { FooterColumn, type FooterLink } from "./footer-column";
import styles from "./footer.module.css";

const EXPLORE: FooterLink[] = [
  { label: "Technology", href: "/technology" },
  { label: "Devices",    href: "/devices" },
];

const COMPANY: FooterLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Team ↓",   href: "/about#team" },
  { label: "Careers",  href: "/careers" },
];

const CONNECT: FooterLink[] = [
  { label: "Contact",  href: "/contact" },
  { label: "LinkedIn", href: "#" },
  { label: "Email",    href: "#" },
  { label: "X",        href: "#" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <Link href="/" className={styles.logoLink} aria-label="Polytecks home">
          <Image
            src="/assets/polytecks-logo-white.png"
            alt="Polytecks"
            width={2500}
            height={720}
            className={styles.logo}
          />
        </Link>
        <FooterColumn label="Explore" links={EXPLORE} />
        <FooterColumn label="Company" links={COMPANY} />
        <FooterColumn label="Connect" links={CONNECT} />
      </div>
      <hr className={styles.divider} />
      <div className={styles.bottom}>
        <span>© 2026 Polytecks Ltd · Cambridge, UK</span>
        <div className={styles.legal}>
          <Link href="/privacy" className={styles.legalLink}>Privacy</Link>
          <Link href="/terms" className={styles.legalLink}>Terms</Link>
        </div>
      </div>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import { StackEntry } from "@/components/stack-entry";
import { loadAnnouncements } from "@/data/announcements";
import styles from "./latest-news.module.css";

type NewsItem = {
  outlet: string;
  title: string;
  /** ISO date "YYYY-MM-DD" — formatted to "DD MMM YYYY" in sans (not caps). */
  iso?: string;
  href: string;
  /** Path under /assets/announcements/ for the card image. */
  image?: string;
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [, y, mo, d] = m;
  const month = MONTHS[parseInt(mo, 10) - 1];
  if (!month) return null;
  return `${parseInt(d, 10)} ${month} ${y}`;
}

/**
 * Latest News — white-panel surface inversion sitting flush below the
 * partners ribbon. Three flat editorial cards separated by hairline rules
 * (vertical on desktop, horizontal on mobile). No card backgrounds, no
 * shadows, no surface lifts.
 */
export function LatestNews() {
  // Items are loaded at render time from `Homepage Announcements.txt`
  // at the repo root — the user maintains that file by hand. We cap at
  // the first three so the row layout doesn't overflow, and fall back
  // gracefully if the file is missing (the section still renders its
  // heading + "View all news" link).
  const items: NewsItem[] = loadAnnouncements().slice(0, 3);
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Latest News</p>
          <h2 className={styles.title}>
            Advancing what&apos;s possible in <em>diagnostics</em>.
          </h2>
        </header>

        <div className={styles.cards}>
          {items.map((item, i) => {
            const dateLabel = formatDate(item.iso);
            return (
              <div key={`${item.outlet}-${i}`} className={styles.slot}>
                <StackEntry index={i}>
                  <a
                    className={styles.card}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.image ? (
                      <div className={styles.imageWrap}>
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="(max-width: 720px) 100vw, 33vw"
                          className={styles.image}
                        />
                      </div>
                    ) : null}
                    <span className={styles.outlet}>{item.outlet}</span>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    {dateLabel ? (
                      <time className={styles.date} dateTime={item.iso}>
                        {dateLabel}
                      </time>
                    ) : null}
                  </a>
                </StackEntry>
              </div>
            );
          })}
        </div>

        <div className={styles.viewAllWrap}>
          <Link href="/press" className={styles.viewAll}>
            View all news <span className={styles.viewArrow}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

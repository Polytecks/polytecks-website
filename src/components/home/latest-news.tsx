import Link from "next/link";
import { StackEntry } from "@/components/stack-entry";
import styles from "./latest-news.module.css";

type NewsItem = {
  outlet: string;
  title: string;
  /** ISO date "YYYY-MM-DD" — formatted to "DD MMM YYYY" in sans (not caps). */
  iso?: string;
  href: string;
};

// Inline placeholder content. The user has indicated they may wire this up
// to the press page's featured items in a future change — until then, three
// real items live here so the section reads as a content surface, not a
// "loading…" stub.
const ITEMS: NewsItem[] = [
  {
    outlet: "Eureka Magazine",
    title:
      "New wearable sensor could transform cardiac monitoring during pregnancy",
    iso: "2026-05-12",
    href: "#",
  },
  {
    outlet: "Department of Engineering, Cambridge",
    title:
      "From lab to market: Department spin-out develops wearable e-textile tech",
    iso: "2026-04-22",
    href: "#",
  },
  {
    outlet: "Photonics CDT",
    title: "CDT graduate presents novel health tech at House of Lords",
    iso: "2026-03-04",
    href: "#",
  },
];

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
          {ITEMS.map((item, i) => {
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

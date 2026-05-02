import Image from "next/image";
import Link from "next/link";
import { StackEntry } from "@/components/stack-entry";
import { CrossfadeVideo } from "./crossfade-video";
import styles from "./dive-deeper.module.css";

type TileData = {
  label: string;
  href: string;
  media:
    | { kind: "image"; src: string; alt: string }
    | { kind: "video"; src: string };
};

// Tile definitions are a plain array so swapping label / route / media
// is a single-line edit. Both tiles support either media kind via the
// internal branch in <Tile/>.
const TILES: TileData[] = [
  {
    label: "View Open Roles",
    href: "/careers",
    media: {
      kind: "image",
      src: "/assets/explorecareers.jpg",
      alt: "Polytecks team at work",
    },
  },
  {
    label: "See Our Technology",
    href: "/technology",
    media: {
      // URL-encode the spaces in the filename — the asset on disk is
      // "polytecks textile vid 1.mp4". Browsers accept this directly.
      kind: "video",
      src: "/assets/polytecks%20textile%20vid%201.mp4",
    },
  },
];

/**
 * Dive Deeper — dark panel with two photographic / video tiles. Sits
 * flush below Latest News (white) — the white panel ends and the black
 * panel begins, hard boundary, no separator.
 */
export function DiveDeeper() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Explore</p>
          <h2 className={styles.title}>
            Dive <em>deeper</em> into Polytecks
          </h2>
        </header>

        <div className={styles.grid}>
          {TILES.map((tile, i) => (
            <StackEntry key={tile.href} index={i}>
              <Tile {...tile} />
            </StackEntry>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tile({ label, href, media }: TileData) {
  return (
    <Link href={href} className={styles.tile}>
      {media.kind === "image" ? (
        <div className={styles.media}>
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="(max-width: 720px) 100vw, 50vw"
            className={styles.imageEl}
            priority={false}
          />
        </div>
      ) : (
        <CrossfadeVideo src={media.src} />
      )}

      {/* Label-legibility gradient. Sits above the media (z 2) and below
          the label/arrow (z 3). Pointer-transparent so the whole tile
          is still a single click target via the surrounding <Link>. */}
      <div className={styles.gradient} aria-hidden="true" />

      <span className={styles.label}>{label}</span>
      <span className={styles.arrow} aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
    </Link>
  );
}

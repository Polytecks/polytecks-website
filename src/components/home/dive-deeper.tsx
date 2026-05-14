import { FadeImage as Image } from "@/components/fade-image";
import Link from "next/link";
import { StackEntry } from "@/components/stack-entry";
import { CrossfadeVideo } from "./crossfade-video";
import styles from "./dive-deeper.module.css";

type TileData = {
  label: string;
  href: string;
  media:
    | { kind: "image"; src: string; alt: string }
    | { kind: "video"; src: string; poster: string };
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
      kind: "video",
      // 720p re-encode of the 1080p source: ~1.7 MB vs 15 MB, visually
      // indistinguishable at the tile's display size. The poster is the
      // first frame extracted as an 80 KB JPG and painted as a CSS
      // background on the video wrap, so the tile is never a grey
      // square — the still frame shows instantly and the video swaps
      // in over the top once decoded.
      src: "/assets/polytecks-textile-720.mp4",
      poster: "/assets/polytecks-textile-poster.jpg",
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
        <CrossfadeVideo src={media.src} poster={media.poster} />
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

import Image from "next/image";
import styles from "./hex-portrait.module.css";

export function HexGradientDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6a74dc" />
          <stop offset="50%" stopColor="#a0afff" />
          <stop offset="100%" stopColor="#4a54c0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HexPortrait({
  src,
  alt,
  name,
  role,
  variant = "team",
  href,
}: {
  src: string;
  alt: string;
  name: string;
  role: string;
  variant?: "team" | "advisor";
  /** External profile URL (LinkedIn, university page, etc.). When set,
   *  only the hex portrait itself becomes a clickable link — the name
   *  and role stay as plain text outside the link target. */
  href?: string;
}) {
  const portraitId = src.replace(/.*\/(.*?)\.(png|jpg|jpeg|webp)$/, "$1");
  const className =
    variant === "advisor" ? `${styles.card} ${styles.advisor}` : styles.card;

  const frame = (
    <div className={styles.frame}>
      <svg
        className={styles.ring}
        viewBox="0 0 100 115.47"
        preserveAspectRatio="none"
      >
        <polygon points="50,1.5 98.5,28.87 98.5,86.60 50,113.97 1.5,86.60 1.5,28.87" />
      </svg>
      <div className={styles.clip}>
        <Image src={src} alt={alt} width={400} height={462} />
      </div>
    </div>
  );

  return (
    <div className={className} data-portrait={portraitId}>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.frameLink}
          aria-label={`${name} — external profile`}
        >
          {frame}
        </a>
      ) : (
        frame
      )}
      <div className={styles.name}>{name}</div>
      <div className={styles.role}>{role}</div>
    </div>
  );
}

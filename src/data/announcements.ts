/**
 * Homepage announcements parser.
 *
 * Reads `Homepage Announcements.txt` from the repo root at server-render
 * time and returns a typed list of entries. The plain-text file is
 * intentionally simple to keep it editable by hand — drop in new entries
 * using the existing format and refresh the homepage.
 *
 * Expected format per entry (blank line between entries):
 *
 *   1.
 *   Publication/Venue/Group: <outlet>
 *   Caption: <headline>
 *   Link: <url>
 *   Date: DD/MM/YYYY
 *
 * The leading "N." line is optional and ignored. Field labels are
 * case-insensitive. Lines that don't match are skipped silently — a
 * missing field on any one entry doesn't break the whole parse.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Announcement = {
  outlet: string;
  title: string;
  /** ISO YYYY-MM-DD, parsed from the file's DD/MM/YYYY format. */
  iso?: string;
  href: string;
  /** Path under /assets/announcements/ for the card image. Discovered
   *  automatically by leading slot number (1, 2, 3) — the rest of the
   *  filename can be anything (e.g. "1 pitchatkings.jpg"). */
  image?: string;
};

const FILE_NAME = "Homepage Announcements.txt";
const IMAGE_DIR = join("public", "assets", "announcements");

/** Convert DD/MM/YYYY → YYYY-MM-DD; returns undefined if unparseable. */
function isoFromDdMmYyyy(input: string): string | undefined {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(input.trim());
  if (!m) return undefined;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** Pull labelled values out of a single entry block. */
function parseBlock(block: string): Announcement | null {
  const fields: Record<string, string> = {};
  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    // "Label: value" — capture before the first colon as the field name.
    const m = /^([^:]+?)\s*:\s*(.+)$/.exec(line);
    if (m) fields[m[1].trim().toLowerCase()] = m[2].trim();
  }
  const outlet = fields["publication/venue/group"];
  const title = fields["caption"];
  const href = fields["link"] || "#";
  const iso = isoFromDdMmYyyy(fields["date"] ?? "");
  if (!outlet || !title) return null;
  return { outlet, title, href, iso };
}

/** Find the image file for a given slot (1-based). Matches filenames
 *  whose name starts with the slot digit followed by a separator (space,
 *  dot, dash, or underscore) — e.g. "1 pitchatkings.jpg", "1.png",
 *  "1-headline.webp". The leading-digit-anchored regex prevents "10" or
 *  "12something.jpg" from being picked up as slot 1. */
function findImagePath(slot: number): string | undefined {
  const dir = join(process.cwd(), IMAGE_DIR);
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return undefined;
  }
  const match = entries.find((name) =>
    new RegExp(`^${slot}([.\\s\\-_]|$)`).test(name),
  );
  // URL-encode the filename so spaces (e.g. "1 pitchatkings.jpg") and
  // any other reserved characters resolve correctly when the browser
  // requests the asset.
  return match
    ? `/assets/announcements/${encodeURIComponent(match)}`
    : undefined;
}

/**
 * Load and parse the announcements file. The text file lives at the repo
 * root and is edited by hand; each entry's image is auto-discovered from
 * `public/assets/announcements/` by leading slot number so the editor
 * doesn't need to touch the .txt to swap an image — just drop a new
 * `1 …`/`2 …`/`3 …` file in the folder and refresh.
 *
 * The function is intentionally synchronous and called inside the server
 * component on each render. Next.js's per-request caching means the file
 * is effectively read once per page load.
 */
export function loadAnnouncements(): Announcement[] {
  const path = join(process.cwd(), FILE_NAME);
  let raw: string;
  try {
    raw = readFileSync(path, "utf-8");
  } catch {
    // File missing or unreadable — fail silently so the homepage still
    // renders. The section's "View all news" link still works.
    return [];
  }
  const parsed = raw
    .split(/\r?\n\s*\r?\n/) // blank-line-delimited entries
    .map((b) => b.trim())
    .filter(Boolean)
    .map(parseBlock)
    .filter((x): x is Announcement => x !== null);
  // Attach the auto-discovered image (by 1-based slot index) to each
  // parsed entry. Slot beyond what's in the folder yields undefined,
  // and the card will simply render without an image.
  return parsed.map((item, i) => ({ ...item, image: findImagePath(i + 1) }));
}

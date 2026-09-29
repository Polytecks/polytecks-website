// Sync the investor deck from the sibling webdeck repo into public/d/_deck/
// as a standalone, UNGATED static page. Run with `npm run sync-deck`.
//
// The deck repo is only ever read, never written. What gets copied:
//   - public/deck/{slides,media}  -> public/d/_deck/{slides,media}
//   - public/deck/manifest.json   -> inlined into the page, paths rewritten
//   - app/deck/DeckViewer.tsx     -> bundled with React via esbuild
//   - app/globals.css             -> inlined into the page
//
// Gate removal (reapplied on every run): the deck's gate lives entirely in its
// server code (middleware.ts, app/deck/gate, app/api/gate, lib/auth) — none of
// which is copied. The viewer is mounted with track={false} and its default is
// patched to false too, so no /api/track beacons fire. The sync then refuses to
// write anything if the bundle still references the gate, cookie, or /api/.
//
// next.config.ts rewrites /d/<slug> (for each slug in deck-slugs.mjs) to the
// generated index.html, and marks /d/* noindex.

import { build } from "esbuild";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { DECK_SLUGS } from "../deck-slugs.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DECK_REPO = path.resolve(process.env.DECK_REPO ?? path.join(ROOT, "..", "webdeck"));
const OUT = path.join(ROOT, "public", "d", "_deck");
const PUBLIC_BASE = "/d/_deck"; // URL of OUT; absolute, so it works at every slug

const SRC = {
  viewer: path.join(DECK_REPO, "app", "deck", "DeckViewer.tsx"),
  css: path.join(DECK_REPO, "app", "globals.css"),
  deckDir: path.join(DECK_REPO, "public", "deck"),
};

function fail(msg) {
  console.error(`\n[sync-deck] ERROR: ${msg}\n`);
  process.exit(1);
}

// --- preflight --------------------------------------------------------------
for (const p of Object.values(SRC)) if (!existsSync(p)) fail(`missing ${p}`);
for (const s of DECK_SLUGS) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(s) || s.startsWith("_")) fail(`bad slug "${s}"`);
}

try {
  const dirty = execFileSync(
    "git",
    ["-C", DECK_REPO, "status", "--porcelain", "--", "public/deck", "app/deck/DeckViewer.tsx", "app/globals.css"],
    { encoding: "utf8" },
  ).trim();
  if (dirty) {
    console.warn("[sync-deck] WARNING: deck repo has uncommitted changes to synced files:\n" + dirty);
  }
  const head = execFileSync("git", ["-C", DECK_REPO, "log", "-1", "--format=%h %s"], { encoding: "utf8" }).trim();
  console.log(`[sync-deck] deck repo @ ${head}`);
} catch {
  console.warn("[sync-deck] WARNING: could not read deck repo git state");
}

// --- manifest: rewrite /deck/... asset paths to /d/_deck/... ----------------
const manifest = JSON.parse(await fs.readFile(path.join(SRC.deckDir, "manifest.json"), "utf8"));
const rewrite = (p) => {
  if (typeof p !== "string" || !p.startsWith("/deck/")) fail(`unexpected asset path in manifest: ${p}`);
  return PUBLIC_BASE + p.slice("/deck".length);
};
const referenced = new Set();
for (const s of manifest.slides) {
  referenced.add(s.image);
  s.image = rewrite(s.image);
  for (const ov of s.overlays ?? []) {
    for (const k of ["src", "poster"]) {
      if (ov[k]) {
        referenced.add(ov[k]);
        ov[k] = rewrite(ov[k]);
      }
    }
  }
}
for (const p of referenced) {
  if (!existsSync(path.join(DECK_REPO, "public", p))) fail(`manifest references missing file ${p}`);
}

// --- viewer: patch tracking off, then bundle --------------------------------
let viewerSrc = await fs.readFile(SRC.viewer, "utf8");
// 1. default the prop off (the entry also passes track={false})
viewerSrc = viewerSrc.replace(/\btrack\s*=\s*true\b/, "track = false");
// 2. make the dwell-tracking flush an unconditional no-op, so the minifier
//    drops the sendBeacon/fetch("/api/track") code entirely
const flushGuard = /if\s*\(\s*!track\s*\)\s*return;/;
if (!flushGuard.test(viewerSrc)) {
  fail("could not find the `if (!track) return;` tracking guard in DeckViewer.tsx — update the patch");
}
viewerSrc = viewerSrc.replace(flushGuard, "return;");

const entry = `
import { createRoot } from "react-dom/client";
import DeckViewer from "./DeckViewer";
const manifest = JSON.parse(document.getElementById("deck-manifest").textContent);
createRoot(document.getElementById("root")).render(
  <DeckViewer manifest={manifest} viewerId="" track={false} />
);
`;

const result = await build({
  stdin: { contents: entry, loader: "tsx", resolveDir: ROOT, sourcefile: "deck-entry.tsx" },
  plugins: [
    {
      // serve the patched DeckViewer source from memory; resolve react from this repo
      name: "deck-viewer",
      setup(b) {
        b.onResolve({ filter: /^\.\/DeckViewer$/ }, () => ({ path: "DeckViewer.tsx", namespace: "deck" }));
        b.onLoad({ filter: /.*/, namespace: "deck" }, () => ({
          contents: viewerSrc,
          loader: "tsx",
          resolveDir: ROOT,
        }));
      },
    },
  ],
  bundle: true,
  write: false,
  minify: true,
  format: "iife",
  target: ["es2019"],
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
  logLevel: "warning",
});
const js = result.outputFiles[0].text;

// --- gate guard: nothing gate/tracking-related may survive -------------------
const FORBIDDEN = ["/api/", "/deck/gate", "deck_access", "document.cookie", "sendBeacon"];
const hits = FORBIDDEN.filter((f) => js.includes(f));
if (hits.length) {
  fail(
    `bundled viewer still references gate/tracking (${hits.join(", ")}).\n` +
      "The deck viewer has changed in a way this script doesn't know how to neutralise.\n" +
      "Update the gate-removal patch in scripts/sync-deck.mjs before syncing.",
  );
}
const jsFinal = js;

// --- write output ------------------------------------------------------------
const css = await fs.readFile(SRC.css, "utf8");
const jsName = `deck.${createHash("sha256").update(jsFinal).digest("hex").slice(0, 10)}.js`;
const esc = (s) => s.replace(/</g, "\\u003c");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title>Polytecks — Investor Deck</title>
<link rel="icon" href="/favicon.ico">
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
<script id="deck-manifest" type="application/json">${esc(JSON.stringify(manifest))}</script>
<script src="${PUBLIC_BASE}/${jsName}"></script>
</body>
</html>
`;

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });
for (const sub of ["slides", "media"]) {
  await fs.cp(path.join(SRC.deckDir, sub), path.join(OUT, sub), { recursive: true });
}
await fs.writeFile(path.join(OUT, jsName), jsFinal);
await fs.writeFile(path.join(OUT, "index.html"), html);

console.log(
  `[sync-deck] wrote ${path.relative(ROOT, OUT)} — ${manifest.slides.length} slides, ` +
    `${referenced.size} assets, ${jsName}`,
);
console.log("[sync-deck] served at:\n" + DECK_SLUGS.map((s) => `  /d/${s}`).join("\n"));

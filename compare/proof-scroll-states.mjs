/**
 * Capture the proof section at various scroll progresses to verify the new
 * in-place fade-and-grow choreography.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:3000";
const OUT = "compare/proof-states";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

// Find the proof section's outer element + bounding box
const outer = await page.evaluate(() => {
  const sections = Array.from(document.querySelectorAll('section'));
  // The proof section is the one with height ~300vh (multi-viewport tall)
  const proof = sections.find(s => {
    const r = s.getBoundingClientRect();
    return r.height > window.innerHeight * 2;
  });
  if (!proof) return null;
  const r = proof.getBoundingClientRect();
  return { top: window.scrollY + r.top, height: r.height };
});

if (!outer) {
  console.error("Proof section not found");
  process.exit(1);
}

console.log(`Proof section: top=${Math.round(outer.top)}, height=${Math.round(outer.height)}`);

// Capture at 5 progress points within the section
const states = [
  { label: "00pct", progress: 0.0 },
  { label: "25pct", progress: 0.25 },
  { label: "50pct", progress: 0.5 },
  { label: "75pct", progress: 0.75 },
  { label: "99pct", progress: 0.99 },
];

for (const s of states) {
  // Section progress: progress=0 means top of section at top of viewport.
  // Scroll Y position = outer.top + (outer.height - viewport_height) * progress
  const scrollY = outer.top + (outer.height - 900) * s.progress;
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(400); // let any motion values settle
  const path = join(OUT, `proof-${s.label}.png`);
  await page.screenshot({ path, fullPage: false });
  console.log(`  ${s.label}: scrollY=${Math.round(scrollY)} → ${path}`);
}

await browser.close();
console.log(`\nDone. See ${OUT}/`);

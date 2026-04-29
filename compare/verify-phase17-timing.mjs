/**
 * Capture devices page at 3 timepoints to confirm the sequence:
 *   t=200ms  → eyebrow + title fading in (no lede, no icons, no tabs)
 *   t=1300ms → header fully visible, icons starting
 *   t=2800ms → everything visible (icons + tabs)
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-phase17";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`PAGE: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`CONSOLE: ${m.text()}`); });

  // First navigation primes the page (compile time on Turbopack first hit).
  await page.goto(`${BASE}/devices`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Now navigate fresh and capture at intervals.
  await page.goto(`${BASE}/devices`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(OUT, "devices-t200.png"), fullPage: false });

  await page.waitForTimeout(1100); // total ≈ 1300
  await page.screenshot({ path: join(OUT, "devices-t1300.png"), fullPage: false });

  await page.waitForTimeout(1500); // total ≈ 2800
  await page.screenshot({ path: join(OUT, "devices-t2800.png"), fullPage: false });

  // Tech page sequence
  await page.goto(`${BASE}/technology`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(OUT, "tech-t200.png"), fullPage: false });
  await page.waitForTimeout(1300); // ≈ 1500
  await page.screenshot({ path: join(OUT, "tech-t1500.png"), fullPage: false });
  await page.waitForTimeout(800); // ≈ 2300
  await page.screenshot({ path: join(OUT, "tech-t2300.png"), fullPage: false });
  await page.waitForTimeout(1000); // ≈ 3300
  await page.screenshot({ path: join(OUT, "tech-t3300.png"), fullPage: false });

  await browser.close();
  console.log("\n=== ERRORS ===");
  console.log(errors.length === 0 ? "(none)" : errors.join("\n"));
  console.log(`Screenshots → ${OUT}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });

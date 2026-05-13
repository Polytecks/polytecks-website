/**
 * Capture /press at mobile viewports for the press page mobile cleanup.
 * Each viewport gets the full page so we can audit every section.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-press-mobile";
mkdirSync(OUT, { recursive: true });

const URL = "http://localhost:3000/press";
const VIEWPORTS = [320, 375, 414];

const browser = await chromium.launch();
for (const w of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: join(OUT, `press-${w}.png`),
    fullPage: true,
  });
  await ctx.close();
}
await browser.close();
console.log("done");

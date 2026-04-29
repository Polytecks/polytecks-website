import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-phase28";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.evaluate(() => {
  const panel = document.querySelector('[class*="mission-panel-module"]');
  if (panel) panel.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(500);
await page.screenshot({ path: join(OUT, "mission.png"), fullPage: false });

const result = await page.evaluate(() => {
  const h = document.querySelector('[class*="mission-panel-module"] h2');
  if (!h) return { error: "no headline" };
  const cs = getComputedStyle(h);
  const lineHeight = parseFloat(cs.lineHeight);
  const rect = h.getBoundingClientRect();
  return {
    text: h.textContent?.trim(),
    fontSize: cs.fontSize,
    whiteSpace: cs.whiteSpace,
    lineHeight,
    height: rect.height,
    width: rect.width,
    isOneLine: rect.height < lineHeight * 1.4, // single-line ≈ 1× line-height
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();

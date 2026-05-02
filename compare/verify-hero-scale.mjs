import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-hero-scale";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const VIEWPORTS = [375, 720, 1280, 1440, 1600, 1920, 2560];

const browser = await chromium.launch();
const findings = [];

for (const w of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.addStyleTag({ content: `*, *::before, *::after { animation-play-state: paused !important; animation: none !important; }` });

  const data = await page.evaluate((vw) => {
    const headline = document.querySelector("h1[class*='hero-module']");
    const content = document.querySelector("[class*='hero-module'][class*='__content']");
    const leftCol = headline?.parentElement;
    if (!headline || !content || !leftCol) return null;
    const cs = getComputedStyle(headline);
    const hl = headline.getBoundingClientRect();
    const co = content.getBoundingClientRect();
    const col = leftCol.getBoundingClientRect();
    return {
      fontSize: parseFloat(cs.fontSize),
      headlineW: Math.round(hl.width),
      headlineH: Math.round(hl.height),
      contentW: Math.round(co.width),
      colW: Math.round(col.width),
      headlineRight: Math.round(hl.right),
      colRight: Math.round(col.right),
      overflowsCol: hl.right > col.right + 1,
      scrollW: document.documentElement.scrollWidth,
      bodyOverflows: document.documentElement.scrollWidth > vw + 1,
    };
  }, w);

  await page.screenshot({ path: join(OUT, `${w}-hero.png`) });
  findings.push({ w, ...data });
  await ctx.close();
}
await browser.close();

console.log("\nViewport  Font   Headline×Tall   Col   Overflows  PageOverflows");
for (const f of findings) {
  console.log(
    `${String(f.w).padStart(7)}px  ${String(f.fontSize).padStart(5)}px  ${String(f.headlineW).padStart(5)}×${String(f.headlineH).padStart(4)}px      ${String(f.colW).padStart(4)}px  ${f.overflowsCol ? "YES" : "no "}        ${f.bodyOverflows ? "YES" : "no "}`,
  );
}

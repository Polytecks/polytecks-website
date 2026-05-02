import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-home-sections";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const VIEWPORTS = [
  { name: "375", width: 375, height: 900 },
  { name: "1280", width: 1280, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const browser = await chromium.launch();
const errors = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${vp.name} PAGE: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${vp.name} CONSOLE: ${m.text()}`);
  });

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.addStyleTag({ content: `*, *::before, *::after { animation-play-state: paused !important; }` });

  // Probe DOM
  const newsInfo = await page.evaluate(() => {
    const sec = document.querySelector("section[class*='latest-news-module'][class*='__section']");
    if (!sec) return { found: false };
    const cs = getComputedStyle(sec);
    const slots = sec.querySelectorAll("[class*='__slot']");
    const cards = sec.querySelectorAll("a[class*='__card']");
    const titleEm = sec.querySelector("h2 em");
    const eyebrow = sec.querySelector("p[class*='__eyebrow']");
    const viewAll = sec.querySelector("a[class*='__viewAll']");
    return {
      found: true,
      bg: cs.backgroundColor,
      slotCount: slots.length,
      cardCount: cards.length,
      titleEmText: titleEm?.textContent,
      titleEmColor: titleEm ? getComputedStyle(titleEm).color : null,
      eyebrowText: eyebrow?.textContent,
      eyebrowColor: eyebrow ? getComputedStyle(eyebrow).color : null,
      viewAllText: viewAll?.textContent?.trim(),
      viewAllHref: viewAll?.getAttribute("href"),
    };
  });

  if (!newsInfo.found) {
    errors.push(`${vp.name}: Latest News section not found`);
    await ctx.close();
    continue;
  }

  // Element screenshot — Playwright handles scroll + clip for us
  const newsHandle = await page.$("section[class*='latest-news-module'][class*='__section']");
  if (newsHandle) {
    await newsHandle.screenshot({ path: join(OUT, `${vp.name}-news.png`) });
  }

  // Boundary: capture from end of ribbon through start of news
  await page.evaluate(() => {
    const r = document.querySelector("div[class*='partners-ribbon-module'][class*='__ribbon']");
    r?.scrollIntoView({ block: "end" });
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, `${vp.name}-boundary.png`) });

  console.log(`[${vp.name}]`, JSON.stringify(newsInfo));
  await ctx.close();
}
await browser.close();

console.log(`\nErrors: ${errors.length === 0 ? "(none)" : errors.length}`);
if (errors.length > 0) console.log(errors.join("\n"));
console.log(`Screenshots → ${OUT}`);

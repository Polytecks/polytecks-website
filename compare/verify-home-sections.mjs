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
    if (m.type() === "error" && !m.text().includes("afil_SPARK")) {
      errors.push(`${vp.name} CONSOLE: ${m.text()}`);
    }
  });

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.addStyleTag({ content: `*, *::before, *::after { animation-play-state: paused !important; }` });

  // Probe each section
  const probe = await page.evaluate(() => {
    const news = document.querySelector("section[class*='latest-news-module'][class*='__section']");
    const deep = document.querySelector("section[class*='dive-deeper-module'][class*='__section']");
    const newsBg = news ? getComputedStyle(news).backgroundColor : null;
    const deepBg = deep ? getComputedStyle(deep).backgroundColor : null;
    const tiles = deep?.querySelectorAll("a[class*='__tile']") ?? [];
    const videos = deep?.querySelectorAll("video") ?? [];
    const images = deep?.querySelectorAll("img") ?? [];
    const titleEm = deep?.querySelector("h2 em");
    const eyebrow = deep?.querySelector("p[class*='__eyebrow']");
    return {
      newsFound: !!news,
      newsBg,
      deepFound: !!deep,
      deepBg,
      tileCount: tiles.length,
      videoCount: videos.length,
      imageCount: images.length,
      titleEmText: titleEm?.textContent,
      titleEmColor: titleEm ? getComputedStyle(titleEm).color : null,
      eyebrowText: eyebrow?.textContent,
      tileLinks: [...tiles].map((t) => t.getAttribute("href")),
    };
  });

  // Element screenshots
  const newsHandle = await page.$("section[class*='latest-news-module'][class*='__section']");
  if (newsHandle) await newsHandle.screenshot({ path: join(OUT, `${vp.name}-news.png`) });

  const deepHandle = await page.$("section[class*='dive-deeper-module'][class*='__section']");
  if (deepHandle) await deepHandle.screenshot({ path: join(OUT, `${vp.name}-deep.png`) });

  // Boundary: news → deep
  await page.evaluate(() => {
    const n = document.querySelector("section[class*='latest-news-module']");
    n?.scrollIntoView({ block: "end" });
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, `${vp.name}-boundary-news-to-deep.png`) });

  console.log(`[${vp.name}]`, JSON.stringify(probe));
  await ctx.close();
}
await browser.close();

console.log(`\nErrors: ${errors.length === 0 ? "(none)" : errors.length}`);
if (errors.length > 0) console.log(errors.join("\n"));
console.log(`Screenshots → ${OUT}`);

import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-partners";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const VIEWPORTS = [
  { name: "375",  width: 375,  height: 900 },
  { name: "1280", width: 1280, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const browser = await chromium.launch();
const errors = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${vp.name}: PAGE: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${vp.name}: CONSOLE: ${m.text()}`); });

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.addStyleTag({ content: `*, *::before, *::after { animation-play-state: paused !important; }` });

  // Mission panel screenshot (captures university-mark frames)
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("section, div")].find((d) =>
      /Brought to you by world-leading researchers/i.test(d.textContent ?? "")
    );
    el?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(400);

  const missionInfo = await page.evaluate(() => {
    const marks = document.querySelectorAll("[class*='university-mark-module'][class*='__mark']");
    const heights = [...marks].map((m) => m.getBoundingClientRect().height);
    const widths = [...marks].map((m) => m.getBoundingClientRect().width);
    const names = [...marks].map((m) => m.getAttribute("data-name"));
    const firstY = marks[0]?.getBoundingClientRect().top;
    return { count: marks.length, heights, widths, names, firstY };
  });
  if (missionInfo.firstY != null) {
    await page.screenshot({
      path: join(OUT, `${vp.name}-mission.png`),
      clip: {
        x: 0,
        y: Math.max(0, missionInfo.firstY - 30),
        width: vp.width,
        height: Math.min(150, vp.height - Math.max(0, missionInfo.firstY - 30)),
      },
    });
  }

  // Partners ribbon
  await page.evaluate(() => {
    const ribbon = document.querySelector("div[class*='partners-ribbon-module'][class*='__ribbon']");
    ribbon?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(400);

  const ribbonInfo = await page.evaluate(() => {
    const ribbon = document.querySelector("div[class*='partners-ribbon-module'][class*='__ribbon']");
    if (!ribbon) return { ribbonFound: false };
    const r = ribbon.getBoundingClientRect();
    const items = ribbon.querySelectorAll("div[class*='__item']");
    const captions = ribbon.querySelectorAll("[class*='__caption']");
    const itemRects = [...items].slice(0, 11).map((el) => el.getBoundingClientRect());
    return {
      ribbonFound: true,
      ribbonY: r.top,
      ribbonH: r.height,
      itemCount: items.length,
      captionCount: captions.length,
      sample: itemRects.map((r) => ({ w: Math.round(r.width), h: Math.round(r.height) })),
    };
  });

  if (ribbonInfo.ribbonFound) {
    await page.screenshot({
      path: join(OUT, `${vp.name}-ribbon.png`),
      clip: {
        x: 0,
        y: Math.max(0, ribbonInfo.ribbonY - 10),
        width: vp.width,
        height: Math.min(ribbonInfo.ribbonH + 20, vp.height - Math.max(0, ribbonInfo.ribbonY - 10)),
      },
    });
  }

  // Full track at desktop
  if (vp.width >= 1280 && ribbonInfo.ribbonFound) {
    const trackW = await page.evaluate(() => {
      const t = document.querySelector("div[class*='partners-ribbon-module'][class*='__track']:not([class*='__trackWrap'])");
      return t?.scrollWidth ?? 0;
    });
    const halfW = Math.round(trackW / 2);

    const ctx2 = await browser.newContext({ viewport: { width: Math.max(vp.width, halfW + 80), height: vp.height } });
    const page2 = await ctx2.newPage();
    await page2.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page2.waitForTimeout(1500);
    await page2.addStyleTag({ content: `*, *::before, *::after { animation-play-state: paused !important; }` });
    await page2.addStyleTag({ content: `
      div[class*='partners-ribbon-module'][class*='__track']:not([class*='__trackWrap']) { transform: translateX(0) !important; }
      div[class*='partners-ribbon-module'][class*='__trackWrap'] { mask-image: none !important; -webkit-mask-image: none !important; overflow: visible !important; }
    `});
    await page2.evaluate(() => {
      const r = document.querySelector("div[class*='partners-ribbon-module'][class*='__ribbon']");
      r?.scrollIntoView({ block: "center" });
    });
    await page2.waitForTimeout(400);
    const r = await page2.evaluate(() => {
      const e = document.querySelector("div[class*='partners-ribbon-module'][class*='__ribbon']");
      return e ? { y: e.getBoundingClientRect().top, h: e.getBoundingClientRect().height } : null;
    });
    if (r) {
      await page2.screenshot({
        path: join(OUT, `${vp.name}-track-full.png`),
        clip: { x: 0, y: Math.max(0, r.y - 10), width: halfW + 80, height: r.h + 20 },
      });
    }
    await ctx2.close();
  }

  console.log(`[${vp.name}] mission marks=${missionInfo.count} h=${JSON.stringify(missionInfo.heights.map((h) => Math.round(h)))} names=${JSON.stringify(missionInfo.names)}`);
  console.log(`[${vp.name}] ribbon items=${ribbonInfo.itemCount} captions=${ribbonInfo.captionCount} item sizes=${JSON.stringify(ribbonInfo.sample)}`);

  await ctx.close();
}
await browser.close();

console.log(`Errors: ${errors.length === 0 ? "(none)" : errors.length}`);
if (errors.length > 0) console.log(errors.join("\n"));
console.log(`Screenshots → ${OUT}`);

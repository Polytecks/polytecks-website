import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-mobile-fixes";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const VIEWPORTS = [320, 375, 414, 720, 1280];

const browser = await chromium.launch();

async function probeNews(w) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const s = document.querySelector("section[class*='latest-news-module']");
    s?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(400);
  const data = await page.evaluate(() => {
    const cards = document.querySelectorAll("a[class*='latest-news-module'][class*='__card']");
    if (cards.length === 0) return null;
    const first = cards[0];
    const last = cards[cards.length - 1];
    const date = first.querySelector("time[class*='__date']");
    return {
      cardCount: cards.length,
      firstCardPadding: getComputedStyle(first).padding,
      lastCardPadding: getComputedStyle(last).padding,
      dateMarginTop: date ? getComputedStyle(date).marginTop : null,
      dateAlign: date ? getComputedStyle(date).textAlign : null,
    };
  });
  const handle = await page.$("section[class*='latest-news-module']");
  if (handle) await handle.screenshot({ path: join(OUT, `news-${w}.png`) });
  await ctx.close();
  return data;
}

async function probeTeam(w) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    document.querySelector("#team")?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(400);

  const data = await page.evaluate(() => {
    const link = document.querySelector("a[class*='hex-portrait-module'][class*='__frameLink']");
    const clip = link?.querySelector("[class*='__clip']");
    const after = clip ? getComputedStyle(clip, "::after") : null;
    return {
      linkFound: !!link,
      clipFound: !!clip,
      afterContent: after?.content,
      afterOpacity: after?.opacity,
      afterBg: after?.backgroundColor,
    };
  });

  // Simulate :active by mouse-down on the first portrait
  const link = await page.$("a[class*='hex-portrait-module'][class*='__frameLink']");
  if (link) {
    const box = await link.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(150);
      const activeData = await page.evaluate(() => {
        const link = document.querySelector("a[class*='hex-portrait-module'][class*='__frameLink']");
        const clip = link?.querySelector("[class*='__clip']");
        return clip ? { activeOpacity: getComputedStyle(clip, "::after").opacity } : null;
      });
      data.activeOpacity = activeData?.activeOpacity;
      await page.mouse.up();
    }
  }
  await ctx.close();
  return data;
}

for (const w of VIEWPORTS) {
  const data = await probeNews(w);
  console.log(`news ${w}px:`, JSON.stringify(data));
}
console.log();
for (const w of VIEWPORTS) {
  const data = await probeTeam(w);
  console.log(`team ${w}px:`, JSON.stringify(data));
}

await browser.close();

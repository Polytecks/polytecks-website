/**
 * Capture the home hero at 1280/1440/1600/1920/2560 to verify Task 2 wide-screen
 * layout. Also full-page screenshots to confirm sections below the hero
 * (mission, ribbon, news, deeper) did NOT widen.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-hero-wide";
mkdirSync(OUT, { recursive: true });

const URL = "http://localhost:3000/";
const VIEWPORTS = [1280, 1440, 1600, 1920, 2560];

const browser = await chromium.launch();
for (const w of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2200);
  await page.screenshot({
    path: join(OUT, `hero-${w}.png`),
    clip: { x: 0, y: 0, width: w, height: 900 },
  });
  await page.screenshot({
    path: join(OUT, `full-${w}.png`),
    fullPage: true,
  });

  // Quick numeric measurement.
  const m = await page.evaluate(() => {
    const headline = document.querySelector("h1");
    const sub = document.querySelector("p");
    const arm = document.querySelector("[class*=arm]");
    const armImg = arm?.querySelector("img");
    const content = headline?.closest("[class*=content]");
    const left = headline?.parentElement;
    return {
      contentWidth: Math.round(content.getBoundingClientRect().width),
      gridCols: getComputedStyle(content).gridTemplateColumns,
      leftCol: Math.round(left?.getBoundingClientRect().width),
      armCol: Math.round(arm?.getBoundingClientRect().width),
      armImg: Math.round(armImg?.getBoundingClientRect().width),
      subLines: Math.round(
        sub.getBoundingClientRect().height / parseFloat(getComputedStyle(sub).lineHeight),
      ),
      headlineFontSize: getComputedStyle(headline).fontSize,
    };
  });
  console.log(w, JSON.stringify(m));
  await ctx.close();
}
await browser.close();

/**
 * Capture /technology hero at desktop widths to verify Task 3 title bump
 * and lede removal. Also captures one mobile width to confirm the mobile
 * title clamp wasn't disturbed.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-mosaic";
mkdirSync(OUT, { recursive: true });

const URL = "http://localhost:3000/technology";
const VIEWPORTS = [375, 1280, 1440, 1600, 1920, 2560];

const browser = await chromium.launch();
for (const w of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: join(OUT, `hero-${w}.png`),
    clip: { x: 0, y: 0, width: w, height: Math.min(900, 900) },
  });

  const m = await page.evaluate(() => {
    const title = document.querySelector("h1");
    const eyebrow = document.querySelector("h1")?.previousElementSibling
      ?.firstElementChild;
    const lede = document.querySelector("h1 ~ p");
    const header = document.querySelector("h1")?.closest("[class*=header]");
    const r = title?.getBoundingClientRect();
    const lh = parseFloat(getComputedStyle(title).lineHeight);
    return {
      titleFontSize: getComputedStyle(title).fontSize,
      titleLineHeight: getComputedStyle(title).lineHeight,
      titleWidth: Math.round(r?.width ?? 0),
      titleHeight: Math.round(r?.height ?? 0),
      titleLines: lh ? Math.round((r?.height ?? 0) / lh) : null,
      titleMaxWidth: getComputedStyle(title).maxWidth,
      headerWidth: Math.round(
        header?.getBoundingClientRect().width ?? 0,
      ),
      ledePresent: !!lede,
    };
  });
  console.log(w, JSON.stringify(m));
  await ctx.close();
}
await browser.close();

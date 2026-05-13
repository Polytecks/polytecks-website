import { chromium } from "playwright";
import fs from "fs";

const outDir = "compare/screenshots-about-bg-debug";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const widths = [375, 720, 1024, 1440, 1920];
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto("http://localhost:3000/about", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/w${w}.png`, fullPage: false });
  console.log(`vw=${w} saved`);
}
await browser.close();

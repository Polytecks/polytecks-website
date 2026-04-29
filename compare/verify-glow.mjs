import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-phase27";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/technology", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: join(OUT, "tech-glow.png"), fullPage: false });

const result = await page.evaluate(() => {
  const title = document.querySelector('[class*="hero-module"][class*="__header"] [class*="__title"]');
  const lede = document.querySelector('[class*="hero-module"][class*="__header"] [class*="__lede"]');
  return {
    titleShadow: title ? getComputedStyle(title).textShadow : null,
    ledeShadow: lede ? getComputedStyle(lede).textShadow : null,
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();

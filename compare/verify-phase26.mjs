import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-phase26";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Tech hero
  await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, "tech-hero.png"), fullPage: false });

  const techMetrics = await page.evaluate(() => {
    const hero = document.querySelector('[class*="hero-module"][class*="__hero"]');
    const header = document.querySelector('[class*="hero-module"][class*="__header"]');
    const lede = header?.querySelector('[class*="subpage-module"][class*="__lede"]');
    const heroRect = hero?.getBoundingClientRect();
    const headerRect = header?.getBoundingClientRect();
    return {
      heroHeight: heroRect?.height,
      headerCenterY: headerRect ? headerRect.top + headerRect.height / 2 : null,
      heroCenterY: heroRect ? heroRect.top + heroRect.height / 2 : null,
      ledeFontSize: lede ? getComputedStyle(lede).fontSize : null,
      ledeFontWeight: lede ? getComputedStyle(lede).fontWeight : null,
    };
  });
  techMetrics.headerOffsetFromCenter = (techMetrics.headerCenterY ?? 0) - (techMetrics.heroCenterY ?? 0);

  // About page lede for size comparison
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const aboutLede = await page.evaluate(() => {
    const lede = document.querySelector('[class*="subpage-module"][class*="__lede"]');
    return {
      fontSize: lede ? getComputedStyle(lede).fontSize : null,
      fontWeight: lede ? getComputedStyle(lede).fontWeight : null,
    };
  });

  await browser.close();

  const result = {
    tech: techMetrics,
    about: aboutLede,
    ledeSizesMatch: techMetrics.ledeFontSize === aboutLede.fontSize,
    techLedeBolderThanAbout: parseFloat(techMetrics.ledeFontWeight ?? "0") > parseFloat(aboutLede.fontWeight ?? "0"),
  };
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });

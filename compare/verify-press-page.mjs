import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-press";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const VIEWPORTS = [
  { name: "375", width: 375, height: 900 },
  { name: "1280", width: 1280, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const browser = await chromium.launch();
const errors = [];
let allOk = true;

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { errors.push(`${vp.name} PAGE: ${e.message}`); allOk = false; });
  page.on("console", (m) => {
    if (m.type() === "error") {
      errors.push(`${vp.name} CONSOLE: ${m.text()}`);
      allOk = false;
    }
  });

  const resp = await page.goto(`${BASE}/press`, { waitUntil: "networkidle" });
  if (!resp || resp.status() !== 200) {
    errors.push(`${vp.name}: HTTP ${resp?.status() ?? "no response"}`);
    allOk = false;
  }
  await page.waitForTimeout(800);

  // Top of page
  await page.screenshot({ path: join(OUT, `${vp.name}-top.png`) });
  // Full
  await page.screenshot({ path: join(OUT, `${vp.name}-full.png`), fullPage: true });

  // Sanity checks
  const checks = await page.evaluate(() => {
    const headline = document.querySelector("h1");
    const featured = document.querySelector("[class*='featured-carousel-module']");
    const pressSection = document.querySelector("[class*='press-section-module'][class*='__section']");
    const pubSection = document.querySelector("[class*='publications-section-module'][class*='__section']");
    const pressContact = document.querySelector("[class*='press-contact-module'][class*='__section']");
    const pubBg = pubSection ? getComputedStyle(pubSection).backgroundColor : null;
    const press = pressSection ? getComputedStyle(pressSection).backgroundColor : null;

    return {
      headlineText: headline?.textContent ?? null,
      hasFeatured: !!featured,
      hasPress: !!pressSection,
      hasPub: !!pubSection,
      hasContact: !!pressContact,
      pubBg,
      pressBg: press,
      eyebrowCount: document.querySelectorAll("[class*='section-eyebrow-module']").length,
      pagerCount: document.querySelectorAll("[class*='pager-arrows-module']").length,
      featuredCardCount: document.querySelectorAll("[class*='featured-carousel-module'][class*='__card']").length,
      pressRowCount: document.querySelectorAll("[class*='press-section-module'][class*='__row']").length,
      pubBlockCount: document.querySelectorAll("[class*='publications-section-module'][class*='__block']").length,
    };
  });

  console.log(`[${vp.name}] ${JSON.stringify(checks, null, 2)}`);
  await ctx.close();
}
await browser.close();

console.log(`\nErrors: ${errors.length === 0 ? "(none)" : errors.length}`);
if (errors.length > 0) console.log(errors.join("\n"));
console.log(`Screenshots → ${OUT}`);
process.exit(allOk ? 0 : 1);

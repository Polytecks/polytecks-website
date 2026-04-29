import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-mobile-audit";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

// iPhone 12 / 13 / 14 — common phone width
const ROUTES = ["/", "/about", "/technology", "/devices", "/careers", "/contact"];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`PAGE: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`CONSOLE: ${m.text()}`); });

// Disable scroll-driven proof animations for clean screenshots
const summary = [];
for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const file = `${route === "/" ? "home" : route.slice(1)}.png`;
  await page.screenshot({ path: join(OUT, file), fullPage: true });

  const m = await page.evaluate(() => {
    const root = document.documentElement;
    return {
      docWidth: root.scrollWidth,
      viewportWidth: window.innerWidth,
      docHeight: root.scrollHeight,
      hasHorizontalScroll: root.scrollWidth > window.innerWidth + 1,
    };
  });
  summary.push({ route, ...m });
}
await browser.close();
console.log(JSON.stringify(summary, null, 2));
console.log("\nErrors:", errors.length === 0 ? "(none)" : errors.length);
console.log("Screenshots →", OUT);

import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-mobile-final";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const VIEWPORTS = [
  { name: "375",  width: 375,  height: 812 },
  { name: "768",  width: 768,  height: 1024 },
  { name: "1280", width: 1280, height: 800 },
];

const ROUTES = ["/", "/about", "/technology", "/devices", "/careers", "/contact"];

const browser = await chromium.launch();
const errors = [];
const summary = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${vp.name}: PAGE: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${vp.name}: CONSOLE: ${m.text()}`); });

  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    const file = `${vp.name}-${route === "/" ? "home" : route.slice(1)}.png`;
    await page.screenshot({ path: join(OUT, file), fullPage: true });

    const m = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        scrollWidth: root.scrollWidth,
        viewport: window.innerWidth,
        overflows: root.scrollWidth > window.innerWidth + 1,
      };
    });
    summary.push({ route, viewport: vp.name, ...m });
  }
  await ctx.close();
}
await browser.close();

const overflows = summary.filter((s) => s.overflows);
console.log(`Captured ${summary.length} screenshots across ${VIEWPORTS.length} viewports × ${ROUTES.length} routes`);
console.log(`Horizontal overflows: ${overflows.length === 0 ? "(none)" : overflows.length}`);
if (overflows.length > 0) console.log(JSON.stringify(overflows, null, 2));
console.log(`Errors: ${errors.length === 0 ? "(none)" : errors.length}`);
if (errors.length > 0) console.log(errors.slice(0, 5).join("\n"));
console.log(`Screenshots → ${OUT}`);

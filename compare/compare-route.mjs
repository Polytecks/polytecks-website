/**
 * Per-route comparison: pass route as arg, e.g. `node compare/compare-route.mjs /about`.
 * Captures new (3000) and legacy (4000 + #fragment) at desktop only.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const route = (process.argv[2] || "/").replace(/^\/+/, "/");
const slug = route.replace(/^\//, "") || "home";
const NEW = `http://localhost:3000${route}`;
const OLD = `http://localhost:4000/index.html`;
const OUT = "compare";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

const errors = { new: [], legacy: [] };

async function shot(url, name, side, navigateTo) {
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") errors[side].push(m.text());
  });
  page.on("pageerror", (e) => errors[side].push(`pageerror: ${e}`));
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  if (navigateTo) {
    await page.evaluate((p) => window.navigate?.(p), navigateTo);
    await page.waitForTimeout(800);
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
  await page.close();
}

await shot(NEW, `${slug}-new`, "new");
await shot(OLD, `${slug}-legacy`, "legacy", slug === "home" ? null : slug);
await browser.close();

console.log(`Wrote compare/${slug}-new.png and compare/${slug}-legacy.png`);
console.log(`Console (new):    ${errors.new.length}`);
console.log(`Console (legacy): ${errors.legacy.length}`);
if (errors.new.length) console.log("New errors:", errors.new.slice(0, 5));

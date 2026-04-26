import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("compare", { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

page.on("console", (m) => {
  if (m.text().startsWith("[pillar-debug]")) console.log("BROWSER:", m.text());
});

await page.goto("http://localhost:3000/technology", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(1500);

const materials = page.locator('[data-pillar-id="materials"]');
const box = await materials.boundingBox();
if (!box) throw new Error("no materials box");
await materials.scrollIntoViewIfNeeded();

// Click to latch active via onClick handler.
await materials.click();
await page.waitForTimeout(900);
// Read computed style FIRST (without screenshot resizing the viewport).
const computedBeforeShot = await page.evaluate(() => {
  const el = document.querySelector('[data-pillar-id="materials"]');
  if (!el) return null;
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return {
    "data-active": el.getAttribute("data-active"),
    "flex-grow": cs.flexGrow,
    "min-height": cs.minHeight,
    width: cs.width, height: cs.height,
    rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
  };
});
console.log("BEFORE screenshot:");
console.log(JSON.stringify(computedBeforeShot, null, 2));
// Viewport-only screenshot — no resize artifact
await page.screenshot({ path: "compare/hover-debug-active.png" });

const computed = await page.evaluate(() => {
  const el = document.querySelector('[data-pillar-id="materials"]');
  if (!el) return null;
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return {
    "data-active": el.getAttribute("data-active"),
    "flex-grow": cs.flexGrow,
    "min-height": cs.minHeight,
    width: cs.width, height: cs.height,
    rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
  };
});
console.log("After click:");
console.log(JSON.stringify(computed, null, 2));

await browser.close();

/**
 * Captures a screenshot of the FirstDevice video-box on /devices,
 * then crops separate views for each acceptance check.
 *
 * Usage: node compare/validate-swiftstage.mjs
 * Assumes dev server on http://localhost:3000.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const URL = "http://localhost:3000/devices";
const OUT = "compare/swiftstage-validate";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

// Disable disk cache so the latest webm is loaded.
await page.route("**/swiftstage3-clean.webm*", async (route) => {
  await route.continue();
});
await ctx.clearCookies();

await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
// Let StackEntry animations complete + a couple of video frames play.
await page.waitForTimeout(2500);

// Force-reload to bypass any caching, then wait for video.
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2500);

// Make sure the video element has actually loaded the latest file.
const loaded = await page.evaluate(() => {
  const v = document.querySelector('[class*="kitVideo"]');
  if (!v) return null;
  return { src: v.currentSrc, ready: v.readyState, w: v.videoWidth, h: v.videoHeight };
});
console.log("video state:", loaded);

// Find the videoBox (the bordered frame holding the looping clip).
const videoBox = await page.locator('[class*="videoBox"]').first();
await videoBox.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);

// Whole video box.
await videoBox.screenshot({ path: join(OUT, "videoBox.png") });

// Whole device-visual (dog box + video box) for context.
const deviceVisual = await page.locator('[class*="deviceVisual"]').first();
await deviceVisual.screenshot({ path: join(OUT, "deviceVisual.png") });

// Boundary detail: left edge of videoBox at high zoom
const box = await videoBox.boundingBox();
if (box) {
  const boundaryClip = {
    x: Math.max(0, box.x - 8),
    y: box.y,
    width: Math.min(140, box.width / 3),
    height: box.height,
  };
  await page.screenshot({ path: join(OUT, "boundary-detail.png"), clip: boundaryClip });

  // Hexagon area (right ~40% of box)
  const hexClip = {
    x: box.x + box.width * 0.55,
    y: box.y,
    width: box.width * 0.45,
    height: box.height,
  };
  await page.screenshot({ path: join(OUT, "hex-detail.png"), clip: hexClip });
}

await browser.close();
console.log(`Wrote screenshots to ${OUT}/`);

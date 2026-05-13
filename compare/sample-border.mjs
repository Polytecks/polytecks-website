import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/devices", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
await page.locator('[class*="videoBox"]').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);

// Take a full screenshot, sample pixels at expected border positions using canvas.
const png = await page.screenshot({ fullPage: false });
const box = await page.locator('[class*="videoBox"]').first().boundingBox();

// Decode the PNG using the Image API in node? Easier: use playwright's pixel utilities.
// We'll re-take the screenshot of the box element with a small inset margin so the
// border row is visible at known pixel coordinates.
const padded = await page.evaluate(({ box }) => {
  // Use canvas to grab a strip across the top border of the videoBox.
  return null;
}, { box });

// Just save the box screenshot.
const fs = await import('node:fs');
await page.locator('[class*="videoBox"]').first().screenshot({ path: 'compare/swiftstage-validate/videoBox-edge.png' });

// Also take a strip just covering the top-edge of the box at high zoom for a sanity check.
const stripClip = { x: box.x - 4, y: box.y - 4, width: box.width + 8, height: 12 };
await page.screenshot({ path: 'compare/swiftstage-validate/videoBox-top-strip.png', clip: stripClip });
const sideClip = { x: box.x - 4, y: box.y + box.height/2 - 6, width: 12, height: 12 };
await page.screenshot({ path: 'compare/swiftstage-validate/videoBox-left-strip.png', clip: sideClip });

console.log('box rect:', box);
console.log('Wrote videoBox-edge.png, videoBox-top-strip.png, videoBox-left-strip.png');
await browser.close();

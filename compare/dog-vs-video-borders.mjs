import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/devices", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);

await page.locator('[class*="dogBox"]').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
const dogBox = await page.locator('[class*="dogBox"]').first().boundingBox();
const videoBox = await page.locator('[class*="videoBox"]').first().boundingBox();

const clip = (b) => ({ x: b.x - 4, y: b.y - 4, width: b.width + 8, height: 12 });
await page.screenshot({ path: 'compare/swiftstage-validate/dogBox-top-strip.png', clip: clip(dogBox) });
await page.screenshot({ path: 'compare/swiftstage-validate/videoBox-top-strip2.png', clip: clip(videoBox) });
console.log('dogBox y =', dogBox.y, 'videoBox y =', videoBox.y);
await browser.close();

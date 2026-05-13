import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/devices", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
await page.locator('[class*="videoBox"]').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(500);

const result = await page.evaluate(() => {
  const vb = document.querySelector('[class*="videoBox"]');
  if (!vb) return null;
  const rect = vb.getBoundingClientRect();
  // Sample pixel-color near the right-corner of the box (where hex is, expected dark page bg)
  // Use document.elementsFromPoint to see what's stacked.
  const sampleX = rect.left + rect.width * 0.85;
  const sampleY = rect.top + rect.height * 0.15;
  const stack = document.elementsFromPoint(sampleX, sampleY).map(el => ({
    tag: el.tagName,
    class: el.className?.toString?.()?.slice(0, 60),
    bg: getComputedStyle(el).backgroundColor,
  })).slice(0, 6);
  return { rect, sample: { x: sampleX, y: sampleY }, stack };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();

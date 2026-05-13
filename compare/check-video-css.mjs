import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/devices", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
await page.locator('[class*="videoBox"]').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);

const r = await page.evaluate(() => {
  const v = document.querySelector('[class*="kitVideo"]');
  if (!v) return null;
  const cs = getComputedStyle(v);
  const r = v.getBoundingClientRect();
  const parent = v.parentElement;
  const pr = parent.getBoundingClientRect();
  return {
    classes: v.className.toString(),
    pos: cs.position,
    top: cs.top, right: cs.right, bottom: cs.bottom, left: cs.left,
    width: cs.width, height: cs.height,
    rectX: r.x, rectY: r.y, rectW: r.width, rectH: r.height,
    parentRectX: pr.x, parentRectY: pr.y, parentRectW: pr.width, parentRectH: pr.height,
  };
});
console.log(JSON.stringify(r, null, 2));
await browser.close();

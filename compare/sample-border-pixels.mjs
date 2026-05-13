import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/devices", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
await page.locator('[class*="videoBox"]').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);

// Use html2canvas-like sampling via the browser: paint each box's edge into a canvas
// using getBoundingClientRect + the document elements at that point.
const result = await page.evaluate(() => {
  function describe(el) {
    if (!el) return "(null)";
    return `${el.tagName}.${el.className.toString().slice(0, 60)}`;
  }

  function sampleStack(x, y) {
    return document.elementsFromPoint(x, y).slice(0, 4).map(describe);
  }

  const dogBox = document.querySelector('[class*="dogBox"]');
  const videoBox = document.querySelector('[class*="videoBox"]');

  const out = {};
  for (const [name, el] of [["dog", dogBox], ["video", videoBox]]) {
    const r = el.getBoundingClientRect();
    out[name] = {
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      computedBorder: getComputedStyle(el).border,
      computedShadow: getComputedStyle(el).boxShadow,
      // Sample multiple points: outside the box, on the border ring, just inside
      atOutsideTop: sampleStack(r.x + r.width/2, r.y - 2),
      atBorderTop:  sampleStack(r.x + r.width/2, r.y - 0.5),  // box-shadow region
      atInsideTop:  sampleStack(r.x + r.width/2, r.y + 1),    // just inside
      atOutsideLeft: sampleStack(r.x - 2, r.y + r.height/2),
      atBorderLeft:  sampleStack(r.x - 0.5, r.y + r.height/2),
      atInsideLeft:  sampleStack(r.x + 1, r.y + r.height/2),
    };
  }
  return out;
});

console.log(JSON.stringify(result, null, 2));
await browser.close();

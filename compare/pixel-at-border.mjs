import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/devices", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
await page.locator('[class*="videoBox"]').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);

const result = await page.evaluate(async () => {
  const v = document.querySelector('[class*="videoBox"]');
  const rect = v.getBoundingClientRect();
  // Snapshot the videoBox area to a canvas
  const cs = getComputedStyle(v);
  return {
    rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
    border: cs.border,
    bg: cs.backgroundColor,
    // Use elementsFromPoint at the very top edge to see what's painted there
    atTopEdge: document.elementsFromPoint(rect.x + rect.width/2, rect.y).map(el => ({
      tag: el.tagName, cls: el.className.toString().slice(0, 50)
    })).slice(0, 5),
    atBorderTop: document.elementsFromPoint(rect.x + rect.width/2, rect.y + 0.5).map(el => ({
      tag: el.tagName, cls: el.className.toString().slice(0, 50)
    })).slice(0, 5),
    atBorderLeft: document.elementsFromPoint(rect.x + 0.5, rect.y + rect.height/2).map(el => ({
      tag: el.tagName, cls: el.className.toString().slice(0, 50)
    })).slice(0, 5),
    // Sample the video frame at the border y
    videoSample: (() => {
      const vid = v.querySelector('video');
      if (!vid || vid.readyState < 2) return null;
      const c = document.createElement('canvas');
      c.width = vid.videoWidth;
      c.height = vid.videoHeight;
      c.getContext('2d').drawImage(vid, 0, 0);
      // Sample at video corners (we'll see if there's content there)
      const ctx2 = c.getContext('2d');
      return {
        topLeft: [...ctx2.getImageData(2, 2, 1, 1).data],
        topMid:  [...ctx2.getImageData(c.width/2, 2, 1, 1).data],
        topRight: [...ctx2.getImageData(c.width - 3, 2, 1, 1).data],
      };
    })(),
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();

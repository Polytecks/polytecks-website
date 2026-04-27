import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const info = await page.evaluate(() => {
  const marks = Array.from(document.querySelectorAll('img[alt="Cambridge"], img[alt="Imperial"], img[alt="Durham"], img[alt="UCL"]'));
  return marks.map(img => {
    const mark = img.closest('div'); // bracket-mark wrapper
    const r = mark?.getBoundingClientRect();
    const imgR = img.getBoundingClientRect();
    return {
      alt: img.alt,
      markRect: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null,
      imgRect: { x: Math.round(imgR.x), y: Math.round(imgR.y), w: Math.round(imgR.width), h: Math.round(imgR.height) },
    };
  });
});
console.log(JSON.stringify(info, null, 2));
await browser.close();

import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/devices", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Find the videoBox and inspect its computed styles + parent bg
const info = await page.evaluate(() => {
  const vb = document.querySelector('[class*="videoBox"]');
  if (!vb) return null;
  let el = vb;
  const chain = [];
  while (el && el !== document.body) {
    const cs = getComputedStyle(el);
    chain.push({
      tag: el.tagName,
      class: el.className.toString().slice(0, 60),
      bg: cs.backgroundColor,
      bgImage: cs.backgroundImage.slice(0, 60),
    });
    el = el.parentElement;
  }
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
  return { chain, bodyBg, htmlBg };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();

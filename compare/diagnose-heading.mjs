import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const info = await page.evaluate(() => {
  const h2s = Array.from(document.querySelectorAll("h2"));
  return h2s.map((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      text: el.textContent.trim().slice(0, 80),
      tag: el.tagName,
      width: r.width,
      contentBoxWidth: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
      maxWidth: cs.maxWidth,
      paddingLeft: cs.paddingLeft,
      paddingRight: cs.paddingRight,
      fontSize: cs.fontSize,
      textWrap: cs.textWrap,
      fontFamily: cs.fontFamily,
    };
  });
});
console.log(JSON.stringify(info, null, 2));

await browser.close();

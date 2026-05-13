import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/devices", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
await page.locator('[class*="videoBox"]').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(800);

const info = await page.evaluate(() => {
  const dog = document.querySelector('[class*="dogBox"]');
  const vid = document.querySelector('[class*="videoBox"]');
  const css = (el) => {
    const s = getComputedStyle(el);
    return {
      border: s.border,
      borderTop: s.borderTop,
      borderColor: s.borderTopColor,
      background: s.backgroundColor,
      overflow: s.overflow,
      classes: el.className.toString().slice(0, 120),
    };
  };
  return {
    dog: dog ? css(dog) : null,
    video: vid ? css(vid) : null,
    // also dump the actual CSS rules that match .videoBox
    matchedRules: (() => {
      const m = [];
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.cssText && rule.cssText.includes("videoBox") && rule.cssText.includes("border")) {
              m.push(rule.cssText.slice(0, 200));
            }
          }
        } catch (e) {}
      }
      return m;
    })(),
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();

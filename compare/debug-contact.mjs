import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/contact", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.evaluate(() => {
  document.body.style.setProperty("--tw-contact-img-scale", "2");
});
await page.waitForTimeout(500);
const result = await page.evaluate(() => {
  const img = document.querySelector('[class*="contact-hero"][class*="__featureImage"]');
  const cs = getComputedStyle(img);
  return {
    cssWidthProperty: cs.width,
    cssRight: cs.right,
    cssLeft: cs.left,
    cssPosition: cs.position,
    boundingRectWidth: img.getBoundingClientRect().width,
    htmlWidthAttr: img.getAttribute("width"),
    inlineStyle: img.getAttribute("style"),
    parentRect: img.parentElement.getBoundingClientRect(),
    bodyVar: getComputedStyle(document.body).getPropertyValue("--tw-contact-img-scale").trim(),
  };
});
console.log(JSON.stringify(result, null, 2));
await browser.close();

import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
const data = await page.evaluate(() => {
  const heroSection = document.querySelector('section[class*="hero"]');
  const sub = heroSection?.querySelector('p');
  const arm = heroSection?.querySelector('[class*="arm"]');
  const ctas = heroSection?.querySelectorAll('[class*="ctas"] > *');
  const d = (el) => el ? getComputedStyle(el).animationDelay : null;
  return { sub: d(sub), arm: d(arm), cta1: ctas?.[0] ? d(ctas[0]) : null, cta2: ctas?.[1] ? d(ctas[1]) : null };
});
console.log("Desktop hero entry timing (1280):");
console.log(JSON.stringify(data, null, 2));
await browser.close();

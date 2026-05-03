import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const VIEWPORTS = [320, 375, 414];

const browser = await chromium.launch();

for (const w of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/press`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const data = await page.evaluate(() => {
    const pressTitles = [...document.querySelectorAll("a[class*='press-section-module'][class*='__row'] h3")];
    const pubTitles = [...document.querySelectorAll("article[class*='publications-section-module'][class*='__block'] h3")];
    function probe(els) {
      return els.map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const lh = parseFloat(cs.lineHeight);
        const lines = Math.round(r.height / lh);
        return { text: el.textContent?.slice(0, 50), w: Math.round(r.width), h: Math.round(r.height), lh, fontSize: cs.fontSize, lines };
      });
    }
    return {
      press: probe(pressTitles),
      pub: probe(pubTitles),
    };
  });
  console.log(`\n=== ${w}px ===`);
  console.log("PRESS titles:");
  for (const t of data.press) console.log(`  ${t.lines}L  ${t.h}px  font ${t.fontSize}  "${t.text}…"`);
  console.log("PUBLICATION titles:");
  for (const t of data.pub) console.log(`  ${t.lines}L  ${t.h}px  font ${t.fontSize}  "${t.text}…"`);
  await ctx.close();
}
await browser.close();

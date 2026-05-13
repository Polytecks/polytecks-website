import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.setViewportSize({ width: 1920, height: 900 });
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);

// Scroll ribbon into view to force lazy loading
await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll("div"));
  const lbl = all.find(d => d.textContent?.trim() === "Affiliations and Partners");
  lbl?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(2000);

const stats = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img[src*="/assets/afil_"]')).slice(0, 12);
  return imgs.map(img => {
    const item = img.parentElement;
    const ir = item.getBoundingClientRect();
    const cs = getComputedStyle(img);
    const itemCs = getComputedStyle(item);
    return {
      src: img.getAttribute("src").replace("/assets/", ""),
      itemH: itemCs.height,
      itemW: itemCs.width,
      transform: cs.transform,
    };
  });
});

console.log("Per-item rendering at vw=1920:");
for (const s of stats) console.log(JSON.stringify(s));

await browser.close();

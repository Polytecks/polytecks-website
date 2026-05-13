import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const outDir = "compare/screenshots-ribbon-final";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

await page.setViewportSize({ width: 1920, height: 900 });
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);

await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll("div"));
  const lbl = all.find(d => d.textContent?.trim() === "Affiliations and Partners");
  lbl?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(2000);

// Scroll the track to show items 7-12 (translate so item 7 is at left edge)
const offset = await page.evaluate(() => {
  const items = document.querySelectorAll('img[src*="/assets/afil_"]');
  if (items.length < 8) return 0;
  // Position 7 (Royce) onward — translate left by sum of widths+gaps of items 0-6
  const item7 = items[6].parentElement; // 7th index 6
  return item7.offsetLeft;
});

await page.addStyleTag({
  content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
});

await page.evaluate((off) => {
  document.querySelectorAll('[class*="track"]').forEach(t => {
    t.style.transform = `translateX(-${off}px)`;
  });
}, offset);

await page.waitForTimeout(1500);

const labelBox = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll("div"));
  const lbl = all.find(d => d.textContent?.trim() === "Affiliations and Partners");
  if (!lbl) return null;
  const r = lbl.getBoundingClientRect();
  return { y: r.y, h: r.height };
});

if (labelBox) {
  await page.screenshot({
    path: `${outDir}/w1920-pan.png`,
    clip: { x: 0, y: Math.max(0, labelBox.y - 60), width: 1920, height: 280 },
  });
}

await browser.close();
console.log("done");

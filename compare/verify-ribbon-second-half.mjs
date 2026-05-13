import { chromium } from "playwright";
import fs from "fs";

const outDir = "compare/screenshots-ribbon-final";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.setViewportSize({ width: 1920, height: 900 });
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);

// Scroll the ribbon into view
await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll("div"));
  const lbl = all.find(d => d.textContent?.trim() === "Affiliations and Partners");
  lbl?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(2000);

// Disable animation
await page.addStyleTag({
  content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
});

// Read measured offset of item 6 (zero-indexed: Royce is index 6)
const offset = await page.evaluate(() => {
  const imgs = document.querySelectorAll('img[src*="/assets/afil_"]');
  if (imgs.length < 12) return 0;
  // Item 6 is the 7th logo (Royce); we want to translate so it's at left
  return imgs[6].parentElement.offsetLeft;
});

console.log("offset to apply:", offset);

await page.evaluate((off) => {
  document.querySelectorAll('[class*="track"]').forEach(t => {
    t.style.transform = `translateX(-${off}px)`;
    t.style.animation = 'none';
  });
}, offset);

await page.waitForTimeout(800);

const labelBox = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll("div"));
  const lbl = all.find(d => d.textContent?.trim() === "Affiliations and Partners");
  if (!lbl) return null;
  const r = lbl.getBoundingClientRect();
  return { y: r.y };
});

if (labelBox) {
  await page.screenshot({
    path: `${outDir}/w1920-second-half.png`,
    clip: { x: 0, y: Math.max(0, labelBox.y - 60), width: 1920, height: 320 },
  });
  console.log("saved");
}

await browser.close();

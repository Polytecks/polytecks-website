import { chromium } from "playwright";
import fs from "fs";

const outDir = "compare/screenshots-ribbon-hover";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.setViewportSize({ width: 1920, height: 900 });
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);

// Scroll ribbon into view
await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll("div"));
  const lbl = all.find(d => d.textContent?.trim() === "Affiliations and Partners");
  lbl?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(2000);

// Pause the marquee with !important inline style so we can predict positions
await page.addStyleTag({
  content: `[class*="track"] { animation: none !important; transform: none !important; }`,
});
await page.waitForTimeout(400);

// Hover the 5050 logo (square, taller item) to verify the halo scales
// with the taller box.
const targetSrc = "afil_5050";
await page.hover(`img[src*="${targetSrc}"]`);
await page.waitForTimeout(600);

const labelBox = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll("div"));
  const lbl = all.find(d => d.textContent?.trim() === "Affiliations and Partners");
  if (!lbl) return null;
  const r = lbl.getBoundingClientRect();
  return { y: r.y };
});

if (labelBox) {
  await page.screenshot({
    path: `${outDir}/hover-5050-1920.png`,
    clip: { x: 0, y: Math.max(0, labelBox.y - 60), width: 1920, height: 320 },
  });
}

// Read computed glow data
const glow = await page.evaluate((src) => {
  const img = document.querySelector(`img[src*="${src}"]`);
  if (!img) return null;
  const item = img.parentElement;
  const cs = getComputedStyle(item);
  const before = getComputedStyle(item, "::before");
  const ir = item.getBoundingClientRect();
  return {
    item: {
      transform: cs.transform,
      opacity: cs.opacity,
      filter: cs.filter,
      box: { x: ir.x, y: ir.y, w: ir.width, h: ir.height },
    },
    before: {
      opacity: before.opacity,
      background: before.background.substring(0, 120),
      inset: `${before.top} ${before.right} ${before.bottom} ${before.left}`,
    },
  };
}, targetSrc);
console.log(JSON.stringify(glow, null, 2));

await browser.close();
console.log("done");

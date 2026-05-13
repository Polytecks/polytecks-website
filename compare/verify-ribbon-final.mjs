import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const outDir = "compare/screenshots-ribbon-final";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const widths = [1920, 1440, 1024, 720, 375];

for (const w of widths) {
  console.log(`vw=${w}: navigating…`);
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  // Scroll the ribbon into view
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("div"));
    const lbl = all.find(d => d.textContent?.trim() === "Affiliations and Partners");
    lbl?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(2000);

  // Disable animation
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; transform: none !important; }`,
  });

  // Reset ribbon track to translateX(0) so all logos line up at left
  await page.evaluate(() => {
    document.querySelectorAll('[class*="track"]').forEach(t => t.style.transform = 'none');
  });
  await page.waitForTimeout(300);

  const labelBox = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("div"));
    const lbl = all.find(d => d.textContent?.trim() === "Affiliations and Partners");
    if (!lbl) return null;
    const r = lbl.getBoundingClientRect();
    return { y: r.y, h: r.height };
  });

  if (labelBox) {
    await page.screenshot({
      path: `${outDir}/w${w}.png`,
      clip: { x: 0, y: Math.max(0, labelBox.y - 60), width: w, height: 280 },
    });
    console.log(`vw=${w}: screenshot saved`);
  } else {
    console.log(`vw=${w}: label not found`);
  }
}

await browser.close();
console.log("done");

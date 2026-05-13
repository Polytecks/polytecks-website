import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const outDir = "compare/screenshots-ribbon-logos";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const widths = [1920, 1440, 1024, 720, 375];
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  // Pause the ribbon animation so screenshots show a stable frame
  await page.addStyleTag({
    content: `*, *::before, *::after { animation-play-state: paused !important; transition: none !important; }`,
  });

  // Find the ribbon by its label text
  const labelHandle = await page.evaluateHandle(() => {
    const all = Array.from(document.querySelectorAll("div"));
    return all.find(d => d.textContent?.trim() === "Affiliations and Partners") ?? null;
  });
  const label = labelHandle.asElement();
  if (label) await label.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const stats = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img[src*="/assets/afil_"]'));
    // Take first 12 (one full set; the loop renders them twice)
    return imgs.slice(0, 12).map(img => {
      const item = img.parentElement;
      const r = item.getBoundingClientRect();
      const ir = img.getBoundingClientRect();
      return {
        src: img.getAttribute("src"),
        item: { w: r.width.toFixed(1), h: r.height.toFixed(1) },
        img:  { w: ir.width.toFixed(1), h: ir.height.toFixed(1) },
        transform: getComputedStyle(img).transform,
      };
    });
  });

  console.log(`\n=== vw=${w} ===`);
  for (const s of stats) console.log(JSON.stringify(s));

  // Screenshot the ribbon area
  if (label) {
    const box = await label.boundingBox();
    if (box) {
      await page.screenshot({
        path: `${outDir}/w${w}.png`,
        clip: {
          x: 0,
          y: Math.max(0, box.y - 80),
          width: w,
          height: 280,
        },
      });
    }
  }
}

await browser.close();

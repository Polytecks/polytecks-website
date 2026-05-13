import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const outDir = "compare/screenshots-ribbon-full";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const widths = [1920, 1440, 1024, 720, 375];

for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Scroll the ribbon into view to force lazy-load
  const labelHandle = await page.evaluateHandle(() => {
    const all = Array.from(document.querySelectorAll("div"));
    return all.find(d => d.textContent?.trim() === "Affiliations and Partners") ?? null;
  });
  const label = labelHandle.asElement();
  if (label) await label.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);

  // Wait for all ribbon images to actually have natural dimensions
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img[src*="/assets/afil_"]'));
    await Promise.all(
      imgs.map(img => img.complete ? null : new Promise(r => { img.onload = r; img.onerror = r; }))
    );
  });

  // Pause animation for stable screenshot
  await page.addStyleTag({
    content: `*, *::before, *::after { animation-play-state: paused !important; transition: none !important; }`,
  });

  // Reset the slide animation to translateX(0) so all logos line up at left edge
  await page.evaluate(() => {
    const tracks = Array.from(document.querySelectorAll('[class*="track"]'));
    for (const t of tracks) t.style.transform = 'translateX(0)';
  });

  await page.waitForTimeout(400);

  const stats = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img[src*="/assets/afil_"]')).slice(0, 12);
    return imgs.map(img => {
      const r = img.getBoundingClientRect();
      const item = img.parentElement.getBoundingClientRect();
      return {
        src: img.getAttribute("src").replace("/assets/", ""),
        item_w: item.width.toFixed(0),
        img_w: r.width.toFixed(0),
        img_h: r.height.toFixed(0),
      };
    });
  });
  console.log(`\n=== vw=${w} ===`);
  for (const s of stats) console.log(JSON.stringify(s));

  if (label) {
    const box = await label.boundingBox();
    if (box) {
      await page.screenshot({
        path: `${outDir}/w${w}.png`,
        clip: { x: 0, y: Math.max(0, box.y - 80), width: w, height: 280 },
      });
    }
  }
}

await browser.close();

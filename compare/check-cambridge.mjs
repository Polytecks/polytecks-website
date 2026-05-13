import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const browser = await chromium.launch();
mkdirSync("compare/cambridge", { recursive: true });

async function shoot(viewport, slug) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/about", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  const sec = page.locator('[class*="cambridge"]').first();
  await sec.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);

  const info = await page.evaluate(() => {
    const img = document.querySelector('[class*="cambridge"] img');
    const media = document.querySelector('[class*="cambridge"] [class*="media"]');
    if (!img) return null;
    const cs = getComputedStyle(img);
    const r = img.getBoundingClientRect();
    return {
      imgWidth: cs.width,
      imgHeight: cs.height,
      imgMaskImage: cs.maskImage,
      rectW: r.width,
      rectH: r.height,
      viewportW: window.innerWidth,
      media: media ? { width: getComputedStyle(media).width, rect: media.getBoundingClientRect() } : null,
    };
  });
  console.log(`[${slug}]`, JSON.stringify(info, null, 2));

  await page.screenshot({ path: `compare/cambridge/${slug}.png`, fullPage: false });
  await ctx.close();
}

await shoot({ width: 1366, height: 768 }, "laptop13");
await shoot({ width: 1440, height: 900 }, "laptop");
await shoot({ width: 1536, height: 864 }, "laptop15");
await shoot({ width: 1600, height: 900 }, "laptop16");
await shoot({ width: 1920, height: 1080 }, "wide");
await browser.close();
console.log("Wrote compare/cambridge/{laptop,wide}.png");

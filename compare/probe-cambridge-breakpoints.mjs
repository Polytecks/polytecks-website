import { chromium } from "playwright";

const browser = await chromium.launch();

const cases = [
  { name: "1440",   width: 1440, height: 900 },
  { name: "1800",   width: 1800, height: 1000 },
  { name: "390",    width: 390,  height: 844  },
];

for (const c of cases) {
  const page = await browser.newPage({ viewport: { width: c.width, height: c.height } });
  await page.goto(`http://localhost:3000/about?tweaks=1`, { waitUntil: "networkidle" });

  const media = page.locator('[class*="cambridge-section_module__"][class*="__media"], [class*="cambridge-section-module__"][class*="__media"], [class*="mobile-cambridge-section_module__"][class*="__media"], [class*="mobile-cambridge-section-module__"][class*="__media"]').first();
  await media.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const box = await media.boundingBox();
  if (!box) {
    console.log(`[${c.name}] no media box`);
    await page.close();
    continue;
  }

  await page.screenshot({
    path: `compare/cambridge-${c.name}.png`,
    clip: {
      x: Math.max(0, box.x - 40),
      y: Math.max(0, box.y - 40),
      width: Math.min(c.width, box.width + 80),
      height: Math.min(c.height, box.height + 80),
    },
  });

  const probe = await page.evaluate(() => {
    const m = document.querySelector('[class*="__media"]');
    const g = m?.querySelector('[class*="__glow"]');
    if (!m || !g) return null;
    const gCS = getComputedStyle(g);
    return {
      glowMask: gCS.maskImage?.slice(0, 200),
      glowOpacity: gCS.opacity,
    };
  });

  console.log(`[${c.name}] ${box.width.toFixed(0)}×${box.height.toFixed(0)}`, probe);
  await page.close();
}

await browser.close();
console.log("done");

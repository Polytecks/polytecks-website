import { chromium } from "playwright";

const browser = await chromium.launch();
for (const c of [
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1800", width: 1800, height: 1000 },
]) {
  const page = await browser.newPage({ viewport: { width: c.width, height: c.height } });
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForFunction(() => {
    const img = document.querySelector('[class*="cambridge-section_module__"][class*="__media"] img, [class*="cambridge-section-module__"][class*="__media"] img');
    return img && img.complete && img.naturalWidth > 0;
  }, null, { timeout: 15000 });
  await page.waitForTimeout(300);

  const probe = await page.evaluate(() => {
    const media = document.querySelector('[class*="cambridge-section_module__"][class*="__media"], [class*="cambridge-section-module__"][class*="__media"]');
    if (!media) return null;
    const body = media.querySelector('[class*="__bodyText"]');
    const callout = media.querySelector('[class*="__calloutText"]');
    const img = media.querySelector('img');
    const r = (el) => el ? { left: el.getBoundingClientRect().left.toFixed(1), right: el.getBoundingClientRect().right.toFixed(1), width: el.getBoundingClientRect().width.toFixed(1) } : null;
    const fs = (el) => el ? getComputedStyle(el).fontSize : null;
    const mw = (el) => el ? getComputedStyle(el).maxWidth : null;
    return {
      viewport: window.innerWidth,
      mediaWidth: media.getBoundingClientRect().width.toFixed(1),
      imgWidth: img.getBoundingClientRect().width.toFixed(1),
      body: { rect: r(body), fontSize: fs(body), maxWidth: mw(body) },
      callout: { rect: r(callout), fontSize: fs(callout), maxWidth: mw(callout) },
      // Check if callout right edge bleeds past media right edge (off the image)
      calloutOverflowsRight: (parseFloat(callout?.getBoundingClientRect().right) - parseFloat(media.getBoundingClientRect().right)).toFixed(1),
    };
  });
  console.log(c.name, JSON.stringify(probe, null, 2));

  // Tight crop screenshot
  const media = await page.locator('[class*="cambridge-section_module__"][class*="__media"], [class*="cambridge-section-module__"][class*="__media"]').first();
  await media.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box = await media.boundingBox();
  if (box) {
    await page.screenshot({
      path: `compare/cambridge-callout-${c.name}.png`,
      clip: {
        x: Math.max(0, box.x),
        y: Math.max(0, box.y - 40),
        width: Math.min(c.width, box.width),
        height: Math.min(c.height, box.height + 80),
      },
    });
    console.log(`  → compare/cambridge-callout-${c.name}.png`);
  }
  await page.close();
}
await browser.close();

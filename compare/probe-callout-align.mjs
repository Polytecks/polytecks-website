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
    const title = document.querySelector('[class*="cambridge-section_module__"][class*="__title"], [class*="cambridge-section-module__"][class*="__title"]');
    const body = document.querySelector('[class*="cambridge-section_module__"][class*="__bodyText"], [class*="cambridge-section-module__"][class*="__bodyText"]');
    const callout = document.querySelector('[class*="cambridge-section_module__"][class*="__calloutText"], [class*="cambridge-section-module__"][class*="__calloutText"]');
    const media = document.querySelector('[class*="cambridge-section_module__"][class*="__media"], [class*="cambridge-section-module__"][class*="__media"]');
    return {
      viewport: window.innerWidth,
      titleLeft: title?.getBoundingClientRect().left.toFixed(1),
      bodyLeft: body?.getBoundingClientRect().left.toFixed(1),
      calloutLeft: callout?.getBoundingClientRect().left.toFixed(1),
      mediaWidth: media?.getBoundingClientRect().width.toFixed(1),
      titleVsBodyOffset: (parseFloat(body?.getBoundingClientRect().left) - parseFloat(title?.getBoundingClientRect().left)).toFixed(1),
      bodyVsCalloutOffset: (parseFloat(callout?.getBoundingClientRect().left) - parseFloat(body?.getBoundingClientRect().left)).toFixed(1),
    };
  });
  console.log(c.name, JSON.stringify(probe));

  const m = await page.locator('[class*="cambridge-section_module__"][class*="__media"], [class*="cambridge-section-module__"][class*="__media"]').first();
  await m.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box = await m.boundingBox();
  if (box) {
    await page.screenshot({
      path: `compare/cambridge-align-${c.name}.png`,
      clip: {
        x: 0,
        y: Math.max(0, box.y - 100),
        width: c.width,
        height: Math.min(c.height, box.height + 130),
      },
    });
  }
  await page.close();
}
await browser.close();

import { chromium } from "playwright";

const browser = await chromium.launch();
for (const c of [{ name: "1440", width: 1440, height: 900 }, { name: "390", width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport: { width: c.width, height: c.height } });
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  // Frame the title + image: scroll title to ~80px from top, capture viewport.
  await page.evaluate(() => {
    const t = document.querySelector('[class*="cambridge-section_module__"][class*="__title"], [class*="cambridge-section-module__"][class*="__title"], [class*="mobile-cambridge-section_module__"][class*="__title"], [class*="mobile-cambridge-section-module__"][class*="__title"]');
    if (!t) return;
    const r = t.getBoundingClientRect();
    window.scrollBy(0, r.top - 80);
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `compare/cambridge-gap-${c.name}.png` });
  console.log(`shot → compare/cambridge-gap-${c.name}.png`);
  await page.close();
}
await browser.close();

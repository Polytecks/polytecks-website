import { chromium } from "playwright";

const browser = await chromium.launch();
for (const c of [
  { name: "1280", width: 1280, height: 800 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1600", width: 1600, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
]) {
  const page = await browser.newPage({ viewport: { width: c.width, height: c.height } });
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const probe = await page.evaluate(() => {
    const media = document.querySelector('[class*="cambridge-section_module__"][class*="__media"], [class*="cambridge-section-module__"][class*="__media"]');
    if (!media) return null;
    const img = media.querySelector('img');
    const mr = media.getBoundingClientRect();
    const ir = img.getBoundingClientRect();
    return {
      viewport: window.innerWidth,
      mediaLeft: mr.left.toFixed(1),
      mediaRight: mr.right.toFixed(1),
      mediaWidth: mr.width.toFixed(1),
      imgLeft: ir.left.toFixed(1),
      imgRight: ir.right.toFixed(1),
      imgWidth: ir.width.toFixed(1),
      overflowLeft: (0 - ir.left).toFixed(1),
      overflowRight: (ir.right - window.innerWidth).toFixed(1),
    };
  });

  console.log(c.name, JSON.stringify(probe));
  await page.close();
}
await browser.close();

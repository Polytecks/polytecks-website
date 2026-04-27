import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
for (const path of ["/", "/about", "/technology", "/devices", "/careers", "/contact", "/privacy"]) {
  const page = await ctx.newPage();
  await page.goto(`http://localhost:3000${path}?tweaks=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const panelVisible = await page.locator('[role="dialog"][aria-label="Design tweaks"]').count() > 0;
  console.log(`${path.padEnd(12)} tweaks panel rendered: ${panelVisible ? "YES" : "NO"}`);
  await page.close();
}
await browser.close();

import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-phase23";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.evaluate(() => {
  const team = document.getElementById("team");
  if (team) team.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(600);
await page.screenshot({ path: join(OUT, "about-team-after.png"), fullPage: false });

// Tight crop on advisors row
const advisorRow = await page.evaluate(() => {
  const row = document.querySelector('[class*="team-section"][class*="__advisorsRow"]');
  return row?.getBoundingClientRect();
});
if (advisorRow) {
  await page.screenshot({
    path: join(OUT, "about-advisors-tight.png"),
    clip: {
      x: Math.max(0, advisorRow.x - 20),
      y: Math.max(0, advisorRow.y - 20),
      width: Math.min(1440, advisorRow.width + 40),
      height: Math.min(900 - advisorRow.y + 20, advisorRow.height + 40),
    },
  });
}
await browser.close();
console.log("done");

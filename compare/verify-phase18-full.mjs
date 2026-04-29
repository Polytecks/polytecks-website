import { chromium } from "playwright";
import { join } from "node:path";

const OUT = "compare/screenshots-phase18";
const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "contact-full.png"), fullPage: true });
  await browser.close();
  console.log("done");
}
main();

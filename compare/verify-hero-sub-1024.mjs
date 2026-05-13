import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 700 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(2200);
await page.screenshot({ path: "compare/screenshots-hero-sub/w1024.png", fullPage: false });
await browser.close();

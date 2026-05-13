import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto("http://localhost:3000/careers", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const result = await page.evaluate(() => {
  const h1 = document.querySelector("h1");
  if (!h1) return { error: "no h1" };
  const em = h1.querySelector("em");
  if (!em) return { error: "no em in h1", html: h1.innerHTML };
  const cs = getComputedStyle(em);
  return {
    text: h1.textContent.trim(),
    emText: em.textContent,
    color: cs.color,
    fontStyle: cs.fontStyle,
    fontWeight: cs.fontWeight,
  };
});

console.log("Careers H1:", JSON.stringify(result, null, 2));

if (!fs.existsSync("compare/screenshots-careers-em")) fs.mkdirSync("compare/screenshots-careers-em", { recursive: true });
await page.screenshot({ path: "compare/screenshots-careers-em/desktop-1440.png", fullPage: false });

await page.setViewportSize({ width: 375, height: 667 });
await page.waitForTimeout(400);
await page.screenshot({ path: "compare/screenshots-careers-em/mobile-375.png", fullPage: false });

await browser.close();

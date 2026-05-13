import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

if (!fs.existsSync("compare/screenshots-hero-sub")) fs.mkdirSync("compare/screenshots-hero-sub", { recursive: true });

const widths = [375, 720, 1280, 1440, 1920, 2560];
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200); // let entry animation finish
  const stats = await page.evaluate((vw) => {
    const sub = Array.from(document.querySelectorAll("p, h2, h3"))
      .find(el => /Advanced bioelectrical/i.test(el.textContent || ""));
    if (!sub) return { vw, error: "no sub" };
    const cs = getComputedStyle(sub);
    return {
      vw,
      tag: sub.tagName,
      text: (sub.textContent || "").trim().slice(0, 80),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      width: sub.getBoundingClientRect().width.toFixed(1),
    };
  }, w);
  console.log(JSON.stringify(stats));
  await page.screenshot({ path: `compare/screenshots-hero-sub/w${w}.png`, fullPage: false });
}

await browser.close();

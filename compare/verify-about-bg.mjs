import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

if (!fs.existsSync("compare/screenshots-about-bg")) fs.mkdirSync("compare/screenshots-about-bg", { recursive: true });

const widths = [375, 720, 1024, 1440, 1920, 2560];
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Stats on bg image and overlay
  const stats = await page.evaluate(() => {
    const bgWrap = document.querySelector('[aria-hidden="true"]');
    const img = document.querySelector('img[src*="about-us-background"]');
    if (!img) return { error: "no image found" };
    const wrapRect = img.parentElement.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    const csImg = getComputedStyle(img);
    const overlay = img.parentElement.querySelector('div');
    const csOverlay = overlay ? getComputedStyle(overlay) : {};
    return {
      wrap: {
        left: wrapRect.left.toFixed(0),
        right: wrapRect.right.toFixed(0),
        top: wrapRect.top.toFixed(0),
        width: wrapRect.width.toFixed(0),
        height: wrapRect.height.toFixed(0),
      },
      imgComputed: {
        objectFit: csImg.objectFit,
        objectPosition: csImg.objectPosition,
      },
      overlayBg: csOverlay.backgroundColor || "n/a",
    };
  });
  console.log(`vw=${w}`, JSON.stringify(stats));
  await page.screenshot({ path: `compare/screenshots-about-bg/w${w}.png`, fullPage: false });
}

await browser.close();

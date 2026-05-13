import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

// Scroll the ribbon into view
const ribbonHandle = await page.$('section[aria-label="Affiliations and partners"]');
if (!ribbonHandle) {
  console.log("could not find ribbon section");
  // try alternate selector
}

// Find by text content (ribbon label says AFFILIATIONS & PARTNERS)
const result = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll("section, div"));
  const ribbon = els.find(e => /Affiliations\s+and\s+Partners/i.test(e.textContent || "") && e.querySelector("img"));
  if (!ribbon) return { error: "no ribbon element found" };
  const cs = getComputedStyle(ribbon);
  return {
    tag: ribbon.tagName,
    cls: ribbon.className,
    padding: cs.padding,
    paddingTop: cs.paddingTop,
    paddingBottom: cs.paddingBottom,
  };
});
console.log("Ribbon section:", JSON.stringify(result, null, 2));

if (!fs.existsSync("compare/screenshots-ribbon-padding")) fs.mkdirSync("compare/screenshots-ribbon-padding", { recursive: true });

// Scroll ribbon into view, then screenshot
await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll("section, div"));
  const ribbon = els.find(e => /Affiliations\s+and\s+Partners/i.test(e.textContent || "") && e.querySelector("img"));
  if (ribbon) ribbon.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(800);
await page.screenshot({ path: "compare/screenshots-ribbon-padding/desktop-1440.png" });

await page.setViewportSize({ width: 375, height: 667 });
await page.waitForTimeout(400);
await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll("section, div"));
  const ribbon = els.find(e => /Affiliations\s+and\s+Partners/i.test(e.textContent || "") && e.querySelector("img"));
  if (ribbon) ribbon.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(400);
await page.screenshot({ path: "compare/screenshots-ribbon-padding/mobile-375.png" });

await browser.close();

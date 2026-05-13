import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// Grab the saved tweaks from localStorage
const stored = await page.evaluate(() => {
  try {
    const raw = localStorage.getItem("polytecks:tweaks");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return { error: String(e) };
  }
});

console.log("Saved tweaks (polytecks:tweaks):");
console.log(JSON.stringify(stored, null, 2));

// Also grab the current applied values on body
const applied = await page.evaluate(() => {
  const cs = getComputedStyle(document.body);
  const keys = [
    "--tw-cb-scale",
    "--tw-cb-crop-bottom",
    "--tw-cb-crop-sides",
    "--tw-cb-callout-top",
    "--tw-cb-callout-left",
    "--tw-cb-side-fade",
    "--tw-cb-bottom-fade",
  ];
  return Object.fromEntries(keys.map((k) => [k, cs.getPropertyValue(k).trim()]));
});

console.log("\nApplied CSS vars on body:");
console.log(JSON.stringify(applied, null, 2));

await browser.close();

import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Clear localStorage so saved tweaks don't override defaults
await page.goto("http://localhost:3000/about", { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.removeItem("polytecks:tweaks"));
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const applied = await page.evaluate(() => {
  const cs = getComputedStyle(document.body);
  return {
    "--tw-cb-callout-top": cs.getPropertyValue("--tw-cb-callout-top").trim(),
    "--tw-cb-callout-left": cs.getPropertyValue("--tw-cb-callout-left").trim(),
    "--tw-cb-crop-bottom": cs.getPropertyValue("--tw-cb-crop-bottom").trim(),
  };
});

console.log("Carry-forward applied (from defaults):");
console.log(JSON.stringify(applied, null, 2));

await browser.close();

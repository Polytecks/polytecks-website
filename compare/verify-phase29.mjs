import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-phase29";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`PAGE: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`CONSOLE: ${m.text()}`); });

const results = {};

// 1. About lede no "breakthrough"
await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
results.aboutLede = await page.evaluate(() => {
  const lede = document.querySelector('[class*="subpage-module"][class*="__lede"]');
  return {
    text: lede?.textContent?.trim(),
    hasBreakthrough: lede?.textContent?.toLowerCase().includes("breakthrough") ?? false,
  };
});

// 2. Cambridge crop — measure at 3 viewports, confirm aspect-ratio locked
const VPS = [
  { width: 1920, height: 900 },
  { width: 1280, height: 900 },
  { width: 800,  height: 900 },
];
results.cambridgeAtViewports = [];
for (const vp of VPS) {
  await page.setViewportSize(vp);
  await page.evaluate(() => {
    document.body.style.setProperty("--tw-cb-scale", "1");
    document.body.style.setProperty("--tw-cb-crop-bottom", "0");
    document.body.style.setProperty("--tw-cb-crop-sides", "0");
  });
  await page.waitForTimeout(300);
  const m = await page.evaluate(() => {
    const img = document.querySelector('[class*="cambridge-section"][class*="__media"] img');
    if (!img) return null;
    const rect = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    return {
      width: rect.width,
      height: rect.height,
      ratio: +(rect.width / rect.height).toFixed(3),
      aspectRatio: cs.aspectRatio,
    };
  });
  results.cambridgeAtViewports.push({ vp, ...m });
}
const ratios = results.cambridgeAtViewports.map((r) => r.ratio);
results.cambridgeRatioConsistent = ratios.every((r) => Math.abs(r - ratios[0]) < 0.01);
await page.setViewportSize({ width: 1440, height: 900 });

// 3. Tech glow strength
await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: join(OUT, "tech-hero.png"), fullPage: false });
results.tech = await page.evaluate(() => {
  const title = document.querySelector('[class*="hero-module"][class*="__header"] [class*="__title"]');
  const lede = document.querySelector('[class*="hero-module"][class*="__header"] [class*="__lede"]');
  const overlay = document.querySelector('[class*="hero-module"][class*="__overlay"]');
  return {
    titleShadow: title ? getComputedStyle(title).textShadow : null,
    ledeShadow: lede ? getComputedStyle(lede).textShadow : null,
    overlayBg: overlay ? getComputedStyle(overlay).background.slice(0, 200) : null,
    titleShadowLayers: title ? (getComputedStyle(title).textShadow.match(/rgba?\(/g) || []).length : 0,
  };
});

// 4. Careers title + value icons + spacing
await page.goto(`${BASE}/careers`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: join(OUT, "careers.png"), fullPage: true });
results.careers = await page.evaluate(() => {
  const title = document.querySelector('[class*="careers-hero-module"][class*="__title"]');
  const valueIcons = document.querySelectorAll('[class*="values-section"][class*="__icon"]');
  const valuesSec = document.querySelector('[class*="values-section"][class*="__section"]');
  return {
    titleText: title?.textContent?.trim(),
    titleHasFullStop: title?.textContent?.trim().endsWith(".") ?? false,
    titleMentionsHowWe: title?.textContent?.toLowerCase().includes("how we") ?? false,
    iconCount: valueIcons.length,
    iconTags: Array.from(valueIcons).slice(0, 3).map((i) => i.tagName),
    iconSrcs: Array.from(valueIcons).slice(0, 6).map((i) =>
      decodeURIComponent(i.getAttribute("src") ?? "")
    ),
    valuesPaddingBottom: valuesSec ? getComputedStyle(valuesSec).paddingBottom : null,
    cssVarBottom: getComputedStyle(document.body).getPropertyValue("--sp-careers-values-bottom").trim(),
  };
});

// 5. Mission + careers title not repeating
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.evaluate(() => {
  const panel = document.querySelector('[class*="mission-panel-module"]');
  if (panel) panel.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(500);
results.mission = await page.evaluate(() => {
  const h2 = document.querySelector('[class*="mission-panel-module"] h2');
  return { heading: h2?.textContent?.trim() };
});

await browser.close();
console.log(JSON.stringify(results, null, 2));
console.log("\nERRORS:", errors.length === 0 ? "(none)" : errors.join("\n"));
console.log("\nScreenshots →", OUT);

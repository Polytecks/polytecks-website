/**
 * Phase 24 verification:
 *   1. Tech hero — no lede, ™ has indigo color, banner uses tech-banner CSS vars
 *   2. Tech tweak panel: "Banner scale" + "Banner side fade" sliders present
 *   3. Devices — captions white, em-dash → comma in subheading, real
 *      icon images loaded, icon size larger than 72px
 *   4. Landing — university marks render the new PNG logos
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-phase24";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`PAGE: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`CONSOLE: ${m.text()}`); });

  const results = {};

  // ── Tech hero ─────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(OUT, "tech-hero.png"), fullPage: false });

  results.tech = await page.evaluate(() => {
    const heroLede = document.querySelector('[class*="hero-module"][class*="__banner"] [class*="subpage-module"][class*="__lede"]');
    const tm = document.querySelector('[class*="hero-module"][class*="__tm"]');
    const banner = document.querySelector('[class*="hero-module"][class*="__banner"]');
    const img = banner?.querySelector("img");
    return {
      hasLede: !!heroLede,
      hasTM: !!tm,
      tmText: tm?.textContent,
      tmColor: tm ? getComputedStyle(tm).color : null,
      bannerHeight: banner?.getBoundingClientRect().height,
      maskHasSideFadeVar: img ? getComputedStyle(img).maskImage.includes("8%") : false,
      cssVarBannerScale: getComputedStyle(document.body).getPropertyValue("--tw-tech-banner-scale").trim(),
      cssVarSideFade: getComputedStyle(document.body).getPropertyValue("--tw-tech-banner-side-fade").trim(),
    };
  });

  // ── Tweak panel sliders ───────────────────────────────────────────────────
  await page.goto(`${BASE}/technology?tweaks=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const fx = buttons.find((b) => b.textContent?.trim().toLowerCase().includes("fx"));
    fx?.click();
  });
  await page.waitForTimeout(300);
  results.tweakSliders = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll("span")).map((el) => el.textContent?.trim() ?? "");
    const has = (s) => labels.some((l) => l === s);
    return {
      bannerScale: has("Banner scale"),
      bannerSideFade: has("Banner side fade"),
    };
  });

  // ── Devices page ──────────────────────────────────────────────────────────
  await page.goto(`${BASE}/devices`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);  // wait for icon cascade
  await page.screenshot({ path: join(OUT, "devices.png"), fullPage: false });

  results.devices = await page.evaluate(() => {
    const lede = document.querySelector('[class*="subpage-module"][class*="__lede"]');
    const ledeText = lede?.textContent ?? "";
    const wraps = document.querySelectorAll('[class*="applications-strip"][class*="__iconWrap"]');
    const labels = document.querySelectorAll('[class*="applications-strip"][class*="__label"]');
    const labelColor = labels[0] ? getComputedStyle(labels[0]).color : null;
    const wrapSizes = Array.from(wraps).map((w) => ({
      width: w.getBoundingClientRect().width,
      height: w.getBoundingClientRect().height,
    }));
    const imgs = document.querySelectorAll('[class*="applications-strip"][class*="__iconImg"]');
    const imgSrcs = Array.from(imgs).map((i) => decodeURIComponent(i.getAttribute("src") ?? ""));
    return {
      ledeHasEmDash: ledeText.includes("—"),
      ledeHasComma: /primary care, and/.test(ledeText),
      labelColor,
      iconCount: wraps.length,
      iconSize: wrapSizes[0]?.width,
      imgSrcs: imgSrcs.slice(0, 6),
    };
  });

  // ── Landing — university marks ────────────────────────────────────────────
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  // Scroll to mission panel where universities live
  await page.evaluate(() => {
    const panel = document.querySelector('[class*="mission-panel-module"]');
    if (panel) panel.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "landing-team-tease.png"), fullPage: false });

  results.universityMarks = await page.evaluate(() => {
    const marks = document.querySelectorAll('[class*="university-mark-module"][class*="__mark"]');
    return Array.from(marks).map((m) => {
      const img = m.querySelector("img");
      const text = m.querySelector('[class*="university-mark-module"][class*="__text"]');
      return {
        alt: img?.getAttribute("alt"),
        src: img ? decodeURIComponent(img.getAttribute("src") ?? "") : null,
        fellbackToText: !!text,
      };
    });
  });

  await browser.close();
  console.log("=== RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
  console.log("\n=== ERRORS ===");
  console.log(errors.length === 0 ? "(none)" : errors.join("\n"));
  console.log(`\nScreenshots → ${OUT}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });

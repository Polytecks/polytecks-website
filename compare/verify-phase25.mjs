/**
 * Phase 25 verification:
 *   1. Devices: tabs delay overlaps with last icon's fade (no perceived gap)
 *   2. Devices: icons larger, strip wider, captions stacked on 2 lines
 *   3. Mission: new heading + body text
 *   4. Careers: 120px symmetric bottom fade; open-roles -120px margin-top
 *   5. Tech hero: 100vh, bg-image set, lede restored, bottom-fade overlay
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-phase25";
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

  // ── 1+2. Devices ──────────────────────────────────────────────────────────
  await page.goto(`${BASE}/devices`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(OUT, "devices.png"), fullPage: false });

  results.devices = await page.evaluate(() => {
    const strip = document.querySelector('[class*="applications-strip"][class*="__strip"]');
    const wraps = document.querySelectorAll('[class*="applications-strip"][class*="__iconWrap"]');
    const labels = document.querySelectorAll('[class*="applications-strip"][class*="__label"]');
    const items = strip?.querySelectorAll('[class*="stack-entry-module"][class*="__wrap"]');
    const itemDelays = items
      ? Array.from(items).map((el) => el.style.getPropertyValue("--stack-delay-ms"))
      : null;
    const tabsRoot = document.querySelector('[class*="devices-tabs-module"]');
    const tabsWrap = tabsRoot?.closest('[class*="stack-entry-module"][class*="__wrap"]');
    return {
      stripMaxWidth: strip ? getComputedStyle(strip).maxWidth : null,
      stripWidth: strip?.getBoundingClientRect().width,
      iconSize: wraps[0]?.getBoundingClientRect().width,
      labelHTML: labels[0]?.innerHTML,
      hasBR: labels[0]?.innerHTML.includes("<br"),
      labelMinHeight: labels[0] ? getComputedStyle(labels[0]).minHeight : null,
      lastIconDelay: itemDelays?.[itemDelays.length - 1],
      tabsDelay: tabsWrap?.style.getPropertyValue("--stack-delay-ms") ?? null,
    };
  });
  // Gap check: tabs delay should be SHORTER than last icon delay + 600ms
  const lastIcon = parseFloat(results.devices.lastIconDelay) || 0;
  const tabs = parseFloat(results.devices.tabsDelay) || 0;
  results.devices.gapVsFullDuration = (lastIcon + 600) - tabs;
  results.devices.tabsOverlapsIcon = results.devices.gapVsFullDuration > 0;

  // ── 3. Mission heading + body ─────────────────────────────────────────────
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const panel = document.querySelector('[class*="mission-panel-module"]');
    if (panel) panel.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, "mission.png"), fullPage: false });

  results.mission = await page.evaluate(() => {
    const h2 = document.querySelector('[class*="mission-panel-module"] h2');
    const lede = document.querySelector('[class*="mission-panel-module"][class*="__lede"]');
    return {
      heading: h2?.textContent?.trim(),
      ledeStart: lede?.textContent?.trim().slice(0, 60),
      ledeHasNew: lede?.textContent?.includes("revealing") ?? false,
    };
  });

  // ── 4. Careers fade ───────────────────────────────────────────────────────
  await page.goto(`${BASE}/careers`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  results.careers = await page.evaluate(() => {
    const values = document.querySelector('[class*="values-section"][class*="__section"]');
    const open = document.querySelector('[class*="open-roles-section"][class*="__section"]');
    const valuesCs = values ? getComputedStyle(values) : null;
    const openCs = open ? getComputedStyle(open) : null;
    return {
      maskImage: valuesCs?.maskImage ?? valuesCs?.webkitMaskImage,
      openMarginTop: openCs?.marginTop,
    };
  });
  await page.evaluate(() => {
    const sec = document.querySelector('[class*="values-section"][class*="__section"]');
    if (sec) {
      const rect = sec.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + rect.bottom - window.innerHeight + 20);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, "careers.png"), fullPage: false });

  // ── 5. Tech hero ──────────────────────────────────────────────────────────
  await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(OUT, "tech-hero.png"), fullPage: false });

  results.tech = await page.evaluate(() => {
    const hero = document.querySelector('[class*="hero-module"][class*="__hero"]');
    const overlay = document.querySelector('[class*="hero-module"][class*="__overlay"]');
    const bottomFade = document.querySelector('[class*="hero-module"][class*="__bottomFade"]');
    const lede = document.querySelector('[class*="hero-module"][class*="__hero"] [class*="subpage-module"][class*="__lede"]');
    const tm = document.querySelector('[class*="hero-module"][class*="__tm"]');
    const heroCs = hero ? getComputedStyle(hero) : null;
    return {
      heroPosition: heroCs?.position,
      heroHeight: hero?.getBoundingClientRect().height,
      viewportHeight: window.innerHeight,
      heroIs100vh: hero?.getBoundingClientRect().height === window.innerHeight,
      heroBgImage: heroCs?.backgroundImage,
      heroBgSize: heroCs?.backgroundSize,
      heroBgPosition: heroCs?.backgroundPosition,
      hasOverlay: !!overlay,
      hasBottomFade: !!bottomFade,
      hasLede: !!lede,
      ledeText: lede?.textContent?.trim(),
      tmColor: tm ? getComputedStyle(tm).color : null,
    };
  });
  // Scroll past hero to confirm normal scroll-away (not fixed/sticky)
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(300);
  results.tech.heroTopAfterScroll = await page.evaluate(() => {
    const hero = document.querySelector('[class*="hero-module"][class*="__hero"]');
    return hero?.getBoundingClientRect().top;
  });
  results.tech.scrollsAway = results.tech.heroTopAfterScroll < -400;

  await browser.close();
  console.log("=== RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
  console.log("\n=== ERRORS ===");
  console.log(errors.length === 0 ? "(none)" : errors.join("\n"));
  console.log(`\nScreenshots → ${OUT}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });

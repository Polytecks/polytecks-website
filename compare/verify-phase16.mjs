/**
 * Phase 16 visual verification: capture the four pages we just touched and
 * extract enough info to confirm the changes landed.
 *
 *  - About:     Cambridge image vignette (mask-image present, max-width tighter)
 *  - Tech:      Banner image vignette + proof breathing per-card + post-lock collapse
 *  - Devices:   Icon strip stagger override (--stack-stagger-ms === 60ms)
 *  - Contact:   New panel layout w/ mosaicvertical bg + faded panel mask
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-phase16";
mkdirSync(OUT, { recursive: true });

const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on("pageerror", (e) => errors.push(`PAGE: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`CONSOLE: ${m.text()}`);
  });

  const results = {};

  // ── About / Cambridge ─────────────────────────────────────────────────────
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "about-top.png"), fullPage: false });
  // scroll to cambridge
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, "about-cambridge.png"), fullPage: false });

  results.cambridge = await page.evaluate(() => {
    const media = document.querySelector('[class*="cambridge-section"][class*="__media"]');
    const img = media?.querySelector("img");
    if (!img) return { error: "no img" };
    const cs = getComputedStyle(img);
    const mediaCs = media ? getComputedStyle(media) : null;
    return {
      mediaMaxWidth: mediaCs?.maxWidth,
      mediaWidth: media?.getBoundingClientRect().width,
      maskImage: cs.maskImage || cs.webkitMaskImage,
      filter: cs.filter,
    };
  });

  // ── Technology ────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "tech-top.png"), fullPage: false });

  results.techBanner = await page.evaluate(() => {
    const banner = document.querySelector('[class*="hero-module"][class*="__banner"]');
    const img = banner?.querySelector("img");
    if (!img) return { error: "no img" };
    const cs = getComputedStyle(img);
    return {
      bannerMaxWidth: banner ? getComputedStyle(banner).maxWidth : null,
      bannerWidth: banner?.getBoundingClientRect().width,
      maskImage: cs.maskImage || cs.webkitMaskImage,
    };
  });

  // Scroll proof section to fully through and verify breath + lock collapse
  // First find the proof outer height before lock
  results.proofPreScroll = await page.evaluate(() => {
    const outer = document.querySelector('[class*="proof-section"][class*="__outer"]');
    if (!outer) return { error: "no outer" };
    return {
      height: outer.getBoundingClientRect().height,
      dataLocked: outer.getAttribute("data-locked"),
    };
  });

  // Scroll to a midpoint where ~1 card is settled
  await page.evaluate(() => {
    const outer = document.querySelector('[class*="proof-section"][class*="__outer"]');
    if (outer) outer.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5));
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "proof-mid.png"), fullPage: false });

  results.proofMid = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="proof-section"][class*="__card"]');
    return Array.from(cards).map((c) => ({
      settled: c.getAttribute("data-settled"),
      opacity: c.style.opacity,
    }));
  });

  // Scroll all the way through proof
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(OUT, "proof-locked.png"), fullPage: false });

  results.proofPostScroll = await page.evaluate(() => {
    const outer = document.querySelector('[class*="proof-section"][class*="__outer"]');
    if (!outer) return { error: "no outer" };
    const cards = document.querySelectorAll('[class*="proof-section"][class*="__card"]');
    return {
      height: outer.getBoundingClientRect().height,
      dataLocked: outer.getAttribute("data-locked"),
      cards: Array.from(cards).map((c) => ({ settled: c.getAttribute("data-settled") })),
    };
  });

  // ── Devices ───────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/devices`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, "devices-top.png"), fullPage: false });

  results.devicesStrip = await page.evaluate(() => {
    const strip = document.querySelector('[class*="applications-strip"][class*="__strip"]');
    if (!strip) return { error: "no strip" };
    const cs = getComputedStyle(strip);
    const items = strip.querySelectorAll('[class*="applications-strip"][class*="__item"]');
    return {
      stackStaggerMs: cs.getPropertyValue("--stack-stagger-ms").trim(),
      stackDurationMs: cs.getPropertyValue("--stack-duration-ms").trim(),
      iconCount: items.length,
    };
  });

  // ── Contact ───────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "contact-top.png"), fullPage: false });

  results.contact = await page.evaluate(() => {
    const section = document.querySelector('[class*="contact-hero"][class*="__section"]');
    const bg = document.querySelector('[class*="contact-hero"][class*="__bg"]:not([class*="bgWash"])');
    const panel = document.querySelector('[class*="contact-hero"][class*="__panel"]:not([class*="panelWrap"])');
    return {
      sectionMinHeight: section ? getComputedStyle(section).minHeight : null,
      bgImage: bg ? getComputedStyle(bg).backgroundImage : null,
      panelDisplay: panel ? getComputedStyle(panel).display : null,
      panelMaskImage: panel
        ? (getComputedStyle(panel).maskImage || getComputedStyle(panel).webkitMaskImage)
        : null,
      panelGridTemplateCols: panel ? getComputedStyle(panel).gridTemplateColumns : null,
      formFieldCount: document.querySelectorAll('[class*="contact-hero"][class*="__field"]:not([class*="fieldRow"])').length,
      hasNewsletterCard: !!document.querySelector('[class*="contact-hero"][class*="__newsletterCard"]'),
    };
  });

  await browser.close();

  console.log("=== RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
  console.log("\n=== ERRORS ===");
  console.log(errors.length === 0 ? "(none)" : errors.join("\n"));
  console.log(`\nScreenshots → ${OUT}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

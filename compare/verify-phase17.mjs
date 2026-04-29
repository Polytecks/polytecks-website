/**
 * Phase 17 verification — five fixes:
 *   1. Breathing animation gone
 *   2. Devices: header → icons → tabs sequence + slider works
 *   3. Tech page: top-down entry sequence (hero → pillar title → cards LTR → proof)
 *   4. Cambridge image: exact spec mask + 80% width / max 1400
 *   5. Contact: bg image visible, two separate panels (reach-out + newsletter)
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-phase17";
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

  // ── About / Cambridge — exact spec ────────────────────────────────────────
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, "about-cambridge.png"), fullPage: false });

  results.cambridge = await page.evaluate(() => {
    const media = document.querySelector('[class*="cambridge-section"][class*="__media"]');
    const img = media?.querySelector("img");
    if (!img || !media) return { error: "no img" };
    const cs = getComputedStyle(img);
    const mediaCs = getComputedStyle(media);
    return {
      mediaWidth: mediaCs.width,
      mediaMaxWidth: mediaCs.maxWidth,
      bbox: media.getBoundingClientRect().width,
      maskImage: cs.maskImage || cs.webkitMaskImage,
      filter: cs.filter,
    };
  });

  // ── Technology — top-down sequence ────────────────────────────────────────
  await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
  // Sample animation-delay on each tracked element
  results.tech = await page.evaluate(() => {
    const result = {};
    // Hero internals (SubpageHeader StackEntry indices 0/1/2)
    const heroBanner = document.querySelector('[class*="hero-module"][class*="__banner"]');
    const heroEntries = heroBanner?.querySelectorAll('[class*="stack-entry-module"][class*="__inner"]');
    result.heroEntryDelays = heroEntries
      ? Array.from(heroEntries).map((e) => getComputedStyle(e).animationDelay)
      : null;

    // Pillar section title
    const pillarSection = document.querySelector('[class*="pillar-section-module"][class*="__section"]');
    const titleEntry = pillarSection?.querySelector('[class*="stack-entry-module"][class*="__wrap"]');
    const titleInner = titleEntry?.querySelector('[class*="stack-entry-module"][class*="__inner"]');
    result.pillarTitleDelay = titleInner ? getComputedStyle(titleInner).animationDelay : null;
    result.pillarTitleStackI = titleEntry ? titleEntry.style.getPropertyValue("--stack-i") : null;
    result.pillarTitleStackDelay = titleEntry ? titleEntry.style.getPropertyValue("--stack-delay-ms") : null;

    // Pillar cards (motion.button) — read inline transition's delay isn't easy;
    // instead verify they render and the row contains 3 of them.
    const cards = pillarSection?.querySelectorAll('[data-pillar-id]');
    result.pillarCardCount = cards?.length ?? 0;

    // Proof section StackEntry
    const proofSection = document.querySelector('[class*="proof-section-module"][class*="__outer"]');
    const proofWrap = proofSection?.parentElement;
    result.proofStackDelay = proofWrap?.style.getPropertyValue("--stack-delay-ms") ?? null;

    // No more breathing keyframe rule should be in the stylesheet for proof
    // (Detect by checking computed animation on a `.card` after settle isn't
    // possible without scrolling; instead, look for the keyframe in the
    // active stylesheets text.)
    const sheetTexts = Array.from(document.styleSheets).flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText);
      } catch { return []; }
    });
    const hasBreathe = sheetTexts.some((t) => t.includes("@keyframes breathe"));
    const hasHeartbeat = sheetTexts.some((t) => t.includes("@keyframes heartbeat"));
    result.breathingKeyframeStillPresent = hasBreathe;
    result.heartbeatKeyframeStillPresent = hasHeartbeat;
    return result;
  });
  await page.screenshot({ path: join(OUT, "tech-top.png"), fullPage: false });

  // ── Devices — sequence + tabs gap ─────────────────────────────────────────
  await page.goto(`${BASE}/devices`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT, "devices-top.png"), fullPage: false });

  results.devices = await page.evaluate(() => {
    const strip = document.querySelector('[class*="applications-strip"][class*="__strip"]');
    const items = strip?.querySelectorAll('[class*="stack-entry-module"][class*="__wrap"]');
    const itemDelays = items
      ? Array.from(items).map((el) => el.style.getPropertyValue("--stack-delay-ms"))
      : null;
    // Tabs entry — find by walking after the strip
    const tabsRoot = document.querySelector('[class*="devices-tabs-module"]')
      ?? document.querySelector('[role="tablist"]')?.closest('div');
    const tabsWrap = tabsRoot?.closest('[class*="stack-entry-module"][class*="__wrap"]');
    const tabsDelay = tabsWrap?.style.getPropertyValue("--stack-delay-ms") ?? null;
    const iconStaggerVar = getComputedStyle(document.body).getPropertyValue("--devices-icon-stagger-ms").trim();
    return { iconCount: items?.length ?? 0, itemDelays, tabsDelay, iconStaggerVar };
  });

  // ── Contact — bg visible + two panels ─────────────────────────────────────
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "contact-top.png"), fullPage: false });

  results.contact = await page.evaluate(() => {
    const bg = document.querySelector('[class*="contact-hero"][class*="__bg"]:not([class*="bgWash"])');
    const panels = document.querySelectorAll('[class*="contact-hero"][class*="__panel"]:not([class*="panelWrap"]):not([class*="newsletterPanel"])');
    // Capture both reach-out and newsletter panels distinctly:
    const reachOut = document.querySelector('[class*="contact-hero"][class*="__panel"]:not([class*="newsletterPanel"]):not([class*="panelWrap"])');
    const newsletter = document.querySelector('[class*="contact-hero"][class*="__newsletterPanel"]');
    const bgCs = bg ? getComputedStyle(bg) : null;
    return {
      bgImageProp: bgCs?.backgroundImage ?? null,
      bgBlendMode: bgCs?.backgroundBlendMode ?? null,
      hasReachOutPanel: !!reachOut,
      hasNewsletterPanel: !!newsletter,
      panelCount: panels.length + (newsletter ? 1 : 0),
      reachOutHasForm: !!reachOut?.querySelector("form"),
      newsletterHasForm: !!newsletter?.querySelector("form"),
    };
  });

  await browser.close();
  console.log("=== RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
  console.log("\n=== ERRORS ===");
  console.log(errors.length === 0 ? "(none)" : errors.join("\n"));
  console.log(`\nScreenshots → ${OUT}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });

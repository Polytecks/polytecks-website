/**
 * Phase 19 verification:
 *   1. Tweak panel scrollable (max-height + overflow-y on .body)
 *   2. Cambridge: scale × crop drives element box; mask CSS unchanged;
 *      sliders adjust the actual rendered size
 *   3. Proof: lock fires earlier (~0.88), section collapses, scroll
 *      correction keeps the panel in viewport
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-phase19";
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

  // ── 1. Tweaks panel scroll ────────────────────────────────────────────────
  await page.goto(`${BASE}/technology?tweaks=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  // Click Page Fx tab to load all the Cambridge sliders
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const fx = buttons.find((b) => b.textContent?.trim().toLowerCase().includes("fx"));
    fx?.click();
  });
  await page.waitForTimeout(200);

  results.tweakPanel = await page.evaluate(() => {
    const panel = document.querySelector('[class*="tweak-panel"][class*="__panel"]');
    const body = document.querySelector('[class*="tweak-panel"][class*="__body"]');
    if (!panel || !body) return { error: "no panel/body" };
    const panelCs = getComputedStyle(panel);
    const bodyCs = getComputedStyle(body);
    return {
      panelMaxHeight: panelCs.maxHeight,
      panelDisplay: panelCs.display,
      panelOverflow: panelCs.overflow,
      bodyOverflowY: bodyCs.overflowY,
      bodyScrollHeight: body.scrollHeight,
      bodyClientHeight: body.clientHeight,
      bodyOverflows: body.scrollHeight > body.clientHeight,
    };
  });
  await page.screenshot({ path: join(OUT, "tweaks-fx.png"), fullPage: false });

  // ── 2. Cambridge: scale + crop sliders affect element box ─────────────────
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);

  // Default state
  results.cambridge_default = await page.evaluate(() => {
    const img = document.querySelector('[class*="cambridge-section"][class*="__media"] img');
    if (!img) return { error: "no img" };
    const cs = getComputedStyle(img);
    const rect = img.getBoundingClientRect();
    const body = getComputedStyle(document.body);
    return {
      width: rect.width,
      height: rect.height,
      objectFit: cs.objectFit,
      objectPosition: cs.objectPosition,
      cssScale: body.getPropertyValue("--tw-cb-scale").trim(),
      cssCropBottom: body.getPropertyValue("--tw-cb-crop-bottom").trim(),
      cssCropSides: body.getPropertyValue("--tw-cb-crop-sides").trim(),
      maskImage: cs.maskImage.startsWith("linear-gradient"),
      maskComposite: cs.maskComposite,
    };
  });

  // Drive sliders programmatically and verify the box changes.
  // Set scale=1.3, cropBottom=0.3, cropSides=0.2
  await page.evaluate(() => {
    const body = document.body;
    body.style.setProperty("--tw-cb-scale", "1.3");
    body.style.setProperty("--tw-cb-crop-bottom", "0.3");
    body.style.setProperty("--tw-cb-crop-sides", "0.2");
  });
  await page.waitForTimeout(300);
  results.cambridge_modified = await page.evaluate(() => {
    const img = document.querySelector('[class*="cambridge-section"][class*="__media"] img');
    if (!img) return { error: "no img" };
    const rect = img.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  // Expected: width = 1100 × 1.3 × (1 − 0.2) = 1144 px
  // Expected: height = 1100 × 0.5625 × 1.3 × (1 − 0.3) ≈ 563 px
  results.cambridge_expectedW = 1100 * 1.3 * 0.8;
  results.cambridge_expectedH = 1100 * 0.5625 * 1.3 * 0.7;

  // Reset and screenshot
  await page.evaluate(() => {
    const body = document.body;
    body.style.removeProperty("--tw-cb-scale");
    body.style.removeProperty("--tw-cb-crop-bottom");
    body.style.removeProperty("--tw-cb-crop-sides");
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, "about-cambridge.png"), fullPage: false });

  // ── 3. Proof — lock-trigger timing + scroll correction ────────────────────
  await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Find proof section's document-Y position
  const proofTop = await page.evaluate(() => {
    const outer = document.querySelector('[class*="proof-section"][class*="__outer"]');
    if (!outer) return -1;
    return window.scrollY + outer.getBoundingClientRect().top;
  });
  // Scroll to ~88% of proof's pinned scroll budget
  // pinScrollMult=3 → outer height 300vh = 2700px at 900vh
  // proof top at proofTop, scrollable range = 200vh = 1800px
  // 88% = 0.88 * 1800 = 1584 px above proofTop
  await page.evaluate((top) => {
    window.scrollTo(0, top + 0.85 * 1800);
  }, proofTop);
  await page.waitForTimeout(500);

  results.proof_at_85 = await page.evaluate(() => {
    const outer = document.querySelector('[class*="proof-section"][class*="__outer"]');
    return {
      dataLocked: outer?.getAttribute("data-locked"),
      heightPx: outer?.getBoundingClientRect().height,
    };
  });

  // Continue scrolling to trigger the lock at ~0.89-0.9
  await page.evaluate((top) => {
    window.scrollTo(0, top + 0.9 * 1800);
  }, proofTop);
  await page.waitForTimeout(500);

  results.proof_after_trigger = await page.evaluate(() => {
    const outer = document.querySelector('[class*="proof-section"][class*="__outer"]');
    if (!outer) return null;
    const rect = outer.getBoundingClientRect();
    return {
      dataLocked: outer.getAttribute("data-locked"),
      heightPx: rect.height,
      // After scroll-correction, the panel should be at viewport top
      sectionTopFromViewport: rect.top,
      panelAtViewportTop: Math.abs(rect.top) < 5,
    };
  });
  await page.screenshot({ path: join(OUT, "proof-after-trigger.png"), fullPage: false });

  await browser.close();
  console.log("=== RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
  console.log("\n=== ERRORS ===");
  console.log(errors.length === 0 ? "(none)" : errors.join("\n"));
  console.log(`\nScreenshots → ${OUT}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });

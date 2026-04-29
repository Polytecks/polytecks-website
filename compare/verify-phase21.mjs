/**
 * Phase 21 verification:
 *   1. Cambridge body text — display font, larger, no weird wrap
 *   2. Cambridge callout — no chrome, smaller, ~2 lines
 *   3. Cambridge bottom crop — viewport-independent (test 3 viewports)
 *   4. Devices spacing knobs wired (3 sliders, CSS vars on body)
 *   5. Devices stack timing — first icon delay shorter than 1500ms,
 *      tabs delay shorter than 2400ms
 *   6. Careers — black-to-white gradient transition between values panel
 *      and open-roles panel
 *   7. Contact — section overflow visible; imageOverlay position:fixed;
 *      ancestor chain has no overflow:hidden; scale slider wired
 *   8. SubpageHeader lede + pillar subtitle render in indigo
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-phase21";
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

  // ── 1+2. Cambridge body text + callout ────────────────────────────────────
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, "about-cambridge-1440.png"), fullPage: false });

  results.cambridge_default = await page.evaluate(() => {
    const body = document.querySelector('[class*="cambridge-section"][class*="__bodyText"]');
    const callout = document.querySelector('[class*="cambridge-section"][class*="__calloutText"]');
    const bodyCs = body ? getComputedStyle(body) : null;
    const calloutCs = callout ? getComputedStyle(callout) : null;
    return {
      bodyTextFamily: bodyCs?.fontFamily,
      bodyTextFontSize: bodyCs?.fontSize,
      bodyTextMaxWidth: bodyCs?.maxWidth,
      calloutFontSize: calloutCs?.fontSize,
      calloutMaxWidth: calloutCs?.maxWidth,
      calloutBg: calloutCs?.backgroundColor,
    };
  });

  // ── 3. Cambridge bottom crop — viewport-independent ───────────────────────
  // Crank scale=1 and crop_bottom=0.3, then measure rendered height at
  // three different viewport widths. Should be IDENTICAL since the height
  // calc is fixed-px (619 × scale × (1-crop_bottom) = 619 × 0.7 = 433.3).
  const VPS = [
    { width: 1920, height: 900 },
    { width: 1280, height: 900 },
    { width:  800, height: 900 },
  ];
  results.bottomCropAtViewports = [];
  for (const vp of VPS) {
    await page.setViewportSize(vp);
    await page.evaluate(() => {
      document.body.style.setProperty("--tw-cb-scale", "1");
      document.body.style.setProperty("--tw-cb-crop-bottom", "0.3");
      document.body.style.setProperty("--tw-cb-crop-sides", "0");
    });
    await page.waitForTimeout(200);
    const measured = await page.evaluate(() => {
      const img = document.querySelector('[class*="cambridge-section"][class*="__media"] img');
      if (!img) return null;
      const rect = img.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    results.bottomCropAtViewports.push({ viewport: vp, ...measured });
  }
  // Reset
  await page.evaluate(() => {
    document.body.style.removeProperty("--tw-cb-scale");
    document.body.style.removeProperty("--tw-cb-crop-bottom");
    document.body.style.removeProperty("--tw-cb-crop-sides");
  });
  await page.setViewportSize({ width: 1440, height: 900 });

  // Pass condition: heights identical across all 3 viewports.
  const heights = results.bottomCropAtViewports.map((m) => m?.height);
  results.bottomCropViewportInvariant = heights.every((h) => h === heights[0]);

  // ── 4. Devices spacing CSS vars set on body ───────────────────────────────
  await page.goto(`${BASE}/devices`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  results.devicesSpacing = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const strip = document.querySelector('[class*="applications-strip"][class*="__strip"]');
    const stripCs = strip ? getComputedStyle(strip) : null;
    return {
      cssVarHeader: body.getPropertyValue("--sp-devices-header-to-strip").trim(),
      cssVarBelow: body.getPropertyValue("--sp-devices-strip-gap-below").trim(),
      cssVarRowGap: body.getPropertyValue("--sp-devices-icon-row-gap").trim(),
      stripMargin: stripCs?.margin,
    };
  });

  // ── 5. Devices stack timing ───────────────────────────────────────────────
  results.devicesTiming = await page.evaluate(() => {
    const items = document.querySelectorAll('[class*="applications-strip"][class*="__strip"] [class*="stack-entry-module"][class*="__wrap"]');
    const itemDelays = Array.from(items).map((el) => el.style.getPropertyValue("--stack-delay-ms"));
    const tabsRoot = document.querySelector('[class*="devices-tabs-module"]');
    const tabsWrap = tabsRoot?.closest('[class*="stack-entry-module"][class*="__wrap"]');
    return {
      firstIconDelay: itemDelays[0],
      lastIconDelay: itemDelays[itemDelays.length - 1],
      tabsDelay: tabsWrap?.style.getPropertyValue("--stack-delay-ms") ?? null,
    };
  });

  // ── 6. Careers gradient transition ────────────────────────────────────────
  await page.goto(`${BASE}/careers`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  results.careersGradient = await page.evaluate(() => {
    const valuesSection = document.querySelector('[class*="values-section"][class*="__section"]');
    if (!valuesSection) return { error: "no values section" };
    const after = window.getComputedStyle(valuesSection, "::after");
    return {
      hasAfter: !!after,
      afterContent: after.content,
      afterPosition: after.position,
      afterBackground: after.background.slice(0, 200),
      afterHeight: after.height,
    };
  });
  // Scroll to the boundary
  await page.evaluate(() => {
    const sec = document.querySelector('[class*="values-section"][class*="__section"]');
    if (sec) {
      const rect = sec.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + rect.bottom - window.innerHeight + 100);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, "careers-transition.png"), fullPage: false });

  // ── 7. Contact — free-floating image ──────────────────────────────────────
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "contact.png"), fullPage: false });

  results.contact = await page.evaluate(() => {
    const section = document.querySelector('[class*="contact-hero"][class*="__section"]');
    const overlay = document.querySelector('[class*="contact-hero"][class*="__imageOverlay"]');
    const featureImg = document.querySelector('[class*="contact-hero"][class*="__featureImage"]');
    const sectionCs = section ? getComputedStyle(section) : null;
    const overlayCs = overlay ? getComputedStyle(overlay) : null;
    const imgCs = featureImg ? getComputedStyle(featureImg) : null;
    // Walk ancestors of the image looking for overflow:hidden
    const ancestorOverflows = [];
    let walker = featureImg;
    while (walker && walker.tagName.toLowerCase() !== "html") {
      const cs = getComputedStyle(walker);
      const overflow = cs.overflow;
      const ox = cs.overflowX;
      if (overflow === "hidden" || ox === "hidden" || overflow === "clip" || ox === "clip") {
        ancestorOverflows.push({
          tag: walker.tagName,
          cls: walker.className?.toString().slice(0, 80),
          overflow,
          overflowX: ox,
        });
      }
      walker = walker.parentElement;
    }
    const bodyCs = getComputedStyle(document.body);
    return {
      sectionOverflow: sectionCs?.overflow,
      overlayPosition: overlayCs?.position,
      overlayTop: overlayCs?.top,
      overlayRight: overlayCs?.right,
      overlayWidth: overlayCs?.width,
      overlayHeight: overlayCs?.height,
      overlayMaskImage: (overlayCs?.maskImage ?? overlayCs?.webkitMaskImage)?.slice(0, 80),
      featureImgPosition: imgCs?.position,
      featureImgTransform: imgCs?.transform,
      featureImgWidth: featureImg?.getBoundingClientRect().width,
      featureImgHeight: featureImg?.getBoundingClientRect().height,
      ancestorOverflows,
      bodyOverflowX: bodyCs.overflowX,
      cssVars: {
        scale: bodyCs.getPropertyValue("--tw-contact-img-scale").trim(),
        offsetX: bodyCs.getPropertyValue("--tw-contact-img-offset-x").trim(),
        spotX: bodyCs.getPropertyValue("--tw-contact-spot-x").trim(),
        spotY: bodyCs.getPropertyValue("--tw-contact-spot-y").trim(),
        size: bodyCs.getPropertyValue("--tw-contact-spot-size").trim(),
      },
    };
  });

  // Drive scale = 2 and offset = 30%, observe image growth and translation
  await page.evaluate(() => {
    document.body.style.setProperty("--tw-contact-img-scale", "2");
    document.body.style.setProperty("--tw-contact-img-offset-x", "30%");
  });
  await page.waitForTimeout(300);
  results.contactScaledShifted = await page.evaluate(() => {
    const img = document.querySelector('[class*="contact-hero"][class*="__featureImage"]');
    if (!img) return null;
    return {
      width: img.getBoundingClientRect().width,
      transform: getComputedStyle(img).transform,
    };
  });
  await page.evaluate(() => {
    document.body.style.removeProperty("--tw-contact-img-scale");
    document.body.style.removeProperty("--tw-contact-img-offset-x");
  });

  // ── 8. Indigo subheadings ─────────────────────────────────────────────────
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  results.subheadings_about = await page.evaluate(() => {
    const lede = document.querySelector('[class*="subpage-module"][class*="__lede"]');
    return { color: lede ? getComputedStyle(lede).color : null };
  });
  await page.goto(`${BASE}/devices`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  results.subheadings_devices = await page.evaluate(() => {
    const lede = document.querySelector('[class*="subpage-module"][class*="__lede"]');
    return { color: lede ? getComputedStyle(lede).color : null };
  });
  await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  results.subheadings_tech = await page.evaluate(() => {
    const lede = document.querySelector('[class*="subpage-module"][class*="__lede"]');
    const subtitle = document.querySelector('[class*="pillar-module"][class*="__subtitle"]');
    return {
      ledeColor: lede ? getComputedStyle(lede).color : null,
      pillarSubtitleColor: subtitle ? getComputedStyle(subtitle).color : null,
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

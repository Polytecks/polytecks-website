/**
 * Phase 20 verification:
 *   - Cambridge body text now in normal flow (not absolute overlay)
 *   - ECG callout has no panel chrome (no bg, border, padding)
 *   - Callout sliders are vw/vh based with wider ranges; font scales w/ image
 *   - Proof card 1 has <br> in its label
 *   - Contact: solid black bg, 2-col grid, image fills right column,
 *     no sticky/transforms-on-scroll, single radial spotlight
 *   - Contact: title "Contact us." and newsletter title "Stay close to Mosaic." share class
 *   - Below 900px: image col display:none
 *   - Four contact sliders present (offset, spot X, spot Y, spot size)
 *   - Cambridge sliders: callout top (vh) + callout left (vw) only
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-phase20";
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

  // ── About / Cambridge ─────────────────────────────────────────────────────
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, "about-cambridge.png"), fullPage: false });

  results.cambridge = await page.evaluate(() => {
    const bodyText = document.querySelector('[class*="cambridge-section"][class*="__bodyText"]');
    const callout = document.querySelector('[class*="cambridge-section"][class*="__calloutText"]');
    const oldBadge = document.querySelector('[class*="cambridge-section"][class*="__calloutBadge"]');
    const oldOverlay = document.querySelector('[class*="cambridge-section"][class*="__imageOverlayText"]');
    const bodyTextCs = bodyText ? getComputedStyle(bodyText) : null;
    const calloutCs = callout ? getComputedStyle(callout) : null;
    return {
      hasBodyText: !!bodyText,
      bodyTextPosition: bodyTextCs?.position ?? null,
      bodyTextColor: bodyTextCs?.color ?? null,
      bodyTextFontSize: bodyTextCs?.fontSize ?? null,
      hasCalloutText: !!callout,
      calloutPosition: calloutCs?.position ?? null,
      calloutBg: calloutCs?.backgroundColor ?? null,
      calloutBorder: calloutCs?.borderTopWidth ?? null,
      calloutPadding: calloutCs?.padding ?? null,
      calloutFontSize: calloutCs?.fontSize ?? null,
      calloutText: callout?.textContent?.slice(0, 40) ?? null,
      hasOldBadge: !!oldBadge,
      hasOldOverlay: !!oldOverlay,
      cssVarTopVh: getComputedStyle(document.body).getPropertyValue("--tw-cb-callout-top").trim(),
      cssVarLeftVw: getComputedStyle(document.body).getPropertyValue("--tw-cb-callout-left").trim(),
    };
  });

  // ── Tech / proof line break ───────────────────────────────────────────────
  await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  results.proofBreak = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="proof-section"][class*="__cardLabel"]');
    const card1 = Array.from(cards).find((el) => el.textContent?.includes("Skin preparation"));
    const html = card1?.innerHTML ?? null;
    return {
      cardCount: cards.length,
      card1Html: html,
      hasBr: html?.includes("<br") ?? false,
    };
  });

  // ── Contact ───────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "contact-desktop.png"), fullPage: false });

  results.contact = await page.evaluate(() => {
    const section = document.querySelector('[class*="contact-hero"][class*="__section"]');
    const grid = document.querySelector('[class*="contact-hero"][class*="__grid"]');
    const imageCol = document.querySelector('[class*="contact-hero"][class*="__imageCol"]');
    const featureImg = document.querySelector('[class*="contact-hero"][class*="__featureImage"]');
    const titles = Array.from(document.querySelectorAll('[class*="contact-hero"][class*="__title"]'));
    const titleClasses = titles.map((el) => el.className);
    const titleSizes = titles.map((el) => ({ tag: el.tagName, text: el.textContent?.trim().slice(0, 40), fs: getComputedStyle(el).fontSize, fw: getComputedStyle(el).fontWeight, ff: getComputedStyle(el).fontFamily }));
    const sectionCs = section ? getComputedStyle(section) : null;
    const imageColCs = imageCol ? getComputedStyle(imageCol) : null;
    const imgCs = featureImg ? getComputedStyle(featureImg) : null;
    return {
      sectionBgImage: sectionCs?.backgroundImage,
      sectionBgColor: sectionCs?.backgroundColor,
      gridCols: grid ? getComputedStyle(grid).gridTemplateColumns : null,
      imageColPosition: imageColCs?.position ?? null,
      imageColTop: imageColCs?.top ?? null,
      imageColDisplay: imageColCs?.display ?? null,
      featureImgTransform: imgCs?.transform ?? null,
      featureImgWidth: featureImg?.getBoundingClientRect().width ?? null,
      featureImgHeight: featureImg?.getBoundingClientRect().height ?? null,
      featureImgMask: imgCs?.maskImage ?? null,
      titleCount: titles.length,
      titleClasses,
      titleSizes,
      cssVars: {
        offsetX: getComputedStyle(document.body).getPropertyValue("--tw-contact-img-offset-x").trim(),
        spotX: getComputedStyle(document.body).getPropertyValue("--tw-contact-spot-x").trim(),
        spotY: getComputedStyle(document.body).getPropertyValue("--tw-contact-spot-y").trim(),
        size: getComputedStyle(document.body).getPropertyValue("--tw-contact-spot-size").trim(),
      },
    };
  });

  // Mobile viewport — image should be display:none
  await page.setViewportSize({ width: 414, height: 900 });
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  results.contactMobile = await page.evaluate(() => {
    const imageCol = document.querySelector('[class*="contact-hero"][class*="__imageCol"]');
    const cs = imageCol ? getComputedStyle(imageCol) : null;
    return { imageColDisplay: cs?.display ?? null };
  });
  await page.screenshot({ path: join(OUT, "contact-mobile.png"), fullPage: false });

  await page.setViewportSize({ width: 1440, height: 900 });

  // ── Tweak panel — confirm new sliders ─────────────────────────────────────
  await page.goto(`${BASE}/technology?tweaks=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const fx = buttons.find((b) => b.textContent?.trim().toLowerCase().includes("fx"));
    fx?.click();
  });
  await page.waitForTimeout(300);

  results.sliders = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll("span")).map((el) => el.textContent?.trim() ?? "");
    const has = (s) => labels.some((l) => l === s);
    return {
      // Cambridge: only callout top + left, no overlay sliders
      cambridgeCalloutTop: has("Cambridge callout top"),
      cambridgeCalloutLeft: has("Cambridge callout left"),
      cambridgeOldCpTop: has("Cambridge cp top"),         // should be false
      cambridgeOldCpLeft: has("Cambridge cp left"),       // should be false
      cambridgeOldCbTop: has("Cambridge cb top"),         // should be false
      cambridgeOldCbRight: has("Cambridge cb right"),     // should be false
      // Cambridge image controls (kept)
      cambridgeScale: has("Cambridge scale"),
      cambridgeCropBottom: has("Cambridge crop bottom"),
      cambridgeCropSides: has("Cambridge crop sides"),
      // Contact image controls
      contactImgOffsetX: has("Contact image offset X"),
      contactSpotX: has("Contact spot X"),
      contactSpotY: has("Contact spot Y"),
      contactSpotSize: has("Contact spot size"),
      // Old sliders gone
      contactOldEllipseX: has("Contact ellipse X"),       // false
      contactOldEllipseY: has("Contact ellipse Y"),       // false
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

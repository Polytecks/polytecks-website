/**
 * Phase 18 verification:
 *   1. Cambridge image: linear-gradient mask + composite intersect, hard top
 *      edge, soft L/R/bottom fades, CSS vars wired
 *   2. Three Cambridge sliders present (img width, side fade, bottom fade)
 *   3. Contact: solid black bg, two-column grid, mosaicvertical.png as <img>
 *      (not bg-image), spotlight radial mask on the img element
 *   4. Four contact spotlight sliders present
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-phase18";
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

  // ── About — Cambridge image ──────────────────────────────────────────────
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, "about-cambridge.png"), fullPage: false });

  results.cambridge = await page.evaluate(() => {
    const media = document.querySelector('[class*="cambridge-section"][class*="__media"]');
    const img = media?.querySelector("img");
    if (!img || !media) return { error: "no img" };
    const cs = getComputedStyle(img);
    const mediaCs = getComputedStyle(media);
    return {
      mediaWidth: mediaCs.width,
      mediaCssWidth: media.style.width || "(from class)",
      cssVarWidth: getComputedStyle(document.body).getPropertyValue("--tw-cb-img-width").trim(),
      cssVarSide: getComputedStyle(document.body).getPropertyValue("--tw-cb-side-fade").trim(),
      cssVarBottom: getComputedStyle(document.body).getPropertyValue("--tw-cb-bottom-fade").trim(),
      maskImage: cs.maskImage,
      webkitMaskImage: cs.webkitMaskImage,
      maskComposite: cs.maskComposite,
      webkitMaskComposite: cs.webkitMaskComposite,
    };
  });

  // ── Contact ──────────────────────────────────────────────────────────────
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, "contact.png"), fullPage: false });

  results.contact = await page.evaluate(() => {
    const section = document.querySelector('[class*="contact-hero"][class*="__section"]');
    const grid = document.querySelector('[class*="contact-hero"][class*="__grid"]');
    const featureImg = document.querySelector('[class*="contact-hero"][class*="__featureImage"]');
    const sectionCs = section ? getComputedStyle(section) : null;
    const gridCs = grid ? getComputedStyle(grid) : null;
    const imgCs = featureImg ? getComputedStyle(featureImg) : null;
    const allBgs = [];
    let walker = section;
    while (walker && walker !== document.body) {
      const cs = getComputedStyle(walker);
      if (cs.backgroundImage && cs.backgroundImage !== "none") {
        allBgs.push({ tag: walker.tagName.toLowerCase(), cls: walker.className.toString().slice(0, 80), bg: cs.backgroundImage });
      }
      walker = walker.parentElement;
    }
    const bodyBg = getComputedStyle(document.body).backgroundImage;
    const mainBg = document.querySelector("main") ? getComputedStyle(document.querySelector("main")).backgroundImage : null;
    return {
      sectionBg: sectionCs?.background ?? null,
      sectionBgImage: sectionCs?.backgroundImage ?? null,
      sectionBgColor: sectionCs?.backgroundColor ?? null,
      gridDisplay: gridCs?.display ?? null,
      gridTemplateCols: gridCs?.gridTemplateColumns ?? null,
      featureImgTag: featureImg?.tagName ?? null,
      featureImgSrc: featureImg?.getAttribute("src") ?? null,
      featureImgMask: imgCs?.maskImage ?? null,
      featureImgWebkitMask: imgCs?.webkitMaskImage ?? null,
      ancestorBgs: allBgs,
      bodyBg,
      mainBg,
      // Confirm the CSS vars are set
      cssVarSpotX: getComputedStyle(document.body).getPropertyValue("--tw-contact-spot-x").trim(),
      cssVarSpotY: getComputedStyle(document.body).getPropertyValue("--tw-contact-spot-y").trim(),
      cssVarEllipseX: getComputedStyle(document.body).getPropertyValue("--tw-contact-ellipse-x").trim(),
      cssVarEllipseY: getComputedStyle(document.body).getPropertyValue("--tw-contact-ellipse-y").trim(),
    };
  });

  // ── Tweak panel: confirm the new sliders exist ────────────────────────────
  await page.goto(`${BASE}/technology?tweaks=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  // Click the Page Fx tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const fxBtn = buttons.find((b) => b.textContent?.trim().toLowerCase().includes("page fx"))
      ?? buttons.find((b) => b.textContent?.trim().toLowerCase().startsWith("fx"));
    fxBtn?.click();
  });
  await page.waitForTimeout(300);

  results.sliders = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll("label, span")).map((el) => el.textContent?.trim() ?? "");
    const has = (s) => labels.some((l) => l === s);
    return {
      cambridgeImgWidth: has("Cambridge img width"),
      cambridgeSideFade: has("Cambridge side fade"),
      cambridgeBottomFade: has("Cambridge bottom fade"),
      contactSpotX: has("Contact spot X"),
      contactSpotY: has("Contact spot Y"),
      contactEllipseX: has("Contact ellipse X"),
      contactEllipseY: has("Contact ellipse Y"),
    };
  });
  await page.screenshot({ path: join(OUT, "tweaks-page-fx.png"), fullPage: false });

  await browser.close();
  console.log("=== RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
  console.log("\n=== ERRORS ===");
  console.log(errors.length === 0 ? "(none)" : errors.join("\n"));
  console.log(`\nScreenshots → ${OUT}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });

/**
 * Phase 22 verification:
 *   1. Proof card 1 label starts with lowercase 's'
 *   2. Cambridge bodyText uses font-sans (matches subtitle font)
 *   3. Subpage .lede font-size matches Cambridge bodyText
 *   4. Pillar .subtitle is white (--ink), not indigo
 *   5. Advisor portrait images scale UP (>1) so no blank caps
 *   6. Careers values panel has linear mask fading bottom to transparent;
 *      open-roles section has negative top margin to slide behind
 *   7. Contact image overlay uses position: absolute (not fixed/sticky);
 *      scrolls with the section
 *   8. Tech banner is full-bleed (banner width = viewport width); uses
 *      multi-mask + composite intersect for soft sides + bottom; top stays hard
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "compare/screenshots-phase22";
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

  // ── 1. Proof "skin" lowercase ─────────────────────────────────────────────
  await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  results.proofSkin = await page.evaluate(() => {
    const labels = document.querySelectorAll('[class*="proof-section"][class*="__cardLabel"]');
    const card1 = Array.from(labels).find((el) => el.textContent?.toLowerCase().includes("preparation"));
    return {
      text: card1?.textContent?.slice(0, 30),
      startsLowerS: card1?.textContent?.startsWith("skin") ?? false,
    };
  });
  // Check pillar subtitle color (white now)
  results.pillarSubtitle = await page.evaluate(() => {
    const sub = document.querySelector('[class*="pillar-module"][class*="__subtitle"]');
    return sub ? { color: getComputedStyle(sub).color, fontSize: getComputedStyle(sub).fontSize } : null;
  });
  // Tech banner full-bleed + masks
  results.techBanner = await page.evaluate(() => {
    const banner = document.querySelector('[class*="hero-module"][class*="__banner"]');
    const img = banner?.querySelector("img");
    if (!banner || !img) return { error: "no banner/img" };
    const bannerCs = getComputedStyle(banner);
    const imgCs = getComputedStyle(img);
    return {
      bannerWidth: banner.getBoundingClientRect().width,
      viewportWidth: window.innerWidth,
      bannerMaxWidth: bannerCs.maxWidth,
      bannerPadding: bannerCs.padding,
      imgWidth: img.getBoundingClientRect().width,
      maskImage: imgCs.maskImage.slice(0, 200),
      webkitMaskImage: imgCs.webkitMaskImage.slice(0, 200),
      maskComposite: imgCs.maskComposite,
      webkitMaskComposite: imgCs.webkitMaskComposite,
      hasTwoMasks: (imgCs.maskImage.match(/linear-gradient/g) ?? []).length === 2,
    };
  });
  await page.screenshot({ path: join(OUT, "tech-hero.png"), fullPage: false });

  // ── 2+3. Cambridge bodyText vs subpage lede font + size ───────────────────
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  results.aboutTypography = await page.evaluate(() => {
    const lede = document.querySelector('[class*="subpage-module"][class*="__lede"]');
    const bodyText = document.querySelector('[class*="cambridge-section"][class*="__bodyText"]');
    return {
      ledeColor: lede ? getComputedStyle(lede).color : null,
      ledeFontSize: lede ? getComputedStyle(lede).fontSize : null,
      ledeFontFamily: lede ? getComputedStyle(lede).fontFamily : null,
      bodyTextFontSize: bodyText ? getComputedStyle(bodyText).fontSize : null,
      bodyTextFontFamily: bodyText ? getComputedStyle(bodyText).fontFamily : null,
      sameSize: lede && bodyText
        ? getComputedStyle(lede).fontSize === getComputedStyle(bodyText).fontSize
        : false,
      sameFamily: lede && bodyText
        ? getComputedStyle(lede).fontFamily === getComputedStyle(bodyText).fontFamily
        : false,
    };
  });
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, "about-cambridge.png"), fullPage: false });

  // ── 5. Advisor portraits — scale > 1 (no blank caps) ──────────────────────
  await page.evaluate(() => {
    const team = document.getElementById("team");
    if (team) team.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(600);
  results.advisorScales = await page.evaluate(() => {
    const advisors = document.querySelectorAll('[data-portrait^="advisor-"]');
    return Array.from(advisors).map((card) => {
      const id = card.getAttribute("data-portrait");
      const img = card.querySelector("img");
      const t = img ? getComputedStyle(img).transform : "";
      // matrix(scaleX, ..., ..., scaleY, ..., ...) — first value is scaleX
      const m = t.match(/matrix\(([\d.\-]+),/);
      const scale = m ? parseFloat(m[1]) : null;
      return { id, scale };
    });
  });
  await page.screenshot({ path: join(OUT, "about-team.png"), fullPage: false });

  // ── 6. Careers gradient ───────────────────────────────────────────────────
  await page.goto(`${BASE}/careers`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  results.careers = await page.evaluate(() => {
    const values = document.querySelector('[class*="values-section"][class*="__section"]');
    const open = document.querySelector('[class*="open-roles-section"][class*="__section"]');
    const valuesCs = values ? getComputedStyle(values) : null;
    const openCs = open ? getComputedStyle(open) : null;
    return {
      valuesMaskImage: valuesCs?.maskImage ?? valuesCs?.webkitMaskImage ?? null,
      valuesZIndex: valuesCs?.zIndex,
      openMarginTop: openCs?.marginTop,
      openZIndex: openCs?.zIndex,
    };
  });
  // Scroll to the boundary
  await page.evaluate(() => {
    const sec = document.querySelector('[class*="values-section"][class*="__section"]');
    if (sec) {
      const rect = sec.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + rect.bottom - window.innerHeight + 50);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, "careers-transition.png"), fullPage: false });

  // ── 7. Contact image scrolls with page ────────────────────────────────────
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  results.contactStatic = await page.evaluate(() => {
    const overlay = document.querySelector('[class*="contact-hero"][class*="__imageOverlay"]');
    const cs = overlay ? getComputedStyle(overlay) : null;
    const rectPre = overlay?.getBoundingClientRect();
    return {
      position: cs?.position,
      top: cs?.top,
      right: cs?.right,
      hasFixed: cs?.position === "fixed" || cs?.position === "sticky",
      preTopY: rectPre?.top,
    };
  });
  // Scroll a bit to confirm the overlay moves with content
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(300);
  results.contactScrolled = await page.evaluate(() => {
    const overlay = document.querySelector('[class*="contact-hero"][class*="__imageOverlay"]');
    const rect = overlay?.getBoundingClientRect();
    return { topAfterScroll: rect?.top };
  });
  // If position:fixed, top stays the same (≈ pre). If absolute, top decreases by ~scroll amount.
  results.contactScrollsWithPage = (results.contactStatic.preTopY ?? 0) - (results.contactScrolled.topAfterScroll ?? 0) >= 350;
  await page.screenshot({ path: join(OUT, "contact-scrolled.png"), fullPage: false });

  await browser.close();
  console.log("=== RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
  console.log("\n=== ERRORS ===");
  console.log(errors.length === 0 ? "(none)" : errors.join("\n"));
  console.log(`\nScreenshots → ${OUT}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });

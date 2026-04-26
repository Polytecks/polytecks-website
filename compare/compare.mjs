/**
 * Compare new Next.js home page (http://localhost:3000) vs legacy
 * (http://localhost:4000/index.html) at multiple breakpoints.
 *
 * Outputs:
 *   compare/<bp>-new.png, <bp>-legacy.png   — full-page screenshots
 *   compare/diff.json                       — structured findings
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const NEW = "http://localhost:3000";
const OLD = "http://localhost:4000/index.html";
const OUT = "compare";
mkdirSync(OUT, { recursive: true });

const breakpoints = [
  { name: "desktop", w: 1440, h: 900 },
  { name: "wide",    w: 1920, h: 1080 },
  { name: "mobile",  w: 414,  h: 900 },
];

const findings = {
  pages: { new: NEW, legacy: OLD },
  consoleErrors: { new: [], legacy: [] },
  pageErrors:    { new: [], legacy: [] },
  failedRequests:{ new: [], legacy: [] },
  domSnapshots:  {},      // breakpoint -> { new: {...}, legacy: {...} }
  diffs: [],
};

function recordPage(page, side) {
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") {
      findings.consoleErrors[side].push({ type: m.type(), text: m.text() });
    }
  });
  page.on("pageerror", (e) => {
    findings.pageErrors[side].push(String(e));
  });
  page.on("requestfailed", (req) => {
    findings.failedRequests[side].push({
      url: req.url(),
      method: req.method(),
      failure: req.failure()?.errorText,
    });
  });
}

async function snapshot(page, side) {
  return await page.evaluate(() => {
    const q = (sel) => document.querySelector(sel);
    const all = (sel) => Array.from(document.querySelectorAll(sel));

    function info(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        present: true,
        text: (el.textContent || "").trim().slice(0, 200),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        font: {
          family: cs.fontFamily,
          size: cs.fontSize,
          weight: cs.fontWeight,
          style: cs.fontStyle,
          color: cs.color,
          letterSpacing: cs.letterSpacing,
          lineHeight: cs.lineHeight,
        },
        bg: cs.backgroundColor,
      };
    }

    // Tag-agnostic queries — both legacy and new use semantic structure but classes differ.
    const headline = q("h1");
    const eyebrow  = headline?.previousElementSibling;
    const sub      = headline?.nextElementSibling;
    const ctas     = all('a[href*="/technology"], a[href*="/devices"], a[href$=".html"][href*="science"], a[href$=".html"][href*="device"]');
    const armImg   = all("img").find(i => /arm|polytecks-arm/.test(i.getAttribute("src") || ""));
    const canvas   = q("canvas");
    const missionH = all("h2").find(h => /legible|window|body|mission/i.test(h.textContent || ""));
    const partnersLabel = all("*").find(el => /investors and partners/i.test(el.textContent || "") && el.children.length === 0);

    return {
      title: document.title,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      headline: info(headline),
      eyebrow:  info(eyebrow),
      sub:      info(sub),
      ctaCount: ctas.length,
      ctaSamples: ctas.slice(0, 4).map(info),
      arm: armImg ? info(armImg) : { present: false },
      canvas: canvas ? {
        present: true,
        rect: (() => { const r = canvas.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(),
        position: getComputedStyle(canvas).position,
        zIndex: getComputedStyle(canvas).zIndex,
        pixelW: canvas.width, pixelH: canvas.height,
      } : { present: false },
      missionHeadline: info(missionH),
      partnersLabel: info(partnersLabel),
      docHeight: Math.round(document.documentElement.scrollHeight),
      viewport: { w: window.innerWidth, h: window.innerHeight },
      // Word-stagger headline check — count direct text-bearing spans inside h1
      headlineSpanCount: headline ? all("h1 span").length : 0,
      headlineHasItalicWindow: headline
        ? !!all("h1 *").find(el => /window/i.test(el.textContent || "") && getComputedStyle(el).fontStyle === "italic")
        : false,
      // Mix-blend-mode panel detection — find any element with mix-blend-mode: difference
      mixBlendDifferenceCount: all("*").filter(el => getComputedStyle(el).mixBlendMode === "difference").length,
      // Marquee animation check
      animatedTracks: all("*").filter(el => /slide|marquee|scroll/i.test(getComputedStyle(el).animationName)).length,
    };
  });
}

const browser = await chromium.launch();

for (const bp of breakpoints) {
  console.log(`\n=== ${bp.name} ${bp.w}x${bp.h} ===`);
  findings.domSnapshots[bp.name] = {};
  const ctx = await browser.newContext({ viewport: { width: bp.w, height: bp.h }, deviceScaleFactor: 1 });

  // NEW
  let page = await ctx.newPage();
  recordPage(page, "new");
  await page.goto(NEW, { waitUntil: "networkidle", timeout: 30000 });
  // Wait for canvas to actually paint a frame
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(OUT, `${bp.name}-new.png`), fullPage: true });
  findings.domSnapshots[bp.name].new = await snapshot(page, "new");
  await page.close();

  // LEGACY
  page = await ctx.newPage();
  recordPage(page, "legacy");
  await page.goto(OLD, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(OUT, `${bp.name}-legacy.png`), fullPage: true });
  findings.domSnapshots[bp.name].legacy = await snapshot(page, "legacy");
  await page.close();

  await ctx.close();
}

await browser.close();

// Quick diff pass — flag cross-side differences
function diffField(label, a, b, tol = 0.05) {
  if (a == null || b == null) {
    if (a !== b) findings.diffs.push(`${label}: new=${JSON.stringify(a)}, legacy=${JSON.stringify(b)}`);
    return;
  }
  if (typeof a === "number" && typeof b === "number") {
    const denom = Math.max(Math.abs(a), Math.abs(b), 1);
    if (Math.abs(a - b) / denom > tol) findings.diffs.push(`${label}: new=${a}, legacy=${b}`);
    return;
  }
  if (a !== b) findings.diffs.push(`${label}: new=${JSON.stringify(a)}, legacy=${JSON.stringify(b)}`);
}

for (const bp of breakpoints) {
  const n = findings.domSnapshots[bp.name].new;
  const l = findings.domSnapshots[bp.name].legacy;
  if (!n || !l) continue;
  const tag = `[${bp.name}]`;
  diffField(`${tag} title`, n.title, l.title);
  diffField(`${tag} headline.text`, n.headline?.text, l.headline?.text);
  diffField(`${tag} headline.font.family`, n.headline?.font?.family, l.headline?.font?.family);
  diffField(`${tag} headline.font.weight`, n.headline?.font?.weight, l.headline?.font?.weight);
  diffField(`${tag} headline.font.size`, parseFloat(n.headline?.font?.size), parseFloat(l.headline?.font?.size), 0.08);
  diffField(`${tag} eyebrow.text`, n.eyebrow?.text, l.eyebrow?.text);
  diffField(`${tag} sub.text`, n.sub?.text, l.sub?.text);
  diffField(`${tag} ctaCount`, n.ctaCount, l.ctaCount);
  diffField(`${tag} canvas.present`, n.canvas?.present, l.canvas?.present);
  diffField(`${tag} arm.present`, n.arm?.present, l.arm?.present);
  diffField(`${tag} missionHeadline.text`, n.missionHeadline?.text, l.missionHeadline?.text);
  diffField(`${tag} partnersLabel.text`, n.partnersLabel?.text, l.partnersLabel?.text);
  diffField(`${tag} headlineSpanCount`, n.headlineSpanCount, l.headlineSpanCount, 0.1);
  diffField(`${tag} headlineHasItalicWindow`, n.headlineHasItalicWindow, l.headlineHasItalicWindow);
  diffField(`${tag} mixBlendDifferenceCount`, n.mixBlendDifferenceCount, l.mixBlendDifferenceCount);
  diffField(`${tag} animatedTracks`, n.animatedTracks, l.animatedTracks);
  diffField(`${tag} docHeight`, n.docHeight, l.docHeight, 0.15);
  diffField(`${tag} bodyBg`, n.bodyBg, l.bodyBg);
}

writeFileSync(join(OUT, "diff.json"), JSON.stringify(findings, null, 2));
console.log("\n=== DIFFS ===");
for (const d of findings.diffs) console.log("  -", d);
console.log("\nWrote", join(OUT, "diff.json"));
console.log("Console errors — new:", findings.consoleErrors.new.length, "legacy:", findings.consoleErrors.legacy.length);
console.log("Page errors   — new:", findings.pageErrors.new.length,    "legacy:", findings.pageErrors.legacy.length);
console.log("Failed reqs   — new:", findings.failedRequests.new.length, "legacy:", findings.failedRequests.legacy.length);

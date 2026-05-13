// Investigation script for Task 1 (mission panel centring).
// Sweeps several mobile viewport widths and captures:
//   (a) raw screenshot of the mission panel
//   (b) the same with a coloured outline injected on .inner so the box
//       is visible against the white-feel background
//   (c) computed bounding rects for the panel, .fill overlay, .inner,
//       eyebrow, headline, lede, teamTease, logos
//
// Goal: figure out whether the perceived asymmetry is real layout (box
// not centred) OR an optical artifact of the absolute .fill overlay
// (mix-blend-mode: difference) modulating the moving topo canvas.

import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-mission";
mkdirSync(OUT, { recursive: true });

const VPS = [
  { w: 320, h: 568 }, // iPhone SE
  { w: 360, h: 800 }, // typical Android
  { w: 375, h: 812 }, // iPhone 11/12/13 mini
  { w: 393, h: 852 }, // iPhone 14/15/16
  { w: 414, h: 896 }, // iPhone Plus / Max
];

const PROBE_CSS = `
  /* Inject high-contrast outlines on key containers so we can see exactly
     where each box sits regardless of the topo canvas underneath. */
  section[class*="mission-panel-module"][class*="panel"] > div[class*="fill"] {
    outline: 2px dashed magenta !important;
    outline-offset: -2px !important;
  }
  section[class*="mission-panel-module"][class*="panel"] [class*="inner"] {
    outline: 2px solid #00d cyan !important;
    outline-offset: -1px !important;
    background: rgba(0, 0, 255, 0.12) !important;
  }
  section[class*="mission-panel-module"][class*="panel"] [class*="teamTease"] {
    outline: 2px solid orange !important;
    outline-offset: -1px !important;
    background: rgba(255, 165, 0, 0.10) !important;
  }
  section[class*="mission-panel-module"][class*="panel"] [class*="logos"] {
    outline: 2px solid limegreen !important;
    outline-offset: -1px !important;
  }
  section[class*="mission-panel-module"][class*="panel"] [class*="logos"] > * {
    outline: 1px dashed red !important;
  }
  /* Vertical centre line on the viewport */
  body::after {
    content: "";
    position: fixed;
    inset: 0 50% 0 50%;
    width: 1px;
    background: red;
    z-index: 9999;
    pointer-events: none;
  }
`;

const browser = await chromium.launch();

for (const vp of VPS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  // Wait for hero entry to complete & mission to mount.
  await page.waitForTimeout(800);

  // Find the mission section and scroll it into view.
  const handle = await page.evaluateHandle(() => {
    const all = Array.from(document.querySelectorAll("section"));
    return all.find((s) => /mission-panel-module/.test(s.className)) || null;
  });
  await handle.asElement()?.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // -- Pass 1: clean screenshot of just the mission panel --
  const cleanShot = join(OUT, `${vp.w}-clean.png`);
  await handle.asElement()?.screenshot({ path: cleanShot });

  // -- Pass 2: inject probe outlines + viewport centre line --
  await page.addStyleTag({ content: PROBE_CSS });
  await page.waitForTimeout(200);
  const probeShot = join(OUT, `${vp.w}-probe.png`);
  // Use full-page screenshot here so the red centre line spans the
  // viewport, not just the section.
  await page.screenshot({ path: probeShot, fullPage: false });

  // -- Pass 3: collect bounding rects --
  const data = await page.evaluate(() => {
    const panel = document.querySelector('section[class*="mission-panel-module"][class*="panel"]');
    const fill = panel?.querySelector('[class*="fill"]');
    const inner = panel?.querySelector('[class*="inner"]');
    const teamTease = panel?.querySelector('[class*="teamTease"]');
    const logos = panel?.querySelector('[class*="logos"]');
    const eyebrow = inner?.querySelector('p:first-of-type');
    const headline = inner?.querySelector('h2');
    const lede = inner?.querySelector('p:last-of-type');
    const teamTitle = teamTease?.querySelector('h3');
    const marks = panel ? Array.from(panel.querySelectorAll('[data-name]')) : [];

    const rect = (el) => el ? (() => {
      const r = el.getBoundingClientRect();
      return { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), r: Math.round(r.right) };
    })() : null;

    return {
      vp: window.innerWidth,
      panel: rect(panel),
      fill: rect(fill),
      inner: rect(inner),
      teamTease: rect(teamTease),
      logos: rect(logos),
      eyebrow: rect(eyebrow),
      headline: rect(headline),
      teamTitle: rect(teamTitle),
      lede: rect(lede),
      marks: marks.map((m) => ({ name: m.getAttribute('data-name'), rect: rect(m) })),
    };
  });

  await ctx.close();

  // -- Report --
  console.log(`\n========== Viewport ${vp.w}px ==========`);
  const fmt = (label, r) => {
    if (!r) return console.log(`  ${label.padEnd(14)} (not found)`);
    const symL = r.l;
    const symR = data.vp - r.r;
    const balanced = Math.abs(symL - symR) <= 2 ? "✓" : `✗ Δ${symL - symR}`;
    console.log(`  ${label.padEnd(14)} l=${String(r.l).padStart(3)} r=${String(r.r).padStart(3)} w=${String(r.w).padStart(3)}  L-gut=${String(symL).padStart(3)} R-gut=${String(symR).padStart(3)}  ${balanced}`);
  };
  fmt("panel", data.panel);
  fmt("fill", data.fill);
  fmt("inner", data.inner);
  fmt("eyebrow", data.eyebrow);
  fmt("headline", data.headline);
  fmt("lede", data.lede);
  fmt("teamTease", data.teamTease);
  fmt("teamTitle", data.teamTitle);
  fmt("logos", data.logos);
  for (const m of data.marks) fmt(`  ${m.name}`, m.rect);

  // logos pair symmetry: gap and outer gutters
  if (data.marks.length >= 4) {
    const sorted = [...data.marks].sort((a, b) => a.rect.l - b.rect.l);
    const [a, b, , ] = sorted;
    const leftGutter = a.rect.l;
    const rightGutter = data.vp - sorted[sorted.length - 1].rect.r;
    const innerGap = b.rect.l - a.rect.r;
    console.log(`  logos pair-row: L-gutter=${leftGutter} R-gutter=${rightGutter} innerGap=${innerGap}`);
  }
}

await browser.close();
console.log("\nScreenshots written to", OUT);

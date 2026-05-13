// Test eyebrow fix candidates live in WebKit by injecting CSS overrides.
// We try four candidates in order of invasiveness.

import { webkit } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-mission-webkit";
mkdirSync(OUT, { recursive: true });

const VPS = [{ w: 320, h: 568 }, { w: 375, h: 812 }, { w: 414, h: 896 }];

const CANDIDATES = {
  baseline: ``,
  // Candidate 1 — minimal: white-space: nowrap on the eyebrow itself.
  c1_nowrap: `
    section[class*="mission-panel-module"] p[class*="eyebrow"] {
      white-space: nowrap !important;
    }
  `,
  // Candidate 2 — also ensure the inline-flex preferred size reflects
  // text width: add min-width: max-content so the container can't shrink
  // below its content.
  c2_nowrap_minmax: `
    section[class*="mission-panel-module"] p[class*="eyebrow"] {
      white-space: nowrap !important;
      min-width: max-content !important;
    }
  `,
  // Candidate 3 — restructure to block-level flex so width is deterministic
  // (full inner width) and items are centred via justify-content.
  c3_block_flex: `
    section[class*="mission-panel-module"] p[class*="eyebrow"] {
      display: flex !important;
      width: 100% !important;
      justify-content: center !important;
      align-items: center !important;
      white-space: nowrap !important;
    }
  `,
  // Candidate 4 — kill the pseudo-element flex entirely on mobile and
  // fall back to plain centred text. (Loss of design fidelity but
  // bulletproof.)
  c4_kill_lines: `
    section[class*="mission-panel-module"] p[class*="eyebrow"] {
      display: block !important;
      white-space: nowrap !important;
    }
    section[class*="mission-panel-module"] p[class*="eyebrow"]::before,
    section[class*="mission-panel-module"] p[class*="eyebrow"]::after {
      display: none !important;
    }
  `,
};

const browser = await webkit.launch();

for (const vp of VPS) {
  console.log(`\n========== WebKit @ ${vp.w}px ==========`);
  for (const [name, css] of Object.entries(CANDIDATES)) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3000/?cb=" + Date.now() + "&n=" + name, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    if (css) await page.addStyleTag({ content: css });
    await page.waitForTimeout(400);

    await page.evaluate(() => {
      document.querySelector('section[class*="mission-panel-module"]')?.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(300);

    const data = await page.evaluate(() => {
      const eyebrow = document.querySelector('section[class*="mission-panel-module"] p[class*="eyebrow"]');
      if (!eyebrow) return null;
      const r = eyebrow.getBoundingClientRect();
      const cs = getComputedStyle(eyebrow);
      const lh = parseFloat(cs.lineHeight) || 0;
      return {
        width: Math.round(r.width),
        height: Math.round(r.height),
        left: Math.round(r.left),
        right: Math.round(r.right),
        lines: lh ? Math.round(r.height / lh) : "?",
        whiteSpace: cs.whiteSpace,
        display: cs.display,
      };
    });

    if (name !== "baseline") {
      const handle = await page.evaluateHandle(() => document.querySelector('section[class*="mission-panel-module"]'));
      await handle.asElement()?.screenshot({ path: join(OUT, `${vp.w}-${name}.png`) });
    }
    await ctx.close();

    const vpW = vp.w;
    const symL = data.left, symR = vpW - data.right;
    const sym = Math.abs(symL - symR) <= 2 ? "✓" : `Δ${symL - symR}`;
    console.log(`  ${name.padEnd(20)} w=${data.width} h=${data.height} lines=${data.lines}  L-gut=${symL} R-gut=${symR} ${sym}  (display:${data.display}, ws:${data.whiteSpace})`);
  }
}

await browser.close();
console.log("\nScreenshots →", OUT);

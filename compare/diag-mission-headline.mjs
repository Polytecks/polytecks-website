// Investigate h2 wrap behaviour for "To redefine how we see disease"
// across mobile viewports. Reports: line count, break points, line widths
// (via Range API per-character measurement), computed font-size.
//
// Used to pick between:
//   Fix A — explicit <br> at the "balance" break point
//   Fix B — shrink font so the headline fits one line
//   Fix C — text-wrap: pretty
//
// We're testing Chromium-headless, which is NOT the user's reported real
// phone (iOS Safari) — but if we can see balance picking different breaks
// than the user perceives, that's strong evidence the cause is engine
// differences in text-wrap: balance.

import { chromium } from "playwright";

const VPS = [
  { w: 320, h: 568 },
  { w: 360, h: 800 },
  { w: 375, h: 812 },
  { w: 393, h: 852 },
  { w: 414, h: 896 },
];

const browser = await chromium.launch();

for (const vp of VPS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const data = await page.evaluate(() => {
    const panel = document.querySelector('section[class*="mission-panel-module"][class*="panel"]');
    const h2 = panel?.querySelector('h2');
    if (!h2) return { error: "no headline" };
    h2.scrollIntoView({ block: "center", behavior: "instant" });

    const cs = getComputedStyle(h2);
    const innerEl = panel.querySelector('[class*="inner"]');
    const innerWidth = innerEl ? innerEl.getBoundingClientRect().width : null;

    // Walk through text content and detect Y-position changes via Range.
    // This gives us the actual visual line break points the engine chose.
    const text = h2.textContent || "";
    const node = h2.firstChild;
    const range = document.createRange();
    const lines = [];
    let currentLine = { text: "", startCh: 0, endCh: 0, top: null, l: null, r: null };

    for (let i = 0; i < text.length; i++) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      const top = Math.round(r.top);
      if (currentLine.top === null) {
        currentLine.top = top;
        currentLine.l = r.left;
        currentLine.r = r.right;
      }
      if (top !== currentLine.top) {
        // line break: commit current, start new
        lines.push({
          text: currentLine.text,
          width: Math.round(currentLine.r - currentLine.l),
          left: Math.round(currentLine.l),
          right: Math.round(currentLine.r),
        });
        currentLine = { text: text[i], startCh: i, endCh: i, top, l: r.left, r: r.right };
      } else {
        currentLine.text += text[i];
        currentLine.r = r.right;
      }
    }
    lines.push({
      text: currentLine.text,
      width: Math.round(currentLine.r - currentLine.l),
      left: Math.round(currentLine.l),
      right: Math.round(currentLine.r),
    });

    return {
      vp: window.innerWidth,
      h2Text: text,
      h2BoxWidth: Math.round(h2.getBoundingClientRect().width),
      innerWidth: innerWidth ? Math.round(innerWidth) : null,
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      whiteSpace: cs.whiteSpace,
      textWrap: cs.textWrap || cs.getPropertyValue("text-wrap"),
      letterSpacing: cs.letterSpacing,
      lines,
    };
  });

  await ctx.close();

  console.log(`\n========== Viewport ${vp.w}px ==========`);
  if (data.error) {
    console.log("  ERROR:", data.error);
    continue;
  }
  console.log(`  text:           "${data.h2Text}"`);
  console.log(`  font-size:      ${data.fontSize}    line-height: ${data.lineHeight}`);
  console.log(`  letter-spacing: ${data.letterSpacing}`);
  console.log(`  white-space:    ${data.whiteSpace}    text-wrap: ${data.textWrap}`);
  console.log(`  inner width:    ${data.innerWidth}px`);
  console.log(`  h2 box width:   ${data.h2BoxWidth}px`);
  console.log(`  --> ${data.lines.length} line(s):`);
  for (const [i, l] of data.lines.entries()) {
    const symL = l.left;
    const symR = data.vp - l.right;
    const balance = Math.abs(symL - symR) <= 2 ? "✓" : `Δ${symL - symR}`;
    console.log(`     line ${i + 1} [w=${String(l.width).padStart(3)}px]  "${l.text.trim()}"   L-gut=${symL} R-gut=${symR} ${balance}`);
  }
}

await browser.close();

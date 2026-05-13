// Reproduce iOS Safari rendering of the mission panel using Playwright
// WebKit. Captures DOM + per-line wrap info + screenshot for the eyebrow,
// headline, and team-title — so we can see which element is actually
// breaking weirdly on Safari that the user is reporting as "split across
// two lines and right-aligned."

import { webkit } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-mission-webkit";
mkdirSync(OUT, { recursive: true });

const VPS = [
  { w: 320, h: 568 },
  { w: 360, h: 800 },
  { w: 375, h: 812 },
  { w: 414, h: 896 },
];

function lineWalk(el) {
  // Walk text nodes; for each character, getBoundingClientRect via Range
  // and detect Y-position change. Returns lines[].
  const out = [];
  const node = el.firstChild;
  if (!node || node.nodeType !== 3) {
    return [{ note: "non-text first child", html: el.innerHTML }];
  }
  const text = node.nodeValue || "";
  const range = document.createRange();
  let cur = { text: "", top: null, l: null, r: null };
  for (let i = 0; i < text.length; i++) {
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    const r = range.getBoundingClientRect();
    const top = Math.round(r.top);
    if (cur.top === null) {
      cur.top = top; cur.l = r.left; cur.r = r.right;
    }
    if (top !== cur.top) {
      out.push({ text: cur.text, w: Math.round(cur.r - cur.l), l: Math.round(cur.l), r: Math.round(cur.r) });
      cur = { text: text[i], top, l: r.left, r: r.right };
    } else {
      cur.text += text[i];
      cur.r = r.right;
    }
  }
  out.push({ text: cur.text, w: Math.round(cur.r - cur.l), l: Math.round(cur.l), r: Math.round(cur.r) });
  return out;
}

const browser = await webkit.launch();

for (const vp of VPS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/?cb=" + Date.now(), { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    const panel = document.querySelector('section[class*="mission-panel-module"]');
    panel?.scrollIntoView({ block: "center", behavior: "instant" });
  });
  await page.waitForTimeout(400);

  const data = await page.evaluate(({ lineWalkSrc }) => {
    // eslint-disable-next-line no-new-func
    const lineWalk = new Function("el", `${lineWalkSrc}; return lineWalk(el);`);
    const panel = document.querySelector('section[class*="mission-panel-module"]');
    const eyebrow = panel?.querySelector('p:first-of-type');
    const h2 = panel?.querySelector('h2');
    const teamTitle = panel?.querySelector('h3');

    const rect = (el) => el ? (() => { const r = el.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height), t: Math.round(r.top) }; })() : null;
    const cs = (el, props) => el ? Object.fromEntries(props.map(p => [p, getComputedStyle(el)[p] || getComputedStyle(el).getPropertyValue(p)])) : null;

    const eyebrowRect = rect(eyebrow);

    return {
      vp: window.innerWidth,
      eyebrow: {
        text: eyebrow?.textContent,
        rect: eyebrowRect,
        css: cs(eyebrow, ["display", "textAlign", "whiteSpace", "fontSize", "letterSpacing", "flexWrap", "width", "maxWidth"]),
        // Number of visual lines: divide bbox height by line-height
        lineHeight: eyebrow ? getComputedStyle(eyebrow).lineHeight : null,
      },
      h2: {
        html: h2?.innerHTML,
        text: h2?.textContent,
        rect: rect(h2),
        css: cs(h2, ["textAlign", "whiteSpace", "textWrap", "fontSize", "lineHeight"]),
        lines: h2 && h2.firstChild?.nodeType === 3 ? lineWalk(h2) : "(spans, not raw text)",
      },
      teamTitle: {
        text: teamTitle?.textContent,
        rect: rect(teamTitle),
        css: cs(teamTitle, ["textAlign", "whiteSpace", "textWrap", "fontSize", "lineHeight"]),
        // teamTitle has both raw text and an <em> child — manual handling below
      },
    };
  }, { lineWalkSrc: lineWalk.toString() });

  // For team title with mixed nodes, capture per-line via a different walk
  // that traverses ALL descendant text nodes
  const teamLines = await page.evaluate(() => {
    const teamTitle = document.querySelector('section[class*="mission-panel-module"] h3');
    if (!teamTitle) return [];
    const walker = document.createTreeWalker(teamTitle, NodeFilter.SHOW_TEXT);
    const out = [];
    let cur = { text: "", top: null, l: null, r: null };
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue || "";
      for (let i = 0; i < text.length; i++) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect();
        const top = Math.round(r.top);
        if (cur.top === null) {
          cur.top = top; cur.l = r.left; cur.r = r.right;
        }
        if (top !== cur.top) {
          out.push({ text: cur.text, w: Math.round(cur.r - cur.l), l: Math.round(cur.l), r: Math.round(cur.r) });
          cur = { text: text[i], top, l: r.left, r: r.right };
        } else {
          cur.text += text[i];
          cur.r = r.right;
        }
      }
    }
    out.push({ text: cur.text, w: Math.round(cur.r - cur.l), l: Math.round(cur.l), r: Math.round(cur.r) });
    return out;
  });

  const shot = join(OUT, `${vp.w}-mission.png`);
  const handle = await page.evaluateHandle(() => document.querySelector('section[class*="mission-panel-module"]'));
  await handle.asElement()?.screenshot({ path: shot });

  await ctx.close();

  console.log(`\n========== WebKit @ ${vp.w}px ==========`);
  console.log("EYEBROW:");
  console.log("  text:", JSON.stringify(data.eyebrow.text));
  console.log("  rect:", data.eyebrow.rect);
  console.log("  css:", data.eyebrow.css);
  console.log("  lineHeight:", data.eyebrow.lineHeight, "→ visual line count =", data.eyebrow.rect && data.eyebrow.lineHeight ? Math.round(data.eyebrow.rect.h / parseFloat(data.eyebrow.lineHeight)) : "?");
  console.log("\nH2 HEADLINE:");
  console.log("  html:", JSON.stringify(data.h2.html));
  console.log("  rect:", data.h2.rect);
  console.log("  css:", data.h2.css);
  if (Array.isArray(data.h2.lines)) {
    for (const [i, l] of data.h2.lines.entries()) {
      const symL = l.l, symR = data.vp - l.r;
      const balanced = Math.abs(symL - symR) <= 2 ? "✓" : `Δ${symL - symR}`;
      console.log(`  line ${i + 1} [w=${l.w}]  "${l.text.trim()}"   L-gut=${symL} R-gut=${symR} ${balanced}`);
    }
  }
  console.log("\nTEAM TITLE:");
  console.log("  rect:", data.teamTitle.rect);
  console.log("  css:", data.teamTitle.css);
  for (const [i, l] of teamLines.entries()) {
    const symL = l.l, symR = data.vp - l.r;
    const balanced = Math.abs(symL - symR) <= 2 ? "✓" : `Δ${symL - symR}`;
    console.log(`  line ${i + 1} [w=${l.w}]  "${l.text.trim()}"   L-gut=${symL} R-gut=${symR} ${balanced}`);
  }
}

await browser.close();
console.log("\nScreenshots →", OUT);

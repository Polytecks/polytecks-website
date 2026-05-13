import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-mission";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const data = await page.evaluate(() => {
  const panel = document.querySelector('section[class*="panel"]');
  const inner = panel?.querySelector('[class*="inner"]');
  const teamTease = panel?.querySelector('[class*="teamTease"]');
  const logos = panel?.querySelector('[class*="logos"]');
  const eyebrow = inner?.querySelector('p:first-of-type');
  const headline = inner?.querySelector('h2');
  const lede = inner?.querySelector('p:last-of-type');
  const marks = panel ? Array.from(panel.querySelectorAll('[data-name]')) : [];

  const rect = (el) => el ? (() => {
    const r = el.getBoundingClientRect();
    return { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), r: Math.round(r.right) };
  })() : null;

  const styleOf = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      width: cs.width,
      maxWidth: cs.maxWidth,
      paddingLeft: cs.paddingLeft,
      paddingRight: cs.paddingRight,
      marginLeft: cs.marginLeft,
      marginRight: cs.marginRight,
      textAlign: cs.textAlign,
      gridTemplateColumns: cs.gridTemplateColumns,
      justifyContent: cs.justifyContent,
      justifyItems: cs.justifyItems,
    };
  };

  const vp = window.innerWidth;
  return {
    vp,
    panel: { rect: rect(panel), style: styleOf(panel) },
    inner: { rect: rect(inner), style: styleOf(inner) },
    teamTease: { rect: rect(teamTease), style: styleOf(teamTease) },
    logos: { rect: rect(logos), style: styleOf(logos) },
    eyebrow: { rect: rect(eyebrow), style: styleOf(eyebrow) },
    headline: { rect: rect(headline), style: styleOf(headline) },
    lede: { rect: rect(lede), style: styleOf(lede) },
    marks: marks.map((m) => ({ name: m.getAttribute('data-name'), rect: rect(m) })),
  };
});

await page.locator('section >> nth=1').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "375-mission.png") });

await browser.close();

console.log(`Viewport: ${data.vp}px`);
const fmt = (label, obj) => {
  if (!obj.rect) return console.log(`  ${label}: (not found)`);
  const r = obj.rect;
  const symL = r.l;
  const symR = data.vp - r.r;
  const balanced = Math.abs(symL - symR) <= 2 ? "✓" : `✗ Δ${symL - symR}`;
  console.log(`  ${label.padEnd(12)}  l=${r.l}  r=${r.r}  w=${r.w}  symmetry: L=${symL} R=${symR} ${balanced}`);
};

console.log("\nElement positions (left/right margins relative to viewport):");
fmt("panel", data.panel);
fmt("inner", data.inner);
fmt("eyebrow", data.eyebrow);
fmt("headline", data.headline);
fmt("lede", data.lede);
fmt("teamTease", data.teamTease);
fmt("logos", data.logos);
for (const m of data.marks) {
  fmt(`  ${m.name}`, { rect: m.rect });
}

console.log("\nKey computed styles:");
console.log("  inner.text-align =", data.inner.style?.textAlign, " maxWidth =", data.inner.style?.maxWidth);
console.log("  teamTease.text-align =", data.teamTease.style?.textAlign, " maxWidth =", data.teamTease.style?.maxWidth);
console.log("  logos.grid-template-columns =", data.logos.style?.gridTemplateColumns);
console.log("  logos.justify-items =", data.logos.style?.justifyItems, " justify-content =", data.logos.style?.justifyContent);

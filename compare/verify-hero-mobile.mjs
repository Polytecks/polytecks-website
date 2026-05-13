import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-hero-mobile";
mkdirSync(OUT, { recursive: true });
const URL = "http://localhost:3000/";

const VIEWPORTS = [
  { name: "320", width: 320, height: 720 },
  { name: "375", width: 375, height: 812 },
  { name: "414", width: 414, height: 896 },
];

const browser = await chromium.launch();
const errors = [];
const results = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${vp.name}: PAGE: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${vp.name}: CONSOLE: ${m.text()}`); });

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: join(OUT, `${vp.name}.png`), fullPage: true });

  const m = await page.evaluate(() => {
    const root = document.documentElement;
    // Anchor on the <section> with class containing "hero" (the only one
    // on the home page) to avoid matching .subheading / etc. elsewhere.
    const heroSection = document.querySelector('section[class*="hero"]');
    const headline = heroSection?.querySelector('h1');
    const sub      = heroSection?.querySelector('p');
    const arm      = heroSection?.querySelector('[class*="arm"]');
    const ctas     = heroSection?.querySelector('[class*="ctas"]');
    const canvas   = document.querySelector("canvas");
    const order = [];
    if (headline) order.push({ name: "headline", top: headline.getBoundingClientRect().top });
    if (sub)      order.push({ name: "sub",      top: sub.getBoundingClientRect().top });
    if (arm)      order.push({ name: "arm",      top: arm.getBoundingClientRect().top });
    if (ctas)     order.push({ name: "ctas",     top: ctas.getBoundingClientRect().top });
    order.sort((a, b) => a.top - b.top);

    const subRect  = sub  ? sub.getBoundingClientRect()  : null;
    const ctasRect = ctas ? ctas.getBoundingClientRect() : null;
    const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
    const canvasBuffer = canvas ? { w: canvas.width, h: canvas.height } : null;

    const styleOf = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        display: cs.display,
        gridArea: cs.gridArea,
        width: cs.width,
        maxWidth: cs.maxWidth,
        paddingRight: cs.paddingRight,
        position: cs.position,
        left: cs.left,
        right: cs.right,
        transform: cs.transform,
      };
    };
    const wrapper = heroSection?.querySelector('div[class*="content"] > div:first-of-type');
    const contentDiv = heroSection?.querySelector('div[class*="content"]');
    const heroBox  = heroSection ? heroSection.getBoundingClientRect() : null;
    const contentBox = contentDiv ? contentDiv.getBoundingClientRect() : null;

    return {
      scrollWidth: root.scrollWidth,
      viewport: window.innerWidth,
      overflows: root.scrollWidth > window.innerWidth + 1,
      stackOrder: order.map((o) => o.name).join(" → "),
      subRight:  subRect  ? Math.round(subRect.right)  : null,
      ctasRight: ctasRect ? Math.round(ctasRect.right) : null,
      subLeft:   subRect  ? Math.round(subRect.left)   : null,
      ctasLeft:  ctasRect ? Math.round(ctasRect.left)  : null,
      subStyle: styleOf(sub),
      ctasStyle: styleOf(ctas),
      wrapperStyle: styleOf(wrapper),
      canvasCss: canvasRect ? { w: Math.round(canvasRect.width), h: Math.round(canvasRect.height) } : null,
      canvasBuffer,
      heroBox: heroBox ? { l: Math.round(heroBox.left), w: Math.round(heroBox.width), r: Math.round(heroBox.right) } : null,
      contentBox: contentBox ? { l: Math.round(contentBox.left), w: Math.round(contentBox.width), r: Math.round(contentBox.right) } : null,
      heroStyle: styleOf(heroSection),
      contentStyle: styleOf(contentDiv),
    };
  });
  results.push({ vp: vp.name, ...m });
  await ctx.close();
}
await browser.close();

const failures = [];
for (const r of results) {
  console.log(`\n${r.vp}: viewport=${r.viewport} scrollWidth=${r.scrollWidth} overflow=${r.overflows}`);
  console.log(`  stack:  ${r.stackOrder}`);
  console.log(`  sub  rect: left=${r.subLeft} right=${r.subRight}`);
  console.log(`  sub  style: ${JSON.stringify(r.subStyle)}`);
  console.log(`  ctas rect: left=${r.ctasLeft} right=${r.ctasRight}`);
  console.log(`  ctas style: ${JSON.stringify(r.ctasStyle)}`);
  console.log(`  wrapper style: ${JSON.stringify(r.wrapperStyle)}`);
  console.log(`  hero    rect: ${JSON.stringify(r.heroBox)}`);
  console.log(`  content rect: ${JSON.stringify(r.contentBox)}`);
  console.log(`  hero style: ${JSON.stringify(r.heroStyle)}`);
  console.log(`  content style: ${JSON.stringify(r.contentStyle)}`);
  console.log(`  canvas css=${JSON.stringify(r.canvasCss)} buffer=${JSON.stringify(r.canvasBuffer)}`);
  if (r.overflows) failures.push(`${r.vp} horizontal overflow (${r.scrollWidth} > ${r.viewport})`);
  if (r.stackOrder !== "headline → sub → arm → ctas") failures.push(`${r.vp} wrong stack order: ${r.stackOrder}`);
  if (r.subRight !== null && r.subRight > r.viewport + 1) failures.push(`${r.vp} sub overflows (right=${r.subRight} > vp=${r.viewport})`);
  if (r.ctasRight !== null && r.ctasRight > r.viewport + 1) failures.push(`${r.vp} ctas overflows (right=${r.ctasRight} > vp=${r.viewport})`);
}

console.log(`\nErrors: ${errors.length === 0 ? "(none)" : errors.length}`);
if (errors.length) console.log(errors.slice(0, 5).join("\n"));
console.log(`Failures: ${failures.length === 0 ? "(none)" : failures.length}`);
if (failures.length) console.log(failures.join("\n"));
console.log(`Screenshots → ${OUT}`);
process.exit(failures.length === 0 && errors.length === 0 ? 0 : 1);

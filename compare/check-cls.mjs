/**
 * Capture every layout-shift on the homepage with element attribution
 * so we can identify what's actually jumping.
 */
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const shifts = [];
await page.exposeFunction("__shift", (e) => shifts.push(e));

await page.addInitScript(() => {
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      // Layout-shift entries include `sources` describing which
      // element moved + previous/current rects.
      const sources = (e.sources || []).map((s) => ({
        tag: s.node?.tagName,
        cls: s.node?.className?.toString?.()?.slice?.(0, 60),
        text: s.node?.textContent?.slice?.(0, 30),
        prev: s.previousRect ? {
          y: Math.round(s.previousRect.y),
          h: Math.round(s.previousRect.height),
        } : null,
        next: s.currentRect ? {
          y: Math.round(s.currentRect.y),
          h: Math.round(s.currentRect.height),
        } : null,
      }));
      window.__shift({
        time: Math.round(e.startTime),
        value: e.value.toFixed(4),
        hadRecentInput: e.hadRecentInput,
        sources,
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
});

await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);

console.log(`${shifts.length} layout shifts during first 4 s\n`);
let cumulative = 0;
for (const s of shifts) {
  cumulative += parseFloat(s.value);
  console.log(`t=${s.time}ms  +${s.value}  (cumulative ${cumulative.toFixed(4)})`);
  for (const src of s.sources) {
    const dy = src.next && src.prev ? src.next.y - src.prev.y : null;
    console.log(
      `   ${src.tag} .${src.cls?.split(" ")?.[0] ?? "?"}  "${(src.text ?? "").trim()}"  prev y=${src.prev?.y} → next y=${src.next?.y} (dy ${dy ?? "?"})`,
    );
  }
}

await browser.close();

import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-devices-gap";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const VIEWPORTS = [375, 720, 960, 1280, 1920];

const browser = await chromium.launch();
const findings = [];

for (const w of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 1000 } });
  // clear any saved tweaks so the TWEAK_DEFAULTS apply
  await ctx.addInitScript(() => {
    try { localStorage.removeItem("polytecks:tweaks"); } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/devices`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.addStyleTag({ content: `*, *::before, *::after { animation-play-state: paused !important; animation: none !important; transition: none !important; }` });

  const data = await page.evaluate(() => {
    const strip = document.querySelector("[class*='applications-strip-module']");
    const tabsWrap = document.querySelector("[class*='devices-tabs-module'], [class*='tabs-module']");
    const cs = strip ? getComputedStyle(strip) : null;
    const stripRect = strip?.getBoundingClientRect();
    const cssVar = getComputedStyle(document.body).getPropertyValue("--sp-devices-strip-gap-below").trim();
    return {
      stripFound: !!strip,
      tabsFound: !!tabsWrap,
      marginBottom: cs?.marginBottom,
      stripBottomY: stripRect ? Math.round(stripRect.bottom) : null,
      cssVar,
    };
  });

  // screenshot showing the gap
  await page.evaluate(() => {
    const strip = document.querySelector("[class*='applications-strip-module']");
    strip?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, `${w}-strip-and-tabs.png`) });

  findings.push({ w, ...data });
  await ctx.close();
}
await browser.close();

console.log("\nViewport  CSS var          margin-bottom");
for (const f of findings) {
  console.log(`${String(f.w).padStart(7)}px   ${f.cssVar.padEnd(15)}  ${f.marginBottom}`);
}

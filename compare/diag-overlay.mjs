import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-overlay-diag";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Click hamburger
await page.locator('button[aria-label="Open menu"]').click();
await page.waitForTimeout(600);  // let transition settle
await page.screenshot({ path: join(OUT, "menu-open.png") });

// Probe the overlay's computed style + stacking context
const data = await page.evaluate(() => {
  const overlay = document.getElementById("mobile-nav-overlay");
  if (!overlay) return { error: "no overlay" };
  const cs = getComputedStyle(overlay);
  const rect = overlay.getBoundingClientRect();

  // Walk up the parents and collect anything that creates a stacking context
  const stack = [];
  let el = overlay;
  while (el && el !== document.documentElement) {
    const s = getComputedStyle(el);
    const id = el.id || el.tagName.toLowerCase();
    const cls = (typeof el.className === 'string' ? el.className : '').slice(0, 40);
    stack.push({
      tag: id,
      cls,
      position: s.position,
      zIndex: s.zIndex,
      transform: s.transform,
      filter: s.filter,
      backdropFilter: s.backdropFilter,
      willChange: s.willChange,
      isolation: s.isolation,
      mixBlendMode: s.mixBlendMode,
      opacity: s.opacity,
    });
    el = el.parentElement;
  }

  // Sample a pixel at the centre of the overlay area
  const cx = Math.round(rect.left + rect.width / 2);
  const cy = Math.round(rect.top + rect.height / 2);
  const elAtPoint = document.elementFromPoint(cx, cy);
  const elAtPointInfo = elAtPoint ? {
    id: elAtPoint.id,
    tag: elAtPoint.tagName,
    cls: typeof elAtPoint.className === 'string' ? elAtPoint.className.slice(0, 60) : '',
  } : null;

  return {
    overlayStyle: {
      position: cs.position,
      top: cs.top, bottom: cs.bottom, left: cs.left, right: cs.right,
      width: cs.width, height: cs.height,
      zIndex: cs.zIndex,
      backgroundColor: cs.backgroundColor,
      background: cs.background,
      opacity: cs.opacity,
      transform: cs.transform,
      mixBlendMode: cs.mixBlendMode,
      isolation: cs.isolation,
      filter: cs.filter,
      backdropFilter: cs.backdropFilter,
      pointerEvents: cs.pointerEvents,
      display: cs.display,
    },
    overlayRect: {
      l: Math.round(rect.left), t: Math.round(rect.top),
      w: Math.round(rect.width), h: Math.round(rect.height),
    },
    stack,
    elAtCentreOfOverlay: elAtPointInfo,
    elAtCentreCoords: { cx, cy },
  };
});

await browser.close();

console.log(JSON.stringify(data, null, 2));

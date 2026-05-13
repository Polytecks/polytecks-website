/**
 * Performance profile of the homepage first paint + entrance animations.
 * Captures:
 *   - Long tasks (>50 ms blocking the main thread)
 *   - First Contentful Paint, Largest Contentful Paint
 *   - Frame timing during the first 4 seconds
 *   - Animation-related counters (rAF rate, layout count)
 */
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const longTasks = [];
await page.exposeFunction("__lt", (e) => longTasks.push(e));

await page.addInitScript(() => {
  // Long-task observer — anything blocking the main thread > 50 ms.
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        // @ts-expect-error attribution is not typed
        const attrs = e.attribution ?? [];
        window.__lt({
          startTime: Math.round(e.startTime),
          duration: Math.round(e.duration),
          attribution: attrs.map((a) => ({
            containerType: a.containerType,
            containerSrc: a.containerSrc,
            containerId: a.containerId,
            containerName: a.containerName,
          })),
        });
      }
    }).observe({ type: "longtask", buffered: true });
  } catch {}

  // Frame timing — count dropped frames during entrance.
  window.__frames = [];
  let last = performance.now();
  function tick() {
    const now = performance.now();
    window.__frames.push(Math.round(now - last));
    last = now;
    if (now < 5000) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});

// Use Chrome DevTools Protocol for CPU throttling to simulate a mid-tier
// laptop more honestly. Set to 4x slowdown — closer to what the user is
// likely experiencing on a typical machine + browser-load overhead.
const cdp = await ctx.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

const tStart = Date.now();
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
const tDOMContentLoaded = Date.now() - tStart;
await page.waitForTimeout(4500);

const vitals = await page.evaluate(() => {
  const paint = performance.getEntriesByType("paint");
  const fcp = paint.find((e) => e.name === "first-contentful-paint")?.startTime;
  const lcp = performance
    .getEntriesByType("largest-contentful-paint")
    .at(-1)?.startTime;
  const navTiming = performance.getEntriesByType("navigation")[0];
  return {
    fcp: fcp ? Math.round(fcp) : null,
    lcp: lcp ? Math.round(lcp) : null,
    domContentLoaded: navTiming
      ? Math.round(navTiming.domContentLoadedEventEnd)
      : null,
    loadEvent: navTiming ? Math.round(navTiming.loadEventEnd) : null,
    frames: window.__frames || [],
  };
});

// Frame stats — count frames > 32 ms (=2 missed 60fps frames), > 50 ms
// (dropped frames), and max frame duration.
const frames = vitals.frames;
const long32 = frames.filter((d) => d > 32).length;
const long50 = frames.filter((d) => d > 50).length;
const long100 = frames.filter((d) => d > 100).length;
const maxFrame = Math.max(...frames, 0);

console.log("--- Vitals ---");
console.log("FCP:", vitals.fcp, "ms");
console.log("LCP:", vitals.lcp, "ms");
console.log("DCL:", vitals.domContentLoaded, "ms (perf timing)");
console.log("DOMContentLoaded wall-clock:", tDOMContentLoaded, "ms");

console.log("\n--- Frame stats (during 0–5 s, 4x CPU throttling) ---");
console.log("Total frames sampled:", frames.length);
console.log("Frames > 32 ms (jank):", long32);
console.log("Frames > 50 ms (dropped):", long50);
console.log("Frames > 100 ms (severe stall):", long100);
console.log("Max frame duration:", maxFrame, "ms");

console.log("\n--- Long Tasks (>50 ms main thread blocks) ---");
const totalBlocked = longTasks.reduce((s, t) => s + t.duration, 0);
console.log(
  `${longTasks.length} long tasks, ${totalBlocked} ms total blocked.\n`,
);
for (const t of longTasks.slice(0, 20)) {
  const attrs =
    t.attribution
      ?.map(
        (a) =>
          `${a.containerType ?? "?"}/${a.containerName ?? a.containerId ?? "?"}`,
      )
      .join(",") || "—";
  console.log(
    `  ${String(t.startTime).padStart(5)} ms  +${String(t.duration).padStart(4)} ms  ${attrs}`,
  );
}

await browser.close();

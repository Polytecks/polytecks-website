import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const widths = [1024, 1280, 1440, 1600, 1920, 2560];
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  const stats = await page.evaluate(() => {
    const sub = Array.from(document.querySelectorAll("p, h2, h3"))
      .find(el => /Advanced bioelectrical/i.test(el.textContent || ""));
    if (!sub) return { error: "no sub" };

    // Get the available column width (parent of sub)
    const colWidth = sub.parentElement.getBoundingClientRect().width;
    const wrappedRect = sub.getBoundingClientRect();
    const cs = getComputedStyle(sub);

    // Measure intrinsic single-line width by temporarily setting white-space:nowrap
    const origWS = sub.style.whiteSpace;
    const origMW = sub.style.maxWidth;
    sub.style.whiteSpace = "nowrap";
    sub.style.maxWidth = "none";
    const naturalWidth = sub.getBoundingClientRect().width;
    sub.style.whiteSpace = origWS;
    sub.style.maxWidth = origMW;

    return {
      fontSize: cs.fontSize,
      cssMaxWidth: cs.maxWidth,
      colWidth: colWidth.toFixed(0),
      wrappedWidth: wrappedRect.width.toFixed(0),
      wrappedHeight: wrappedRect.height.toFixed(0),
      naturalSingleLineWidth: naturalWidth.toFixed(0),
    };
  });
  console.log(`vw=${w}`, JSON.stringify(stats));
}

await browser.close();

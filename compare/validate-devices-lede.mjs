/**
 * Inspect the Devices hero — confirm the editorialLede:
 *  - dark-neutral body, indigo only on the <em>
 *  - 2 lines on desktop, balanced
 *  - secondary to the headline
 *  - icon row below not crowded
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const browser = await chromium.launch();
mkdirSync("compare/devices-lede", { recursive: true });

async function shoot(viewport, slug) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/devices", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(2500);

  const info = await page.evaluate(() => {
    const lede = document.querySelector('p[class*="lede"]');
    const em = lede?.querySelector("em");
    if (!lede) return null;
    const lcs = getComputedStyle(lede);
    const ecs = em ? getComputedStyle(em) : null;
    const r = lede.getBoundingClientRect();
    return {
      ledeClass: lede.className,
      ledeText: lede.textContent?.slice(0, 200),
      emText: em?.textContent,
      lede: {
        fontSize: lcs.fontSize,
        fontWeight: lcs.fontWeight,
        lineHeight: lcs.lineHeight,
        color: lcs.color,
        maxWidth: lcs.maxWidth,
        height: r.height,
        rectWidth: r.width,
      },
      em: ecs && {
        fontStyle: ecs.fontStyle,
        fontWeight: ecs.fontWeight,
        color: ecs.color,
        whiteSpace: ecs.whiteSpace,
      },
    };
  });
  console.log(`[${slug}]`, JSON.stringify(info, null, 2));

  // Capture hero region — top of page down to start of icon strip.
  const strip = await page
    .locator('[class*="applicationsStrip"], [class*="ApplicationsStrip"]')
    .first()
    .boundingBox()
    .catch(() => null);
  const clipHeight = strip
    ? Math.min(strip.y + 220, viewport.height)
    : viewport.height;
  await page.screenshot({
    path: `compare/devices-lede/${slug}.png`,
    clip: { x: 0, y: 0, width: viewport.width, height: clipHeight },
  });

  await ctx.close();
}

await shoot({ width: 1440, height: 900 }, "desktop");
await shoot({ width: 1024, height: 768 }, "tablet");
await shoot({ width: 390, height: 844 }, "mobile");

await browser.close();
console.log("Wrote compare/devices-lede/{desktop,tablet,mobile}.png");

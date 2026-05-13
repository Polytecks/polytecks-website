/**
 * Inspect the About Us hero — confirm the new editorial lede:
 *  - dark-neutral body
 *  - indigo accent only on the <em>
 *  - 2–3 balanced lines at desktop, more on mobile
 *  - secondary to the main headline
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const browser = await chromium.launch();
mkdirSync("compare/about-lede", { recursive: true });

async function shoot(viewport, slug) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/about", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(2500);

  // Sample computed styles on the lede paragraph + its <em>.
  const info = await page.evaluate(() => {
    const lede = document.querySelector('p[class*="lede"]');
    const em = lede?.querySelector("em");
    if (!lede) return null;
    const lcs = getComputedStyle(lede);
    const ecs = em ? getComputedStyle(em) : null;
    const r = lede.getBoundingClientRect();
    return {
      ledeClass: lede.className,
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
      },
    };
  });
  console.log(`[${slug}]`, JSON.stringify(info, null, 2));

  // Capture the hero region (everything above the Cambridge section).
  const cam = await page.locator('[class*="cambridge"]').first().boundingBox();
  const heroClip = {
    x: 0,
    y: 0,
    width: viewport.width,
    height: cam ? Math.min(cam.y, viewport.height) : viewport.height,
  };
  await page.screenshot({
    path: `compare/about-lede/${slug}.png`,
    clip: heroClip,
  });

  await ctx.close();
}

await shoot({ width: 1440, height: 900 }, "desktop");
await shoot({ width: 1024, height: 768 }, "tablet");
await shoot({ width: 390, height: 844 }, "mobile");

await browser.close();
console.log("Wrote compare/about-lede/{desktop,tablet,mobile}.png");

/**
 * Inspect the homepage hero sub — confirm:
 *  - dark-neutral body, indigo only on the <em>
 *  - weight 400, line-height ≈ 1.4
 *  - 1–2 calm lines on desktop, more on mobile
 *  - "bioelectrical mapping" kept on one line
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const browser = await chromium.launch();
mkdirSync("compare/home-sub", { recursive: true });

async function shoot(viewport, slug) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(2500);

  const info = await page.evaluate(() => {
    const sub = document.querySelector('p[class*="sub"]');
    if (!sub) return null;
    const em = sub.querySelector("em");
    const scs = getComputedStyle(sub);
    const ecs = em ? getComputedStyle(em) : null;
    const r = sub.getBoundingClientRect();
    return {
      subClass: sub.className,
      text: sub.textContent?.slice(0, 200),
      emText: em?.textContent,
      sub: {
        fontSize: scs.fontSize,
        fontWeight: scs.fontWeight,
        lineHeight: scs.lineHeight,
        color: scs.color,
        maxWidth: scs.maxWidth,
        letterSpacing: scs.letterSpacing,
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

  await page.screenshot({
    path: `compare/home-sub/${slug}.png`,
    clip: { x: 0, y: 0, width: viewport.width, height: viewport.height },
  });

  await ctx.close();
}

await shoot({ width: 2560, height: 1440 }, "ultrawide");
await shoot({ width: 1920, height: 1080 }, "wide");
await shoot({ width: 1440, height: 900 }, "desktop");
await shoot({ width: 1024, height: 768 }, "tablet");
await shoot({ width: 390, height: 844 }, "mobile");

await browser.close();
console.log("Wrote compare/home-sub/{desktop,tablet,mobile}.png");

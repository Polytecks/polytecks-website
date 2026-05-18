import { chromium } from "playwright";

const URL = process.env.URL ?? "http://localhost:3000/about?tweaks=1";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on("console", (msg) => {
  if (msg.type() === "error") console.error("[page error]", msg.text());
});

await page.goto(URL, { waitUntil: "networkidle" });

// Find the Cambridge media box and scroll it into view.
const mediaHandle = await page.locator('[class*="cambridge-section_module"][class*="__media"], [class*="cambridge-section-module"][class*="__media"]').first();
await mediaHandle.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);

const probe = await page.evaluate(() => {
  const media =
    document.querySelector('[class*="cambridge-section_module__"][class*="__media"]') ||
    document.querySelector('[class*="cambridge-section-module__"][class*="__media"]') ||
    document.querySelector('section [class*="__media"]');
  if (!media) return { error: "no .media found" };

  const glow = media.querySelector('[class*="__glow"]');
  const img = media.querySelector('img');
  const mediaCS = getComputedStyle(media);
  const glowCS = glow ? getComputedStyle(glow) : null;
  const imgCS = img ? getComputedStyle(img) : null;

  const rect = (el) => el ? el.getBoundingClientRect() : null;

  return {
    media: {
      isolation: mediaCS.isolation,
      position: mediaCS.position,
      zIndex: mediaCS.zIndex,
      overflow: mediaCS.overflow,
      width: mediaCS.width,
      height: mediaCS.height,
      rect: rect(media),
    },
    glow: glow ? {
      position: glowCS.position,
      zIndex: glowCS.zIndex,
      opacity: glowCS.opacity,
      overflow: glowCS.overflow,
      rect: rect(glow),
    } : null,
    img: img ? {
      position: imgCS.position,
      zIndex: imgCS.zIndex,
      rect: rect(img),
    } : null,
    /* Effective stacking — what does elementFromPoint return at the centre? */
    elementAtCenter: (() => {
      const r = rect(media);
      if (!r) return null;
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const el = document.elementFromPoint(x, y);
      return el ? { tag: el.tagName, classes: el.className?.toString().slice(0, 80) } : null;
    })(),
    elementAtTopMiddle: (() => {
      const r = rect(media);
      if (!r) return null;
      const x = r.left + r.width / 2;
      const y = r.top + 20;
      const el = document.elementFromPoint(x, y);
      return el ? { tag: el.tagName, classes: el.className?.toString().slice(0, 80) } : null;
    })(),
  };
});

console.log(JSON.stringify(probe, null, 2));

// Tight crop screenshot of the Cambridge media area.
const box = await mediaHandle.boundingBox();
if (box) {
  await page.screenshot({
    path: "compare/cambridge-tight.png",
    clip: {
      x: Math.max(0, box.x - 60),
      y: Math.max(0, box.y - 80),
      width: Math.min(1440, box.width + 120),
      height: Math.min(900, box.height + 160),
    },
  });
  console.log("tight crop → compare/cambridge-tight.png");
}

await browser.close();

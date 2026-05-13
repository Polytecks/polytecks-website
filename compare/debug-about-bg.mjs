import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto("http://localhost:3000/about", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);

const info = await page.evaluate(() => {
  const img = document.querySelector('img[src*="about-us-background"]');
  if (!img) return { found: false };
  const wrap = img.parentElement;
  const wRect = wrap.getBoundingClientRect();
  const iRect = img.getBoundingClientRect();
  const wCs = getComputedStyle(wrap);
  const iCs = getComputedStyle(img);
  return {
    found: true,
    wrap: {
      tag: wrap.tagName,
      class: wrap.className,
      rect: { x: wRect.x, y: wRect.y, w: wRect.width, h: wRect.height },
      computed: {
        position: wCs.position,
        right: wCs.right,
        top: wCs.top,
        zIndex: wCs.zIndex,
        opacity: wCs.opacity,
        display: wCs.display,
        visibility: wCs.visibility,
        mask: wCs.maskImage || wCs.webkitMaskImage,
      },
    },
    img: {
      src: img.src,
      naturalW: img.naturalWidth,
      naturalH: img.naturalHeight,
      complete: img.complete,
      rect: { x: iRect.x, y: iRect.y, w: iRect.width, h: iRect.height },
      computed: {
        objectFit: iCs.objectFit,
        objectPosition: iCs.objectPosition,
      },
    },
  };
});

console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: "compare/screenshots-about-bg-debug.png", fullPage: false });
await browser.close();

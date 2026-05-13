import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-topo";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "320",  w: 320,  h: 720 },
  { name: "375",  w: 375,  h: 812 },
  { name: "414",  w: 414,  h: 896 },
  { name: "768",  w: 768,  h: 1024 },
  { name: "1280", w: 1280, h: 800 },
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);  // let canvas animate

  const data = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return null;
    return {
      cssW: c.clientWidth, cssH: c.clientHeight,
      bufW: c.width, bufH: c.height,
      ratioBufCss: { w: (c.width / c.clientWidth).toFixed(2), h: (c.height / c.clientHeight).toFixed(2) },
    };
  });

  await page.screenshot({ path: join(OUT, `${vp.name}.png`), fullPage: false });
  await ctx.close();

  const portrait = vp.w < vp.h;
  console.log(`${vp.name.padEnd(5)}  vp=${vp.w}×${vp.h}  ${portrait ? "portrait" : "landscape"}  canvas css=${data.cssW}×${data.cssH}  buffer=${data.bufW}×${data.bufH}  bufRatio=${data.ratioBufCss.w}×${data.ratioBufCss.h}`);
}
await browser.close();

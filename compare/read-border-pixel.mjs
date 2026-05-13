import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/devices", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
await page.locator('[class*="videoBox"]').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);

const data = await page.evaluate(async () => {
  // Use html2canvas-equivalent: read each video pixel via canvas of the document
  // Not possible directly — instead, take a known small region screenshot from JS.
  // Simpler: use the SCREENSHOT png and read pixel by hand.
  return null;
});

// Take a small clip at the EXACT pixel border location
const dog = await page.locator('[class*="dogBox"]').first().boundingBox();
const vid = await page.locator('[class*="videoBox"]').first().boundingBox();

async function pixelStripFromShot(box, name) {
  // 1px wide column going from outside-left to inside-left, at mid-height
  const x = Math.floor(box.x - 4);
  const y = Math.floor(box.y + box.height/2);
  const clip = { x, y, width: 10, height: 1 };
  const buf = await page.screenshot({ clip });
  // PNG sig: 89 50 4e 47 0d 0a 1a 0a, then 4-byte length + IHDR
  // Easier: re-take but at scale 1 we can just decode via canvas in browser context
  return clip;
}

// Use the browser to capture a full-page screenshot and sample pixels
const fullShot = await page.screenshot({ fullPage: false });
// Pass it back into a fresh page with a Canvas to sample
const samplerPage = await ctx.newPage();
await samplerPage.setContent(`<!doctype html><body><canvas id=c></canvas><img id=im src="data:image/png;base64,${fullShot.toString('base64')}"></body>`);
await samplerPage.waitForFunction('document.getElementById("im").complete');

const sampled = await samplerPage.evaluate(({ dog, vid }) => {
  const im = document.getElementById('im');
  const c = document.getElementById('c');
  c.width = im.naturalWidth;
  c.height = im.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(im, 0, 0);
  const sample = (x, y) => {
    const px = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    return `(${px[0]}, ${px[1]}, ${px[2]}, ${px[3]})`;
  };
  function probe(box, label) {
    const my = box.y + box.height / 2;
    return {
      label,
      outside_left_3:  sample(box.x - 3, my),
      outside_left_2:  sample(box.x - 2, my),
      outside_left_1:  sample(box.x - 1, my),
      at_left_edge_0:  sample(box.x, my),
      inside_left_1:   sample(box.x + 1, my),
      inside_left_2:   sample(box.x + 2, my),
    };
  }
  return { dog: probe(dog, "dog"), vid: probe(vid, "vid") };
}, { dog, vid });

console.log(JSON.stringify(sampled, null, 2));
await browser.close();

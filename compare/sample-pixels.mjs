import { chromium } from "playwright";
import { readFile } from "node:fs/promises";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/devices", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);
await page.locator('[class*="videoBox"]').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(800);

// Take a single full-page screenshot of the videoBox area, then sample pixels using Canvas in browser.
const sampleResult = await page.evaluate(async () => {
  const vb = document.querySelector('[class*="videoBox"]');
  if (!vb) return null;
  const rect = vb.getBoundingClientRect();

  // Use html2canvas-like trick: capture videoBox using a canvas and CSS Paint API isn't available.
  // Instead, use a simpler approach: use the video element directly.
  const video = vb.querySelector('video');
  if (!video) return null;
  // Wait for video to be ready
  if (video.readyState < 2) {
    await new Promise(r => video.addEventListener('loadeddata', r, { once: true }));
  }

  // Draw current video frame onto a canvas WITHOUT page bg, so we get raw video pixels with alpha.
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  // Sample specific points
  const samples = [
    { name: 'right-corner-top', x: 1700, y: 100 },
    { name: 'right-corner-bottom', x: 1700, y: 700 },
    { name: 'mid-right-outside-hex', x: 1860, y: 350 },
    { name: 'top-edge-outside-hex', x: 1500, y: 30 },
    { name: 'inside-hex-center', x: 1554, y: 350 },
    { name: 'left-photo-area', x: 800, y: 400 },
    // Photo edge boundary checks
    { name: 'photo-edge x=1210 y=378', x: 1210, y: 378 },
    { name: 'photo-edge x=1220 y=378', x: 1220, y: 378 },
    { name: 'photo-edge x=1225 y=378', x: 1225, y: 378 },
    { name: 'photo-just-past x=1228 y=378', x: 1228, y: 378 },
    { name: 'white-bg x=1240 y=378', x: 1240, y: 378 },
    { name: 'photo-edge x=1220 y=50',  x: 1220, y: 50 },
    { name: 'photo-edge x=1225 y=750', x: 1225, y: 750 },
    // Hex-border edges
    { name: 'hex-border-top x=1555 y=55', x: 1555, y: 55 },
    { name: 'hex-border-bottom x=1555 y=700', x: 1555, y: 700 },
    { name: 'hex-just-outside-top x=1555 y=45', x: 1555, y: 45 },
    { name: 'hex-just-outside-bot x=1555 y=710', x: 1555, y: 710 },
  ];

  return samples.map(s => {
    const px = ctx.getImageData(s.x, s.y, 1, 1).data;
    return { ...s, rgba: [px[0], px[1], px[2], px[3]] };
  });
});

console.log("Pixel samples from rendered video frame:");
for (const s of sampleResult) {
  console.log(`  ${s.name.padEnd(40)} → rgba(${s.rgba.join(", ")})`);
}

await browser.close();

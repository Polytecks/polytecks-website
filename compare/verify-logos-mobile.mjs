import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-logos-mobile";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const logos = await page.evaluate(() => {
  const marks = Array.from(document.querySelectorAll('[data-name]')).filter(
    (el) => /mark/.test(el.className),
  );
  return marks.map((m) => {
    const r = m.getBoundingClientRect();
    const img = m.querySelector('img');
    const ir = img ? img.getBoundingClientRect() : null;
    return {
      name: m.getAttribute('data-name'),
      box: { w: Math.round(r.width), h: Math.round(r.height) },
      logo: ir ? { w: Math.round(ir.width), h: Math.round(ir.height) } : null,
    };
  });
});

await page.locator('section >> nth=1').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "375-full.png"), fullPage: true });

const logoStrip = page.locator('[data-name]').first().locator('..');
await logoStrip.screenshot({ path: join(OUT, "375-strip.png") });

await browser.close();

console.log("Logo box and rendered sizes at 375px:");
for (const l of logos) {
  console.log(`  ${l.name.padEnd(10)} box=${l.box.w}×${l.box.h}  logo=${l.logo ? `${l.logo.w}×${l.logo.h}` : "(text fallback)"}`);
}

const allBoxesEqual = logos.every(
  (l) => l.box.w === logos[0].box.w && l.box.h === logos[0].box.h,
);
console.log(`\nAll mark boxes identical: ${allBoxesEqual ? "yes ✓" : "NO ✗"}`);
const imperial = logos.find((l) => l.name === "imperial");
const others   = logos.filter((l) => l.name !== "imperial" && l.logo);
if (imperial?.logo && others.length) {
  const widest = Math.max(...others.map((o) => o.logo.w));
  console.log(`Imperial logo width: ${imperial.logo.w}, widest other: ${widest} → Imperial smaller? ${imperial.logo.w < widest ? "yes ✓" : "no ✗"}`);
}

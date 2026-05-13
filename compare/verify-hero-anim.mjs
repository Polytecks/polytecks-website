import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
// don't waitForTimeout — animations are time-based; we only need computed style

const data = await page.evaluate(() => {
  const heroSection = document.querySelector('section[class*="hero"]');
  const headline = heroSection?.querySelector('h1');
  const words = headline ? Array.from(headline.querySelectorAll('[class*="word"]')) : [];
  const sub = heroSection?.querySelector('p');
  const arm = heroSection?.querySelector('[class*="arm"]');
  const ctas = heroSection?.querySelectorAll('[class*="ctas"] > *');

  const delayOf = (el) => el ? getComputedStyle(el).animationDelay : null;
  const durOf = (el) => el ? getComputedStyle(el).animationDuration : null;

  return {
    headline: words.map((w, i) => ({ i, delay: delayOf(w), dur: durOf(w) })),
    sub:  { delay: delayOf(sub),  dur: durOf(sub)  },
    arm:  { delay: delayOf(arm),  dur: durOf(arm)  },
    cta1: ctas?.[0] ? { delay: delayOf(ctas[0]), dur: durOf(ctas[0]) } : null,
    cta2: ctas?.[1] ? { delay: delayOf(ctas[1]), dur: durOf(ctas[1]) } : null,
  };
});

await browser.close();
console.log("Mobile hero entry timing (375 viewport):");
console.log(`  headline cascade: ${data.headline.map(w => w.delay).join(", ")}`);
console.log(`  headline duration: ${data.headline[0]?.dur}`);
console.log(`  sub:  delay=${data.sub.delay}  dur=${data.sub.dur}`);
console.log(`  arm:  delay=${data.arm.delay}  dur=${data.arm.dur}`);
console.log(`  cta1: delay=${data.cta1?.delay} dur=${data.cta1?.dur}`);
console.log(`  cta2: delay=${data.cta2?.delay} dur=${data.cta2?.dur}`);

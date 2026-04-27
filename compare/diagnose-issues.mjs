import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// 1. Check Cambridge overlay text positioning + clipping
const page1 = await ctx.newPage();
await page1.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await page1.waitForTimeout(800);
const cambridgeInfo = await page1.evaluate(() => {
  const el = document.querySelector('p[class*="imageOverlayText"]');
  if (!el) return { found: false };
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    found: true,
    text: el.textContent.slice(0, 60),
    left: cs.left,
    top: cs.top,
    width: cs.width,
    boundingX: Math.round(r.x),
    boundingW: Math.round(r.width),
    bodyParent: el.parentElement?.className,
  };
});
console.log("Cambridge overlay:", JSON.stringify(cambridgeInfo, null, 2));
await page1.close();

// 2. Check proof cards opacity at scroll = top of section
const page2 = await ctx.newPage();
await page2.goto("http://localhost:3000/technology", { waitUntil: "networkidle" });
await page2.waitForTimeout(800);
// Find proof section and scroll to its top
const proofTop = await page2.evaluate(() => {
  const sections = Array.from(document.querySelectorAll('section'));
  const proof = sections.find(s => s.getBoundingClientRect().height > window.innerHeight * 2);
  return proof ? window.scrollY + proof.getBoundingClientRect().top : null;
});
console.log("Proof section top:", proofTop);
await page2.evaluate((y) => window.scrollTo(0, y), proofTop);
await page2.waitForTimeout(600);
const proofState = await page2.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('div[class*="proof"][class*="card"]'));
  // The class names are CSS-modules-hashed; look for divs that contain a cardNumber + cardLabel pair
  const matches = Array.from(document.querySelectorAll('p')).filter(p => {
    return p.className.includes('cardNumber') || p.className.includes('cardLabel');
  });
  if (matches.length === 0) return { found: 0, hint: "no matching p elements" };
  const card0 = matches[0]?.closest('div');
  const card1 = matches[2]?.closest('div');
  const card2 = matches[4]?.closest('div');
  const stylesOf = (el) => {
    if (!el) return null;
    // Dump matching CSS rules + active animations
    const animations = el.getAnimations ? el.getAnimations().map(a => ({
      id: a.animationName || a.id,
      effect: a.effect ? a.effect.getKeyframes ? a.effect.getKeyframes().map(k => ({ offset: k.offset, opacity: k.opacity })) : null : null,
      playState: a.playState,
    })) : [];
    return {
      computedOpacity: getComputedStyle(el).opacity,
      inlineOpacity: el.style.opacity,
      inlineFull: el.getAttribute('style'),
      animations,
      classList: Array.from(el.classList),
      tagName: el.tagName,
    };
  };
  return {
    matched: matches.length,
    card0: stylesOf(card0),
    card1: stylesOf(card1),
    card2: stylesOf(card2),
  };
});
console.log("Proof cards at scroll-top of section:", JSON.stringify(proofState, null, 2));

await browser.close();

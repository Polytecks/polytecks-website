import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const OUT = "compare/screenshots-cross-cutting";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const browser = await chromium.launch();
const findings = [];

async function run({ name, width, height }) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(`PAGE ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("favicon")) {
      consoleErrors.push(`CONSOLE ${m.text()}`);
    }
  });

  // ── TASK 1: favicon ─────────────────────────────────────────────────
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const favicon = await page.evaluate(() => {
    const link = document.querySelector('link[rel*="icon"]');
    return link?.getAttribute("href") ?? null;
  });
  findings.push({ vp: name, task: "1 favicon", value: favicon });

  // ── TASK 2 + 3a + 4: hero ───────────────────────────────────────────
  const heroData = await page.evaluate(() => {
    const sub = document.querySelector("section[class*='hero-module'] p[class*='__sub']");
    const headline = document.querySelector("section[class*='hero-module'] h1[class*='__headline']");
    const arm = document.querySelector("section[class*='hero-module'] [class*='__arm']");
    const subBefore = sub ? getComputedStyle(sub, "::before").backgroundImage : null;
    const headlineBefore = headline ? getComputedStyle(headline, "::before").backgroundImage : null;
    const armAfter = arm ? getComputedStyle(arm, "::after").backgroundImage : null;
    return {
      subColor: sub ? getComputedStyle(sub).color : null,
      subWeight: sub ? getComputedStyle(sub).fontWeight : null,
      headlineGlowSet: headlineBefore !== "none" && headlineBefore !== null,
      subGlowSet: subBefore !== "none" && subBefore !== null,
      armGlowSet: armAfter !== "none" && armAfter !== null,
    };
  });
  findings.push({ vp: name, task: "2 hero subtitle indigo", value: heroData.subColor });
  findings.push({ vp: name, task: "3a hero subtitle weight", value: heroData.subWeight });
  findings.push({ vp: name, task: "4 hero headline glow ::before", value: heroData.headlineGlowSet ? "set" : "MISSING" });
  findings.push({ vp: name, task: "4 hero sub glow ::before", value: heroData.subGlowSet ? "set" : "MISSING" });
  findings.push({ vp: name, task: "4 hero arm glow ::after", value: heroData.armGlowSet ? "set" : "MISSING" });

  await page.screenshot({ path: join(OUT, `${name}-hero.png`), clip: { x: 0, y: 0, width, height: Math.min(900, height) } });

  // ── TASK 3b: about lede weight ───────────────────────────────────
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const aboutLede = await page.evaluate(() => {
    const lede = document.querySelector("p[class*='subpage-module'][class*='__lede']");
    return lede ? { weight: getComputedStyle(lede).fontWeight, text: lede.textContent?.slice(0, 50) } : null;
  });
  findings.push({ vp: name, task: "3b about lede weight", value: aboutLede?.weight ?? "MISSING" });

  // ── TASK 5: Cambridge ECG callout ─────────────────────────────
  const callout = await page.evaluate(() => {
    const el =
      document.querySelector("p[class*='cambridge-section-module'][class*='__calloutText']") ||
      document.querySelector("p[class*='mobile-cambridge-section-module'][class*='__callout']");
    if (!el) return null;
    const em = el.querySelector("em");
    return {
      text: el.textContent?.slice(0, 80),
      hasEm: !!em,
      emText: em?.textContent,
      emColor: em ? getComputedStyle(em).color : null,
      emStyle: em ? getComputedStyle(em).fontStyle : null,
      emWeight: em ? getComputedStyle(em).fontWeight : null,
    };
  });
  findings.push({ vp: name, task: "5 Cambridge callout em", value: callout ? `text="${callout.emText}" color=${callout.emColor} italic=${callout.emStyle}/${callout.emWeight}` : "MISSING" });

  // ── TASK 6: team portrait links ────────────────────────────────
  const team = await page.evaluate(() => {
    const links = document.querySelectorAll("a[class*='hex-portrait-module'][class*='__frameLink']");
    return [...links].map((a) => ({ href: a.getAttribute("href"), target: a.getAttribute("target") }));
  });
  findings.push({ vp: name, task: "6 team portrait link count", value: `${team.length} (expect 8)` });
  findings.push({ vp: name, task: "6 first link href", value: team[0]?.href ?? "MISSING" });
  findings.push({ vp: name, task: "6 first link target", value: team[0]?.target ?? "MISSING" });

  // ── TASK 3c: devices lede weight ────────────────────────────────
  await page.goto(`${BASE}/devices`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const devicesLede = await page.evaluate(() => {
    const lede = document.querySelector("p[class*='subpage-module'][class*='__lede']");
    return lede ? getComputedStyle(lede).fontWeight : null;
  });
  findings.push({ vp: name, task: "3c devices lede weight", value: devicesLede ?? "MISSING" });

  // ── TASK 7: contact email fallback ────────────────────────────
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const fallback = await page.evaluate(() => {
    const el = document.querySelector("p[class*='contact-hero-module'][class*='__emailFallback']");
    const link = el?.querySelector("a");
    return el ? { text: el.textContent?.trim(), href: link?.getAttribute("href"), color: link ? getComputedStyle(link).color : null } : null;
  });
  findings.push({ vp: name, task: "7 email fallback", value: fallback ? `"${fallback.text}" → ${fallback.href}` : "MISSING" });

  // ── TASK 8: publications link on technology ───────────────────
  await page.goto(`${BASE}/technology`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const pubLink = await page.evaluate(() => {
    const links = [...document.querySelectorAll("a")];
    const pub = links.find((a) => /press#publications/.test(a.getAttribute("href") ?? ""));
    return pub ? { href: pub.getAttribute("href"), label: pub.textContent?.trim() } : null;
  });
  findings.push({ vp: name, task: "8 tech publications link", value: pubLink ? `"${pubLink.label}" → ${pubLink.href}` : "MISSING" });

  // ── TASK 8: anchor exists on press page ──────────────────────
  await page.goto(`${BASE}/press#publications`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const anchor = await page.evaluate(() => {
    const el = document.getElementById("publications");
    return el ? { tag: el.tagName, classes: el.className.slice(0, 60) } : null;
  });
  findings.push({ vp: name, task: "8 press publications anchor", value: anchor ? `${anchor.tag} class~=${anchor.classes}` : "MISSING" });

  // ── TASK 9: StackEntry on press page ──────────────────────
  await page.goto(`${BASE}/press`, { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  const stack = await page.evaluate(() => {
    const wraps = document.querySelectorAll("[class*='stack-entry-module'][class*='__wrap']");
    return wraps.length;
  });
  findings.push({ vp: name, task: "9 press StackEntry count", value: `${stack} wraps` });

  if (consoleErrors.length > 0) {
    findings.push({ vp: name, task: "console errors", value: consoleErrors.join(" | ") });
  }

  await ctx.close();
}

await run({ name: "1280", width: 1280, height: 900 });
await run({ name: "375", width: 375, height: 812 });

await browser.close();

// Report
const grouped = {};
for (const f of findings) {
  if (!grouped[f.task]) grouped[f.task] = {};
  grouped[f.task][f.vp] = f.value;
}
console.log("\n═════ CROSS-CUTTING TASK VERIFICATION ═════");
for (const [task, vps] of Object.entries(grouped)) {
  console.log(`\n[${task}]`);
  for (const [vp, val] of Object.entries(vps)) {
    console.log(`  ${vp}: ${val}`);
  }
}
console.log(`\nScreenshots → ${OUT}`);

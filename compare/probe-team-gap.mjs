import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const probe = await page.evaluate(() => {
  const cambridge = document.querySelector('[class*="cambridge-section_module__"][class*="__section"], [class*="cambridge-section-module__"][class*="__section"]');
  const team = document.querySelector('[class*="team-section_module__"][class*="__section"], [class*="team-section-module__"][class*="__section"]');
  if (!cambridge || !team) return { error: "missing", cambridge: !!cambridge, team: !!team };

  const r = (el) => {
    const b = el.getBoundingClientRect();
    return { top: b.top.toFixed(1), bottom: b.bottom.toFixed(1) };
  };
  const cs = (el, ...p) => {
    const c = getComputedStyle(el);
    return Object.fromEntries(p.map(k => [k, c[k]]));
  };

  return {
    cambridge: { rect: r(cambridge), ...cs(cambridge, "marginTop", "marginBottom") },
    team:      { rect: r(team),      ...cs(team,      "marginTop", "marginBottom") },
    gap: (parseFloat(team.getBoundingClientRect().top) - parseFloat(cambridge.getBoundingClientRect().bottom)).toFixed(1),
  };
});

console.log(JSON.stringify(probe, null, 2));
await browser.close();

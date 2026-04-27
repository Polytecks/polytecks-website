/**
 * Smoke test for the April 2026 redesign.
 *
 * For each route:
 *   - Capture console errors and page errors
 *   - Take desktop (1440x900) + mobile (414x900) full-page screenshots
 *   - Run page-specific assertions for redesign changes
 *
 * Usage: assumes the Next.js dev server is running at http://localhost:3000.
 *   node compare/smoke-redesign.mjs
 *
 * Output:
 *   compare/screenshots-redesign/<route>-<viewport>.png
 *   compare/smoke-redesign-report.json
 *   stdout: pass/fail summary
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:3000";
const OUT = "compare/screenshots-redesign";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", w: 1440, h: 900 },
  { name: "mobile",  w: 414,  h: 900 },
];

/** @type {{ route: string, name: string, assertions: (page: import("playwright").Page) => Promise<{ name: string, pass: boolean, detail?: string }[]> }[]} */
const ROUTES = [
  {
    route: "/",
    name: "home",
    assertions: async (page) => {
      const checks = [];
      // Blinking R&D Cambridge UK eyebrow should be GONE
      const eyebrowGone = await page.locator('text=/R&D.*Cambridge UK/').count() === 0;
      checks.push({ name: "blinking R&D Cambridge UK eyebrow removed", pass: eyebrowGone });
      // Mission panel meta strip "Cambridge, UK / Founded 2024" should be GONE
      const metaGone = await page.locator('text=/Founded 2024/').count() === 0;
      checks.push({ name: "mission meta 'Founded 2024' removed", pass: metaGone });
      // Footer should be present (look for copyright)
      const footerPresent = await page.locator('text=/© 2026 Polytecks Ltd/').count() > 0;
      checks.push({ name: "footer copyright present", pass: footerPresent });
      // Affiliations ribbon label updated
      const affiliationsLabel = await page.locator('text="Affiliations and Partners"').count() > 0;
      checks.push({ name: "ribbon renamed to 'Affiliations and Partners'", pass: affiliationsLabel });
      // Mission team-tease universities — check for the <img alt="..."> rendered
      // by <UniversityMark> (works whether SVG loads or text-fallback fires).
      const altCambridge = await page.locator('img[alt="Cambridge"]').count() > 0;
      const altImperial = await page.locator('img[alt="Imperial"]').count() > 0;
      const altDurham = await page.locator('img[alt="Durham"]').count() > 0;
      const altUcl = await page.locator('img[alt="UCL"]').count() > 0;
      // Fallback: if SVG 404s, UniversityMark renders a <span> with the name.
      const fbCambridge = altCambridge || await page.locator('span:text-is("Cambridge")').count() > 0;
      const fbImperial = altImperial || await page.locator('span:text-is("Imperial")').count() > 0;
      const fbDurham = altDurham || await page.locator('span:text-is("Durham")').count() > 0;
      const fbUcl = altUcl || await page.locator('span:text-is("UCL")').count() > 0;
      checks.push({ name: "team-tease shows Cambridge/Imperial/Durham/UCL", pass: fbCambridge && fbImperial && fbDurham && fbUcl,
        detail: `cambridge=${fbCambridge} imperial=${fbImperial} durham=${fbDurham} ucl=${fbUcl}` });
      // Team headline tagline
      const teamHeadline = await page.locator('text=/world-leading researchers/').count() > 0;
      checks.push({ name: "team-tease headline present", pass: teamHeadline });
      return checks;
    },
  },
  {
    route: "/about",
    name: "about",
    assertions: async (page) => {
      const checks = [];
      // New Cambridge heading
      const newHeading = await page.locator('text=/From Origins at the/').count() > 0;
      checks.push({ name: "new Cambridge heading 'From Origins at the University of Cambridge'", pass: newHeading });
      // Old heading "From Cambridge origins" should be GONE
      const oldHeading = await page.locator('text="From Cambridge origins"').count() === 0;
      checks.push({ name: "old 'From Cambridge origins' heading removed", pass: oldHeading });
      // Intro paragraph (founding team)
      const intro = await page.locator('text=/founding team met while studying at Cambridge/').count() > 0;
      checks.push({ name: "intro paragraph promoted (founding team)", pass: intro });
      // ECG badge with new text
      const badge = await page.locator('text=/The ECG was born in Cambridge over a century ago/').count() > 0;
      checks.push({ name: "ECG callout badge present with new copy", pass: badge });
      // Old meta strip should be GONE
      const oldMeta = await page.locator('text="ECG Legacy"').count() === 0;
      checks.push({ name: "old 'ECG Legacy 100+ years' meta removed", pass: oldMeta });
      // Footer
      const footer = await page.locator('text=/© 2026 Polytecks Ltd/').count() > 0;
      checks.push({ name: "footer present", pass: footer });
      // #team anchor exists
      const teamAnchor = await page.locator('#team').count() > 0;
      checks.push({ name: "#team anchor on team section", pass: teamAnchor });
      return checks;
    },
  },
  {
    route: "/technology",
    name: "technology",
    assertions: async (page) => {
      const checks = [];
      // Hero title changed to Mosaic Platform
      const mosaicTitle = await page.locator('text=/The Mosaic.*Platform/').count() > 0;
      checks.push({ name: "hero title 'The Mosaic™ Platform'", pass: mosaicTitle });
      // Old hero title gone
      const oldHero = await page.locator('text="The electrode, reinvented"').count() === 0;
      checks.push({ name: "old 'electrode, reinvented' title removed", pass: oldHero });
      // Pillar section header promoted with new copy
      const pillarHeader = await page.locator('text=/Reimagined from first principles/').count() > 0;
      checks.push({ name: "pillar section header 'Reimagined from first principles'", pass: pillarHeader });
      // Old pillar lede gone
      const oldLede = await page.locator('text="Rebuilt from first principles."').count() === 0;
      checks.push({ name: "old 'Rebuilt from first principles' lede removed", pass: oldLede });
      // Proof section: should have a section with height significantly > viewport
      const proofOuterHeight = await page.evaluate(() => {
        // Look for the .outer of proof-section by finding a section with the
        // characteristic 300vh-ish height (3x viewport).
        const sections = Array.from(document.querySelectorAll('section'));
        const heights = sections.map(s => s.getBoundingClientRect().height);
        const maxHeight = Math.max(...heights);
        return { maxHeight, viewportHeight: window.innerHeight };
      });
      const proofPinned = proofOuterHeight.maxHeight > proofOuterHeight.viewportHeight * 2;
      checks.push({ name: "proof section is multi-viewport tall (pinned scroll)", pass: proofPinned,
        detail: `max section height: ${Math.round(proofOuterHeight.maxHeight)}px (viewport ${proofOuterHeight.viewportHeight}px)` });
      // Footer
      const footer = await page.locator('text=/© 2026 Polytecks Ltd/').count() > 0;
      checks.push({ name: "footer present", pass: footer });
      return checks;
    },
  },
  {
    route: "/devices",
    name: "devices",
    assertions: async (page) => {
      const checks = [];
      const footer = await page.locator('text=/© 2026 Polytecks Ltd/').count() > 0;
      checks.push({ name: "footer present", pass: footer });
      return checks;
    },
  },
  {
    route: "/careers",
    name: "careers",
    assertions: async (page) => {
      const checks = [];
      const footer = await page.locator('text=/© 2026 Polytecks Ltd/').count() > 0;
      checks.push({ name: "footer present", pass: footer });
      return checks;
    },
  },
  {
    route: "/contact",
    name: "contact",
    assertions: async (page) => {
      const checks = [];
      const footer = await page.locator('text=/© 2026 Polytecks Ltd/').count() > 0;
      checks.push({ name: "footer present", pass: footer });
      return checks;
    },
  },
  {
    route: "/privacy",
    name: "privacy",
    assertions: async (page) => {
      const checks = [];
      const heading = await page.locator('text="Privacy Policy"').count() > 0;
      checks.push({ name: "Privacy Policy heading renders", pass: heading });
      const lede = await page.locator('text="Coming soon."').count() > 0;
      checks.push({ name: "'Coming soon.' lede renders", pass: lede });
      return checks;
    },
  },
  {
    route: "/terms",
    name: "terms",
    assertions: async (page) => {
      const checks = [];
      const heading = await page.locator('text="Terms of Service"').count() > 0;
      checks.push({ name: "Terms of Service heading renders", pass: heading });
      return checks;
    },
  },
];

const browser = await chromium.launch();
const report = {
  base: BASE,
  routes: [],
  summary: { totalChecks: 0, passed: 0, failed: 0, consoleErrors: 0, pageErrors: 0 },
};

for (const r of ROUTES) {
  const routeReport = { route: r.route, viewports: {}, checks: [], consoleErrors: [], pageErrors: [] };
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    page.on("console", (m) => {
      if (m.type() === "error") routeReport.consoleErrors.push({ vp: vp.name, text: m.text() });
    });
    page.on("pageerror", (e) => routeReport.pageErrors.push({ vp: vp.name, text: String(e) }));

    try {
      await page.goto(`${BASE}${r.route}`, { waitUntil: "networkidle", timeout: 30000 });
      // Allow any mount-time animations to settle and effects to run.
      await page.waitForTimeout(1500);
      const screenshotPath = join(OUT, `${r.name}-${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      routeReport.viewports[vp.name] = screenshotPath;
      // Run assertions only on desktop pass to avoid double-counting.
      if (vp.name === "desktop") {
        routeReport.checks = await r.assertions(page);
      }
    } catch (e) {
      routeReport.pageErrors.push({ vp: vp.name, text: `navigation/render failed: ${e.message}` });
    }
    await ctx.close();
  }

  // Tally per-route results.
  for (const c of routeReport.checks) {
    report.summary.totalChecks++;
    if (c.pass) report.summary.passed++;
    else        report.summary.failed++;
  }
  report.summary.consoleErrors += routeReport.consoleErrors.length;
  report.summary.pageErrors += routeReport.pageErrors.length;

  report.routes.push(routeReport);

  // Per-route console output
  const passed = routeReport.checks.filter(c => c.pass).length;
  console.log(`\n${r.route}  (${passed}/${routeReport.checks.length} checks passed, ${routeReport.consoleErrors.length} console errors, ${routeReport.pageErrors.length} page errors)`);
  for (const c of routeReport.checks) {
    const mark = c.pass ? "  ✓" : "  ✗";
    const detail = c.detail ? ` — ${c.detail}` : "";
    console.log(`${mark} ${c.name}${detail}`);
  }
  for (const e of routeReport.consoleErrors) {
    console.log(`  ⚠ console (${e.vp}): ${e.text.slice(0, 200)}`);
  }
  for (const e of routeReport.pageErrors) {
    console.log(`  ✗ page error (${e.vp}): ${e.text.slice(0, 200)}`);
  }
}

await browser.close();

// Final summary + report file
writeFileSync(join("compare", "smoke-redesign-report.json"), JSON.stringify(report, null, 2));

console.log("\n=== SUMMARY ===");
console.log(`Routes:        ${report.routes.length}`);
console.log(`Checks:        ${report.summary.passed}/${report.summary.totalChecks} passed (${report.summary.failed} failed)`);
console.log(`Console err:   ${report.summary.consoleErrors}`);
console.log(`Page errors:   ${report.summary.pageErrors}`);
console.log(`\nScreenshots in ${OUT}/`);
console.log(`Full report: compare/smoke-redesign-report.json`);

if (report.summary.failed > 0 || report.summary.pageErrors > 0) {
  process.exit(1);
}

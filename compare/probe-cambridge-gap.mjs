import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/about?tweaks=1", { waitUntil: "networkidle" });

// Locate the cambridge title and the media, get their bounding boxes.
const probe = await page.evaluate(() => {
  const section = document.querySelector('[class*="cambridge-section_module__"][class*="__section"]') ||
                  document.querySelector('[class*="cambridge-section-module__"][class*="__section"]');
  const title = section?.querySelector('[class*="__title"]');
  const body = section?.querySelector('[class*="__body"]');
  const media = section?.querySelector('[class*="__media"]');
  const img = media?.querySelector('img');
  if (!title || !media || !img) return { error: "missing", section: !!section, title: !!title, media: !!media, img: !!img };

  const r = (el) => {
    const b = el.getBoundingClientRect();
    return { top: b.top.toFixed(1), bottom: b.bottom.toFixed(1), height: b.height.toFixed(1) };
  };
  const cs = (el, ...props) => {
    const c = getComputedStyle(el);
    return Object.fromEntries(props.map(p => [p, c[p]]));
  };

  return {
    section: { rect: r(section), ...cs(section, "marginTop", "marginBottom", "paddingTop") },
    title:   { rect: r(title),   ...cs(title, "marginTop", "marginBottom", "paddingTop", "paddingBottom") },
    body:    { rect: r(body),    ...cs(body, "marginTop", "paddingTop") },
    media:   { rect: r(media),   ...cs(media, "marginTop", "paddingTop") },
    img:     { rect: r(img),     ...cs(img, "marginTop") },
    titleToMediaGap: (parseFloat(media.getBoundingClientRect().top) - parseFloat(title.getBoundingClientRect().bottom)).toFixed(1),
    titleToImgGap:   (parseFloat(img.getBoundingClientRect().top)   - parseFloat(title.getBoundingClientRect().bottom)).toFixed(1),
  };
});

console.log(JSON.stringify(probe, null, 2));

// Scroll the title into view and screenshot the gap area.
await page.evaluate(() => {
  const t = document.querySelector('[class*="cambridge-section_module__"][class*="__title"]') ||
            document.querySelector('[class*="cambridge-section-module__"][class*="__title"]');
  t?.scrollIntoView({ block: "start" });
  window.scrollBy(0, -40);
});
await page.waitForTimeout(300);
await page.screenshot({ path: "compare/cambridge-title-gap.png", fullPage: false });
console.log("screenshot → compare/cambridge-title-gap.png");

await browser.close();

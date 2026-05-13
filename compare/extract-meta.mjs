/**
 * Extract Open Graph + meta tags from each fetched HTML file.
 * Logs a compact JSON object per article so we can review the data
 * before stamping it into press.ts.
 */
import { readFileSync } from "node:fs";

function extract(html) {
  const get = (re) => {
    const m = html.match(re);
    return m ? m[1].trim().replace(/\s+/g, " ") : undefined;
  };
  const decode = (s) =>
    s &&
    s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&#8217;/g, "’")
      .replace(/&#8216;/g, "‘")
      .replace(/&#8211;/g, "–")
      .replace(/&#8212;/g, "—");

  const ogTitle = decode(
    get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i),
  );
  const twitterTitle = decode(
    get(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i),
  );
  const pageTitle = decode(get(/<title>([^<]+)<\/title>/i));
  const ogDescription = decode(
    get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i),
  );
  const description = decode(
    get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i),
  );
  const ogSite = decode(
    get(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i),
  );
  const ogImage = decode(
    get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i),
  );
  const publishedTime = decode(
    get(
      /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
    ),
  );
  const datePublished = decode(
    get(/"datePublished"\s*:\s*"([^"]+)"/i),
  );
  const dateModified = decode(get(/"dateModified"\s*:\s*"([^"]+)"/i));

  return {
    title: ogTitle || twitterTitle || pageTitle,
    description: ogDescription || description,
    site: ogSite,
    image: ogImage,
    date: publishedTime || datePublished || dateModified,
  };
}

for (let i = 1; i <= 8; i++) {
  const html = readFileSync(`C:/Users/Calla/AppData/Local/Temp/press_fetch/${i}.html`, "utf-8");
  const data = extract(html);
  console.log(`--- ${i} ---`);
  console.log(JSON.stringify(data, null, 2));
}

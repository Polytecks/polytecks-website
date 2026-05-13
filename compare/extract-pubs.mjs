/**
 * Extract publication metadata from Crossref JSON for each DOI.
 * Logs a compact object we can stamp into press.ts.
 */
import { readFileSync } from "node:fs";

function fmtAuthors(authors = []) {
  return authors.map((a) => {
    const family = a.family || a.name || "";
    const given = (a.given || "").replace(/[^A-Za-z. -]/g, "").trim();
    const initials = given
      .split(/[\s-]+/)
      .filter(Boolean)
      .map((p) => p[0] + ".")
      .join(" ");
    return initials ? `${family} ${initials}` : family;
  });
}

function pick(json) {
  const m = json.message || {};
  const issued = m.issued?.["date-parts"]?.[0] || [];
  const year = issued[0];
  const journal =
    (m["container-title"] && m["container-title"][0]) ||
    (m["short-container-title"] && m["short-container-title"][0]) ||
    "";
  const volume = m.volume || "";
  const page = m.page || m["article-number"] || "";
  const title = (m.title && m.title[0]) || "";
  const authors = fmtAuthors(m.author);
  const doi = m.DOI || m.doi || "";
  return { title, authors, journal, volume, page, year, doi };
}

for (let i = 1; i <= 4; i++) {
  const path = `C:/Users/Calla/AppData/Local/Temp/pub_fetch/${i}.json`;
  let raw;
  try {
    raw = readFileSync(path, "utf-8");
  } catch {
    console.log(`--- ${i} --- (no file)`);
    continue;
  }
  if (raw.length < 100) {
    console.log(`--- ${i} ---`);
    console.log("error:", raw);
    continue;
  }
  const data = pick(JSON.parse(raw));
  console.log(`--- ${i} ---`);
  console.log(JSON.stringify(data, null, 2));
}

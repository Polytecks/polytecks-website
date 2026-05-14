// Image audit + optimizer.
//
// Walks /public/assets, reports dimensions + filesize for each image,
// and flags candidates for re-encoding. Pass `--apply` to actually
// rewrite the files (backups saved to /public/assets/_orig).
//
// Rules (only applied when --apply is set):
//   - JPEG > 400 KB           → re-encode mozjpeg q=82, max 2400 px wide.
//   - PNG > 400 KB, no alpha  → convert to JPEG mozjpeg q=82, max 2400 px wide.
//                               (Original PNG stays in _orig backup.)
//   - PNG > 300 KB, with alpha → palette-quantize (lossless to the eye for
//                               flat graphics; sharp uses libimagequant).
//                               max 2400 px wide.
//   - WebP                    → leave alone (already efficient).
//   - SVG                     → leave alone.
//
// We never overwrite the existing extension. Converted JPGs keep their
// original .png path so the import paths in source stay valid; sharp's
// jpeg() encoder is invoked on a .png filename which is fine — the file
// is binary JPEG regardless of extension. Browsers sniff content type.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "public/assets");
const BACKUP = path.join(ROOT, "_orig");
const APPLY = process.argv.includes("--apply");

const MAX_WIDTH = 2400;
const JPEG_QUALITY = 82;
const PNG_ALPHA_QUALITY = 80;

const JPEG_BYTE_LIMIT = 400 * 1024;
const PNG_NO_ALPHA_LIMIT = 400 * 1024;
const PNG_ALPHA_LIMIT = 300 * 1024;

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_orig") continue;
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

const totals = { before: 0, after: 0, files: 0, changed: 0 };
const rows = [];

if (APPLY) {
  await fs.mkdir(BACKUP, { recursive: true });
}

for await (const file of walk(ROOT)) {
  const ext = path.extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) continue;

  const buf = await fs.readFile(file);
  totals.before += buf.length;
  totals.files++;

  let meta;
  try {
    meta = await sharp(buf).metadata();
  } catch (e) {
    rows.push({ file, note: `cannot read: ${e.message}` });
    continue;
  }

  const hasAlpha = meta.hasAlpha === true;
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  let action = "keep";
  let targetBuf = null;

  if (ext === ".jpg" || ext === ".jpeg") {
    if (buf.length > JPEG_BYTE_LIMIT) {
      action = `jpeg→jpeg q${JPEG_QUALITY}${w > MAX_WIDTH ? ` resize→${MAX_WIDTH}` : ""}`;
      if (APPLY) {
        let pipe = sharp(buf);
        if (w > MAX_WIDTH) pipe = pipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
        targetBuf = await pipe.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
      }
    }
  } else if (ext === ".png") {
    if (!hasAlpha && buf.length > PNG_NO_ALPHA_LIMIT) {
      action = `png(no-alpha)→jpeg q${JPEG_QUALITY}${w > MAX_WIDTH ? ` resize→${MAX_WIDTH}` : ""}`;
      if (APPLY) {
        let pipe = sharp(buf).flatten({ background: "#000000" });
        if (w > MAX_WIDTH) pipe = pipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
        targetBuf = await pipe.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
      }
    } else if (hasAlpha && buf.length > PNG_ALPHA_LIMIT) {
      action = `png(alpha)→png palette q${PNG_ALPHA_QUALITY}${w > MAX_WIDTH ? ` resize→${MAX_WIDTH}` : ""}`;
      if (APPLY) {
        let pipe = sharp(buf);
        if (w > MAX_WIDTH) pipe = pipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
        targetBuf = await pipe.png({ palette: true, quality: PNG_ALPHA_QUALITY, compressionLevel: 9, effort: 10 }).toBuffer();
      }
    }
  } else if (ext === ".webp") {
    // leave alone
  }

  let after = buf.length;
  if (targetBuf && targetBuf.length < buf.length) {
    const backupPath = path.join(BACKUP, path.relative(ROOT, file));
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(file, backupPath);
    await fs.writeFile(file, targetBuf);
    after = targetBuf.length;
    totals.changed++;
  } else if (targetBuf) {
    action += " (skipped: would grow)";
  }

  totals.after += after;

  rows.push({
    file: path.relative(ROOT, file),
    dims: `${w}×${h}${hasAlpha ? "α" : ""}`,
    size: fmtBytes(buf.length),
    after: APPLY && targetBuf && targetBuf.length < buf.length ? fmtBytes(after) : "",
    action,
  });
}

rows.sort((a, b) => parseInt(b.size) - parseInt(a.size));
for (const r of rows) {
  if (r.action === "keep") continue;
  const arrow = r.after ? ` → ${r.after}` : "";
  console.log(`${r.file.padEnd(50)} ${r.dims.padEnd(14)} ${r.size}${arrow}  [${r.action}]`);
}

console.log("");
console.log(`Files scanned:  ${totals.files}`);
console.log(`Files rewrote:  ${totals.changed}`);
console.log(`Bytes before:   ${fmtBytes(totals.before)}`);
console.log(`Bytes after:    ${fmtBytes(totals.after)}`);
console.log(`Savings:        ${fmtBytes(totals.before - totals.after)}`);
console.log(`Mode:           ${APPLY ? "APPLY (originals copied to _orig/)" : "DRY RUN — pass --apply to rewrite"}`);

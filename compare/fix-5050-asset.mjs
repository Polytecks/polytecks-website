// The source `afil_5050 (1).png` has a solid off-white background with the
// "50" rendered as transparent holes — designed for a light page bg. On our
// dark ribbon it renders as a near-white rectangle with dark holes (the
// page bg showing through). Invert: opaque white "50" on transparent bg.
import sharp from "sharp";

const src = "public/assets/afil_5050 (1).png";
const dst = "public/assets/afil_5050.png";

const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(data.length);
// For each pixel: force RGB to white, invert alpha (transparent ↔ opaque).
// The source's "50" pixels have alpha 0 (after inversion → 255, opaque white).
// The source's off-white bg has alpha 255 (after inversion → 0, transparent).
for (let i = 0; i < data.length; i += 4) {
  out[i] = 255;
  out[i + 1] = 255;
  out[i + 2] = 255;
  out[i + 3] = 255 - data[i + 3];
}
await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(dst);
console.log("wrote", dst);

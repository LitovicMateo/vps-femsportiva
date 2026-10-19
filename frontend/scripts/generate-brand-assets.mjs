// Generates raster brand assets (publisher logo, PWA/app icons, default OG
// image) from the SVG sources. Run manually after the logo changes:
//   node scripts/generate-brand-assets.mjs
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const BRAND = "#ff0099";
const INK = "#15171a";
const read = (p) => readFile(new URL(`../${p}`, import.meta.url));

const wordmark = await read("public/logo-wordmark.svg");
const wordmarkDark = await read("public/logo-wordmark-dark.svg");
const icon = await read("app/icon.svg");


// sharp needs a Buffer for composite input, so render the SVG first.
function await_(svg, box) {
  return sharp(svg, { density: 300 })
    .resize(box, box, { fit: "inside" })
    .png()
    .toBuffer();
}

async function square(svg, size, pad, file) {
  const input = await await_(svg, size - pad * 2);
  await sharp({
    create: { width: size, height: size, channels: 4, background: "#ffffff" },
  })
    .composite([{ input, gravity: "centre" }])
    .png()
    .toFile(new URL(`../${file}`, import.meta.url).pathname);
}

await square(wordmark, 512, 56, "public/logo-square.png");
await square(icon, 512, 64, "public/icon-512.png");
await square(icon, 192, 24, "public/icon-192.png");
await square(icon, 180, 22, "app/apple-icon.png");

const logo = await sharp(wordmarkDark, { density: 300 })
  .resize(420, 420, { fit: "inside" })
  .png()
  .toBuffer();
await sharp({
  create: { width: 1200, height: 630, channels: 4, background: INK },
})
  .composite([
    { input: logo, gravity: "centre" },
    {
      input: Buffer.from(
        `<svg width="1200" height="14" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="14" fill="${BRAND}"/></svg>`,
      ),
      top: 616,
      left: 0,
    },
  ])
  .png()
  .toFile(new URL("../public/og-default.png", import.meta.url).pathname);

console.log("brand assets generated");

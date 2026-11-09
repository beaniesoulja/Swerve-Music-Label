import { readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Card-sized delivery variants for the event archive. Originals stay untouched
// and keep serving the zoomed lightbox view.
const dir = new URL("../public/culture/live-n-loud/", import.meta.url);
const files = (await readdir(dir)).filter((name) => /^\d+\.jpg$/.test(name)).sort();
let before = 0;
let after = 0;
for (const name of files) {
  const input = fileURLToPath(new URL(name, dir));
  const output = fileURLToPath(new URL(name.replace(/\.jpg$/, "-480.webp"), dir));
  const result = await sharp(input).rotate().resize({ width: 480, withoutEnlargement: true }).webp({ quality: 78 }).toFile(output);
  before += (await stat(input)).size;
  after += result.size;
}
console.log(`${files.length} gallery images: ${(before / 1048576).toFixed(1)} MB JPEG -> ${(after / 1048576).toFixed(1)} MB WebP`);

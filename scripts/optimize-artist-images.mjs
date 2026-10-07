import sharp from "sharp";
import { fileURLToPath } from "node:url";

// Reproducible delivery variants. Preserve the supplied originals untouched.
const names = ["primary-studio", "studio-full-body", "interview-microphone", "culture-event", "travel-pyramid"];
for (const name of names) {
  const input = fileURLToPath(new URL(`../public/artist/beanie-soulja/${name}.jpg`, import.meta.url));
  for (const width of [480, 900, 1200]) {
    const output = fileURLToPath(new URL(`../public/artist/beanie-soulja/${name}-${width}.webp`, import.meta.url));
    const result = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(output);
    console.log(`${name}-${width}.webp: ${result.width} x ${result.height}, ${result.size} bytes`);
  }
}

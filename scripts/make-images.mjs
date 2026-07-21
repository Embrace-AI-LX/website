/**
 * Regenerates the derived brand assets:
 *   src/assets/embrace-ai-mark.png  brain only, tinted into the brand gradient
 *                                  so it reads on the dark canvas
 *   public/og.png                   social card
 *   public/apple-touch-icon.png
 *
 * One-off: run `npm run images` after changing the logo or the tagline. All
 * outputs are committed, so a CI build never needs to run this.
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOGO = join(ROOT, 'src', 'assets', 'embrace-ai-logo.png');
const MARK = join(ROOT, 'src', 'assets', 'embrace-ai-mark.png');
const OUT = join(ROOT, 'public');

// --- brain-only mark ---------------------------------------------------------
// The source lockup is brain-over-wordmark; at nav size the wordmark turns to
// mush, so crop to the brain and recolour it via its own alpha as a mask.
{
  const source = await sharp(await readFile(LOGO)).ensureAlpha().png().toBuffer();
  const { width, height } = await sharp(source).metadata();
  const brain = await sharp(
    await sharp(source)
      .extract({ left: 0, top: 0, width, height: Math.floor(height * 0.62) })
      .png()
      .toBuffer(),
  )
    .trim({ threshold: 2 })
    .png()
    .toBuffer();

  const { width: w, height: h } = await sharp(brain).metadata();
  const gradient = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stop-color="#5B8DEF"/>
        <stop offset="55%" stop-color="#8AA7F5"/>
        <stop offset="100%" stop-color="#C08BFA"/>
      </linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
    </svg>`,
  );
  await writeFile(
    MARK,
    await sharp(gradient).composite([{ input: brain, blend: 'dest-in' }]).png().toBuffer(),
  );
}

const backdrop = (w, h) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <radialGradient id="a" cx="12%" cy="0%" r="70%">
      <stop offset="0%" stop-color="#403CCF" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#403CCF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="92%" cy="8%" r="65%">
      <stop offset="0%" stop-color="#A855F7" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#A855F7" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#06090F"/>
  <rect width="${w}" height="${h}" fill="url(#a)"/>
  <rect width="${w}" height="${h}" fill="url(#b)"/>
</svg>`;

const ogText = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#5B8DEF"/>
      <stop offset="100%" stop-color="#A855F7"/>
    </linearGradient>
  </defs>
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif">
    <text x="80" y="150" font-size="21" letter-spacing="4.5" fill="#5F6B83">
      // LISBON · MONTHLY SINCE 2025 · NON-PROFIT
    </text>
    <text x="78" y="290" font-size="94" font-weight="700" fill="#E9EDF6">Lisbon's expert</text>
    <text x="78" y="392" font-size="94" font-weight="700" fill="url(#g)">AI community.</text>
    <text x="80" y="470" font-size="30" fill="#939DB4">
      Free, expert-led AI meetups. No product pitches, no hype.
    </text>
    <rect x="80" y="529" width="1040" height="1" fill="#E9EDF6" opacity="0.13"/>
    <text x="80" y="578" font-size="25" letter-spacing="1" fill="#939DB4">
      1,045 members  ·  4.7★  ·  10+ meetups  ·  embrace-ai.org
    </text>
  </g>
</svg>`;

const og = await sharp(Buffer.from(backdrop(1200, 630)))
  .composite([
    { input: await sharp(LOGO).resize({ height: 190 }).png().toBuffer(), top: 62, left: 950 },
    { input: Buffer.from(ogText), top: 0, left: 0 },
  ])
  .png()
  .toBuffer();
await sharp(og).toFile(join(OUT, 'og.png'));

await sharp(Buffer.from(backdrop(180, 180)))
  .composite([{ input: await sharp(LOGO).resize({ width: 132 }).png().toBuffer(), gravity: 'center' }])
  .png()
  .toFile(join(OUT, 'apple-touch-icon.png'));

console.log('[make-images] wrote public/og.png and public/apple-touch-icon.png');

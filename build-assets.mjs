/**
 * ===========================================================================
 * BRAND ASSETS  —  node scripts/build-assets.mjs
 * ---------------------------------------------------------------------------
 * Generates every static asset that has to be an image, from code only:
 * no stock photo, no external service, no manual design tool.
 *
 *   public/favicon.svg         vector mark (also copied as favicon.ico source)
 *   public/og-default.png      1200×630 social preview (sharp + SVG)
 *
 * Run with `npm run assets:build`. Output is committed, so a normal
 * `npm run build` does not need this script.
 * ===========================================================================
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const publicDir = path.join(root, 'public');

/* Read the brand name without importing TypeScript at runtime. */
const configSource = await readFile(path.join(root, 'src', 'config', 'site.ts'), 'utf8');
const brand = configSource.match(/brand:\s*'([^']+)'/)?.[1] ?? 'Vitrine Studio';
const tagline =
  configSource.match(/tagline:\s*\n?\s*'([^']+)'/)?.[1] ?? 'Sites & applications sur mesure.';

/* ------------------------------------------------------------------------ */
/* 1. Favicon                                                               */
/* ------------------------------------------------------------------------ */

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="${brand}">
  <rect width="32" height="32" rx="7" fill="#0a0b0d"/>
  <rect x="1.5" y="1.5" width="29" height="29" rx="6" fill="none" stroke="#ff6a3c" stroke-opacity=".55" stroke-width="1.5"/>
  <g fill="none" stroke="#ff6a3c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11.5 11.5 7 16l4.5 4.5"/>
    <path d="M20.5 11.5 25 16l-4.5 4.5"/>
    <path d="M17.6 9.5 14.4 22.5"/>
  </g>
</svg>
`;

/* ------------------------------------------------------------------------ */
/* 2. Social preview (Open Graph / Twitter)                                */
/* ------------------------------------------------------------------------ */

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="a" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff6a3c" stop-opacity=".55"/>
      <stop offset="100%" stop-color="#ff6a3c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#5fe3c0" stop-opacity=".35"/>
      <stop offset="100%" stop-color="#5fe3c0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="text" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#edeef0"/>
      <stop offset="100%" stop-color="#ffb59c"/>
    </linearGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff6a3c"/>
      <stop offset="100%" stop-color="#5fe3c0"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="#0a0b0d"/>
  <circle cx="1010" cy="90" r="420" fill="url(#a)"/>
  <circle cx="150" cy="580" r="360" fill="url(#b)"/>

  <g opacity=".14" stroke="#edeef0" stroke-width="1">
    ${Array.from({ length: 13 }, (_, i) => `<line x1="0" y1="${40 + i * 48}" x2="1200" y2="${40 + i * 48}"/>`).join('\n    ')}
  </g>

  <g transform="translate(80 92)">
    <rect width="56" height="56" rx="12" fill="#ff6a3c"/>
    <g fill="none" stroke="#1a0a03" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 19 13 28l6 9"/>
      <path d="M37 19l6 9-6 9"/>
      <path d="M32 15 24 41"/>
    </g>
    <text x="76" y="40" font-family="Segoe UI, Inter, sans-serif" font-size="30" font-weight="700" fill="#edeef0">${brand}</text>
  </g>

  <text x="80" y="300" font-family="Segoe UI, Inter, sans-serif" font-size="72" font-weight="700" fill="url(#text)">Sites &amp; applications</text>
  <text x="80" y="386" font-family="Segoe UI, Inter, sans-serif" font-size="72" font-weight="700" fill="#ff6a3c">sur mesure.</text>

  <rect x="80" y="440" width="240" height="4" rx="2" fill="url(#rule)"/>

  <text x="80" y="510" font-family="Segoe UI, Inter, sans-serif" font-size="30" fill="#a8afb9">Développement web · Applications métier · Automatisation</text>
  <text x="80" y="562" font-family="Consolas, ui-monospace, monospace" font-size="22" fill="#8b939e">// le code et le domaine vous appartiennent</text>
</svg>
`;

/* ------------------------------------------------------------------------ */

await mkdir(publicDir, { recursive: true });

await writeFile(path.join(publicDir, 'favicon.svg'), favicon, 'utf8');
console.log('✓ public/favicon.svg');

if (existsSync(path.join(root, 'node_modules', 'sharp'))) {
  await sharp(Buffer.from(ogSvg)).png({ quality: 92, compressionLevel: 9 }).toFile(path.join(publicDir, 'og-default.png'));
  console.log('✓ public/og-default.png');
} else {
  console.warn('! sharp is not installed — skipped public/og-default.png');
}

console.log(`\nBrand: ${brand}`);
console.log(`Tagline: ${tagline}`);
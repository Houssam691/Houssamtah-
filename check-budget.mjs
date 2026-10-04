/**
 * ===========================================================================
 * WEIGHT, BUDGET AND SECRET SCAN  —  node scripts/check-budget.mjs
 * ---------------------------------------------------------------------------
 * Runs on `dist/` after a build. Two jobs:
 *
 *   1. Keep the first visit small. Text assets are measured gzipped, because
 *      that is what crosses the wire; fonts and images are measured raw,
 *      because they are already compressed and gzip buys them nothing.
 *   2. Fail on anything that looks like a leaked secret, on a committed .env,
 *      or on a build that still points at a local path or a source map.
 *
 * Thresholds are deliberately generous: they exist to catch a regression
 * (a font added by accident, a script that imports a framework), not to
 * enforce a number nobody re-checks.
 * ===========================================================================
 */
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const failures = [];
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

/* ==========================================================================
   1. INVENTORY
   ========================================================================== */

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push({ path: full, rel: path.relative(dist, full), size: statSync(full).size, ext: path.extname(entry.name) });
  }
})(dist);

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.xml', '.webmanifest', '.txt', '.svg', '.json']);
const wire = (file) => (COMPRESSIBLE.has(file.ext) ? gzipSync(readFileSync(file.path)).length : file.size);

console.log('=========================================================================');
console.log(` BUILD OUTPUT — ${files.length} files, ${kb(files.reduce((s, f) => s + f.size, 0))} raw`);
console.log('=========================================================================\n');

const byExt = new Map();
for (const file of files) {
  const bucket = byExt.get(file.ext) ?? { count: 0, raw: 0, wire: 0 };
  bucket.count++;
  bucket.raw += file.size;
  bucket.wire += wire(file);
  byExt.set(file.ext, bucket);
}
console.log('  type        files        raw      over the wire');
for (const [ext, bucket] of [...byExt].sort((a, b) => b[1].raw - a[1].raw)) {
  console.log(
    `  ${(ext || '(none)').padEnd(10)} ${String(bucket.count).padStart(5)} ${kb(bucket.raw).padStart(10)} ${kb(bucket.wire).padStart(16)}`,
  );
}

/* ==========================================================================
   2. FIRST VISIT
   ==========================================================================
   Every sub-resource the home page actually asks for: the document, its
   stylesheet, its scripts, its preloaded fonts, the icon and the manifest.
   `sitemap-index.xml` is in the list because the head links it.
   ========================================================================== */

const home = readFileSync(path.join(dist, 'index.html'), 'utf8');
const refs = [
  ...new Set([...home.matchAll(/(?:src|href)="\/(?!mailto:|tel:|#)([^"]+)"/g)].map((m) => m[1])),
].filter((ref) => !ref.endsWith('.html') && !ref.endsWith('/') && !ref.endsWith('.xml'));

const missing = refs.filter((ref) => !existsSync(path.join(dist, ref)));
check('every asset referenced by / exists in dist', missing.length === 0, missing.join(', '));

const firstVisit = [{ rel: 'index.html', size: statSync(path.join(dist, 'index.html')).size, ext: '.html', path: path.join(dist, 'index.html') }].concat(
  refs.filter((ref) => existsSync(path.join(dist, ref))).map((ref) => {
    const full = path.join(dist, ref);
    return { rel: ref, size: statSync(full).size, ext: path.extname(ref), path: full };
  }),
);

console.log('\n  first visit to /');
for (const file of firstVisit) {
  console.log(`    ${kb(file.size).padStart(9)} ${kb(wire(file)).padStart(9)} over the wire  ${file.rel}`);
}
const firstVisitWire = firstVisit.reduce((sum, file) => sum + wire(file), 0);
console.log(`    ${kb(firstVisit.reduce((s, f) => s + f.size, 0)).padStart(9)} ${kb(firstVisitWire).padStart(9)} over the wire  TOTAL`);

check('first visit under 150 KB over the wire', firstVisitWire < 150 * 1024, kb(firstVisitWire));
check('no single font above 60 KB', !files.some((f) => f.ext === '.woff2' && f.size > 60 * 1024), files.filter((f) => f.ext === '.woff2' && f.size > 60 * 1024).map((f) => f.rel).join(', '));
check('at most two fonts preloaded', (home.match(/rel="preload"[^>]*as="font"/g) ?? []).length <= 2, String((home.match(/rel="preload"[^>]*as="font"/g) ?? []).length));

/* ==========================================================================
   2b. FONTS
   --------------------------------------------------------------------------
   The `latin` subsets are declared by hand in `src/styles/global.css`, so a
   mistake there is invisible in the output: a missing `@font-face` still
   builds, still preloads, and simply falls back to Arial at runtime. These
   checks tie the three lists together — the faces the CSS declares, the files
   `dist/` actually contains, and the fonts the HTML preloads.
   ========================================================================== */

const cssFiles = files.filter((f) => f.ext === '.css');
const css = cssFiles.map((f) => readFileSync(f.path, 'utf8')).join('\n');
const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
const familyOf = (block) => (block.match(/font-family:\s*([^;]+)/) ?? [])[1]?.replace(/["']/g, '').trim();

/* A webfont is a face with a `url()` src. A metric override declares the same
   family with `src: local(...)`; Tailwind generates those for every webfont so
   the fallback has identical metrics. Both count as "declared". */
const webfonts = faces.filter((block) => /src:[^;]*url\(/.test(block));
const overrides = faces.filter((block) => /src:[^;]*local\(/.test(block));
const declared = new Set([...webfonts, ...overrides].map(familyOf));
const webfontFiles = webfonts.map((block) => ((block.match(/url\(([^)?]+)/) ?? [])[1] ?? '').split('/').pop());

console.log(`\n  @font-face with a file : ${webfonts.map(familyOf).join(' | ')}`);
console.log(`  @font-face local only  : ${overrides.map(familyOf).join(' | ')}`);
check('both webfonts are declared with a real file', webfonts.length >= 2, `${webfonts.length} downloadable @font-face`);

/* The families the site actually asks for: the theme tokens and the utilities.
   Generic keywords, `var()` references and plain system stacks are skipped —
   they are supposed to resolve without a declaration. */
const SYSTEM = /^(ui-[a-z-]+|system-ui|-apple-system|BlinkMacSystemFont|Segoe UI( Mono| Emoji| Symbol)?|Roboto|Helvetica Neue|Helvetica|Arial|Noto Sans( Arabic| Devanagari| Greek| Hebrew| JP| KR| SC| TC)?|Apple Color Emoji|Noto Color Emoji|sans-serif|serif|monospace|inherit|initial|unset|courier new|liberation mono|liberation sans|menlo|monaco|consolas|sfmono-regular|cascadia mono|andale mono|times new roman)$/i;
const used = new Set();
for (const block of [...css.matchAll(/--font-(?:sans|display|mono):([^;}]+)/g), ...css.matchAll(/\.font-display\{font-family:([^}]+)\}/g)]) {
  for (const name of block[1].split(',')) {
    const clean = name.replace(/["']/g, '').trim();
    if (!clean || clean.startsWith('var(') || SYSTEM.test(clean)) continue;
    used.add(clean);
  }
}
const undeclaredFamilies = [...used].filter((name) => !declared.has(name));
check('every webfont the theme asks for is declared', undeclaredFamilies.length === 0, undeclaredFamilies.join(', '));

/* every preloaded font must be referenced by a declared face */
const preloaded = [...home.matchAll(/rel="preload"[^>]*href="\/[^"]*\/([^/"]+\.woff2)"/g)].map((m) => m[1]);
const orphanPreloads = preloaded.filter((file) => !webfontFiles.includes(file));
check('every preloaded font is declared in the stylesheet', orphanPreloads.length === 0, orphanPreloads.join(', '));

/* no font in dist that the stylesheet does not reference */
const distFonts = files.filter((f) => f.ext === '.woff2').map((f) => f.rel.split(/[\\/]/).pop());
const orphans = distFonts.filter((file) => !webfontFiles.includes(file));
check('no font file in dist is undeclared', orphans.length === 0, orphans.join(', '));

/* ==========================================================================
   3. PER-PAGE BUDGET
   ========================================================================== */

const PAGES = [
  { ext: '.html', label: 'an HTML page', wire: 15 * 1024 },
  { ext: '.css', label: 'a stylesheet', wire: 20 * 1024 },
  { ext: '.js', label: 'a script', wire: 10 * 1024 },
  { ext: '.png', label: 'a PNG', wire: 200 * 1024 },
];
for (const { ext, label, wire: limit } of PAGES) {
  const heavy = files.filter((f) => f.ext === ext && wire(f) > limit).map((f) => `${f.rel} ${kb(wire(f))}`);
  check(`no ${label} above ${kb(limit)} over the wire`, heavy.length === 0, heavy.slice(0, 3).join(' | '));
}

/* ==========================================================================
   4. SECRETS AND LEAKS
   ========================================================================== */

console.log('\n  secret and leak scan');
const skipDirs = new Set(['node_modules', '.git', 'dist', '.astro', '.vercel']);
const suspect = [
  { name: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'Slack token', re: /\bxox[abprs]-[0-9A-Za-z-]{10,}\b/ },
  { name: 'private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: 'hard-coded credential', re: /\b(?:api[_-]?key|secret|password|passwd|token)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i },
  { name: 'credential in a URL', re: /[?&](?:key|apikey|token|access_token)=[A-Za-z0-9_\-]{20,}/ },
];

const hits = [];
(function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (/\.(ts|tsx|js|mjs|cjs|astro|json|md|env|txt|yml|yaml|css)$/.test(entry.name)) {
      const text = readFileSync(full, 'utf8');
      for (const { name, re } of suspect) {
        if (re.test(text)) hits.push(`${path.relative(root, full)}: ${name}`);
      }
    }
  }
})(root);
check('no secret-looking value in the repository', hits.length === 0, hits.join(' | '));

const envFiles = readdirSync(root).filter((f) => f.startsWith('.env') && !f.endsWith('.example'));
check('no committed .env file', envFiles.length === 0, envFiles.join(', '));

const leaks = [];
for (const file of files.filter((f) => f.ext === '.html' || f.ext === '.js' || f.ext === '.css')) {
  const text = readFileSync(file.path, 'utf8');
  if (text.includes('sourceMappingURL')) leaks.push(`${file.rel}: sourceMappingURL`);
  if (/file:\/\/\/|[A-Z]:\\Users\\|\/home\/[a-z]/.test(text)) leaks.push(`${file.rel}: local path`);
}
check('no source map reference or local path in the build', leaks.length === 0, leaks.slice(0, 3).join(' | '));

console.log(`\n${failures.length === 0 ? 'PASS' : `FAIL — ${failures.length} problem(s): ${failures.join(', ')}`}`);
process.exit(failures.length === 0 ? 0 : 1);
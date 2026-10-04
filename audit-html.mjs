/**
 * ===========================================================================
 * HTML AUDIT  —  node scripts/audit-html.mjs
 * ---------------------------------------------------------------------------
 * Runs on `dist/` after a build and checks the things a template can get
 * wrong without anyone noticing. It is a safety net, not a substitute for
 * manual testing with a keyboard and a screen reader.
 *
 * Structure and language
 *   - <html lang> and dir coherence
 *   - one <h1>, no skipped heading level, exactly one <main>
 *   - no duplicate id, every id reference resolves
 *   - skip-to-content link that points at a real target
 *
 * Accessibility
 *   - every input has a label
 *   - every link and button has a discernible name
 *   - no aria-labelledby / aria-controls / aria-describedby to nowhere
 *   - no aria-hidden on a focusable element, no positive tabindex
 *   - target="_blank" always carries rel="noopener noreferrer"
 *   - every image has alt and intrinsic dimensions
 *
 * SEO
 *   - title and meta description present and within the SERP budget
 *   - canonical absolute and pointing at this very page
 *   - Open Graph / Twitter card complete, og:image actually built
 *   - JSON-LD parses and declares @context + @type
 *
 * Security
 *   - no third-party origin (no CDN, no tracker, no external font)
 *   - no javascript: URL
 *   - no inline <script> and no style="" attribute while the CSP in
 *     public/_headers is strict (that is what keeps 'unsafe-inline' out)
 *
 * Content
 *   - internal links point to a page that was actually built
 *   - no unresolved placeholder marker is rendered (warning, not error)
 *
 * Exit code 1 on any error.
 * ===========================================================================
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
const errors = [];
const warnings = [];

/** Collects the hrefs that were actually generated. */
const built = new Set();
async function collect(dir, prefix = '') {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collect(full, `${prefix}/${entry.name}`);
    } else if (entry.name === 'index.html') {
      built.add(`${prefix}/`);
    } else if (entry.name.endsWith('.html')) {
      built.add(`${prefix}/${entry.name.replace(/\.html$/, '')}`);
    }
  }
}
await collect(dist);

const pages = [...built];
const assets = new Set();
for (const page of pages) {
  const file = page.endsWith('/') ? path.join(dist, page, 'index.html') : path.join(dist, `${page}.html`);
  assets.add('/' + path.relative(dist, file).replace(/\\/g, '/'));
}

const strip = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

const decode = (value) =>
  value
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;/g, "'");

const attr = (tag, name) => {
  const match = String(tag).match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match ? (match[1] ?? match[2] ?? match[3]) : null;
};
const visibleText = (inner) => decode(String(inner).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/** True when the shipped policy forbids inline script and inline styles. */
const strictCsp = await (async () => {
  try {
    const headers = await readFile(path.join(process.cwd(), 'public', '_headers'), 'utf8');
    const csp = headers.match(/Content-Security-Policy:\s*(.+)/i)?.[1] ?? '';
    return csp.includes('script-src') && !/script-src[^;]*'unsafe-inline'/.test(csp);
  } catch {
    return false;
  }
})();

for (const page of pages) {
  const file = page.endsWith('/') ? path.join(dist, page, 'index.html') : path.join(dist, `${page}.html`);
  const raw = await readFile(file, 'utf8');
  const html = strip(raw);
  const head = raw.slice(0, Math.max(0, raw.indexOf('</head>')));
  const at = page || '/';
  const isErrorPage = /(^|\/)404(\.html)?$/.test(page);
  const err = (message) => errors.push(`${at} — ${message}`);
  const warn = (message) => warnings.push(`${at} — ${message}`);

  /* ---------------------------------------------------------------- shell */
  if (!/charset=/i.test(raw.slice(0, 1024))) err('no charset declaration in the first 1024 bytes');
  const htmlTag = raw.match(/<html[^>]*>/i)?.[0] ?? '';
  if (!/\slang="[a-z]{2}/i.test(htmlTag)) err('missing <html lang>');
  const lang = attr(htmlTag, 'lang') ?? '';
  if (lang !== 'en') err(`unexpected lang on an English-only site: "${lang}"`);
  if (!/\sdir="(ltr|rtl)"/i.test(htmlTag)) err('<html> has no dir attribute');
  if (/\sdir="rtl"/i.test(htmlTag)) err('RTL page on a left-to-right English site');
  if ((html.match(/<main\b/gi) || []).length !== 1) err('expected exactly one <main> landmark');

  /* ------------------------------------------------------------- headings */
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map((m) => Number(m[1]));
  const h1s = headings.filter((level) => level === 1).length;
  if (h1s !== 1) err(`expected exactly one <h1>, found ${h1s}`);
  let previous = 0;
  for (const level of headings) {
    if (previous && level > previous + 1) err(`heading level jumps from h${previous} to h${level}`);
    previous = level;
  }

  /* ------------------------------------------------------------------ ids */
  const idList = [...html.matchAll(/\sid=(?:"([^"]+)"|([^\s>]+))/gi)].map((m) => m[1] ?? m[2]);
  const idSet = new Set(idList);
  const duplicates = idList.filter((id, index) => idList.indexOf(id) !== index);
  if (duplicates.length) err(`duplicate id: ${[...new Set(duplicates)].join(', ')}`);

  for (const [, href] of html.matchAll(/<a\b[^>]*href="#([^"]+)"/gi)) {
    if (!idSet.has(href)) err(`in-page link to a missing id "#${href}"`);
  }

  const skip = html.match(/<a\b[^>]*class="[^"]*\b(?:skip-link|sr-only)\b[^"]*"[^>]*href="#([^"]+)"/i)
    ?? html.match(/<a\b[^>]*href="#([^"]+)"[^>]*class="[^"]*\b(?:skip-link|sr-only)\b[^"]*"/i);
  if (!skip) warn('no skip-to-content link pointing at the main landmark');
  else if (!idSet.has(skip[1])) err(`skip link points to a missing id "${skip[1]}"`);

  for (const [tag] of html.matchAll(/<(?:div|span|section|a|button|nav|ul|ol|li|p|header|footer|main|form|input|textarea|select|details)\b[^>]*>/gi)) {
    for (const reference of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns']) {
      const value = attr(tag, reference);
      if (!value) continue;
      for (const token of value.split(/\s+/)) {
        if (token && !idSet.has(token)) err(`${reference}="${token}" has no matching element`);
      }
    }
    if (attr(tag, 'aria-hidden') === 'true' && attr(tag, 'tabindex') !== null) {
      err(`aria-hidden="true" on a focusable element: ${String(tag).slice(0, 70)}`);
    }
    const tabindex = attr(tag, 'tabindex');
    if (tabindex && Number(tabindex) > 0) err(`positive tabindex (${tabindex}) breaks the tab order`);
  }

  /* --------------------------------------------------------------- images */
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    if (attr(tag, 'alt') === null && attr(tag, 'aria-hidden') !== 'true') err(`<img> without alt: ${String(tag).slice(0, 80)}`);
    if (!attr(tag, 'width') || !attr(tag, 'height')) warn(`<img> without width/height (layout shift risk): ${attr(tag, 'src')}`);
    if (!attr(tag, 'loading')) warn(`<img> without loading attribute: ${attr(tag, 'src')}`);
  }

  /* -------------------------------------------------------- form controls */
  for (const [tag] of html.matchAll(/<(?:input|textarea|select)\b[^>]*>/gi)) {
    if (/type="(hidden|submit)"/i.test(tag)) continue;
    const id = attr(tag, 'id');
    const labelled =
      (id && new RegExp(`<label[^>]*\\sfor=(?:"${id}"|${id}[\\s>])`).test(html)) ||
      attr(tag, 'aria-label') ||
      attr(tag, 'aria-labelledby');
    if (!labelled) err(`form control without label: ${String(tag).slice(0, 80)}`);
  }

  for (const [tag] of html.matchAll(/<form\b[^>]*>/gi)) {
    /* Either a real destination, or a documented JavaScript hook. */
    if (!attr(tag, 'action') && !/data-[a-z-]+/.test(tag)) err('<form> without action and without a data-* hook');
  }

  /* --------------------------------------------------------------- links */
  for (const [attrs, inner] of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const tag = `<a${attrs}>`;
    const name = visibleText(inner) || attr(tag, 'aria-label') || attr(tag, 'title');
    if (!name) err(`link without accessible name: ${attrs.trim().slice(0, 80)}`);
    if (attr(tag, 'href') === null) {
      err(`<a> without href is not a link: ${attrs.trim().slice(0, 70)}`);
      continue;
    }
    const href = attr(tag, 'href');
    if (/^javascript:/i.test(href)) err(`javascript: URL (${href.slice(0, 40)})`);
    if (attr(tag, 'target') === '_blank') {
      const rel = attr(tag, 'rel') ?? '';
      if (!/noopener/.test(rel)) err(`target="_blank" without rel="noopener": ${href}`);
      if (!/noreferrer/.test(rel)) warn(`target="_blank" without rel="noreferrer": ${href}`);
    }
    if (/^https?:\/\//i.test(href) && !/vitrine-studio\.example/.test(href)) {
      err(`external origin: ${href.slice(0, 60)}`);
    }
    if (href.startsWith('/') && !href.startsWith('//')) {
      const clean = href.split('#')[0].split('?')[0];
      if (clean && !built.has(clean)) err(`link to a page that does not exist: ${href}`);
    }
  }

  for (const [attrs, inner] of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const tag = `<button${attrs}>`;
    const name = visibleText(inner) || attr(tag, 'aria-label') || attr(tag, 'title');
    if (!name) err(`button without accessible name: ${attrs.trim().slice(0, 80)}`);
    if (attr(tag, 'type') === null) warn(`button without type attribute: ${attrs.trim().slice(0, 60)}`);
  }

  /* ---------------------------------------------------------- meta / seo */
  const title = visibleText(raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  if (!title) err('missing <title>');
  else if (title.length > 65) warn(`title longer than 65 characters (${title.length}): ${title}`);
  else if (title.length < 15) warn(`title shorter than 15 characters (${title.length}): ${title}`);

  const description = attr(head.match(/<meta name="description"[^>]*>/i)?.[0] ?? '<meta>', 'content') ?? '';
  if (!description) err('missing meta description');
  else if (!isErrorPage && description.length > 160) warn(`meta description longer than 160 characters (${description.length})`);
  else if (!isErrorPage && description.length < 70) warn(`meta description shorter than 70 characters (${description.length})`);
  else if (isErrorPage && description.length > 160) warn(`meta description longer than 160 characters (${description.length})`);

  const canonical = attr(head.match(/<link rel="canonical"[^>]*>/i)?.[0] ?? '<link>', 'href') ?? '';
  if (!canonical) err('missing canonical');
  else if (!/^https?:\/\//.test(canonical)) warn(`canonical is not an absolute URL: ${canonical}`);
  else {
    const normalize = (p) => p.replace(/^https?:\/\/[^/]+/, '').replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/\/{2,}/g, '/').replace(/\/$/, '');
    if (normalize(canonical) !== normalize(at)) err(`canonical points elsewhere: ${canonical} (page is ${at})`);
  }

  const robots = attr(head.match(/<meta name="robots"[^>]*>/i)?.[0] ?? '<meta>', 'content');
  if (!robots?.includes('noindex')) warn('page is indexable: set siteUrlConfirmed = false in src/config/site.ts while the domain is not final');

  for (const property of ['og:type', 'og:url', 'og:title', 'og:description', 'og:site_name', 'og:locale', 'og:image', 'og:image:alt']) {
    if (!new RegExp(`property="${property}"`, 'i').test(head)) warn(`missing ${property}`);
  }
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    if (!new RegExp(`name="${name}"`, 'i').test(head)) warn(`missing ${name}`);
  }
  const ogImage = attr(head.match(/<meta property="og:image"[^>]*>/i)?.[0] ?? '<meta>', 'content') ?? '';
  if (ogImage && !/^https?:\/\//.test(ogImage) && !assets.has(ogImage)) {
    warn(`og:image was not built: ${ogImage}`);
  }

  for (const [, block] of raw.matchAll(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data;
    try {
      data = JSON.parse(block);
    } catch (error) {
      err(`JSON-LD does not parse: ${error.message}`);
      continue;
    }
    const nodes = data['@graph'] ?? [data];
    if (!data['@context']) err('JSON-LD has no @context');
    for (const node of nodes) if (!node['@type']) err('JSON-LD node without @type');
  }
  if (pages.length > 1 && !/application\/ld\+json/i.test(raw)) warn('no JSON-LD');

  /* ------------------------------------------------------------ security */
  if (strictCsp) {
    const inlineScripts = raw.match(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>/gi) ?? [];
    if (inlineScripts.length) {
      err(`${inlineScripts.length} inline <script> while the CSP forbids 'unsafe-inline': move it to a file`);
    }
    const inlineStyles = raw.match(/\sstyle="/g) ?? [];
    if (inlineStyles.length) err(`${inlineStyles.length} inline style="" attribute(s): use a CSS class`);
  }
  for (const [, value] of raw.matchAll(/\s(?:src|href)="(https?:\/\/[^"]+)"/gi)) {
    if (!/vitrine-studio\.example/.test(value)) err(`third-party origin in markup: ${value.slice(0, 60)}`);
  }

  /* ------------------------------------------------------------- content */
  const leftover = html.match(/\[(TO COMPLETE|TO CONFIRM|TO VALIDATE|À COMPLÉTER|À CONFIRMER|À VALIDER)[^\]]*\]/gi);
  if (leftover) warn(`visible placeholder: ${[...new Set(leftover)].join(', ')}`);
}

/* ------------------------------------------------------------------ report */

console.log('=========================================================================');
console.log(` HTML AUDIT — ${pages.length} pages`);
console.log(` CSP is ${strictCsp ? 'strict (no unsafe-inline)' : 'permissive or unconfigured'}`);
console.log('=========================================================================\n');

if (warnings.length) {
  console.log(`WARNINGS (${warnings.length})`);
  const grouped = new Map();
  for (const item of warnings) {
    const key = item.replace(/^.*? — /, '').replace(/\(.*/, '').replace(/:.*/, '').trim().slice(0, 64);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  }
  for (const [key, list] of grouped) {
    console.log(`  ~ [${list.length}x] ${key}`);
    console.log(`      e.g. ${list[0]}`);
  }
  console.log('');
}

if (errors.length) {
  console.log(`ERRORS (${errors.length})`);
  const grouped = new Map();
  for (const item of errors) {
    const key = item.replace(/^.*? — /, '').replace(/\(.*/, '').replace(/:.*/, '').trim().slice(0, 64);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  }
  for (const [key, list] of grouped) {
    console.log(`  ✗ [${list.length}x] ${key}`);
    console.log(`      e.g. ${list[0]}`);
  }
  console.log('');
  process.exit(1);
}

console.log('✓ no blocking issue found\n');
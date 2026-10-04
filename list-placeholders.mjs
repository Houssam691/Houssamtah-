/**
 * ===========================================================================
 * PLACEHOLDER REPORT  —  node scripts/list-placeholders.mjs
 * ---------------------------------------------------------------------------
 * Lists every unresolved placeholder still present in the source, grouped by
 * marker. This is the pre-publication checklist: a production site must not
 * contain any of them.
 *
 *   [TO COMPLETE]        a fact nobody has provided yet
 *   [TO CONFIRM]         a decision the studio owner must validate
 *   [TO VALIDATE]        a legal or editorial decision
 *   [TO CONFIRM — ...]   a whole sentence still waiting on the owner
 *
 * The legacy French markers are still recognised so an old copy-paste cannot
 * slip through unnoticed.
 *
 * Exit code 1 when placeholders remain, so it can gate a release.
 * ===========================================================================
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const TARGETS = ['src', 'README.md', 'public', 'docs'];

const PATTERNS = [
  { marker: '[TO COMPLETE', kind: 'missing fact' },
  { marker: '[TO CONFIRM', kind: 'owner decision' },
  { marker: '[TO VALIDATE', kind: 'owner decision' },
  { marker: '[À COMPLÉTER', kind: 'missing fact (legacy marker)' },
  { marker: '[À CONFIRMER', kind: 'owner decision (legacy marker)' },
  { marker: '[À VALIDER', kind: 'owner decision (legacy marker)' },
];

/**
 * Files that quote the markers on purpose: the scripts that detect them and the
 * two documents that explain them. Everything else counts.
 */
const DOCUMENTS_THE_MARKERS = new Set([
  'scripts/list-placeholders.mjs',
  'scripts/audit-html.mjs',
  'docs/content-guide.md',
  'docs/pre-publication-checklist.md',
]);

async function walk(target) {
  const absolute = path.join(root, target);
  let entries;
  try {
    entries = await readdir(absolute, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const full = path.join(absolute, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.astro', '.git'].includes(entry.name)) continue;
      files.push(...(await walk(path.relative(root, full))));
    } else if (/\.(ts|astro|mjs|md|json|txt|css)$/.test(entry.name)) {
      files.push(path.relative(root, full));
    }
  }
  return files;
}

const files = (await Promise.all(TARGETS.map(walk))).flat().sort();
const report = new Map();

for (const file of files) {
  if (DOCUMENTS_THE_MARKERS.has(file.split(path.sep).join('/'))) continue;
  const source = await readFile(path.join(root, file), 'utf8');
  const lines = source.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const { marker, kind } of PATTERNS) {
      let from = 0;
      for (;;) {
        const at = line.indexOf(marker, from);
        if (at === -1) break;
        const key = `${marker}…] — ${kind}`;
        if (!report.has(key)) report.set(key, []);
        report.get(key).push(`${file}:${index + 1}`);
        from = at + marker.length;
      }
    }
  });
}

const total = [...report.values()].reduce((sum, lines) => sum + lines.length, 0);

console.log('=========================================================================');
console.log(' PLACEHOLDERS — to resolve before going live');
console.log('=========================================================================\n');

if (total === 0) {
  console.log('✓ No placeholder left: the site is ready to publish.\n');
  process.exit(0);
}

for (const [key, locations] of [...report.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${key}  (${locations.length})`);
  for (const location of locations.slice(0, 12)) console.log(`   ${location}`);
  if (locations.length > 12) console.log(`   … and ${locations.length - 12} more`);
  console.log('');
}

console.log(`TOTAL: ${total} placeholder(s)\n`);
process.exit(1);
#!/usr/bin/env node
/**
 * Content guard rails.
 *
 * 1. Flags stray characters in the English content:
 *    CJK, Cyrillic, Arabic or Hebrew ranges can only be copy-paste accidents.
 * 2. Flags unterminated bracket placeholders such as "[TO CONFIRM".
 *
 * Usage: node scripts/check-content.mjs [--fix]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const contentDir = join(root, 'src', 'content');

const LOCALES = ['en'];
const STRAY = /[\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u3000-\u30FF\u4E00-\u9FFF\uFF01-\uFF60]/u;
/** A placeholder opening bracket: "[" immediately followed by a capital letter. */
const PLACEHOLDER_OPEN = /\[[\p{Lu}ÀÉ]/u;
const CLOSING = /\]/gu;

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(contentDir).filter((file) => file.endsWith('.ts'));
let problems = 0;

for (const file of files) {
  const rel = relative(root, file);
  const locale = LOCALES.find((code) => rel.includes(`content${'/'}${code}`) || rel.includes(`content\\${code}`));
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);

  lines.forEach((line, index) => {
    const at = `${rel}:${index + 1}`;

    if (locale && STRAY.test(line)) {
      const chars = [...new Set(line.match(STRAY) ?? [])].join(' ');
      console.error(`✗ stray non-Latin characters (${chars}) at ${at}\n  ${line.trim()}`);
      problems += 1;
    }

    const opens = (line.match(PLACEHOLDER_OPEN) ?? []).length;
    const closes = (line.match(CLOSING) ?? []).length;
    if (opens > closes) {
      console.error(`✗ unbalanced placeholder at ${at}\n  ${line.trim()}`);
      problems += 1;
    }
  });
}

if (problems > 0) {
  console.error(`\n${problems} problem(s) found in content files.`);
  process.exit(1);
}

console.log(`✓ content check passed (${files.length} files)`);
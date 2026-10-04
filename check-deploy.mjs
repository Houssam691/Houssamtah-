/**
 * The three deployment configs must not drift apart: a header that only exists
 * on one host is a header that silently does not apply.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = (file) => readFileSync(file, 'utf8');

const vercel = JSON.parse(read('vercel.json'));
const netlify = read('public/_headers');
const redirects = read('public/_redirects');

let failures = 0;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

/* ---- the CSP must be character-identical on both hosts ------------------- */
const vercelCsp = vercel.headers
  .flatMap((rule) => rule.headers)
  .find((h) => h.key.toLowerCase() === 'content-security-policy')?.value;
const netlifyCsp = netlify.match(/Content-Security-Policy:\s*(.+)/i)?.[1].trim();
check('CSP identical in vercel.json and public/_headers', vercelCsp === netlifyCsp);
if (vercelCsp !== netlifyCsp) {
  console.log(`  vercel: ${vercelCsp}`);
  console.log(`  netlify: ${netlifyCsp}`);
}

/* ---- no unsafe-inline anywhere ------------------------------------------ */
check('no unsafe-inline in the CSP', !/unsafe-inline/.test(vercelCsp ?? ''));
check('no unsafe-eval in the CSP', !/unsafe-eval/.test(vercelCsp ?? ''));

/* ---- the security headers must exist on both hosts ---------------------- */
const required = [
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy',
  'Strict-Transport-Security',
];
for (const key of required) {
  const inVercel = vercel.headers.flatMap((r) => r.headers).some((h) => h.key.toLowerCase() === key.toLowerCase());
  const inNetlify = new RegExp(`${key}:`, 'i').test(netlify);
  check(`${key} on both hosts`, inVercel && inNetlify, inVercel && inNetlify ? '' : `vercel=${inVercel} netlify=${inNetlify}`);
}

/* ---- Permissions-Policy must not drift either -------------------------- */
const vercelPermissions = vercel.headers.flatMap((r) => r.headers).find((h) => h.key === 'Permissions-Policy')?.value;
const netlifyPermissions = netlify.match(/Permissions-Policy:\s*(.+)/i)?.[1].trim();
check('Permissions-Policy identical on both hosts', vercelPermissions === netlifyPermissions, vercelPermissions === netlifyPermissions ? '' : `vercel="${vercelPermissions}" netlify="${netlifyPermissions}"`);

/* ---- cache rules: no long cache on HTML -------------------------------- */
const htmlRule = vercel.headers.find((r) => r.source.includes('html'));
check('HTML is revalidated, not cached', /max-age=0/.test(JSON.stringify(htmlRule?.headers ?? [])));
check('fingerprinted assets are immutable', vercel.headers.some((r) => r.source.includes('_astro') && JSON.stringify(r.headers).includes('immutable')));

/* ---- no catch-all rewrite that could break assets ----------------------- */
check('no catch-all rewrite in vercel.json', !vercel.rewrites, JSON.stringify(vercel.rewrites ?? []));
check('no catch-all redirect in public/_redirects', !/\*\s+\/:\w+\s+200/.test(redirects) && !/^\/\*\s+/.test(redirects));

/* ---- the two redirect tables must agree -------------------------------- */
/* the two hosts spell a wildcard differently: Netlify `/*` + `:splat`,
   Vercel `/:path*` on both sides. Normalise before comparing. */
const normalize = (value) => value.replace(':splat', ':path*').replace(/\/\*$/, '/:path*');
const vercelRules = (vercel.redirects ?? [])
  .map((r) => `${normalize(r.source)} -> ${normalize(r.destination)}${r.permanent ? ' (permanent)' : ''}`)
  .sort();
const netlifyRules = redirects
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => {
    const [source, destination, ...rest] = line.split(/\s+/);
    return `${normalize(source)} -> ${normalize(destination)}${rest.includes('301') || rest.includes('308') ? ' (permanent)' : ''}`;
  })
  .sort();
check(
  'same locale redirects, same permanence, on both hosts',
  vercelRules.length === netlifyRules.length &&
    vercelRules.every((rule) => netlifyRules.includes(rule)),
  `vercel=[${vercelRules.join(' | ')}] netlify=[${netlifyRules.join(' | ')}]`,
);

/* ---- JSON must be valid and every source a plausible pattern ------------ */
const patterns = vercel.headers.map((r) => r.source).concat((vercel.redirects ?? []).map((r) => r.source));
const suspicious = patterns.filter((p) => /^\/:path\*\.html$/.test(p));
check('no dubious ":path*.html" source pattern', suspicious.length === 0, suspicious.join(', '));

try {
  execFileSync(process.execPath, ['-e', 'JSON.parse(require("fs").readFileSync("vercel.json","utf8"))'], { stdio: 'pipe' });
  check('vercel.json parses', true);
} catch (error) {
  check('vercel.json parses', false, error.message);
}

console.log(`\n${failures === 0 ? 'PASS — deployment configs agree' : `FAIL — ${failures} problem(s)`}`);
process.exit(failures === 0 ? 0 : 1);
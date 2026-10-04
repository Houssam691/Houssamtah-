# Vitrine Studio — site vitrine

Static, multilingual, zero-backend marketing site for a small web development
and automation studio.

> **Status: ready to be filled in, not ready to be published.**
> The site ships with visible placeholders instead of invented facts.
> Run `npm run placeholders` and work through the list before going live.

```bash
npm install
npm run dev        # http://localhost:4321
npm run verify     # content check + types + astro check + build + HTML audit
```

---

## 1. What this site is

| | |
|---|---|
| Framework | Astro 7, static output (`dist/`), no adapter, no server |
| Styling | Tailwind CSS 4 via the Vite plugin, design tokens in CSS variables |
| Language | TypeScript, strict, `astro check` clean |
| Language | English only, served from the root (`/`, `/services/`, …) |
| JavaScript | One ~8 KB vanilla module for progressive enhancement only |
| Third parties | **None.** No CDN, no analytics, no cookie banner, no tracking, no webfont host |
| Fonts | Self-hosted, `latin` subset only (Bricolage Grotesque, Inter) |
| Contact | `mailto:` only — no backend, no form service |
| Images | None. Every visual is CSS or inline SVG, generated from code |

23 pages are generated: home, services index, 6 service pages, work index,
3 case studies, process, pricing, about, contact, FAQ, blog index, 1 blog post,
3 legal pages, plus `404.html` and `robots.txt`.

## 2. Honesty rules encoded in the code

This project deliberately contains **no fabricated information**. There is no
invented client, testimonial, metric, team member, award, price or deadline.

| Marker | Meaning | Where |
|---|---|---|
| `[TO COMPLETE]` | A fact nobody has provided yet | `src/config/site.ts` |
| `[TO CONFIRM]` | A decision the studio owner must validate | config + content files |
| `priceLabel: 'Sur devis'` | A price that is quoted per project | `src/content/en/pricing.ts` |
| `isDemo: true` | A demonstration project, never presented as client work | `src/content/*/work.ts` |

Three safety nets enforce this:

1. `npm run placeholders` lists every remaining placeholder with file and line.
2. `npm run content:check` fails on copy that mixes scripts (English copy
   containing Arabic, Cyrillic or CJK characters).
3. `npm run audit` fails if a page renders a placeholder, if a link points to
   a page that was not built, if a heading level is skipped, or if a third-party
   origin sneaks into the markup.

While `site.siteUrlConfirmed` is `false`, every page carries
`robots: noindex, nofollow` and `robots.txt` disallows everything. Set it to
`true` once the domain is real.

## 3. Project map

```
src/
  config/site.ts          brand, contact and legal data — safe to hand to a client
  content/
    types.ts              the shape of every content file
    en/                   all the copy, one file per page section
  i18n/index.ts           the single locale, paths, dictionary
  lib/paths.ts            getStaticPaths() shared by every page
  layouts/BaseLayout.astro  <head>, theme script, header, footer, CTA, scripts
  components/             22 UI components (no framework, no library)
  pages/
    [...locale]/          one page template per route
    404.astro  robots.txt.ts
  scripts/site.ts         the only client-side JS file
  styles/global.css       tokens, themes, base layer, component utilities
scripts/
  check-content.mjs       mixed-script guard on the content files
  list-placeholders.mjs   pre-publication placeholder report
  build-assets.mjs        generates favicon.svg + og-default.png
  audit-html.mjs          post-build HTML audit (a11y, SEO, CSP, links)
  check-deploy.mjs        keeps vercel.json and public/_headers in agreement
  check-budget.mjs        weight budget, font wiring, secret and leak scan
public/
  _headers                strict CSP + security headers + caching (Netlify / Cloudflare)
  _redirects              old locale prefixes → canonical English paths
```

## 4. Editing content

All copy lives in `src/content/`. To change a sentence, open the matching file
and edit the string — no component, no page file, no rebuild of anything else.

```text
src/content/en/home.ts        home page
src/content/en/services.ts    the six services (detail + FAQ + timeline)
src/content/en/work.ts        the three demo projects + reserved client slots
src/content/en/process.ts     the seven method stages
src/content/en/pricing.ts     three engagement models + comparison table
src/content/en/about.ts       story, values, standards, AI policy, team
src/content/en/contact.ts     channels + the brief template
src/content/en/faq.ts         twelve questions in eight categories
src/content/en/blog.ts        blog (off) + the three legal documents
```

See [docs/content-guide.md](docs/content-guide.md) for adding a service, adding
a real case study, enabling the blog, plugging a real contact endpoint and
adding a second language.

## 5. Brand and non-translated data

Everything a non-developer needs to change is in `src/config/site.ts`:

```ts
brand, tagline, siteUrl, siteUrlConfirmed,
email, phone, bookingUrl,
legalName, legalForm, registrationNumber, address, publicationDirector, host,
social[], contactFormEndpoint, responseTimeHours,
features: { blog, themeToggle, stickyMobileCta },
stack[], standards[]
```

### Tagline

The displayed tagline is `site.tagline`. Alternatives, for later:

1. Custom websites, applications and automation. *(current)*
2. Your idea, built properly.
3. Made to measure, not from a template.
4. We write the code your project needs.
5. Websites, applications and automation — to your requirements.
6. The code and the domain stay yours.

## 6. Design system in one screen

- **Identity:** dark-first warm minimalism. Bone light theme as an equal
  alternative, chosen by the visitor and remembered in `localStorage`.
- **Accents:** ember `#ff6a3c` for action, mint `#5fe3c0` for secondary
  highlight. Nothing else is coloured.
- **Type:** Bricolage Grotesque (display) and Inter (text), both variable.
- **Texture:** two blurred radial meshes and a locally generated film grain.
  No image request, no `feTurbulence` cost at runtime.
- **Motion:** reveals, magnetic buttons, underline draws — all disabled under
  `prefers-reduced-motion`.
- **Layout:** fluid `clamp()` type and CSS logical properties everywhere, so a
  right-to-left language can be added later without touching a component.

Full rationale: [docs/design-system.md](docs/design-system.md).

## 7. Performance budget

Measured by `npm run budget` on the built output, which is also what fails the
build when one of these numbers is broken. Text is measured gzipped, because
that is what crosses the wire; fonts and images are measured raw, because they
are already compressed.

| Metric | Home page |
|---|---|
| HTML | 55 KB raw / **9.9 KB gzip** |
| CSS | 48 KB raw / **10.0 KB gzip** (one file, no framework runtime) |
| JS | **8.6 KB** raw / **3.6 KB gzip**, deferred, two small modules |
| Fonts | 2 latin subsets, 87 KB, both preloaded |
| First visit, total | **112 KB over the wire** |
| Third-party requests | **0** |
| Cookies | **0** |

Only the `latin` font subsets are declared, by hand, in `src/styles/global.css`.
The Fontsource stylesheets also ship Cyrillic, Greek, Vietnamese and Latin
Extended: an English-only site never renders a character outside `latin`, so
those eight files were built, hashed and uploaded for nothing. Not in the
budget and deliberately absent: any client framework, any icon library, any
carousel, any tracking pixel.

## 8. Accessibility

- One `<h1>` per page, no skipped heading level (enforced by `npm run audit`).
- Skip link, visible focus ring, keyboard-operable menu and tabs
  (WAI-ARIA tab pattern with arrow/Home/End keys).
- `<details>` accordions: no JavaScript needed to read the FAQs.
- Form controls labelled, `aria-live` toast region, `aria-pressed` /
  `aria-expanded` / `aria-current` kept in sync.
- Contrast, computed from the tokens (`/tmp` script, WCAG 2.1):
  body text 16.6–17.0:1, muted text 7.1–8.9:1, meta text 5.5–6.3:1,
  accent text 4.75:1 (light) to 6.9:1 (dark), mint 4.8–12.4:1.

Still to do by a human: a full keyboard pass, a screen-reader pass (NVDA /
VoiceOver), and an automated axe run once a browser is available.

## 9. Deployment

Static output: `npm run build`, then publish `dist/`.

- **Netlify** — build `npm run build`, publish `dist`. `public/_headers` and
  `public/_redirects` are applied automatically.
- **Vercel** — `vercel.json` already carries the same headers and redirects.
- **Cloudflare Pages** — same settings; `_headers` / `_redirects` are supported.
- **nginx / Apache / SFTP** — upload `dist/`. Copy the rules from
  `public/_headers` into the server configuration and make sure `/dir/`
  resolves to `/dir/index.html`.

Required at deploy time:

1. `astro.config.mjs` → real `SITE_URL`.
2. `src/config/site.ts` → real `siteUrl`, `siteUrlConfirmed = true`, real
   `email`, legal identifiers, host, and any optional `phone` / `bookingUrl`.
3. If you plug a form endpoint, add its origin to the CSP in **both**
   `public/_headers` and `vercel.json`, then run `npm run deploy:check`.

### Content-Security-Policy

The policy is strict: `default-src 'self'` with no `'unsafe-inline'` and no
`'unsafe-eval'`, so the markup contains no inline `<script>` and no `style=""`
attribute. Two consequences when you edit the templates:

- The theme is applied by `public/theme-boot.js`, a normal external file. Do not
  move it back into `<head>` as an inline script.
- Anything dynamic in a style must be a CSS class in `src/styles/global.css`
  (that is how the reveal delays work), not an inline `style` attribute.

`npm run audit` fails the build if either reappears, and `npm run deploy:check`
fails if the CSP in `vercel.json` and `public/_headers` ever diverge.

## 10. Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serves `dist/` locally |
| `npm run check` | `astro check` (templates + types) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run content:check` | Mixed-script guard on the content files |
| `npm run assets:build` | Regenerates `favicon.svg` and `og-default.png` |
| `npm run placeholders` | Placeholder report, exits 1 if any remain |
| `npm run audit` | Post-build HTML audit (a11y, SEO, CSP, links), exits 1 on error |
| `npm run deploy:check` | Confirms `vercel.json` and `public/_headers` agree |
| `npm run budget` | Weight budget, font wiring, secret and leak scan |
| `npm run verify` | content:check → typecheck → check → build → audit → deploy:check → budget |

## 11. What is still missing on purpose

- Real identity information (legal name, address, SIRET/SIREN, host).
- Real prices, real timelines, real response time.
- Real team names (the slots are explicit placeholders).
- Real client work — three demonstration projects are published instead, each
  one labelled as such at three levels (page, section, card).
- A legal review of the mentions, privacy policy and CGV.

# Editing the content

Everything a visitor reads lives in `src/content/en/`. You never need to touch
a component or a page to change a sentence.

```
src/content/types.ts      the expected shape of every file
src/content/en/*.ts       the copy: chrome, home, services, work, process,
                          pricing, about, contact, faq, blog, legal
```

Run `npm run content:check` after editing: it fails if the copy contains Arabic,
Hebrew, CJK or Cyrillic characters, which is how a copy-paste accident is caught
before it ships.

---

## Change a sentence

```ts
// src/content/en/home.ts
hero: {
  subtitle: 'Your new sentence here.',
}
```

Nothing else changes. The page is rebuilt on the next `npm run build`.

## Add a service

1. Copy an existing entry in `src/content/en/services.ts`.
2. Give it a unique `slug` (it becomes the URL), an `index` (`07`), an `icon`
   from the list in `types.ts`, and fill `audience`, `included`, `how`,
   `deliverables`, `timeline`, `faq`, `cta`, `keywords`.
3. Check the `keywords` list: it feeds the `Service` schema and the meta tags.

The services index, the detail page, the footer links, the sitemap and the
`ItemList` schema all pick it up automatically. No page file changes.

## Add a real client case study

The three published projects are demonstrations (`isDemo: true`). When a real
mission can be published:

1. Copy an entry in `src/content/en/work.ts`.
2. Set `isDemo: false`.
3. Delete the `notice` object (its content is a demo disclaimer) or replace it
   with what the client agreed to disclose.
4. Replace the reserved-slot timeline value with a real one.
5. Remove the project from `slots` if you are filling one of the reserved slots.

The card, the detail page, the demo notice blocks and the schema adapt on their
own: notice blocks render only when `isDemo` is true.

Do not publish a client name, a logo, a metric or a testimonial without a
written agreement. This is the one rule of this project that is not negotiable.

## Turn the blog on

```ts
// src/config/site.ts
features: { blog: true }
```

The routes (`/blog/`, `/blog/<slug>/`) and the content structure already exist.
Write the real post body in `src/pages/[...locale]/blog/[slug].astro` — the
placeholder shows the excerpt only. Then replace the placeholder entry in
`src/content/en/blog.ts` with your posts and remove them from `nav` if you do
not want them in the header.

## Connect a real contact form

The form builds a `mailto:` link and never sends anything by itself. To use a
real endpoint (Formspree, Netlify Forms, a Cloudflare Worker, your own API):

1. Set `contactFormEndpoint` in `src/config/site.ts`.
2. Add its origin to the CSP, in **both** `public/_headers` (Netlify,
   Cloudflare Pages) and `vercel.json` (Vercel):
   `form-action 'self' https://your-endpoint; connect-src 'self' https://your-endpoint`.
3. In `src/components/ContactBrief.astro`, keep the `mailto:` submit as the
   fallback and post to the endpoint with `fetch` when it is configured.

Until then the page is honest: it tells the visitor that the site has no server,
and the e-mail address and phone number are always plain links.

## Placeholder markers

| Marker | Meaning |
|---|---|
| `[TO COMPLETE]` | A fact nobody has provided yet |
| `[TO CONFIRM]` | A decision the owner must validate |
| `[TO VALIDATE]` | Same, for a legal or editorial decision |

The markers are English, like the rest of the site. `npm run audit` also
reports any marker that survived into the built HTML, so a forgotten one shows
up on the page that carries it and not only in the source.

`npm run placeholders` lists all of them with file and line number, and exits
with code 1 while any remain. That is the pre-publication checklist.

## Add a second language

The locale layer was kept in place on purpose, so this is a small change rather
than a rewrite:

1. Copy `src/content/en/` to `src/content/fr/` (or any other language) and
   translate the strings.
2. In `src/content/types.ts`, widen the union:
   `export type Locale = 'en' | 'fr';`
3. In `src/i18n/index.ts`, add one entry to `locales` and point
   `useDict()` at both dictionaries.
4. In `astro.config.mjs`, add the code to `i18n.locales` and to the sitemap
   `i18n.locales` map.
5. In `astro.config.mjs`, decide whether the new locale is the default: with
   `prefixDefaultLocale: false` the default language lives at the root and the
   others get a prefix.

That is all. Every page, breadcrumb, canonical and sitemap entry follows by
itself. Two things have to be added back by hand, because the site is
English-only today and shipping them would be dead weight:

- a language switcher in `Header.astro` / `Footer.astro` (the previous
  `LanguageSwitcher.astro` gated itself on `isMultilingual()`, which is why
  deleting it changed nothing today);
- the `switchLanguage` / `language` dictionary keys in
  `src/content/en/chrome.ts` and `src/content/types.ts`.
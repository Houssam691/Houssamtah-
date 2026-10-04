# Pre-publication checklist

Nothing here is decoration. Every line is either a fact we do not have yet, a
decision that must be validated, or an action with a legal consequence.

Run `npm run placeholders` to regenerate the technical list, then work down
this page.

---

## A. Identity and legal (blocking)

| ☐ | Item | Where | Notes |
|---|---|---|---|
| ☐ | Final domain | `astro.config.mjs` → `SITE_URL`, `src/config/site.ts` → `siteUrl` | Both places must match |
| ☐ | `siteUrlConfirmed = true` | `src/config/site.ts` | Removes `noindex` and unlocks `robots.txt` + sitemap |
| ☐ | Publisher legal name | `legalName` | Name on invoices and on the legal notice |
| ☐ | Legal form | `legalForm` | SARL, SAS, EI, EURL, Ltd… |
| ☐ | Registration number | `registrationNumber` | SIREN / SIRET / RCS / VAT |
| ☐ | Registered address | `address.*` | Postal address of the entity |
| ☐ | Publication director | `publicationDirector` | Required in France |
| ☐ | Hosting provider + jurisdiction | `host.*` | Required in the legal notice |
| ☐ | Professional liability insurance | — | If the activity requires it |
| ☐ | **Legal review of the CGV** | `/legal/cgv/` | Written by a template, not a lawyer. Have it reviewed. |
| ☐ | Review of the privacy policy | `/legal/privacy/` | Must match the real hosting and email setup |

## B. Contact and availability (blocking)

| ☐ | Item | Where | Notes |
|---|---|---|---|
| ☐ | Real e-mail address | `email` | Currently `…@vitrine-studio.example` |
| ☐ | Phone number (optional) | `phone` | Rendered only when filled |
| ☐ | Booking link (optional) | `bookingUrl` | Rendered only when filled |
| ☐ | Response time | `responseTime` | Currently `[TO CONFIRM]` |
| ☐ | Decide on a contact endpoint | `contactFormEndpoint` | Leave empty to keep `mailto:` |
| ☐ | Update the CSP if an endpoint is added | `public/_headers` **and** `vercel.json` | Add the origin to `form-action` and `connect-src`, then run `npm run deploy:check` |
| ☐ | Social profiles | `social[]` | Empty array = no links rendered |

## C. Commercial information (blocking)

| ☐ | Item | Where | Notes |
|---|---|---|---|
| ☐ | Three prices | `content/en/pricing.ts` | Currently a scoping statement, not a number |
| ☐ | Payment terms | `pricing.terms` | Split, schedule, late payment |
| ☐ | Revision policy | `pricing.terms` | Number of iterations included |
| ☐ | Hourly / retainer rates | `pricing.models` | Confirm or remove the model |
| ☐ | Typical timelines per service | `services[].timeline` | Currently `[TO CONFIRM]` |
| ☐ | Confirm the "limited number of projects" claim | `contact.availabilityNote` | Only keep it if it is true |

## D. About page

| ☐ | Item | Where | Notes |
|---|---|---|---|
| ☐ | Team names | `about.team.slots` | The slots are explicit placeholders: do not invent names |
| ☐ | Roles | `about.team.slots` | One line each, truthful |
| ☐ | Location | `site.location.label` | Studio is remote: keep the wording honest |
| ☐ | AI usage policy | `about.ai` | Confirm what is actually true |
| ☐ | Stack statement | `site.stack` | Only tools actually used; no certification claims |

## E. Portfolio (blocking, integrity)

| ☐ | Item | Where | Notes |
|---|---|---|---|
| ☐ | Keep or remove the three demos | `content/*/work.ts` | They are honest and clearly labelled; removing them is also fine |
| ☐ | Publish a first real case study | copy an entry, `isDemo: false` | Needs a written client agreement |
| ☐ | Confirm the reserved slots still make sense | `work.slots` | Or delete them |
| ☐ | Verify every demo disclaimer is still displayed | `/work/` | Page level, section level, card level |

## F. Languages

| ☐ | Item | Notes |
|---|---|---|
| ☐ | Native review of the English copy | Especially the service descriptions and the legal wording |
| ☐ | Decide whether a French version is needed later | `docs/content-guide.md` has the 5-step recipe |

## G. SEO and metadata

| ☐ | Item | Notes |
|---|---|---|
| ☐ | Domain and `siteUrlConfirmed` | Unlocks indexing |
| ☐ | Verify `sitemap-index.xml` on the deployed domain | 22 URLs, no locale duplication |
| ☐ | Submit the sitemap in Search Console / Bing | After indexing is unlocked |
| ☐ | Check every `meta description` | They are written, not generated |
| ☐ | Decide on the `hreflang` question | Single language: none is emitted, which is correct |
| ☐ | Check the OG preview | `og-default.png` is generated; add a real one if preferred |
| ☐ | Add a `sameAs` social profile | `site.social` |

## H. Quality gate (automated)

```bash
npm run verify      # content:check + typecheck + check + build + audit + deploy:check + budget
npm run placeholders
```

| ☐ | Check | Status |
|---|---|---|
| ☐ | `npm run verify` passes | required |
| ☐ | `npm run deploy:check` passes | required: `vercel.json` and `public/_headers` must agree |
| ☐ | `npm run budget` passes | required: weight, font wiring, secret scan |
| ☐ | No CSP violation in the browser console | required: the policy forbids `'unsafe-inline'` |
| ☐ | Both webfonts render (not a silent Arial fallback) | check DevTools → Network → Font |
| ☐ | `npm run placeholders` lists only intentional markers | required before going live |
| ☐ | Lighthouse (performance, accessibility, SEO) | run on the deployed URL |
| ☐ | Keyboard-only pass on every page | menu, tabs, accordion, form, theme toggle |
| ☐ | Screen-reader pass | NVDA or VoiceOver, at least home + contact |
| ☐ | axe DevTools scan | required |
| ☐ | Check on a real phone (iOS + Android) | sticky CTA, menu, safe area |
| ☐ | Check `prefers-reduced-motion` | reveals must not hide content |
| ☐ | Check light theme contrast | every text/background pair |

## I. Post-launch

| ☐ | Item | Notes |
|---|---|---|
| ☐ | Add a real client case study | The strongest asset this site can have |
| ☐ | Enable the blog when there is something to say | Not before |
| ☐ | Re-run `npm run verify` after any content edit | Cheap insurance |
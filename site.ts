/**
 * ===========================================================================
 * SITE CONFIGURATION  —  the only non-translated content file.
 * ---------------------------------------------------------------------------
 * A non-developer can safely edit everything in this file.
 * Each value that still needs a real answer carries a visible placeholder.
 *
 *   [TO COMPLETE]  = a fact we do not have yet (legal name, address, ...)
 *   [TO CONFIRM]   = a decision that must be validated by the studio owner
 *
 * Everything a visitor reads lives in `src/content/en/`; this file only holds
 * the facts that must stay identical on every page (brand, contact, legal).
 * ===========================================================================
 */

export const site = {
  /** Brand name. Change it here and it changes everywhere (title, schema, OG). */
  brand: 'Vitrine Studio',

  /**
   * Tagline. Doubles as the default meta description and the organisation
   * description in the structured data, so it stays under one sentence.
   */
  tagline: 'Custom websites, web apps and automation, built to fit how you work.',

  /**
   * [TO CONFIRM] Domain of the production site. Must match astro.config.mjs.
   * While `siteUrlConfirmed` is false the site is served with a
   * `noindex, nofollow` directive and robots.txt blocks crawlers.
   */
  siteUrl: 'https://vitrine-studio.example',
  siteUrlConfirmed: false,

  /** Primary contact e-mail. */
  email: 'studiovetrine@gmail.com',

  /** Phone number in international format. */
  phone: '+213782416538',

  /** Optional public booking / scheduling link. Empty = no link rendered. */
  bookingUrl: '',

  /**
   * [TO COMPLETE] Legal / trading name of the publishing entity.
   * Auto-entrepreneur: the name under which you are registered, used on
   * invoices and on the legal notice.
   */
  legalName: '[TO COMPLETE — registered trading name]',

  /** Legal form: the studio operates as an auto-entrepreneur (EI). */
  legalForm: 'Auto-entrepreneur (EI)',

  /** [TO COMPLETE] SIRET / SIREN number from the registration. */
  registrationNumber: '[TO COMPLETE — SIRET number]',

  /** [TO COMPLETE] Registered postal address. */
  address: {
    street: '[TO COMPLETE]',
    postalCode: '[TO COMPLETE]',
    city: '[TO COMPLETE]',
    country: 'Algeria',
  },

  /**
   * Team location. Only state what is actually true.
   * The studio works remotely; no physical office is claimed.
   */
  location: {
    label: 'Algeria — remote studio',
    /** Remote-first, small team — truthful description, no headcount invented. */
    model: 'remote-first',
  },

  /** Publication director. */
  publicationDirector: '[TO COMPLETE — name of the publishing manager]',

  /**
   * Hosting provider used for the site itself. Vercel Inc., Delaware, USA.
   * The same headers are mirrored in `vercel.json`.
   */
  host: {
    provider: 'Vercel Inc.',
    address: '340 S Lemon Ave #4133, Walnut, CA 91789, United States',
    contact: 'https://vercel.com/contact',
    jurisdiction: 'United States (Delaware)',
  },

  /** Social profiles. Empty array = no social links rendered. */
  social: [] as { label: string; href: string }[],

  /**
   * ---------------------------------------------------------------------------
   * CONTACT FORM BACKEND
   * ---------------------------------------------------------------------------
   * The site ships with NO backend at all. The contact form builds a `mailto:`
   * link (works with JavaScript) and always exposes a plain e-mail link as a
   * no-JavaScript fallback.
   *
   * To connect a real form later (Formspree, Netlify Forms, a Cloudflare
   * Worker, an API route…), set `contactFormEndpoint` to the service URL and
   * add that origin to the CSP in `public/_headers` (see README).
   * Leave it as an empty string to keep the mailto behaviour.
   */
  contactFormEndpoint: '',

  /**
   * Feature switches.
   */
  features: {
    /** Blog section. Off by default; the routes and the content exist. */
    blog: false,
    /** Sticky call-to-action bar on mobile. */
    stickyMobileCta: true,
  },

  /**
   * Technology stack, displayed as a text strip (no third-party logos).
   * [TO CONFIRM] Every entry must be something the studio really uses: this
   * list is a public claim, not a wish list.
   */
  stack: [
    'TypeScript',
    'Astro',
    'React',
    'Tailwind CSS',
    'Node.js',
    'Python',
    'PostgreSQL',
    'Git',
    'Cloudflare',
    'Netlify',
    'Docker',
    'Playwright',
  ],
} as const;

export type SiteConfig = typeof site;

/**
 * True when a string still contains an unresolved editorial marker.
 * Used to style a value differently instead of silently shipping a bracket.
 */
export function hasPlaceholder(value: string): boolean {
  return /\[(TO COMPLETE|TO CONFIRM|TO VALIDATE|LOCATION TO CONFIRM|PRICE TO DEFINE|TIMELINE TO CONFIRM|CLIENT TO ADD)\b[^\]]*\]/i.test(
    value,
  );
}
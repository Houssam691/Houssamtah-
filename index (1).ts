import type { Dict, Locale } from '~/content/types';
import { en } from '~/content/en';

export type { Locale };

/* ==========================================================================
   LOCALE
   --------------------------------------------------------------------------
   The site is published in English only. The locale layer is kept in place on
   purpose: adding a language later means adding one entry to `locales`, one
   dictionary, and one line to `astro.config.mjs` — no page or component has to
   change. There is no switcher in the markup today, because rendering a single
    "EN / EN" control would be noise. See `src/lib/paths.ts` and
    `docs/content-guide.md`.
   ========================================================================== */

export const defaultLocale: Locale = 'en';

export interface LocaleMeta {
  code: Locale;
  /** Name written in the language itself. */
  label: string;
  /** Value for the `lang` attribute. */
  htmlLang: string;
  dir: 'ltr' | 'rtl';
  /** Value for `hreflang` and for `og:locale`. */
  hreflang: string;
  ogLocale: string;
}

export const locales: LocaleMeta[] = [
  { code: 'en', label: 'English', htmlLang: 'en', dir: 'ltr', hreflang: 'en', ogLocale: 'en_US' },
];

export const localeMeta = (locale: Locale): LocaleMeta =>
  locales.find((item) => item.code === locale) ?? locales[0]!;

export const isLocale = (value: string): value is Locale =>
  locales.some((item) => item.code === value);

export const dir = (locale: Locale): 'ltr' | 'rtl' => localeMeta(locale).dir;

/* ==========================================================================
   PATHS
   Paths are handled without their locale prefix and without a trailing slash
   internally ('/', '/services', '/services/custom-websites'), and rendered with
   a trailing slash because Astro is configured with `trailingSlash: 'always'`.
   ========================================================================== */

/** '/en/services///' -> '/services' */
export function stripLocale(pathname: string): { path: string; locale: Locale } {
  const segments = pathname.split('/').filter(Boolean);
  const [first, ...rest] = segments;

  if (first && isLocale(first) && first !== defaultLocale) {
    return { path: `/${rest.join('/')}`, locale: first };
  }

  return { path: `/${segments.join('/')}`, locale: defaultLocale };
}

/** Reads the locale of a URL, from Astro.url or from a raw pathname. */
export function localeFromUrl(url: URL | string): Locale {
  const pathname = typeof url === 'string' ? url : url.pathname;
  return stripLocale(pathname).locale;
}

/**
 * '/'         + 'en' -> '/'
 * '/services' + 'en' -> '/services/'
 * A future non-default locale gets its code as a prefix: '/fr/services/'.
 */
export function localizedPath(path: string, locale: Locale): string {
  const clean = `/${path.split('/').filter(Boolean).join('/')}`;
  if (locale === defaultLocale) return clean === '/' ? '/' : `${clean}/`;
  return clean === '/' ? `/${locale}/` : `/${locale}${clean}/`;
}

/* ==========================================================================
   DICTIONARY
   ========================================================================== */

export function useDict(locale: Locale): Dict {
  void locale;
  return en;
}
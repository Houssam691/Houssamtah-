/**
 * ===========================================================================
 * STATIC PATHS HELPER
 * ---------------------------------------------------------------------------
 * Every page is written once and rendered in English only.
 *
 * English is served without a prefix: `/`, `/services/`. There is no locale
 * prefix to keep, no translation switch, and no `dir="rtl"` variant.
 *
 * `getStaticPaths()` is provided here so page files stay free of routing code.
 * ===========================================================================
 */
import { defaultLocale, locales, type Locale } from '~/i18n';

export interface LocalePath {
  params: { locale: string | undefined };
  props: { locale: Locale };
}

/** `/`, `/services`, `/legal/mentions` — locale-free, no trailing slash. */
export function localeStaticPaths(): LocalePath[] {
  return locales.map((item) => ({
    params: { locale: item.code === defaultLocale ? undefined : item.code },
    props: { locale: item.code },
  }));
}

/**
 * Combines `localeStaticPaths()` with a dynamic segment, e.g. a service slug or
 * a case-study slug: `/services/web-applications/`, `/en/services/web-applications/`.
 */
export function localeStaticPathsWith<T>(
  entries: readonly T[],
  toParam: (entry: T) => string,
): (LocalePath & { params: { locale: string | undefined; slug: string } })[] {
  return entries.flatMap((entry) =>
    localeStaticPaths().map((base) => ({
      ...base,
      params: { ...base.params, slug: toParam(entry) },
    })),
  );
}

/** Reads the locale handed over by `getStaticPaths()`. */
export function localeFromProps(props: Record<string, unknown>): Locale {
  return (props.locale as Locale) ?? defaultLocale;
}
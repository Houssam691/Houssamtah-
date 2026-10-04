/**
 * robots.txt
 * ---------------------------------------------------------------------------
 * While `site.siteUrlConfirmed` is false the whole site is blocked: it must not
 * be indexed before the final domain, the legal information and the real
 * contact details are in place.
 *
 * Setting `siteUrlConfirmed = true` in `src/config/site.ts` (and replacing the
 * placeholder domain in `astro.config.mjs`) flips this file automatically.
 */
import type { APIRoute } from 'astro';
import { site } from '~/config/site';

export const GET: APIRoute = ({ site: astroSite }) => {
  const origin = astroSite?.origin ?? new URL(site.siteUrl).origin;

  const lines = site.siteUrlConfirmed
    ? ['User-agent: *', 'Allow: /', '', `Sitemap: ${origin}/sitemap-index.xml`, '']
    : [
        '# Vitrine Studio — indexing is disabled on purpose.',
        '# Set `siteUrlConfirmed = true` in src/config/site.ts once the final',
        '# domain, the legal information and the contact details are confirmed.',
        'User-agent: *',
        'Disallow: /',
        '',
      ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
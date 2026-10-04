// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * ---------------------------------------------------------------------------
 * SITE URL  ->  [À CONFIRMER]
 * Replace the placeholder domain below with the final production domain.
 * As long as `siteUrlConfirmed` stays false, robots.txt disallows indexing
 * and the sitemap is still generated for verification purposes.
 * ---------------------------------------------------------------------------
 */
const SITE_URL = 'https://vitrine-studio.example';

export default defineConfig({
  site: SITE_URL,

  // Static output: no adapter, no server, no backend of any kind.
  output: 'static',

  trailingSlash: 'always',
  build: {
    // Inline small stylesheets to keep the critical path to a single request.
    inlineStylesheets: 'auto',
  },

  compressHTML: true,

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en' },
      },
      changefreq: 'monthly',
      lastmod: undefined,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline assets as data URIs: keeps HTML small and cacheable.
      assetsInlineLimit: 0,
    },
  },

  devToolbar: { enabled: false },
});
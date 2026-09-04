// @ts-check

import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';
import { fontaineAfterImports } from './scripts/fontaine-after-imports.mjs';

// https://astro.build/config
export default defineConfig({
  // Every absolute URL BaseLayout publishes is built from this.
  site: 'https://vvsgith.github.io',
  // GitHub Pages serves the site under the repository name.
  base: '/my-cv-website/',
  output: 'static',
  // `preact/debug` in dev only, because a hydration mismatch is otherwise
  // silent (hacks/2026-08-01 §11).
  integrations: [preact({ devtools: true })],
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    routing: {
      // Italian (default) is also served unprefixed using a rewrite.
      prefixDefaultLocale: true,
    },
  },
  vite: {
    css: { postcss: { plugins: [fontaineAfterImports] } },
  },
  prefetch: {
    defaultStrategy: 'hover',
  },
});

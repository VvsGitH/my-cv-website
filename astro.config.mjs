// @ts-check

import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';
import { toAstroFonts, toSubsetTasks } from './fonts.config.mjs';
import { subsetFonts } from './scripts/subset-fonts.mjs';

// https://astro.build/config
export default defineConfig({
  // Every absolute URL BaseLayout publishes is built from this.
  site: 'https://vvsgith.github.io',
  // GitHub Pages serves the site under the repository name.
  base: '/my-cv-website/',
  output: 'static',
  integrations: [
    preact({ devtools: true }),
    // `subsetFonts` cuts the faces `fonts` declares before Astro resolves them
    // (ADR-0024); `preact/debug` in dev only, because a hydration mismatch is
    // otherwise silent (hacks/2026-08-01 §11).
    subsetFonts(toSubsetTasks()),
  ],
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    routing: {
      // Italian (default) is also served unprefixed using a rewrite.
      prefixDefaultLocale: true,
    },
  },
  fonts: toAstroFonts(),
  prefetch: {
    defaultStrategy: 'hover',
  },
});

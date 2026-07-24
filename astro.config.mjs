// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages serves the site under the repository name.
  base: '/my-cv-website/',
  output: 'static',
  integrations: [react()],
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    routing: {
      // Italian (default) is served unprefixed at `/`; English is prefixed at `/en/`.
      prefixDefaultLocale: false,
    },
  },
});

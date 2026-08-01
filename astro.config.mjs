// @ts-check
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import { FontaineTransform } from 'fontaine';

const stylesDir = fileURLToPath(new URL('./src/styles/', import.meta.url));

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
      // Italian (default) is served unprefixed at `/`; English is prefixed at `/en/`.
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [
      // Metric-matched local fallbacks, so text does not reflow on swap (ADR-0012).
      FontaineTransform.vite({
        fallbacks: ['Arial'],
        resolvePath: (id) => pathToFileURL(resolve(stylesDir, id)),
      }),
    ],
  },
});

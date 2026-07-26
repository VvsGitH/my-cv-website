// @ts-check
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import { FontaineTransform } from 'fontaine';

const stylesDir = fileURLToPath(new URL('./src/styles/', import.meta.url));

// https://astro.build/config
export default defineConfig({
  // GitHub Pages serves the site under the repository name.
  base: '/my-cv-website/',
  output: 'static',
  // `devtools` injects `preact/debug` in dev only. Without it, a hydration
  // mismatch stops hydrating and re-renders in silence — Preact logs nothing.
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
      // Generates metric-matched local @font-face fallbacks (size-adjust /
      // ascent-override / descent-override) so text doesn't reflow once the
      // self-hosted face swaps in.
      FontaineTransform.vite({
        fallbacks: ['Arial'],
        resolvePath: (id) => pathToFileURL(resolve(stylesDir, id)),
      }),
    ],
  },
});

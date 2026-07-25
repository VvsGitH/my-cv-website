// @ts-check
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { FontaineTransform } from 'fontaine';

const stylesDir = fileURLToPath(new URL('./src/styles/', import.meta.url));

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

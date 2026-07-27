import { defineConfig, devices } from '@playwright/test';
import { VIEWPORTS } from './tests/support/page';
import { BASE, ORIGIN, PREVIEW_PORT } from './tests/support/site';

/**
 * The single test seam (ticket 12): Playwright against the built output, served
 * by `astro preview` — the same artifact CI deploys, not the dev server.
 */

const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: ORIGIN,
    viewport: VIEWPORTS.paper,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: VIEWPORTS.paper },
    },
  ],
  webServer: {
    // A pinned port: nothing in astro.config.mjs sets one, and `baseURL` has to
    // be known before the server starts.
    command: `npm run preview -- --port ${PREVIEW_PORT}`,
    url: `${ORIGIN}${BASE}`,
    reuseExistingServer: !isCI,
  },
});

import { defineConfig, devices } from '@playwright/test';
import { VIEWPORTS } from './tests/support/page';
import { BASE, ORIGIN, PREVIEW_PORT } from './tests/support/site';

/**
 * The single test seam (ADR-0010): Playwright against the built output, served
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
    // Astro 7.3 asks `am-i-vibing` whether an AI agent is running it and, if so,
    // daemonizes `astro preview` — the command then exits 0 immediately and
    // Playwright reports `Process from config.webServer exited early`. This
    // variable is read only as "the background decision was made explicitly, do
    // not auto-detect"; with no `--background` flag beside it, that decision is
    // the foreground, which is the only thing `webServer` can supervise.
    env: { ASTRO_PREVIEW_BACKGROUND: '1' },
  },
});

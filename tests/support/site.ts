import astroConfig from '../../astro.config.mjs';
import type { Locale } from '../../src/content/types';

/**
 * What the built site publishes, derived from the one place it is configured.
 * `scripts/render-captures.mjs` builds its routes the same way — the two must
 * agree, since the suite asserts the pages against the PDFs that come off them.
 */

export const PREVIEW_PORT = 4322;

export const ORIGIN = `http://localhost:${PREVIEW_PORT}`;

export const BASE = astroConfig.base ?? '/';

const OUT_DIR = astroConfig.outDir ?? 'dist';

const DEFAULT_LOCALE = (astroConfig.i18n?.defaultLocale ?? 'it') as Locale;

export const LOCALES: readonly Locale[] = ['it', 'en'];

export const routeFor = (locale: Locale): string =>
  locale === DEFAULT_LOCALE ? BASE : `${BASE}${locale}/`;

/**
 * The PDF a page's download link points at, as a path on disk. Resolved from
 * the link rather than rebuilt from a template: the filename is written down in
 * both `Chrome.astro` and `render-captures.mjs`, and a third copy here would
 * hide the two drifting apart instead of catching it.
 */
export const distPathForHref = (href: string): string =>
  `${OUT_DIR}/${href.slice(BASE.length)}`;

export const otherLocale = (locale: Locale): Locale => (locale === 'it' ? 'en' : 'it');

import astroConfig from '../../astro.config.mjs';
import type { Locale } from '../../src/content/types';

export { otherLocale } from '../../src/i18n/locale';

/** Derived from astro.config, the same way render-captures.mjs derives its routes. */

export const PREVIEW_PORT = 4322;

export const ORIGIN = `http://localhost:${PREVIEW_PORT}`;

export const BASE = astroConfig.base ?? '/';

const OUT_DIR = astroConfig.outDir ?? 'dist';

const DEFAULT_LOCALE = (astroConfig.i18n?.defaultLocale ?? 'it') as Locale;

export const LOCALES: readonly Locale[] = ['it', 'en'];

export const routeFor = (locale: Locale): string =>
  locale === DEFAULT_LOCALE ? BASE : `${BASE}${locale}/`;

/** Resolved from the link, not a template — a third copy of the filename would
 * hide the other two drifting apart instead of catching it (ADR-0009). */
export const distPathForHref = (href: string): string =>
  `${OUT_DIR}/${href.slice(BASE.length)}`;

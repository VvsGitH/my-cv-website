import astroConfig from '../../astro.config.mjs';
import { type Locale, locales, otherLocale } from '../../src/i18n/locale';

export { locales as LOCALES, otherLocale };

/** Derived from astro.config, the same way render-captures.mjs derives its routes. */

export const PREVIEW_PORT = 4322;

export const ORIGIN = `http://localhost:${PREVIEW_PORT}`;

export const BASE = astroConfig.base ?? '/';

const OUT_DIR = astroConfig.outDir ?? 'dist';

export const routeFor = (locale: Locale): string => `${BASE}${locale}/`;
export const ogRouteFor = (locale: Locale): string => `${BASE}${locale}/og/`;

/** Resolved from the link, not a template — a third copy of the filename would
 * hide the other two drifting apart instead of catching it (ADR-0009). */
export const distPathForHref = (href: string): string => `${OUT_DIR}/${href.slice(BASE.length)}`;

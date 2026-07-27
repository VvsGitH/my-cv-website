import type { Locale } from '../content/types';

/**
 * The other of the two Locales. There are exactly two (CONTEXT.md: "Locale"),
 * so "the other one" is a total function and not a lookup that can miss.
 */
export const otherLocale = (locale: Locale): Locale => (locale === 'it' ? 'en' : 'it');

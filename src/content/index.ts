import type { CvContent, Locale } from './types';
import { en } from './en';
import { it } from './it';

/** The CV content for each Locale, keyed for lookup from a route. */
export const cv: Record<Locale, CvContent> = { it, en };

export type * from './types';

/*
 * There are exactly two Locales (CONTEXT.md: "Locale")
 */
export type Locale = 'it' | 'en';

export const locales: readonly [Locale, Locale] = ['it', 'en'];
export const defaultLocale: Locale = locales[0];

export const localePaths = () => {
  return locales.map((locale) => ({
    params: { locale },
    props: { locale },
  }));
};

export const otherLocale = (locale: Locale): Locale => {
  const [firstLocale, secondLocale] = locales;
  return locale === firstLocale ? secondLocale : firstLocale;
};

export interface ToolbarLinks {
  /** Fixed order [it, en] — load-bearing: the CSS reads the last child to place the pill. */
  locales: { locale: Locale; href: string; current: boolean }[];
  pdfHref: string;
}

export const chromeLinks = (locale: Locale): ToolbarLinks => ({
  locales: locales.map((entry) => ({
    locale: entry,
    href: `${import.meta.env.BASE_URL}${entry}/`,
    current: entry === locale,
  })),
  // Written down twice, deliberately (ADR-0009). Change one end, change the other.
  pdfHref: `${import.meta.env.BASE_URL}Vito_Paparella_Santorsola_CV_${locale.toUpperCase()}.pdf`,
});

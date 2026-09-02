/*
 * There are exactly two Locales (CONTEXT.md: "Locale")
*/
export type Locale = "it" | "en";

export const locales: readonly [Locale, Locale] = ["it", "en"];
export const defaultLocale: Locale = locales[0];

export const localePaths = () => {
  return locales.map(locale => ({
    params: { locale },
    props: { locale }
  }));
};

export const otherLocale = (locale: Locale): Locale => {
  const [firstLocale, secondLocale] = locales;
  return locale === firstLocale ? secondLocale : firstLocale;
};

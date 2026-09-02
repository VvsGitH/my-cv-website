import { expect, test } from '@playwright/test';
import astroConfig from '../astro.config.mjs';
import { defaultLocale, locales } from '../src/i18n/locale';

/**
 * `src/i18n/locale.ts` declares the Locales; `astro.config.mjs` declares them a
 * second time, because Astro's `i18n` block cannot read them from the domain —
 * the config is loaded by three different runtimes before `src/` exists to it.
 *
 * Two declarations of one fact is a drift risk, and the drift is silent: Astro
 * would keep routing the config's list while `otherLocale`, `localePaths` and
 * every `Record<Locale, …>` kept answering from the domain's. The failure would
 * surface as a 404 on a route nothing generated, far from its cause.
 *
 * So the duplication is allowed and pinned here instead. This is the one test in
 * the suite that reads source rather than the built artifact (ADR-0010): the two
 * lists have no single rendered consequence to observe, and catching the mismatch
 * at its cause is worth more than inferring it from a missing page.
 */

test.describe('the two declarations of the Locale set', () => {
  test('list the same Locales, in the same order', () => {
    // Order is part of the contract, not incidental: `locale.ts` derives
    // `defaultLocale` from the first entry, and `otherLocale` reads the pair
    // positionally. A reordered config would keep every route and change which
    // Locale the site defaults to.
    //
    // Astro also accepts `{ path, codes }` entries, which the domain has no
    // shape for; `toEqual` reports that as the mismatch it is.
    expect(
      astroConfig.i18n!.locales,
      'astro.config.mjs i18n.locales vs src/i18n/locale.ts',
    ).toEqual([...locales]);
  });

  test('agree on which Locale is the default', () => {
    // The one the root rewrite serves, and the one `getAbsoluteLocaleUrl` builds
    // the `x-default` hreflang from.
    expect(
      astroConfig.i18n!.defaultLocale,
      'astro.config.mjs i18n.defaultLocale vs src/i18n/locale.ts',
    ).toBe(defaultLocale);
  });
});

import { expect, test } from '@playwright/test';
import { cv } from '../src/content';
import type { Column, Locale, SheetNumber } from '../src/content/types';
import { openPainted, renderedKinds, sheet, slackBelowLastBlock, VIEWPORTS } from './support/page';
import { LOCALES, routeFor } from './support/site';

// Declared rather than inherited from the config: below 51rem the Asides leave
// the paper, so the number every measurement here rests on is load-bearing.
test.use({ viewport: VIEWPORTS.paper });

const SHEETS: SheetNumber[] = [1, 2];
const COLUMNS: Column[] = ['aside', 'main'];

/** The Blocks of one Locale in the order the Sheets render them. */
const blocksInDocumentOrder = (locale: Locale) =>
  SHEETS.flatMap((number) =>
    COLUMNS.flatMap((column) =>
      cv[locale].blocks.filter((block) => block.sheet === number && block.column === column),
    ),
  );

const headingsOf = (locale: Locale) =>
  blocksInDocumentOrder(locale).flatMap((block) => ('heading' in block ? [block.heading] : []));

for (const locale of LOCALES) {
  test.describe(locale, () => {
    test.beforeEach(async ({ page }) => {
      await openPainted(page, routeFor(locale));
    });

    test('is two Sheets, declared in its own Locale', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('.sheet')).toHaveCount(2);
    });

    test('places every Block on the Sheet and in the column it declares', async ({ page }) => {
      for (const number of SHEETS) {
        for (const column of COLUMNS) {
          const expected = cv[locale].blocks
            .filter((block) => block.sheet === number && block.column === column)
            .map((block) => block.kind);

          expect(
            await renderedKinds(sheet(page, number), column),
            `Sheet ${number} ${column}`,
          ).toEqual(expected);
        }
      }
    });

    test('renders every section heading the content declares', async ({ page }) => {
      const rendered = await page
        .locator('.sheet .section-heading')
        .evaluateAll((headings) => headings.map((heading) => heading.textContent?.trim() ?? ''));

      expect(rendered).toEqual(headingsOf(locale));
    });

    /** The assertion ticket 11 handed over; the current slack is tabled there. */
    test('keeps every column inside the paper', async ({ page }) => {
      for (const number of SHEETS) {
        for (const column of COLUMNS) {
          const slack = await slackBelowLastBlock(sheet(page, number), column);
          const edge = column === 'aside' ? 'panel' : 'Sheet';

          expect(
            slack,
            `Sheet ${number} ${column} runs ${Math.abs(slack).toFixed(1)}px past its ${edge}`,
          ).toBeGreaterThan(0);
        }
      }
    });

    /** Design intent from ticket 17, and silently broken by any of the four
     * values `--main-first-heading-gap` derives from drifting. */
    test('opens both columns of Sheet 1 on the same line', async ({ page }) => {
      const topOf = (column: Column) =>
        sheet(page, 1)
          .locator(`.${column} .section-heading`)
          .first()
          .evaluate((heading) => heading.getBoundingClientRect().top);

      const [aside, main] = [await topOf('aside'), await topOf('main')];

      expect(Math.abs(aside - main), `aside at ${aside}, main at ${main}`).toBeLessThanOrEqual(1);
    });
  });
}

test('says the same things in different words in each Locale', async ({ page }) => {
  const render = async (locale: Locale) => {
    await openPainted(page, routeFor(locale));
    return {
      headings: await page
        .locator('.sheet .section-heading')
        .evaluateAll((headings) => headings.map((heading) => heading.textContent?.trim() ?? '')),
      about: await sheet(page, 1).locator('.block--about .about').first().innerText(),
      name: await page.locator('.block--header .name').innerText(),
    };
  };

  const italian = await render('it');
  const english = await render('en');

  expect(italian.headings).toHaveLength(english.headings.length);
  // Privacy is the one section whose heading the two Locales spell the same.
  expect(
    italian.headings.filter((heading, index) => heading === english.headings[index]),
  ).toEqual(['Privacy']);

  expect(italian.about).not.toBe(english.about);
  // The CV is one person's in both Locales, so the name is not translated.
  expect(italian.name).toBe(english.name);
});

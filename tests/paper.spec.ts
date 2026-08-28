import { expect, test } from '@playwright/test';
import { cv } from '../src/content';
import type { Column, Locale, SheetNumber } from '../src/content/types';
import { openPainted, renderedKinds, sheet, slackBelowLastBlock, VIEWPORTS } from './support/page';
import { LOCALES, routeFor } from './support/site';

// Declared rather than inherited from the config. It is no longer a Mode that
// rests on it — Paper Mode is the default at every width (ADR-0017) — but the
// Sheet zooms to fit below ~888px, and a measurement of scaled paper is a
// measurement of nothing. `paper` is wide enough that the zoom resolves to 1.
test.use({ viewport: VIEWPORTS.paper });

const SHEETS: SheetNumber[] = [1, 2];
const COLUMNS: Column[] = ['aside', 'main'];

/** The Blocks of one Locale in the order the Sheets render them. */
const blocksInDocumentOrder = (locale: Locale) =>
  SHEETS.flatMap((number) =>
    COLUMNS.flatMap((column) =>
      cv[locale].blocks.filter(
        (block) => block.paperSheet === number && block.paperColumn === column,
      ),
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
            .filter((block) => block.paperSheet === number && block.paperColumn === column)
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

    /** ADR-0010 records why this exists and how it is designed. */
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

    /** Design intent (ADR-0011), which the floor on the header Block delivers. */
    test('opens both columns of Sheet 1 on the same line', async ({ page }) => {
      const topOf = (column: Column) =>
        sheet(page, 1)
          .locator(`.${column} .section-heading`)
          .first()
          .evaluate((heading) => heading.getBoundingClientRect().top);

      const [aside, main] = [await topOf('aside'), await topOf('main')];

      expect(Math.abs(aside - main), `aside at ${aside}, main at ${main}`).toBeLessThanOrEqual(1);
    });

    /** The condition the alignment above rests on, asserted separately so that
     * outgrowing it reads as its own cause rather than as a mystery drift. */
    test('keeps the header shorter than the portrait it answers to', async ({ page }) => {
      // The Block's own box is the floor, so only its content answers the question.
      const heightOf = (selector: string) =>
        sheet(page, 1)
          .locator(selector)
          .evaluate((element) => element.getBoundingClientRect().height);

      const [header, portrait] = [
        await heightOf('.block--header > .cv-header'),
        await heightOf('.block--photo .photo'),
      ];

      expect(
        header,
        `the header is ${header}px against a ${portrait}px portrait — the floor in ` +
          'Sheet.astro no longer holds, and the two columns have drifted apart',
      ).toBeLessThanOrEqual(portrait);
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

test('dates the Privacy statement at build time, identically in both Locales', async ({ page }) => {
  const placeDateOf = async (locale: Locale) => {
    await openPainted(page, routeFor(locale));
    return (await sheet(page, 2).locator('.block--privacy .place-date').innerText()).trim();
  };

  const italian = await placeDateOf('it');
  const english = await placeDateOf('en');

  // Not today's date spelled out here: the point is the shape the build writes.
  expect(italian).toMatch(/^Bari, \d{4}\.\d{2}\.\d{2}$/);
  // One build, one date — the two Locales cannot drift apart the way two
  // hand-written strings could.
  expect(english).toBe(italian);
});

import { expect, test, type Locator, type Page } from '@playwright/test';
import { cv } from '../src/content';
import type { Locale } from '../src/content/types';
import { ui } from '../src/i18n/ui';
import { openPainted, sheet, toolbar, VIEWPORTS } from './support/page';
import { readPdf, withoutWhitespace } from './support/pdf';
import { distPathForHref, LOCALES, otherLocale, routeFor } from './support/site';

/**
 * The Colophon (CONTEXT.md) — what the site says about itself, ticket 19.
 *
 * `contentinfo` is the locator throughout rather than a class: a `<footer>`
 * maps to that role only while it is outside `<main>`, so finding it by role
 * *is* the assertion that it is Chrome and not paper.
 */
const colophon = (page: Page): Locator => page.getByRole('contentinfo');

const headerOf = (locale: Locale) => {
  const header = cv[locale].blocks.find((block) => block.kind === 'header');
  if (!header) throw new Error(`the ${locale} content has no header Block`);
  return header;
};

const hrefsIn = (locator: Locator): Promise<string[]> =>
  locator.getByRole('link').evaluateAll((links) =>
    links.map((link) => link.getAttribute('href') ?? ''),
  );

type Srgb = [number, number, number];

/** WCAG 2.x relative luminance. */
function luminance([red, green, blue]: Srgb): number {
  const channel = (value: number): number => {
    const ratio = value / 255;
    return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

const contrastRatio = (foreground: Srgb, background: Srgb): number => {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light! + 0.05) / (dark! + 0.05);
};

/** The Colophon's ink against the page it is printed on, in the current theme. */
async function readability(page: Page): Promise<{ ratio: number; fontSize: number }> {
  const measured = await page.evaluate(() => {
    // The tokens are authored in oklch() and `getComputedStyle` hands that
    // back untouched, so the colours are rasterised rather than parsed.
    const context = document.createElement('canvas').getContext('2d')!;
    const srgb = (value: string): [number, number, number] => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      return [red!, green!, blue!];
    };

    const block = document.querySelector('footer')!;
    const style = getComputedStyle(block);
    return {
      color: srgb(style.color),
      background: srgb(getComputedStyle(document.body).backgroundColor),
      fontSize: parseFloat(style.fontSize),
    };
  });

  return {
    ratio: contrastRatio(measured.color, measured.background),
    fontSize: measured.fontSize,
  };
}

for (const locale of LOCALES) {
  test.describe(locale, () => {
    const strings = ui[locale].colophon;

    test.beforeEach(async ({ page }) => {
      await openPainted(page, routeFor(locale));
    });

    test('is a landmark about the site, not a part of the paper', async ({ page }) => {
      await expect(colophon(page)).toHaveCount(1);
      await expect(colophon(page)).toHaveAccessibleName(strings.name);
      await expect(page.locator('main footer')).toHaveCount(0);
      await expect(page.locator('.sheet footer')).toHaveCount(0);
    });

    test('signs the site off in the owner’s name', async ({ page }) => {
      // The year comes from the build and moves on its own (ticket 19), so it
      // is deliberately not asserted — only the notice and whose it is.
      await expect(colophon(page)).toContainText('©');
      await expect(colophon(page)).toContainText(headerOf(locale).name);
    });

    test('states the data regime and the accessibility aim', async ({ page }) => {
      await expect(colophon(page)).toContainText(strings.dataNotice);
      await expect(colophon(page)).toContainText(strings.accessibility);
    });

    test('points at this page in the other language, labelled in it', async ({ page }) => {
      const other = otherLocale(locale);
      const link = colophon(page).getByRole('link', { name: ui[other].colophon.localeName });

      await expect(link).toHaveAttribute('hreflang', other);
      // WCAG 3.1.2: without it an Italian screen reader says "English" with
      // Italian phonetics.
      await expect(link).toHaveAttribute('lang', other);

      await link.click();
      await expect(page).toHaveURL(routeFor(other));
      await expect(page.locator('html')).toHaveAttribute('lang', other);
    });

    test('offers the header’s own channels, not a second copy of them', async ({ page }) => {
      const expected = headerOf(locale)
        .contacts.flatMap((contact) => (contact.url ? [contact.url] : []));
      expect(expected.length, 'the header should carry email and LinkedIn').toBe(2);

      const onPaper = await hrefsIn(sheet(page, 1).locator('.block--header'));
      expect(onPaper).toEqual(expected);

      expect(await hrefsIn(colophon(page))).toEqual(expect.arrayContaining(expected));
    });

    test('is set on the page itself, at a size that can be read', async ({ page }) => {
      await expect(colophon(page)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

      const light = await readability(page);
      expect(light.fontSize, 'the Colophon should not be set below 12px').toBeGreaterThanOrEqual(12);
      expect(light.ratio, 'the Colophon against the light page').toBeGreaterThanOrEqual(4.5);

      await toolbar(page).locator('.toolbar-theme').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      const dark = await readability(page);
      expect(dark.ratio, 'the Colophon against the dark page').toBeGreaterThanOrEqual(4.5);
    });

    test('keeps its words out of the PDF', async ({ page }) => {
      const href = await toolbar(page).locator('a[download]').getAttribute('href');
      const report = await readPdf(distPathForHref(href!));

      const words = [
        ...Object.values(strings).filter((line) => line !== strings.localeName),
        // What the language link actually says on this page.
        ui[otherLocale(locale)].colophon.localeName,
        // The imprint. Its name is the CV's own, so the symbol is the handle.
        '©',
      ];

      for (const line of words) {
        expect(report.text, `“${line}” is Chrome and belongs nowhere near the paper`).not.toContain(
          withoutWhitespace(line),
        );
      }
    });
  });
}

test.describe('Reading Mode', () => {
  // The narrowest column the site targets (Document.astro's `min-width`), which
  // is where the Toolbar's berth is tightest.
  test.use({ viewport: { width: 368, height: VIEWPORTS.reading.height } });

  test.beforeEach(async ({ page }) => {
    await openPainted(page, routeFor('it'));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  });

  test('runs in the same column as the paper above it', async ({ page }) => {
    const contentLeft = (locator: Locator): Promise<number> =>
      locator.evaluate(
        (element) =>
          element.getBoundingClientRect().x +
          parseFloat(getComputedStyle(element).paddingInlineStart),
      );

    expect(await contentLeft(colophon(page))).toBeCloseTo(
      await contentLeft(page.locator('.sheets')),
      1,
    );
  });

  test('leaves the Toolbar its berth at the foot of the scroll', async ({ page }) => {
    await expect(toolbar(page)).toBeVisible();

    const covered = await page.evaluate(() => {
      const strip = document.querySelector('.toolbar')!.getBoundingClientRect();
      return [...document.querySelectorAll('footer :is(p, li)')]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return (
            box.left < strip.right &&
            box.right > strip.left &&
            box.top < strip.bottom &&
            box.bottom > strip.top
          );
        })
        .map((element) => element.textContent?.trim().slice(0, 40) ?? '');
    });

    expect(covered, 'the Toolbar floats over these lines').toEqual([]);
  });
});

import { existsSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import { cv } from '../src/content';
import type { Locale } from '../src/i18n/locale';
import { openPainted, readingMode } from './support/page';
import { type PdfReport, readPdf, readPdfBytes, withoutWhitespace } from './support/pdf';
import {
  distPathForHref,
  LOCALES,
  ORIGIN,
  ogRouteFor,
  otherLocale,
  routeFor,
} from './support/site';

/** A4 in PostScript points, with the slack `render-captures.mjs` documents. */
const A4 = { width: 595.28, height: 841.89 };
const TOLERANCE = 1;

/** Every face `src/styles/fonts.css` declares, under the name Chromium embeds it
 *  with — and each one is drawn, so this doubles as the set the PDF must carry.
 *  All four families are TrueType now, so every one of them has a `BaseFont`:
 *  the Type3 blind spot ADR-0009 and ADR-0010 worked around, which Garet and Now
 *  opened by being CFF, is gone. */
const CV_FACES = [
  'JetBrainsMono-Regular',
  'JetBrainsMono-Bold',
  'JetBrainsMono-ExtraBold',
  'AtkinsonHyperlegible-Regular',
  'AtkinsonHyperlegible-Bold',
  'AtkinsonHyperlegible-Italic',
  'Primera_Signature',
  'icomoon-feather',
];

/** A Continuation's heading is a screen-reader-only copy (ADR-0005), so it is
 *  no evidence of which Locale a file holds. */
const visibleHeadings = (locale: Locale): string[] =>
  cv[locale].blocks.flatMap((block) =>
    'heading' in block && !(block.kind === 'mainSection' && block.continues) ? [block.heading] : [],
  );

for (const locale of LOCALES) {
  test.describe(locale, () => {
    let report: PdfReport;
    let path: string;

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage({ baseURL: ORIGIN });
      await openPainted(page, routeFor(locale));
      const href = await page.locator('.toolbar a[download]').getAttribute('href');
      await page.close();

      path = distPathForHref(href!);
      if (!existsSync(path)) {
        throw new Error(
          `${path} was never rendered — run \`npm run captures:render\` after a build.`,
        );
      }

      report = await readPdf(path);
    });

    test('is exactly two A4 pages', () => {
      expect(report.pages, `${path} should be the two Sheets of the CV`).toHaveLength(2);

      report.pages.forEach((page, index) => {
        expect(
          Math.abs(page.width - A4.width),
          `page ${index + 1} is ${page.width}pt wide`,
        ).toBeLessThanOrEqual(TOLERANCE);
        expect(
          Math.abs(page.height - A4.height),
          `page ${index + 1} is ${page.height}pt tall`,
        ).toBeLessThanOrEqual(TOLERANCE);
      });
    });

    test('carries every face it draws with', () => {
      expect(report.fonts.length, 'the PDF should embed some fonts').toBeGreaterThan(0);

      for (const font of report.fonts) {
        expect(
          font.embedded,
          `${font.baseFont ?? font.subtype} is referenced but not embedded — it would be substituted on another machine`,
        ).toBe(true);
      }

      const named = [
        ...new Set(report.fonts.flatMap((font) => (font.baseFont ? [font.baseFont] : []))),
      ];

      // A face that failed to load would show up here as whatever system
      // fallback Chromium reached for instead.
      for (const face of named) {
        expect(CV_FACES, `${face} is not one of the CV's faces`).toContain(face);
      }

      // ...and one that never loaded would be missing from it. Every face is
      // nameable now, so this is the whole set by name — no longer a count of
      // anonymous Type3 fonts standing in for the two that could not be checked.
      // It is what catches the ADR-0009 hazard: the italic and the signature are
      // only drawn in a corner of the page, and a capture that never renders
      // them produces a PDF that is right in every other respect.
      const missing = CV_FACES.filter((face) => !named.includes(face));
      expect(missing, 'these faces stopped reaching the PDF').toEqual([]);
    });

    test('holds this Locale’s words, and not the other’s', () => {
      // Guards the rest of this test against passing on an empty extraction.
      expect(report.text.length, 'no text came out of the PDF at all').toBeGreaterThan(1000);

      for (const heading of visibleHeadings(locale)) {
        expect(report.text, `“${heading}” should be in ${path}`).toContain(
          withoutWhitespace(heading),
        );
      }

      const foreign = visibleHeadings(otherLocale(locale)).filter(
        (heading) => !visibleHeadings(locale).includes(heading),
      );

      for (const heading of foreign) {
        expect(report.text, `“${heading}” belongs to the other Locale`).not.toContain(
          withoutWhitespace(heading),
        );
      }
    });
  });
}

/**
 * The theme is a screen affordance, and everyone gets the identical PDF (US13).
 * `render-captures.mjs` prints a page it never themed, so this asserts the thing
 * that makes that safe rather than the file it produced: with `dark` chosen and
 * `print` emulated, every surface computes back to the light ramp because the
 * whole ladder in tokens.css sits inside `@media screen` (ADR-0015).
 */
test.describe('print', () => {
  test('is the light theme even when the visitor chose dark', async ({ page }) => {
    await openPainted(page, routeFor('it'));
    const light = await surfaces(page);

    await page.locator('.toolbar-theme [aria-checked="false"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const dark = await surfaces(page);
    expect(dark.sheet, 'the Sheet should have gone dark on screen').not.toBe(light.sheet);

    await page.emulateMedia({ media: 'print' });
    const printed = await surfaces(page);

    // `data-theme` is still `dark`; the media query is what disarms it.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(printed.sheet, 'the printed Sheet').toBe(light.sheet);
    // The page behind the Sheets is the one surface print overrides outright:
    // even light it is grey, and paper must not sit on grey (global.css).
    expect(printed.body, 'the printed page behind the Sheets').toBe(light.sheet);
    expect(light.body, 'the backdrop is its own colour on screen').not.toBe(light.sheet);
  });
});

/**
 * The Mode is remembered, so a reader can be in Reading Mode when they reach for
 * their own printer — and unlike the build's capture, that page carries whatever
 * `localStorage` held. Every Reading Mode rule is fenced behind `@media screen`
 * (coding-standards), so what prints is the paper whichever Mode is standing.
 *
 * The geometry is compared rather than a handful of `display` values: the Sheet is
 * a fixed box, so reading type on paper overflows inside it instead of paginating,
 * and neither the page count nor `assertTwoA4Pages()` can see that (ADR-0009).
 */
test('prints as paper even from Reading Mode', async ({ page }) => {
  await openPainted(page, routeFor('it'));

  await page.emulateMedia({ media: 'print' });
  const paper = await printedGeometry(page);

  // The Toolbar is `display: none` under print, so the control needs screen back.
  await page.emulateMedia({ media: null });
  await readingMode(page);

  const dismantled = await page
    .locator('.sheet')
    .first()
    .evaluate((element) => getComputedStyle(element).display);
  expect(dismantled, 'Reading Mode should dismantle the Sheet on screen').toBe('contents');

  await page.emulateMedia({ media: 'print' });
  const reading = await printedGeometry(page);

  expect(reading.sheet, 'the Sheet is a box again').toBe('block');
  expect(reading.columns).toBe('grid');
  expect(reading.aside).toBe('flex');
  expect(reading.main).toBe('block');

  expect(reading.blocks, 'a printed Block sits somewhere else than it does on paper').toEqual(
    paper.blocks,
  );
  expect(reading.height, 'the printed document is a different height').toBe(paper.height);
});

/**
 * The acceptance the geometry cannot state on its own: a live `Ctrl+P` from Reading
 * Mode is the same two A4 pages Paper Mode gives. `page.pdf()` is headless-Chromium
 * only, which is how this suite runs.
 */
for (const locale of LOCALES) {
  test(`prints two A4 pages from Reading Mode (${locale})`, async ({ page }) => {
    await openPainted(page, routeFor(locale));
    await readingMode(page);

    const report = await readPdfBytes(await page.pdf({ preferCSSPageSize: true }));

    expect(report.pages, 'a print from Reading Mode should be the two Sheets').toHaveLength(2);

    report.pages.forEach((printed, index) => {
      expect(
        Math.abs(printed.width - A4.width),
        `page ${index + 1} is ${printed.width}pt wide`,
      ).toBeLessThanOrEqual(TOLERANCE);
      expect(
        Math.abs(printed.height - A4.height),
        `page ${index + 1} is ${printed.height}pt tall`,
      ).toBeLessThanOrEqual(TOLERANCE);
    });
  });
}

/** Every Block's printed box in document order, in page coordinates. */
const printedGeometry = (page: Page) =>
  page.evaluate(() => {
    const sheet = document.querySelector('.sheet')!;
    const round = (value: number) => Math.round(value * 100) / 100;

    return {
      sheet: getComputedStyle(sheet).display,
      columns: getComputedStyle(sheet.querySelector('.columns')!).display,
      aside: getComputedStyle(sheet.querySelector('.aside')!).display,
      main: getComputedStyle(sheet.querySelector('.main')!).display,
      height: document.documentElement.scrollHeight,
      blocks: [...document.querySelectorAll('.block')].map((block) => {
        const box = block.getBoundingClientRect();
        return [
          block.className,
          round(box.x + window.scrollX),
          round(box.y + window.scrollY),
          round(box.width),
          round(box.height),
        ].join(' ');
      }),
    };
  });

/**
 * The link-preview card is a route that gets screenshotted (ADR-0009), so the
 * machine taking the picture brings a `prefers-color-scheme` of its own. The
 * card paints its own dark ground; the Sheet on it must still be white paper.
 */
test.describe('the OG card', () => {
  test.use({ colorScheme: 'dark' });

  for (const locale of LOCALES) {
    test(`is unthemed on a dark machine (${locale})`, async ({ page }) => {
      // The OS says dark, so the CV route opens dark; ask it for the light
      // paper through the Toolbar rather than naming an oklch() literal here.
      await openPainted(page, routeFor(locale));
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await page.locator('.toolbar-theme [aria-checked="false"]').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
      const paper = (await surfaces(page)).sheet;

      await openPainted(page, ogRouteFor(locale));
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

      const card = await page.evaluate(() => ({
        ground: getComputedStyle(document.querySelector('.card')!).backgroundColor,
        sheet: getComputedStyle(document.querySelector('.sheet')!).backgroundColor,
      }));

      expect(card.sheet, 'the Sheet on the card').toBe(paper);
      expect(card.ground, 'the card’s own ground').not.toBe(card.sheet);
    });
  }
});

const surfaces = (page: Page) =>
  page.evaluate(() => ({
    body: getComputedStyle(document.body).backgroundColor,
    sheet: getComputedStyle(document.querySelector('.sheet')!).backgroundColor,
  }));

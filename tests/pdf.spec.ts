import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { cv } from '../src/content';
import type { Locale } from '../src/content/types';
import { openPainted } from './support/page';
import { readPdf, withoutWhitespace, type PdfReport } from './support/pdf';
import { distPathForHref, LOCALES, ORIGIN, otherLocale, routeFor } from './support/site';

/** A4 in PostScript points, with the slack `render-captures.mjs` documents. */
const A4 = { width: 595.28, height: 841.89 };
const TOLERANCE = 1;

/** The faces that can still be named — ticket 12, "Fonts embedded". */
const CV_FACES = ['Lato-Regular', 'Lato-Bold', 'Lato-Italic', 'icomoon', 'Primera_Signature'];

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
      const href = await page.locator('.toolbar--page a[download]').getAttribute('href');
      await page.close();

      path = distPathForHref(href!);
      if (!existsSync(path)) {
        throw new Error(`${path} was never rendered — run \`npm run captures:render\` after a build.`);
      }

      report = await readPdf(path);
    });

    test('is exactly two A4 pages', () => {
      expect(report.pages, `${path} should be the two Sheets of the CV`).toHaveLength(2);

      report.pages.forEach((page, index) => {
        expect(Math.abs(page.width - A4.width), `page ${index + 1} is ${page.width}pt wide`).toBeLessThanOrEqual(TOLERANCE);
        expect(Math.abs(page.height - A4.height), `page ${index + 1} is ${page.height}pt tall`).toBeLessThanOrEqual(TOLERANCE);
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

      const named = [...new Set(report.fonts.flatMap((font) => (font.baseFont ? [font.baseFont] : [])))];

      // A face that failed to load would show up here as whatever system
      // fallback Chromium reached for instead.
      for (const face of named) {
        expect(CV_FACES, `${face} is not one of the CV's faces`).toContain(face);
      }

      expect(named).toEqual(expect.arrayContaining(['Lato-Regular', 'Lato-Bold']));

      // The display faces are the unnamed Type3 ones, so their count is the only
      // handle on them: without this, a CV set entirely in Lato would pass.
      expect(
        report.fonts.filter((font) => font.subtype === '/Type3').length,
        'the display faces stopped reaching the PDF',
      ).toBeGreaterThan(0);
    });

    test('holds this Locale’s words, and not the other’s', () => {
      // Guards the rest of this test against passing on an empty extraction.
      expect(report.text.length, 'no text came out of the PDF at all').toBeGreaterThan(1000);

      for (const heading of visibleHeadings(locale)) {
        expect(report.text, `“${heading}” should be in ${path}`).toContain(withoutWhitespace(heading));
      }

      const foreign = visibleHeadings(otherLocale(locale)).filter(
        (heading) => !visibleHeadings(locale).includes(heading),
      );

      for (const heading of foreign) {
        expect(report.text, `“${heading}” belongs to the other Locale`).not.toContain(withoutWhitespace(heading));
      }
    });
  });
}

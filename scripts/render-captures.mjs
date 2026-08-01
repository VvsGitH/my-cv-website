import { readFile } from 'node:fs/promises';
import { preview } from 'astro';
import { PDFDocument } from 'pdf-lib';
import { chromium } from 'playwright';
import config from '../astro.config.mjs';

// Everything headless Chromium captures off the built site: the downloadable
// PDF per Locale (ADR-0001) and the link-preview image per Locale (ticket 10).
// Run from the repo root, after `astro build`. The whys behind the capture
// recipe below are in docs/issues/cv-website/08-pdf-render.md.

const outDir = config.outDir ?? 'dist';

// A4 in PostScript points, and the slack for Chromium's mm -> px -> pt
// rounding, which lands ~0.3pt short of the nominal width.
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const SIZE_TOLERANCE = 1;

// Never below 51rem — ticket 08, "set the viewport before you load the page".
// The card sizes itself, so this is the only viewport either capture needs.
const CAPTURE_VIEWPORT = { width: 1280, height: 1600 };

// Must stay the names Chrome.astro and BaseLayout.astro point at.
const pdfPath = (locale) => `${outDir}/Vito_Paparella_Santorsola_CV_${locale.toUpperCase()}.pdf`;
const cardPath = (locale) => `${outDir}/og-${locale}.png`;

const cvRoute = (locale) =>
  locale === config.i18n.defaultLocale ? config.base : `${config.base}${locale}/`;
const cardRoute = (locale) => `${config.base}og/${locale}/`;

/** Ticket 08, "The 2-page split is asserted, not assumed". */
async function assertTwoA4Pages(path) {
  const pdf = await PDFDocument.load(await readFile(path));
  const pages = pdf.getPages();

  if (pages.length !== 2) {
    throw new Error(`${path}: expected 2 pages, got ${pages.length}`);
  }

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const isA4 =
      Math.abs(width - A4_WIDTH) <= SIZE_TOLERANCE &&
      Math.abs(height - A4_HEIGHT) <= SIZE_TOLERANCE;

    if (!isA4) {
      throw new Error(
        `${path}: page ${index + 1} is ${width}x${height}pt, expected A4 (${A4_WIDTH}x${A4_HEIGHT}pt)`,
      );
    }
  });
}

const server = await preview({ logLevel: 'error' });
let browser;

/** Leaves the page fully painted — ticket 08, "The portrait was missing". */
async function openPainted(page, route) {
  const response = await page.goto(new URL(route, `http://localhost:${server.port}`).href);
  if (!response.ok()) {
    throw new Error(`${route}: HTTP ${response.status()}`);
  }

  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images, (image) => image.decode()));
    await document.fonts.ready;
  });
}

try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: CAPTURE_VIEWPORT });

  for (const locale of config.i18n.locales) {
    await openPainted(page, cvRoute(locale));
    // Print emulation, never `emulateMedia({ media: 'screen' })` — ticket 08.
    await page.pdf({
      path: pdfPath(locale),
      preferCSSPageSize: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    await assertTwoA4Pages(pdfPath(locale));
    console.log(`${cvRoute(locale)} -> ${pdfPath(locale)}`);

    await openPainted(page, cardRoute(locale));
    // The element, not the viewport: the card declares its own size, so it
    // stays the one place that size is written down.
    await page.locator('[data-og-card]').screenshot({ path: cardPath(locale) });
    console.log(`${cardRoute(locale)} -> ${cardPath(locale)}`);
  }
} finally {
  await browser?.close();
  await server.stop();
}

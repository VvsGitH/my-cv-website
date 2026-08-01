import { readFile } from 'node:fs/promises';
import { preview } from 'astro';
import { PDFDocument } from 'pdf-lib';
import { chromium } from 'playwright';
import config from '../astro.config.mjs';

// Everything headless Chromium captures off the built site, run from the repo
// root after `astro build`. ADR-0009 is why every step below is where it is —
// read it before changing the order, the viewport or the emulation.

const outDir = config.outDir ?? 'dist';

// A4 in points, with slack for Chromium's mm -> px -> pt rounding (ADR-0009).
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const SIZE_TOLERANCE = 1;

// Never below 53.5rem, and always set before `goto` (ADR-0009).
const CAPTURE_VIEWPORT = { width: 1280, height: 1600 };

// Must stay the names Chrome.astro and BaseLayout.astro point at.
const pdfPath = (locale) => `${outDir}/Vito_Paparella_Santorsola_CV_${locale.toUpperCase()}.pdf`;
const cardPath = (locale) => `${outDir}/og-${locale}.png`;

const cvRoute = (locale) =>
  locale === config.i18n.defaultLocale ? config.base : `${config.base}${locale}/`;
const cardRoute = (locale) => `${config.base}og/${locale}/`;

/** The 2-page split is asserted, not assumed (ADR-0009). */
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

/** Leaves the page fully painted; the image decode is load-bearing (ADR-0009). */
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
    // Print emulation, never `emulateMedia({ media: 'screen' })` (ADR-0009).
    await page.pdf({
      path: pdfPath(locale),
      preferCSSPageSize: true,
      printBackground: true,
    });
    await assertTwoA4Pages(pdfPath(locale));
    console.log(`${cvRoute(locale)} -> ${pdfPath(locale)}`);

    await openPainted(page, cardRoute(locale));
    // The element, not the viewport: the card declares its own size.
    await page.locator('[data-og-card]').screenshot({ path: cardPath(locale) });
    console.log(`${cardRoute(locale)} -> ${cardPath(locale)}`);
  }
} finally {
  await browser?.close();
  await server.stop();
}

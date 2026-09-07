import { expect, type Page, test } from '@playwright/test';
import { cv } from '../src/content';
import { ui } from '../src/i18n/ui';
import { openPainted, readingMode, sheet, toolbar, VIEWPORTS } from './support/page';
import { LOCALES, routeFor } from './support/site';

/**
 * The Mode (CONTEXT.md, ADR-0017). It is the reader's, and the Toolbar is the
 * only way to change it, so everything below the seed tests goes through the
 * control rather than through a viewport.
 *
 * What the viewport decides is only the value a first visit opens on — paper
 * where the paper stands unscaled, reading below 856px (ADR-0017, amended). The
 * seed is evaluated at load, so those tests each do their own `goto`.
 *
 * These run at `paper` unless a test says otherwise, deliberately: Reading Mode
 * on a wide screen is the case that never existed before, and the one nothing
 * else in the suite covers.
 */
test.use({ viewport: VIEWPORTS.paper });

const modeControl = (page: Page) => toolbar(page).locator('.toolbar-mode');

/** The paper's own width: --sheet-width + 2 * --sheets-pad, the seed's threshold. */
const PAPER_FITS_FROM = 840 + 2 * 8;

/** The Blocks of one Locale, by the rank the content declares. */
const headingsByReadOrder = (locale: (typeof LOCALES)[number]) =>
  [...cv[locale].blocks]
    .sort((a, b) => a.readOrder - b.readOrder)
    .flatMap((block) => ('heading' in block ? [block.heading] : []));

/**
 * The seed, pinned from both sides of its one width. `responsive.spec.ts` pins
 * the same 855/856 pair against the fit; between them, the two files say the
 * paper stops being fitted exactly where it stops being the opening Mode.
 */
test('opens a first visit in Reading Mode below the paper’s own width', async ({ page }) => {
  await page.setViewportSize({ width: PAPER_FITS_FROM - 1, height: 812 });
  await openPainted(page, routeFor('it'));

  await expect(page.locator('html')).toHaveAttribute('data-mode', 'reading');
  // No panel down here: the Aside's Blocks read in the column (CONTEXT.md).
  await expect(page.locator('.sheets .block--about')).toBeVisible();
});

test('opens a first visit in Paper Mode the moment the paper fits', async ({ page }) => {
  await page.setViewportSize({ width: PAPER_FITS_FROM, height: 812 });
  await openPainted(page, routeFor('it'));

  await expect(page.locator('html')).toHaveAttribute('data-mode', 'paper');
  await expect(sheet(page, 1).locator('.aside > .block--about')).toBeVisible();
});

test('is set before the first paint, not after hydration', async ({ page }) => {
  // No `openPainted`: the attribute has to be there while the island is still
  // `ssr`, or the page renders one frame of the wrong Mode (ADR-0017).
  await page.goto(routeFor('it'));
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'paper');
});

test('seeds the phone before the first paint too, or it flashes 5px type', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.reading);
  await page.goto(routeFor('it'));
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'reading');
});

test('is remembered across a visit, and only the reader sets it', async ({ page }) => {
  await openPainted(page, routeFor('it'));
  await readingMode(page);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'reading');

  await modeControl(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'paper');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'paper');
});

/**
 * The trap the seed introduces, and the reason the script tests for `'paper'`
 * as well as `'reading'`: a stored choice has to beat the width in *both*
 * directions. Reading it as `storedMode === 'reading' ? … : 'paper'` — correct
 * while paper was the unconditional default — flips this reader back on every
 * reload, so the control looks like it does not stick (ADR-0017, amended).
 */
test('lets a phone reader keep Paper Mode across a reload', async ({ page }) => {
  await page.setViewportSize(VIEWPORTS.reading);
  await openPainted(page, routeFor('it'));
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'reading');

  await modeControl(page).click();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'paper');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'paper');
});

test('carries the choice to the other Locale', async ({ page }) => {
  await openPainted(page, routeFor('it'));
  await readingMode(page);

  await toolbar(page).locator('.toolbar-locale a[hreflang="en"]').click();

  await expect(page).toHaveURL(routeFor('en'));
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'reading');
});

for (const locale of LOCALES) {
  test(`names the control for the Mode it offers, in ${locale}`, async ({ page }) => {
    await openPainted(page, routeFor(locale));
    const { toolbar: strings } = ui[locale];
    const control = modeControl(page);

    // Both names ship and CSS picks, so the control is right pre-hydration (ADR-0003).
    await expect(control).toHaveAccessibleName(strings.modeReading);
    await readingMode(page);
    await expect(control).toHaveAccessibleName(strings.modePaper);
  });
}

test.describe('Reading Mode', () => {
  test.beforeEach(async ({ page }) => {
    await openPainted(page, routeFor('it'));
    await readingMode(page);
  });

  test('dismantles the A4 box and reflows into one column', async ({ page }) => {
    // Every box between the reading column and the Blocks is `display: contents`
    // down here, so the Sheet has no geometry of its own to measure.
    const sheetWidth = await page
      .locator('.sheet')
      .first()
      .evaluate((element) => element.getBoundingClientRect().width);
    expect(sheetWidth, 'the Sheet should have no box in Reading Mode').toBe(0);

    const column = (await page.locator('.sheets').boundingBox())!;
    expect(column.width).toBeLessThanOrEqual(VIEWPORTS.paper.width);

    // The portrait is excluded because it is centred on purpose; every other
    // Block runs the full measure of the reading column.
    const lefts = await page
      .locator('.sheets .block:not(.block--photo)')
      .evaluateAll((blocks) => blocks.map((block) => Math.round(block.getBoundingClientRect().x)));

    expect(lefts.length, 'Blocks from both Sheets should reflow into the column').toBeGreaterThan(
      1,
    );
    expect(new Set(lefts).size, 'every Block should share one column').toBe(1);
  });

  test('reads the Aside in the column, not behind a control', async ({ page }) => {
    // The whole point of ADR-0017: no panel, no second copy, nothing hidden.
    await expect(page.locator('.drawer')).toHaveCount(0);
    await expect(page.locator('.block--about')).toHaveCount(1);

    for (const kind of ['about', 'skills', 'languages', 'certifications', 'privacy']) {
      await expect(page.locator(`.sheets .block--${kind}`), kind).toBeVisible();
    }
  });

  test('runs the Blocks in the order the content declares, not the paper order', async ({
    page,
  }) => {
    const rendered = await page.locator('.sheets .section-heading').evaluateAll((headings) =>
      headings
        .map((heading) => ({
          text: heading.textContent?.trim() ?? '',
          top: heading.getBoundingClientRect().top,
        }))
        .sort((a, b) => a.top - b.top)
        .map((heading) => heading.text),
    );

    expect(rendered).toEqual(headingsByReadOrder('it'));
  });

  test('resumes a Continuation without a second rule across it', async ({ page }) => {
    const continuation = page.locator('.sheets .block[data-continues]');
    await expect(continuation).toHaveCount(1);

    // The heading is announced, never drawn — so the reader sees one section
    // where the paper had to show two (ADR-0005, ADR-0017).
    await expect(continuation.locator('.section-heading')).toHaveClass(/is-sr-only/);

    const gap = await continuation.evaluate((block) =>
      parseFloat(getComputedStyle(block).marginBlockStart),
    );
    expect(gap, 'a Continuation opens no section, so it takes no section gap').toBe(0);
  });

  test('takes the theme with it, so the Aside is not dark ink on dark paper', async ({ page }) => {
    const asideInk = page.locator('.aside .block--about p').first();
    const light = await asideInk.evaluate((element) => getComputedStyle(element).color);

    await toolbar(page).locator('.toolbar-theme [aria-checked="false"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // On paper the cream panel pins the light ramp (ADR-0015); there is no panel
    // here, so the ink has to move with the page it is printed on.
    const dark = await asideInk.evaluate((element) => getComputedStyle(element).color);
    expect(dark, 'the Aside ink should follow the theme in Reading Mode').not.toBe(light);
  });
});

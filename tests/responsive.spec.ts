import { expect, test, type Page } from '@playwright/test';
import { drawer, openPainted, sheet, toolbar, VIEWPORTS } from './support/page';
import { routeFor } from './support/site';

/**
 * The three tiers of CONTEXT.md, at the boundaries the paper's own width
 * settles: 51rem (816px) clears one 793.7px Sheet, 102rem (1632px) clears two
 * and the gap between them. ADR-0006 is why they are read off the paper at all
 * — it removed the scale-to-fit, so a Sheet is a literal A4 box.
 */

/** 210mm × 297mm at 96dpi. */
const A4 = { width: 793.7, height: 1122.5 };
const TOLERANCE = 1;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const sheetBoxes = (page: Page): Promise<Box[]> =>
  page.locator('.sheet').evaluateAll((sheets) =>
    sheets.map((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    }),
  );

const rowCount = async (page: Page): Promise<number> =>
  new Set((await sheetBoxes(page)).map((box) => Math.round(box.y))).size;

function expectRealA4(box: Box, label: string): void {
  expect(Math.abs(box.width - A4.width), `${label} width is ${box.width}px`).toBeLessThanOrEqual(
    TOLERANCE,
  );
  expect(Math.abs(box.height - A4.height), `${label} height is ${box.height}px`).toBeLessThanOrEqual(
    TOLERANCE,
  );
}

test.describe('Paper Mode, two-up', () => {
  test.use({ viewport: VIEWPORTS.twoUp });

  test('sets the two Sheets side by side, at full size', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    const [first, second] = await sheetBoxes(page);
    expect(first && second, 'both Sheets should have a box').toBeTruthy();

    expect(Math.round(first!.y)).toBe(Math.round(second!.y));
    expect(second!.x).toBeGreaterThanOrEqual(first!.x + first!.width);

    expectRealA4(first!, 'Sheet 1');
    expectRealA4(second!, 'Sheet 2');
  });
});

test.describe('Paper Mode, stacked', () => {
  test.use({ viewport: VIEWPORTS.stacked });

  test('stacks the Sheets one per row, and never shrinks them to fit', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    const [first, second] = await sheetBoxes(page);
    expect(Math.round(first!.x)).toBe(Math.round(second!.x));
    expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);

    // Wider than the viewport on purpose — ADR-0006 traded fitting for fidelity.
    expectRealA4(first!, 'Sheet 1');
    expectRealA4(second!, 'Sheet 2');
  });

  test('keeps the paper whole, with both columns on it', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    await expect(sheet(page, 1).locator('.aside')).toBeVisible();
    await expect(sheet(page, 1).locator('.main')).toBeVisible();
    await expect(drawer(page)).toBeHidden();
  });
});

test('changes tier exactly on its boundaries, and not a pixel earlier', async ({ page }) => {
  await openPainted(page, routeFor('it'));
  const paper = sheet(page, 1);

  await page.setViewportSize({ width: 815, height: 1200 });
  await expect(paper.locator('.aside > .block--about'), 'at 815px, Reading Mode').toBeHidden();

  await page.setViewportSize({ width: 816, height: 1200 });
  await expect(paper.locator('.aside > .block--about'), 'at 816px, Paper Mode').toBeVisible();

  await page.setViewportSize({ width: 1631, height: 1200 });
  expect(await rowCount(page), 'at 1631px the Sheets should still stack').toBe(2);

  await page.setViewportSize({ width: 1632, height: 1200 });
  expect(await rowCount(page), 'at 1632px the Sheets should share a row').toBe(1);
});

/**
 * The reason both boundaries are where they are: a Sheet is a literal 793.7px
 * box since ADR-0006, so a tier that starts below the paper's own width scrolls
 * sideways. That is what 48rem did at 768px, and reading the boundary off the
 * paper is only half the fix — the widths *between* the boundaries have to hold
 * too, and so does 375px, where `--reading-column-min` (23rem) sets the floor.
 *
 * A horizontal scrollbar on a CV is a bug at every width, not at the two the
 * tier assertions above happen to name, so this sweeps rather than samples:
 * both boundaries and the pixel under each, the narrowest supported viewport,
 * the widths where the Sheet is wider than the reading column, and the common
 * phones and laptops in between.
 */
const NO_OVERFLOW_WIDTHS = [
  375, 390, 414, 500, 600, 700, 780, 815, 816, 817, 900, 1024, 1280, 1440, 1631, 1632, 1633, 1920,
];

test('never scrolls sideways, at any supported width', async ({ page }) => {
  await openPainted(page, routeFor('it'));

  const overflowing: string[] = [];
  for (const width of NO_OVERFLOW_WIDTHS) {
    await page.setViewportSize({ width, height: 1000 });

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });

    if (overflow > 0) overflowing.push(`${width}px by ${overflow}px`);
  }

  expect(overflowing, 'these widths scroll sideways').toEqual([]);
});

test.describe('Reading Mode', () => {
  test.use({ viewport: VIEWPORTS.reading });

  test.beforeEach(async ({ page }) => {
    await openPainted(page, routeFor('it'));
  });

  test('dismantles the A4 box and reflows into one column', async ({ page }) => {
    // Every box between the reading column and the Blocks is `display: contents`
    // down here, so the Sheet has no geometry of its own to measure.
    const [first] = await sheetBoxes(page);
    expect(first!.width, 'the Sheet should have no box in Reading Mode').toBe(0);

    const readingColumn = await page.locator('.sheets').boundingBox();
    expect(readingColumn!.width).toBeLessThanOrEqual(VIEWPORTS.reading.width);

    // The portrait is excluded because it is centred on purpose; every other
    // Block runs the full measure of the reading column.
    const lefts = await page
      .locator('.sheets .block:visible:not(.block--photo)')
      .evaluateAll((blocks) => blocks.map((block) => Math.round(block.getBoundingClientRect().x)));

    expect(lefts.length, 'Blocks from both Sheets should reflow into the column').toBeGreaterThan(1);
    expect(new Set(lefts).size, 'every Block should share one column').toBe(1);
  });

  test('reads the Aside in the Drawer, and opens with the portrait', async ({ page }) => {
    const paper = sheet(page, 1);

    await expect(paper.locator('.aside > .block--photo')).toBeVisible();
    await expect(paper.locator('.aside > .block--about')).toBeHidden();

    const photo = await paper.locator('.aside > .block--photo').boundingBox();
    const header = await paper.locator('.main > .block--header').boundingBox();
    expect(photo!.y, 'the portrait opens the compact header').toBeLessThan(header!.y);

    await expect(toolbar(page).locator('.toolbar-drawer')).toBeVisible();
  });
});

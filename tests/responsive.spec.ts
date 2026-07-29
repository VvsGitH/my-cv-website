import { expect, test, type Page } from '@playwright/test';
import { drawer, openPainted, sheet, toolbar, VIEWPORTS } from './support/page';
import { routeFor } from './support/site';

/**
 * The three tiers of CONTEXT.md, at the boundaries ADR-0006 settled on rather
 * than the 1280px still written in ticket 12's task list.
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

  await page.setViewportSize({ width: 767, height: 1200 });
  await expect(paper.locator('.aside > .block--about'), 'at 767px, Reading Mode').toBeHidden();

  await page.setViewportSize({ width: 768, height: 1200 });
  await expect(paper.locator('.aside > .block--about'), 'at 768px, Paper Mode').toBeVisible();

  await page.setViewportSize({ width: 1615, height: 1200 });
  expect(await rowCount(page), 'at 1615px the Sheets should still stack').toBe(2);

  await page.setViewportSize({ width: 1616, height: 1200 });
  expect(await rowCount(page), 'at 1616px the Sheets should share a row').toBe(1);
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

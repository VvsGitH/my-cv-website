import { expect, test, type Page } from '@playwright/test';
import { openPainted, sheet, VIEWPORTS } from './support/page';
import { routeFor } from './support/site';

/**
 * Paper Mode at every width — which since ADR-0017 is every width, because the
 * Mode is chosen rather than triggered. Neither of the two tier boundaries is
 * written down any more, and each was replaced by something continuous:
 *
 * - the 53.5rem one by the fit, so below the paper's own width the Sheet zooms
 *   down rather than running over the edge (the half of ADR-0006 §2 that
 *   ADR-0017 puts back);
 * - the 107.5rem one by a wrapping flex line, so the pair shares a row exactly
 *   when there is room for it rather than when a number says so.
 *
 * Both are therefore asserted from the paper's own arithmetic here, never
 * against a literal a stylesheet also holds — there is no longer one to drift
 * from. Reading Mode is tested in `mode.spec.ts`, where it is now reached.
 */

/** The screen box: --sheet-width, in A4's 210/297 ratio. mm only reach print. */
const A4 = { width: 840, height: (840 * 297) / 210 };
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
    // The panel that used to hold the Aside on a phone is gone entirely (ADR-0017).
    await expect(page.locator('.drawer')).toHaveCount(0);
  });
});

test('wraps the pair the pixel before it fits, and not one earlier', async ({ page }) => {
  await openPainted(page, routeFor('it'));
  const { width } = VIEWPORTS.twoUp;

  await page.setViewportSize({ width: width - 1, height: 1200 });
  expect(await rowCount(page), `at ${width - 1}px the Sheets should still stack`).toBe(2);

  await page.setViewportSize({ width, height: 1200 });
  expect(await rowCount(page), `at ${width}px the Sheets should share a row`).toBe(1);
});

/**
 * What the 53.5rem boundary used to hide: below it a Sheet plus its gutter is
 * wider than the viewport. It is fitted now instead of dismantled, so the paper
 * stays whole — both columns on it — at a phone width.
 */
test('shows whole paper at a phone width, fitted rather than dismantled', async ({ page }) => {
  await openPainted(page, routeFor('it'));
  await page.setViewportSize(VIEWPORTS.reading);

  const paper = sheet(page, 1);
  await expect(paper.locator('.aside > .block--about'), 'the Aside is on the paper').toBeVisible();

  const [first] = await sheetBoxes(page);
  // A real box, in A4's ratio, narrower than the viewport it was fitted to.
  expect(first!.width).toBeGreaterThan(0);
  expect(first!.width).toBeLessThan(VIEWPORTS.reading.width);
  expect(first!.height / first!.width).toBeCloseTo(297 / 210, 1);
});

/**
 * `min(1, …)` is the guarantee ADR-0006 wanted and ADR-0017 keeps: the paper is
 * fitted down, never up. Once there is room for 840px plus both gutters — 856px
 * — the fit is inert and every wider tier measures exactly as it did before.
 */
test('stops fitting the moment the paper fits, and never scales it up', async ({ page }) => {
  await openPainted(page, routeFor('it'));

  await page.setViewportSize({ width: 855, height: 1200 });
  const [fitted] = await sheetBoxes(page);
  expect(fitted!.width, 'at 855px the paper is still being fitted').toBeLessThan(A4.width);

  await page.setViewportSize({ width: 856, height: 1200 });
  expectRealA4((await sheetBoxes(page))[0]!, 'at 856px Sheet 1');

  await page.setViewportSize(VIEWPORTS.twoUp);
  expectRealA4((await sheetBoxes(page))[0]!, `at ${VIEWPORTS.twoUp.width}px Sheet 1`);
});

/**
 * The one assertion in this file that names a property instead of measuring a box,
 * and it says so because the measurement is not available here: the fit reads
 * `100cqw`, which falls back to the small viewport when no query container stands
 * above it — and the small viewport counts the classic scrollbar that `.paper`'s
 * content box does not. Measured in a real browser window at 390px with a 15px
 * scrollbar, the fallback reports 390 against `.paper`'s 375 and the Sheet comes
 * out 15px over its box, eating half the gutter either side. Headless Chromium
 * has overlay scrollbars that take no space, so both widths agree here and every
 * geometric assertion below passes with the container deleted.
 *
 * The print half is asserted too: `container-type` brings layout containment, and
 * a layout-contained box is monolithic for fragmentation, which is a hazard to the
 * `break-before: page` that makes the CV two pages.
 */
test('keeps a query container over the paper on screen, and none in print', async ({ page }) => {
  await openPainted(page, routeFor('it'));

  const containerType = () =>
    page.locator('.paper').evaluate((element) => getComputedStyle(element).containerType);

  expect(await containerType(), 'on screen the fit needs something to measure').toBe('inline-size');

  await page.emulateMedia({ media: 'print' });
  expect(await containerType(), 'in print the containment must not reach the page break').toBe(
    'normal',
  );
});

/**
 * A sideways scrollbar is a bug at every width (ADR-0006), so this sweeps rather
 * than samples. It is the sharpest single guard on the fit above, because Paper
 * Mode is now the default at the narrow widths that used to be Reading Mode's:
 * everything under 856px is real A4 paper being scaled to fit, and any
 * arithmetic error there shows up here as an overflow. The two widths where the
 * flex line wraps are swept too — that is the other place the gutters are
 * spent, and the one the fit does not cover.
 */
const NO_OVERFLOW_WIDTHS = [
  375, 390, 414, 500, 600, 700, 780, 855, 856, 857, 888, 900, 1024, 1280, 1440,
  VIEWPORTS.twoUp.width - 1, VIEWPORTS.twoUp.width, VIEWPORTS.twoUp.width + 1, 1920, 2560,
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

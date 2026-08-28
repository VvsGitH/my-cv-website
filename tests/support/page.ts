import { expect, type Locator, type Page } from '@playwright/test';
import type { Column, SheetNumber } from '../../src/content/types';

/**
 * Paint, load every declared face, then hydrate. The font trap itself is ADR-0009;
 * the catch is for Fontaine fallbacks, which may be absent locally.
 */
export async function openPainted(page: Page, route: string): Promise<void> {
  const response = await page.goto(route);
  expect(response?.status(), `${route} should be served`).toBe(200);

  await page.evaluate(() =>
    Promise.all(Array.from(document.images, (image) => image.decode())),
  );

  await page.evaluate(() =>
    Promise.all(
      Array.from(document.fonts, (face) =>
        document.fonts.load(`${face.style} ${face.weight} 1em "${face.family}"`).catch(() => []),
      ),
    ),
  );

  await page.waitForFunction(() => document.fonts.status === 'loaded');

  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

/**
 * One viewport per case. `paper` is also the capture viewport (ADR-0009).
 * `reading` is a phone-sized viewport, not a Mode — since ADR-0017 the Mode is
 * chosen, and a phone gets Paper Mode there until something calls `readingMode`.
 *
 * `twoUp` is the exact width at which the pair stops wrapping: 2 × 840px of
 * paper, the 24px between them and the 24px gutter either side. No stylesheet
 * writes that number down any more — the flex line finds it — so this is the
 * assertion that it is where the arithmetic says it is.
 */
export const VIEWPORTS = {
  reading: { width: 375, height: 812 },
  stacked: { width: 1024, height: 1400 },
  twoUp: { width: 2 * 840 + 24 + 2 * 24, height: 1200 },
  paper: { width: 1280, height: 1600 },
} as const;

/** Puts the page in Reading Mode the way a reader does — through the control. */
export async function readingMode(page: Page): Promise<void> {
  await toolbar(page).locator('.toolbar-mode').click();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'reading');
}

export const sheet = (page: Page, number: SheetNumber): Locator =>
  page.locator('.sheet').nth(number - 1);

export const toolbar = (page: Page): Locator => page.locator('.toolbar');

/** The kind of every Block rendered into one column, in document order. */
export async function renderedKinds(
  sheetLocator: Locator,
  column: Column,
): Promise<string[]> {
  return sheetLocator.locator(`.${column} > .block`).evaluateAll((blocks) =>
    blocks.map((block) => {
      const kind = [...block.classList].find((name) => name.startsWith('block--'));
      return kind?.slice('block--'.length) ?? '';
    }),
  );
}

/** Slack to the edge each column must stay inside — Aside to its panel, Main to the Sheet (ADR-0010). */
export async function slackBelowLastBlock(
  sheetLocator: Locator,
  column: Column,
): Promise<number> {
  return sheetLocator.evaluate((sheetElement, columnName) => {
    const columnElement = sheetElement.querySelector(`.${columnName}`);
    if (!columnElement) throw new Error(`no .${columnName} on this Sheet`);

    const blocks = [...columnElement.querySelectorAll(':scope > .block')];
    if (blocks.length === 0) throw new Error(`.${columnName} rendered no Blocks`);

    const lastBottom = Math.max(...blocks.map((block) => block.getBoundingClientRect().bottom));
    const limit = columnName === 'aside' ? columnElement : sheetElement;

    return limit.getBoundingClientRect().bottom - lastBottom;
  }, column);
}

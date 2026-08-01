import { expect, type Locator, type Page } from '@playwright/test';
import type { Column, SheetNumber } from '../../src/content/types';

/**
 * Paint, hydrate, then load every declared face — in that order. The ordering is
 * a workaround, not a preference (hacks/2026-08-01 §5); the font trap itself is
 * ADR-0009. The catch is for Fontaine fallbacks, which may be absent locally.
 */
export async function openPainted(page: Page, route: string): Promise<void> {
  const response = await page.goto(route);
  expect(response?.status(), `${route} should be served`).toBe(200);

  await page.evaluate(() =>
    Promise.all(Array.from(document.images, (image) => image.decode())),
  );

  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);

  await page.evaluate(() =>
    Promise.all(
      Array.from(document.fonts, (face) =>
        document.fonts.load(`${face.style} ${face.weight} 1em "${face.family}"`).catch(() => []),
      ),
    ),
  );

  await page.waitForFunction(() => document.fonts.status === 'loaded');
}

/** One viewport per tier. `paper` is also the capture viewport (ADR-0009). */
export const VIEWPORTS = {
  reading: { width: 375, height: 812 },
  stacked: { width: 1024, height: 1400 },
  twoUp: { width: 1720, height: 1200 },
  paper: { width: 1280, height: 1600 },
} as const;

export const sheet = (page: Page, number: SheetNumber): Locator =>
  page.locator('.sheet').nth(number - 1);

export const toolbar = (page: Page): Locator => page.locator('.toolbar');

/** The panel — a `<dialog>` opened with `showModal()` (ADR-0008). */
export const drawer = (page: Page): Locator => page.locator('.drawer');

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

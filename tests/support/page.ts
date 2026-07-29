import { expect, type Locator, type Page } from '@playwright/test';
import type { Column, SheetNumber } from '../../src/content/types';

/**
 * Leaves the page fully painted and interactive. Images and `document.fonts.ready`
 * are the pair `scripts/render-captures.mjs` waits on for the same reason — line
 * wrapping moves with the real faces. The third wait is this suite's own: the
 * Chrome's two islands are `client:idle`, and a click sent before Astro clears
 * `ssr` off them is silently lost.
 */
export async function openPainted(page: Page, route: string): Promise<void> {
  const response = await page.goto(route);
  expect(response?.status(), `${route} should be served`).toBe(200);

  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images, (image) => image.decode()));
    await document.fonts.ready;
  });

  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

/**
 * One viewport per tier, at the boundaries ADR-0006 settled on. `paper` is also
 * the capture viewport in `scripts/render-captures.mjs`, and playwright.config
 * makes it the default — measuring what the PDF is cut from.
 */
export const VIEWPORTS = {
  reading: { width: 375, height: 812 },
  stacked: { width: 1024, height: 1400 },
  twoUp: { width: 1616, height: 1200 },
  paper: { width: 1280, height: 1600 },
} as const;

export const sheet = (page: Page, number: SheetNumber): Locator =>
  page.locator('.sheet').nth(number - 1);

export const toolbar = (page: Page): Locator => page.locator('.toolbar');

/** The custom modal's panel — the element carrying `role="dialog"`. */
export const drawer = (page: Page): Locator => page.locator('.drawer');

export const drawerBackdrop = (page: Page): Locator => page.locator('.drawer-backdrop');

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

/**
 * Room left between the last Block of a column and the edge it has to stay
 * inside — positive means it fits. The two reference lines are the ones ticket
 * 17's handover picks: the Aside against its own cream panel, the Main against
 * the Sheet. Returned rather than asserted so a failure can say how far over.
 */
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

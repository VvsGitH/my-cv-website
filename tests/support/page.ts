import { expect, type Locator, type Page } from '@playwright/test';
import type { Column, SheetNumber } from '../../src/content/types';

/**
 * Leaves the page fully painted and interactive. Images and `document.fonts.ready`
 * are the pair `scripts/render-captures.mjs` waits on for the same reason — line
 * wrapping moves with the real faces. The third wait is this suite's own: the
 * Chrome's two islands are `client:idle`, and a click sent before Astro clears
 * `ssr` off them is silently lost.
 *
 * `document.fonts.ready` alone is not enough, and this is the same trap ticket
 * 06 hands to ticket 08: Chrome requests a face only when rendering needs it,
 * so `ready` resolves over the faces requested *so far* and anything rendered
 * afterwards restarts the cycle — swapping metrics out under a measurement
 * already taken.
 *
 * **Hydration is what renders afterwards, so the font wait has to come last.**
 * The Toolbar's controls are icomoon glyphs and the island only draws them once
 * Astro clears `ssr`, so waiting for the faces before that wait leaves the one
 * window that matters. In that window the header Block measures 163.97px on
 * fallback metrics instead of the 165.97px `--header-height` is a hard-coded
 * measurement of (tokens.css), which drops Main's first heading 2px above the
 * Aside's and fails `paper.spec.ts`'s two-column assertion. It only reproduces
 * under the load of the full suite, which is what stretches hydration out.
 *
 * So: paint, hydrate, then request every declared face and hold until the font
 * engine is at rest — `status` is `loading` while any request is in flight,
 * whoever started it, and `loaded` only when none is.
 *
 * The `catch` is for Fontaine's metric-matched fallbacks: they are `local()`
 * faces that resolve against whatever the machine has, so one going missing is
 * expected rather than a failure to surface here.
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

/**
 * One viewport per tier, at the boundaries ADR-0006 settled on. `paper` is also
 * the capture viewport in `scripts/render-captures.mjs`, and playwright.config
 * makes it the default — measuring what the PDF is cut from.
 */
export const VIEWPORTS = {
  reading: { width: 375, height: 812 },
  stacked: { width: 1024, height: 1400 },
  twoUp: { width: 1632, height: 1200 },
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

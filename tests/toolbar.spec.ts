import { existsSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { ui } from '../src/i18n/ui';
import { drawer, drawerBackdrop, openPainted, sheet, toolbar, VIEWPORTS } from './support/page';
import { distPathForHref, LOCALES, otherLocale, routeFor } from './support/site';

// Share copies through the async Clipboard API, which silently no-ops on a
// denied permission — the toast would never appear and the test would read as a
// broken button rather than a missing grant.
test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

/** There is one Toolbar, and these are its five controls. */
const actions = (page: Page) => {
  const strip = toolbar(page);
  return {
    drawer: strip.locator('.toolbar-drawer'),
    language: strip.locator('a[hreflang]'),
    download: strip.locator('a[download]'),
    // The only Toolbar button with no modifier class of its own.
    share: strip.locator('button.toolbar-button:not(.toolbar-drawer):not(.toolbar-theme)'),
    theme: strip.locator('.toolbar-theme'),
    toast: strip.locator('.toolbar-toast'),
  };
};

const backgroundOf = (locator: Locator): Promise<string> =>
  locator.evaluate((element) => getComputedStyle(element).backgroundColor);


for (const locale of LOCALES) {
  test.describe(locale, () => {
    test.beforeEach(async ({ page }) => {
      await openPainted(page, routeFor(locale));
    });

    test('names every action in this Locale', async ({ page }) => {
      const { toolbar } = ui[locale];
      const action = actions(page);

      await expect(action.language).toHaveAccessibleName(toolbar.language);
      await expect(action.download).toHaveAccessibleName(toolbar.download);
      await expect(action.share).toHaveAccessibleName(toolbar.share);
      // The theme action names the theme it switches *to*, and both names ship
      // in the markup — CSS picks between them off `<html data-theme>`.
      await expect(action.theme).toHaveAccessibleName(toolbar.themeToDark);
      // Four actions on paper; the Drawer's toggle is the fifth, and it belongs
      // to Reading Mode alone (CONTEXT.md: "Toolbar").
      await expect(action.drawer).toBeHidden();
    });

    test('names them in aria-label, not in title alone', async ({ page }) => {
      const { drawer: drawerStrings, toolbar } = ui[locale];
      const action = actions(page);

      // `title` does produce an accessible name, but it is the last resort in
      // the accname chain and never surfaces on touch (ticket 19).
      await expect(action.drawer).toHaveAttribute('aria-label', drawerStrings.open);
      await expect(action.language).toHaveAttribute('aria-label', toolbar.language);
      await expect(action.download).toHaveAttribute('aria-label', toolbar.download);
      await expect(action.share).toHaveAttribute('aria-label', toolbar.share);

      // The theme control is the documented exception: its name has to be
      // right before hydration, so it comes from the pair of visually-hidden
      // labels CSS chooses between, and an aria-label would silence them.
      await expect(action.theme).not.toHaveAttribute('aria-label', /./);
    });

    test('gives every action to the keyboard', async ({ page }) => {
      const action = actions(page);

      for (const target of [action.language, action.download, action.share, action.theme]) {
        await target.focus();
        await expect(target).toBeFocused();
      }

      // Focus alone is not operability: the two buttons have to fire from the
      // keyboard too, and each reports back somewhere observable.
      await action.theme.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      await action.share.focus();
      await page.keyboard.press('Space');
      await expect(action.toast).toHaveAttribute('data-visible', '');
    });

    test('sends the reader to the same page in the other Locale', async ({ page }) => {
      const other = otherLocale(locale);

      await actions(page).language.click();

      await expect(page).toHaveURL(routeFor(other));
      await expect(page.locator('html')).toHaveAttribute('lang', other);
      await expect(page.locator('.sheet')).toHaveCount(2);
    });

    test('offers a PDF that was actually rendered', async ({ page }) => {
      const link = actions(page).download;
      await expect(link).toHaveAttribute('download', '');

      const href = await link.getAttribute('href');
      expect(href, 'the download link should carry an href').not.toBeNull();
      expect(
        existsSync(distPathForHref(href!)),
        `${href} is offered for download but no such file was rendered`,
      ).toBe(true);
    });

    test('repaints the page behind the paper, and not the paper', async ({ page }) => {
      const html = page.locator('html');
      const paper = sheet(page, 1);
      const panel = paper.locator('.aside');

      await expect(html).toHaveAttribute('data-theme', 'light');
      const before = {
        body: await backgroundOf(page.locator('body')),
        sheet: await backgroundOf(paper),
        aside: await backgroundOf(panel),
      };

      await actions(page).theme.click();
      await expect(html).toHaveAttribute('data-theme', 'dark');

      expect(await backgroundOf(page.locator('body')), 'the page backdrop').not.toBe(before.body);
      // Spec US17: the CV is a document, and the paper is read off white in
      // both themes.
      expect(await backgroundOf(paper), 'the Sheet surface').toBe(before.sheet);
      expect(await backgroundOf(panel), 'the Aside panel').toBe(before.aside);
    });

    test('remembers the chosen theme across a reload', async ({ page }) => {
      await actions(page).theme.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      await openPainted(page, routeFor(locale));

      // Applied pre-paint by the inline script in BaseLayout, not on hydration.
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });

    test('puts the current URL on the clipboard when shared', async ({ page }) => {
      const action = actions(page);
      const url = page.url();

      await action.share.click();

      await expect(action.toast).toHaveAttribute('data-visible', '');
      await expect(action.toast).toHaveText(ui[locale].toolbar.shared);
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);
    });
  });
}

test('offers a different PDF in each Locale', async ({ page }) => {
  const offered = async (locale: (typeof LOCALES)[number]): Promise<string | null> => {
    await openPainted(page, routeFor(locale));
    return actions(page).download.getAttribute('href');
  };

  const italian = await offered('it');
  const english = await offered('en');

  // Which file holds which Locale's words is pdf.spec's job; this is only that
  // the two links do not point at one file.
  expect(italian).not.toBe(english);
});

test.describe('Focus Not Obscured', () => {
  // WCAG 2.2 · 2.4.11 (Minimum), against the one tier where the Toolbar floats
  // over the reading column rather than over a margin (ticket 19).
  test.use({ viewport: { width: 368, height: VIEWPORTS.reading.height } });

  test('never parks a focused control entirely behind the Toolbar', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    const targets = await page.locator(':is(a[href], button):visible').all();
    expect(targets.length, 'the page should have something to tab through').toBeGreaterThan(3);

    const obscured: string[] = [];
    for (const target of targets) {
      await target.focus();
      const verdict = await target.evaluate((element) => {
        // The Toolbar's own controls live inside the strip by definition.
        if (element.closest('.toolbar')) return null;

        const strip = document.querySelector('.toolbar')!.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        const hidden =
          box.left >= strip.left &&
          box.right <= strip.right &&
          box.top >= strip.top &&
          box.bottom <= strip.bottom;

        return hidden ? (element.textContent?.trim().slice(0, 40) ?? '(unnamed)') : null;
      });

      if (verdict) obscured.push(verdict);
    }

    expect(obscured, 'focusing these scrolled them under the Toolbar').toEqual([]);
  });
});

/**
 * The Drawer is a custom modal (ADR-0007), so everything a `<dialog>` used to
 * grant — Escape, the focus return, holding the page inert, locking the scroll
 * — is this project's code now. These tests are what stands behind it.
 */
test.describe('Drawer', () => {
  // The Drawer is Reading Mode only; its toggle is display:none above 48rem.
  test.use({ viewport: VIEWPORTS.reading });

  const toggle = (page: Page): Locator => toolbar(page).locator('.toolbar-drawer');

  for (const locale of LOCALES) {
    test(`opens and closes from the keyboard in ${locale}, and hands focus back`, async ({
      page,
    }) => {
      await openPainted(page, routeFor(locale));

      const strings = ui[locale].drawer;
      const control = toggle(page);
      const panel = drawer(page);

      await expect(panel).toBeHidden();
      await expect(control).toHaveAttribute('aria-haspopup', 'dialog');
      await expect(control).toHaveAccessibleName(strings.open);

      await control.focus();
      await page.keyboard.press('Enter');

      await expect(panel).toBeVisible();
      await expect(panel).toHaveAccessibleName(strings.name);
      await expect(panel).toBeFocused();
      await expect(control).toHaveAccessibleName(strings.close);
      // The Aside's Blocks are read here once the paper stops showing them.
      await expect(panel.locator('.block--about')).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(panel).toBeHidden();
      await expect(control).toBeFocused();
    });
  }

  test('holds the paper and the Colophon inert while it is open, and releases them', async ({
    page,
  }) => {
    await openPainted(page, routeFor('it'));

    const paper = page.locator('body > main');
    const colophon = page.locator('body > footer');
    const inerted = page.locator('body > [inert]');
    // Named rather than counted: Astro's own `<style>` and bootstrap
    // `<script>` are top-level siblings too and are swept up with the rest,
    // which renders nothing and is not what this test is about.
    const inertToolbar = page.locator('body > [inert] .toolbar');

    await expect(inerted).toHaveCount(0);

    await toggle(page).click();
    await expect(drawer(page)).toBeVisible();

    // What showModal() used to do to the whole document — minus the Toolbar,
    // which has to stay live because it carries the way out.
    await expect(paper).toHaveAttribute('inert', '');
    await expect(colophon).toHaveAttribute('inert', '');
    await expect(inertToolbar).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-drawer-open', '');

    await page.keyboard.press('Escape');

    await expect(inerted).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-drawer-open', /.*/);
  });

  test('does not widen the reading column when it locks the scroll', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    // The property, because a headless browser may overlay its scrollbars and
    // have no gutter to reclaim — which would let the geometry below pass
    // without the rule being there at all.
    await expect(page.locator('html')).toHaveCSS('scrollbar-gutter', 'stable');

    const columnWidth = () =>
      page.locator('.sheets').evaluate((element) => element.getBoundingClientRect().width);
    const before = await columnWidth();

    await toggle(page).click();
    await expect(drawer(page)).toBeVisible();

    // `overflow: hidden` takes the scrollbar away; without the reserved gutter
    // its width falls to the column, re-wrapping every line behind the panel.
    expect(await columnWidth(), 'the column behind the open panel').toBe(before);

    await page.keyboard.press('Escape');
    await expect(drawer(page)).toBeHidden();
    expect(await columnWidth(), 'the column once the panel has gone').toBe(before);
  });

  test('leaves the Toolbar operable beside the open panel', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    await toggle(page).click();
    await expect(drawer(page)).toBeVisible();

    // The whole reason the panel is not a modal `<dialog>`: under one, every
    // control here would be inert behind the backdrop (ADR-0007).
    await actions(page).theme.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // And Escape still closes with the focus outside the panel.
    await page.keyboard.press('Escape');
    await expect(drawer(page)).toBeHidden();
  });

  test('closes on a click beside the panel', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    await toggle(page).click();
    await expect(drawer(page)).toBeVisible();

    await drawerBackdrop(page).click({ position: { x: 350, y: 400 } });

    await expect(drawer(page)).toBeHidden();
    await expect(toggle(page)).toBeFocused();
  });
});

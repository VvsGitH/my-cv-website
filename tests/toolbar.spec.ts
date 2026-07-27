import { existsSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { ui } from '../src/i18n/ui';
import { drawer, openPainted, pageToolbar, sheet, VIEWPORTS } from './support/page';
import { distPathForHref, LOCALES, otherLocale, routeFor } from './support/site';

// Share copies through the async Clipboard API, which silently no-ops on a
// denied permission — the toast would never appear and the test would read as a
// broken button rather than a missing grant.
test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

/**
 * The Toolbar ships twice — once on the page, once inside the Drawer's dialog
 * (ChromeIsland) — so each action has to be reached through one copy or the
 * other. These are the page's.
 */
const actions = (page: Page) => {
  const toolbar = pageToolbar(page);
  return {
    drawer: toolbar.locator('.toolbar-drawer'),
    language: toolbar.locator('a[hreflang]'),
    download: toolbar.locator('a[download]'),
    // The only Toolbar button with no modifier class of its own.
    share: toolbar.locator('button.toolbar-button:not(.toolbar-drawer):not(.toolbar-theme)'),
    theme: toolbar.locator('.toolbar-theme'),
    toast: toolbar.locator('.toolbar-toast'),
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

test.describe('Drawer', () => {
  // The Drawer is Reading Mode only; its toggle is display:none above 48rem.
  test.use({ viewport: VIEWPORTS.reading });

  for (const locale of LOCALES) {
    test(`opens and closes from the keyboard in ${locale}, and hands focus back`, async ({
      page,
    }) => {
      await openPainted(page, routeFor(locale));

      const strings = ui[locale].drawer;
      const toggle = pageToolbar(page).locator('.toolbar-drawer');
      const panel = drawer(page);

      await expect(panel).toBeHidden();
      await expect(toggle).toHaveAttribute('aria-haspopup', 'dialog');
      await expect(toggle).toHaveAccessibleName(strings.open);

      await toggle.focus();
      await page.keyboard.press('Enter');

      await expect(panel).toBeVisible();
      await expect(panel).toHaveAccessibleName(strings.name);
      await expect(toggle).toHaveAccessibleName(strings.close);
      // The Aside's Blocks are read here once the paper stops showing them.
      await expect(panel.locator('.block--about')).toBeVisible();

      // Escape, the focus trap and the focus return are the platform's, because
      // the panel is a native dialog opened with showModal() (ChromeIsland).
      await page.keyboard.press('Escape');

      await expect(panel).toBeHidden();
      await expect(toggle).toBeFocused();
    });
  }
});

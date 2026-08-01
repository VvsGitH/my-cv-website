import { existsSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { ui } from '../src/i18n/ui';
import { drawer, openPainted, sheet, toolbar, VIEWPORTS } from './support/page';
import { distPathForHref, LOCALES, otherLocale, routeFor } from './support/site';

// The Clipboard API silently no-ops on a denied permission, which would read as
// a broken button rather than a missing grant.
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
      // Both theme names ship; CSS picks between them (ADR-0003).
      await expect(action.theme).toHaveAccessibleName(toolbar.themeToDark);
      // Four on paper, five in Reading Mode (CONTEXT.md).
      await expect(action.drawer).toBeHidden();
    });

    test('names them in aria-label, not in title alone', async ({ page }) => {
      const { drawer: drawerStrings, toolbar } = ui[locale];
      const action = actions(page);

      // `title` names a control, but only as the accname chain's last resort (ADR-0013).
      await expect(action.drawer).toHaveAttribute('aria-label', drawerStrings.open);
      await expect(action.language).toHaveAttribute('aria-label', toolbar.language);
      await expect(action.download).toHaveAttribute('aria-label', toolbar.download);
      await expect(action.share).toHaveAttribute('aria-label', toolbar.share);

      // The documented exception: an aria-label would silence the sr-only pair (ADR-0003).
      await expect(action.theme).not.toHaveAttribute('aria-label', /./);
    });

    test('gives every action to the keyboard', async ({ page }) => {
      const action = actions(page);

      for (const target of [action.language, action.download, action.share, action.theme]) {
        await target.focus();
        await expect(target).toBeFocused();
      }

      // Focus alone is not operability — they have to fire, and report back.
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
      // The paper stays white in both themes.
      expect(await backgroundOf(paper), 'the Sheet surface').toBe(before.sheet);
      expect(await backgroundOf(panel), 'the Aside panel').toBe(before.aside);
    });

    test('remembers the chosen theme across a reload', async ({ page }) => {
      await actions(page).theme.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      await openPainted(page, routeFor(locale));

      // Applied pre-paint by BaseLayout's inline script, not on hydration.
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

  // Which file holds which Locale's words is pdf.spec's job.
  expect(italian).not.toBe(english);
});

/** WCAG 2.2 · 2.4.11, at both tiers. In Paper Mode it is the only thing standing behind it (ADR-0008). */
const expectNoControlBehindTheToolbar = async (page: Page): Promise<void> => {
  const targets = await page.locator(':is(a[href], button):visible').all();
  expect(targets.length, 'the page should have something to tab through').toBeGreaterThan(3);

  const obscured: string[] = [];
  for (const target of targets) {
    await target.focus();
    const verdict = await target.evaluate((element) => {
      // The Toolbar's own controls are inside the cluster by definition.
      if (element.closest('.toolbar')) return null;

      const cluster = document.querySelector('.toolbar')!.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      const hidden =
        box.left >= cluster.left &&
        box.right <= cluster.right &&
        box.top >= cluster.top &&
        box.bottom <= cluster.bottom;

      return hidden ? (element.textContent?.trim().slice(0, 40) ?? '(unnamed)') : null;
    });

    if (verdict) obscured.push(verdict);
  }

  expect(obscured, 'focusing these scrolled them under the Toolbar').toEqual([]);
};

/** What `scroll-padding-block-end` has to clear. Reading Mode only (ADR-0008). */
const toolbarReach = (page: Page): Promise<number> =>
  toolbar(page).evaluate((element) => innerHeight - element.getBoundingClientRect().top);

test.describe('Focus Not Obscured', () => {
  test.describe('Reading Mode', () => {
    test.use({ viewport: { width: 368, height: VIEWPORTS.reading.height } });

    test('never parks a focused control entirely behind the Toolbar', async ({ page }) => {
      await openPainted(page, routeFor('it'));
      await expectNoControlBehindTheToolbar(page);
    });

    // Asserted on its own, because the sweep above would pass without the rule.
    test('scroll-pads the bottom edge by the whole cluster', async ({ page }) => {
      await openPainted(page, routeFor('it'));

      const padding = await page
        .locator('html')
        .evaluate((element) => getComputedStyle(element).scrollPaddingBottom);

      expect(padding).not.toBe('auto');
      expect(Number.parseFloat(padding)).toBeGreaterThanOrEqual(await toolbarReach(page));
    });
  });

  test.describe('Paper Mode', () => {
    // The rail is a new obscuring surface (ADR-0008).
    test.use({ viewport: VIEWPORTS.paper });

    test('never parks a focused control entirely behind the Toolbar', async ({ page }) => {
      await openPainted(page, routeFor('it'));
      await expectNoControlBehindTheToolbar(page);
    });
  });
});

/** One cluster, one shape per tier (ADR-0008). */
test.describe('one cluster per tier', () => {
  const controlsOf = (page: Page) =>
    toolbar(page).locator(':scope > .toolbar-button:visible').evaluateAll((controls) =>
      controls.map((control) => {
        const box = control.getBoundingClientRect();
        return { x: Math.round(box.x), y: Math.round(box.y) };
      }),
    );

  test('runs its controls in one horizontal row in Reading Mode', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.reading);
    await openPainted(page, routeFor('it'));

    const row = await controlsOf(page);

    // Five: the four actions plus the Drawer's toggle (CONTEXT.md).
    expect(row).toHaveLength(5);
    expect(new Set(row.map((control) => control.y)).size, 'distinct rows').toBe(1);
    expect(new Set(row.map((control) => control.x)).size, 'distinct columns').toBe(5);
  });

  test('stacks its controls in one vertical rail in Paper Mode', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.paper);
    await openPainted(page, routeFor('it'));

    const rail = await controlsOf(page);

    // Four, in one column: Paper Mode has no Drawer, so it has no toggle.
    expect(rail).toHaveLength(4);
    expect(new Set(rail.map((control) => control.x)).size, 'distinct columns').toBe(1);
    expect(new Set(rail.map((control) => control.y)).size, 'distinct rows').toBe(4);
  });

  test('floats beside the page without moving the paper in Paper Mode', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.paper);
    await openPainted(page, routeFor('it'));

    const rail = (await toolbar(page).boundingBox())!;
    const viewport = VIEWPORTS.paper;

    // A rail, not a sidebar.
    expect(rail.width).toBeLessThan(viewport.width / 3);
    // Against the inline start, centred on the block axis.
    expect(rail.x, 'against the inline start').toBeLessThan(viewport.width / 4);
    expect(rail.y + rail.height / 2, 'centred on the viewport').toBeCloseTo(
      viewport.height / 2,
      0,
    );

    // Out of flow, so Sheet 1 starts at its own margin, not the rail's.
    const paperTop = (await sheet(page, 1).boundingBox())!.y;
    const withoutToolbar = await page.evaluate(() => {
      const cluster = document.querySelector<HTMLElement>('.toolbar')!;
      cluster.style.display = 'none';
      const top = document.querySelector('.sheet')!.getBoundingClientRect().top;
      cluster.style.removeProperty('display');
      return top;
    });

    expect(paperTop).toBeCloseTo(withoutToolbar, 1);
  });
});

/**
 * Escape, the focus trap and the focus return are the platform's (ADR-0008).
 * What these cover is what is still this project's: the way out inside the panel,
 * the CSS scroll lock, the light dismiss, and the Paper Mode guard.
 */
test.describe('Drawer', () => {
  // The Drawer is Reading Mode only; its toggle is display:none above 53.5rem.
  test.use({ viewport: VIEWPORTS.reading });

  const toggle = (page: Page): Locator => toolbar(page).locator('.toolbar-drawer');
  const closeControl = (page: Page): Locator => drawer(page).locator('.drawer-close');

  /** The tab order is the only evidence of inertness: the browser exposes no attribute. */
  const controlsReachedByTab = async (page: Page, presses: number): Promise<string[]> => {
    const reached: string[] = [];

    for (let press = 0; press < presses; press += 1) {
      await page.keyboard.press('Tab');
      const escapee = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active || active === document.body || active.closest('.drawer')) return null;
        return `${active.tagName.toLowerCase()}.${active.className}`;
      });

      if (escapee) reached.push(escapee);
    }

    return reached;
  };

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
      // The name is computed from a real sr-only `<h2>`, not an `aria-label` (ADR-0008).
      await expect(panel.locator('.drawer-title')).toHaveText(strings.name);
      // `autofocus` on the way out, or markup order becomes the focus policy (ADR-0008).
      await expect(closeControl(page)).toBeFocused();
      // The Aside's Blocks are read here once the paper stops showing them.
      await expect(panel.locator('.block--about')).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(panel).toBeHidden();
      await expect(control).toBeFocused();
    });

    test(`names and closes from the panel's own head in ${locale}`, async ({ page }) => {
      await openPainted(page, routeFor(locale));

      const strings = ui[locale].drawer;

      await toggle(page).click();
      await expect(drawer(page)).toBeVisible();

      // Announced, never shown, so the head row is the close control alone (ADR-0008).
      await expect(drawer(page).locator('.drawer-title')).toHaveText(strings.name);
      await expect(closeControl(page)).toHaveAccessibleName(strings.close);

      await closeControl(page).click();

      await expect(drawer(page)).toBeHidden();
      await expect(toggle(page)).toBeFocused();
    });
  }

  test('holds the paper and the Colophon inert while it is open, without an attribute', async ({
    page,
  }) => {
    await openPainted(page, routeFor('it'));

    const html = page.locator('html');
    // A count of 0 fails loudly if ADR-0007's hand-built machinery ever comes back.
    const inerted = page.locator('body > [inert]');

    await expect(inerted).toHaveCount(0);
    await expect(html).not.toHaveCSS('overflow', 'hidden');

    await toggle(page).click();
    await expect(drawer(page)).toBeVisible();

    await expect(inerted).toHaveCount(0);
    // The one thing showModal() does not do (hacks/2026-08-01 §3).
    await expect(html).toHaveCSS('overflow', 'hidden');

    expect(
      await controlsReachedByTab(page, 12),
      'Tab reached these from inside the open panel',
    ).toEqual([]);

    await page.keyboard.press('Escape');

    await expect(drawer(page)).toBeHidden();
    await expect(html).not.toHaveCSS('overflow', 'hidden');
  });

  test('does not widen the reading column when it locks the scroll', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    // The property itself: a headless browser may have no gutter to reclaim, which
    // would let the geometry below pass without the rule being there at all.
    await expect(page.locator('html')).toHaveCSS('scrollbar-gutter', 'stable');

    const columnWidth = () =>
      page.locator('.sheets').evaluate((element) => element.getBoundingClientRect().width);
    const before = await columnWidth();

    await toggle(page).click();
    await expect(drawer(page)).toBeVisible();

    // Without the reserved gutter the lock re-wraps every line behind the panel.
    expect(await columnWidth(), 'the column behind the open panel').toBe(before);

    await page.keyboard.press('Escape');
    await expect(drawer(page)).toBeHidden();
    expect(await columnWidth(), 'the column once the panel has gone').toBe(before);
  });

  test('holds the Toolbar inert behind the open panel', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    await toggle(page).click();
    await expect(drawer(page)).toBeVisible();

    // The exact inversion of ADR-0007's headline property, and ADR-0008's whole price.
    expect(await controlsReachedByTab(page, 12), 'Tab reached the Toolbar').toEqual([]);

    // A click aimed at a control reaches the backdrop, and reads as a dismissal.
    await actions(page).theme.click({ force: true });

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(drawer(page)).toBeHidden();
    await expect(toggle(page)).toBeFocused();
  });

  test('closes on a click beside the panel', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    await toggle(page).click();
    await expect(drawer(page)).toBeVisible();

    // Absolute coordinates: `::backdrop` hit-tests to the dialog, and has no element.
    const beside = await drawer(page).evaluate((panel) => panel.getBoundingClientRect().right + 30);
    await page.mouse.click(beside, 400);

    await expect(drawer(page)).toBeHidden();
    await expect(toggle(page)).toBeFocused();
  });

  test('draws the backdrop behind the open panel', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    await toggle(page).click();
    await expect(drawer(page)).toBeVisible();

    // The tint itself, not merely "not transparent": an engine that did not inherit
    // the custom property into `::backdrop` would drop the declaration, leaving a
    // backdrop that is still hit-testable and only colourless.
    const { fill, tint } = await drawer(page).evaluate((panel) => {
      const probe = document.createElement('span');
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--color-ink');
      probe.style.backgroundColor = `color-mix(in oklab, ${ink} 45%, transparent)`;
      document.body.append(probe);
      const tinted = getComputedStyle(probe).backgroundColor;
      probe.remove();

      return { fill: getComputedStyle(panel, '::backdrop').backgroundColor, tint: tinted };
    });

    expect(fill).not.toBe('rgba(0, 0, 0, 0)');
    expect(fill).toBe(tint);
  });

  test('closes itself when the window grows into Paper Mode', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    await toggle(page).click();
    await expect(drawer(page)).toBeVisible();

    await page.setViewportSize(VIEWPORTS.paper);

    // Guards against a permanently dead page (hacks/2026-08-01 §4).
    await expect(drawer(page)).toBeHidden();
    await expect(drawer(page)).not.toHaveAttribute('open', /.*/);
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');

    // Scrollable and focusable again, which is what "not blocked" means.
    const theme = actions(page).theme;
    await theme.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

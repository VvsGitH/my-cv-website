import { existsSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { ui } from '../src/i18n/ui';
import { inkOn } from './support/contrast';
import { openPainted, sheet, toolbar, VIEWPORTS } from './support/page';
import { distPathForHref, LOCALES, otherLocale, routeFor } from './support/site';

// The Clipboard API silently no-ops on a denied permission, which would read as
// a broken button rather than a missing grant.
test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

/** There is one Toolbar, and these are its five controls — at every tier now. */
const actions = (page: Page) => {
  const strip = toolbar(page);
  return {
    mode: strip.locator('.toolbar-mode'),
    language: strip.locator('a[hreflang]'),
    download: strip.locator('a[download]'),
    // The only Toolbar button with no modifier class of its own.
    share: strip.locator('button.toolbar-button:not(.toolbar-mode):not(.toolbar-theme)'),
    theme: strip.locator('.toolbar-theme'),
    toast: strip.locator('.toolbar-toast'),
  };
};

const backgroundOf = (locator: Locator): Promise<string> =>
  locator.evaluate((element) => getComputedStyle(element).backgroundColor);

const inkOf = (locator: Locator): Promise<string> =>
  locator.evaluate((element) => getComputedStyle(element).color);


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
      // Both names of each pair ship; CSS picks between them (ADR-0003, ADR-0017).
      await expect(action.theme).toHaveAccessibleName(toolbar.themeToDark);
      await expect(action.mode).toHaveAccessibleName(toolbar.modeToReading);
    });

    test('names them in aria-label, not in title alone', async ({ page }) => {
      const { toolbar } = ui[locale];
      const action = actions(page);

      // `title` names a control, but only as the accname chain's last resort (ADR-0013).
      await expect(action.language).toHaveAttribute('aria-label', toolbar.language);
      await expect(action.download).toHaveAttribute('aria-label', toolbar.download);
      await expect(action.share).toHaveAttribute('aria-label', toolbar.share);

      // The documented exception, and it now covers two controls: an aria-label
      // would silence the sr-only pair each of them ships (ADR-0003, ADR-0017).
      await expect(action.theme).not.toHaveAttribute('aria-label', /./);
      await expect(action.mode).not.toHaveAttribute('aria-label', /./);
    });

    test('gives every action to the keyboard', async ({ page }) => {
      const action = actions(page);

      for (const target of [
        action.mode,
        action.language,
        action.download,
        action.share,
        action.theme,
      ]) {
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

    test('repaints the page and the paper, and never the cream Aside', async ({ page }) => {
      const html = page.locator('html');
      const paper = sheet(page, 1);
      const panel = paper.locator('.aside');

      await expect(html).toHaveAttribute('data-theme', 'light');
      const before = {
        body: await backgroundOf(page.locator('body')),
        sheet: await backgroundOf(paper),
        aside: await backgroundOf(panel),
        asideInk: await inkOf(panel.locator('p').first()),
      };

      // The page and the paper are two surfaces, and they were never the same
      // colour to begin with — the backdrop is grey under the white Sheet.
      expect(before.body, 'the page and the paper are separate surfaces').not.toBe(before.sheet);

      await actions(page).theme.click();
      await expect(html).toHaveAttribute('data-theme', 'dark');

      expect(await backgroundOf(page.locator('body')), 'the page backdrop').not.toBe(before.body);
      // The theme reaches the paper (ADR-0015)...
      expect(await backgroundOf(paper), 'the Sheet surface').not.toBe(before.sheet);
      // ...but stops at the cream, which would otherwise take white ink.
      expect(await backgroundOf(panel), 'the Aside panel').toBe(before.aside);
      expect(await inkOf(panel.locator('p').first()), 'the Aside ink').toBe(before.asideInk);
    });

    test('keeps the Aside legible on its cream in the dark theme', async ({ page }) => {
      await actions(page).theme.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      // The one failure this whole architecture exists to prevent: an ink that
      // followed the theme would be white on #fef9e0, at about 1.05:1.
      const { ratio } = await inkOn(page, '.aside p', '.aside');
      expect(ratio, 'the Aside ink against its own panel').toBeGreaterThanOrEqual(4.5);
    });

    test('keeps the Main column legible on the dark paper', async ({ page }) => {
      await actions(page).theme.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      const body = await inkOn(page, '.main .block--mainSection p', '.sheet');
      expect(body.ratio, 'body copy against the dark paper').toBeGreaterThanOrEqual(4.5);

      const heading = await inkOn(page, '.main h2', '.sheet');
      expect(heading.ratio, 'a section heading against the dark paper').toBeGreaterThanOrEqual(4.5);
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

/** The circular reveal, and the one condition that must call it off (ADR-0016). */
test.describe('theme reveal', () => {
  /** Recorded rather than timed: whether the swap went through a View Transition at all. */
  const watchReveal = async (page: Page): Promise<void> => {
    await page.addInitScript(() => {
      const start = document.startViewTransition.bind(document);
      Object.defineProperty(window, 'revealed', { value: false, writable: true });
      document.startViewTransition = (callback) => {
        (window as unknown as { revealed: boolean }).revealed = true;
        return start(callback);
      };
    });
  };

  const revealed = (page: Page): Promise<boolean> =>
    page.evaluate(() => (window as unknown as { revealed: boolean }).revealed);

  test('reveals the new theme instead of cutting to it', async ({ page }) => {
    await watchReveal(page);
    await openPainted(page, routeFor('it'));

    await actions(page).theme.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await revealed(page), 'the swap should run inside a View Transition').toBe(true);
  });

  // The gate has to live in `state.ts`: reset.css collapses transition durations but
  // reaches neither the snapshot pseudo-elements nor `animate()` (coding-standards).
  // `emulateMedia`, not `test.use({ reducedMotion })` â€” the latter does not reach
  // `matchMedia` here, so it would assert the gate against a query that is never true.
  test('cuts straight to the new theme under reduced motion', async ({ page }) => {
    await watchReveal(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openPainted(page, routeFor('it'));

    await actions(page).theme.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await revealed(page), 'no View Transition should have started').toBe(false);
  });
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

/** What `scroll-padding-block-end` has to clear. The narrow tier only (ADR-0008). */
const toolbarReach = (page: Page): Promise<number> =>
  toolbar(page).evaluate((element) => innerHeight - element.getBoundingClientRect().top);

test.describe('Focus Not Obscured', () => {
  test.describe('the bottom row', () => {
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

  test.describe('the inline rail', () => {
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

  // The shape is a width, never the Mode (ADR-0017) — so `reading` and `paper`
  // below name viewports, not what the reader is looking at.
  test('runs its controls in one horizontal row on the narrow tier', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.reading);
    await openPainted(page, routeFor('it'));

    const row = await controlsOf(page);

    // Five at every tier now: the Mode's control replaced the Drawer's toggle,
    // and unlike it, it is offered everywhere (CONTEXT.md).
    expect(row).toHaveLength(5);
    expect(new Set(row.map((control) => control.y)).size, 'distinct rows').toBe(1);
    expect(new Set(row.map((control) => control.x)).size, 'distinct columns').toBe(5);
  });

  test('stacks its controls in one vertical rail on the wide tier', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.paper);
    await openPainted(page, routeFor('it'));

    const rail = await controlsOf(page);

    expect(rail).toHaveLength(5);
    expect(new Set(rail.map((control) => control.x)).size, 'distinct columns').toBe(1);
    expect(new Set(rail.map((control) => control.y)).size, 'distinct rows').toBe(5);
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

import { existsSync } from 'node:fs';
import { expect, type Locator, type Page, test } from '@playwright/test';
import type { Locale } from '../src/i18n/locale';
import { ui } from '../src/i18n/ui';
import { contrastRatio, inkOn } from './support/contrast';
import { openPainted, paperMode, readingMode, sheet, toolbar, VIEWPORTS } from './support/page';
import { distPathForHref, LOCALES, otherLocale, routeFor } from './support/site';

// The Clipboard API silently no-ops on a denied permission, which would read as
// a broken button rather than a missing grant.
test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

type Theme = 'light' | 'dark';

/** There is one Toolbar, and these are its six controls — one shape at every width. */
const controls = (page: Page) => {
  const bar = toolbar(page);
  return {
    mode: bar.locator('.toolbar-mode'),
    locales: bar.locator('.toolbar-locale'),
    locale: (locale: Locale) => bar.locator(`.toolbar-locale a[hreflang="${locale}"]`),
    download: bar.locator('.toolbar-button[download]'),
    share: bar.locator('.toolbar-share'),
    theme: bar.locator('.toolbar-theme'),
    themeOption: (theme: Theme) => bar.locator(`.toolbar-theme [data-theme-option="${theme}"]`),
    unchosenTheme: bar.locator('.toolbar-theme [aria-checked="false"]'),
    toast: bar.locator('.toolbar-toast'),
    rule: bar.locator('.toolbar-rule'),
  };
};

const backgroundOf = (locator: Locator): Promise<string> =>
  locator.evaluate((element) => getComputedStyle(element).backgroundColor);

const inkOf = (locator: Locator): Promise<string> =>
  locator.evaluate((element) => getComputedStyle(element).color);

const lengthOf = (page: Page, token: string, within: string): Promise<number> =>
  page.locator(within).evaluate((element, name) => {
    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.inlineSize = `var(${name})`;
    element.append(probe);
    const { width } = probe.getBoundingClientRect();
    probe.remove();
    return width;
  }, token);

for (const locale of LOCALES) {
  test.describe(locale, () => {
    const strings = ui[locale].toolbar;

    test.beforeEach(async ({ page }) => {
      await openPainted(page, routeFor(locale));
    });

    test('names every control in this Locale', async ({ page }) => {
      const control = controls(page);

      await expect(control.mode).toHaveAccessibleName(strings.modeReading);
      await expect(control.locales).toHaveAccessibleName(strings.localeGroup);
      await expect(control.locale('it')).toHaveAccessibleName('IT');
      await expect(control.locale('en')).toHaveAccessibleName('EN');
      await expect(control.download).toHaveAccessibleName(strings.download);
      await expect(control.share).toHaveAccessibleName(strings.share);
      await expect(control.theme).toHaveAccessibleName(strings.themeGroup);
      await expect(control.themeOption('light')).toHaveAccessibleName(strings.themeLight);
      await expect(control.themeOption('dark')).toHaveAccessibleName(strings.themeDark);
    });

    test('names the Mode control with its visible text and nothing else', async ({ page }) => {
      const mode = controls(page).mode;

      await expect(mode, 'a second copy of the name is a 2.5.3 hazard').not.toHaveAttribute(
        'title',
        /./,
      );
      await expect(mode).not.toHaveAttribute('aria-label', /./);

      await expect(mode).toHaveAccessibleName(strings.modeReading);
      expect(await mode.innerText(), 'the visible text is the name').toBe(strings.modeReading);

      await readingMode(page);

      await expect(mode).toHaveAccessibleName(strings.modePaper);
      expect(await mode.innerText(), 'and still is after the flip').toBe(strings.modePaper);
    });

    test('marks the theme the reader is in, not the one on offer', async ({ page }) => {
      const control = controls(page);
      const html = page.locator('html');

      await expect(html).toHaveAttribute('data-theme', 'light');
      await expect(control.themeOption('light')).toHaveAttribute('aria-checked', 'true');
      await expect(control.themeOption('dark')).toHaveAttribute('aria-checked', 'false');

      await control.themeOption('dark').click();

      await expect(html).toHaveAttribute('data-theme', 'dark');
      await expect(control.themeOption('light')).toHaveAttribute('aria-checked', 'false');
      await expect(control.themeOption('dark')).toHaveAttribute('aria-checked', 'true');
    });

    test('marks the Locale the reader is reading, and puts the pill on it', async ({ page }) => {
      const control = controls(page);
      const other = otherLocale(locale);

      await expect(control.locale(locale)).toHaveAttribute('aria-current', 'page');
      await expect(control.locale(other)).not.toHaveAttribute('aria-current', /./);

      const pill = await control.locales.evaluate(
        (element) => getComputedStyle(element, '::before').translate,
      );
      expect(pill, 'the pill is placed by CSS, off aria-current').toBe(
        locale === 'it' ? 'none' : '100%',
      );
    });

    test('puts the current URL on the clipboard and says so', async ({ page }) => {
      const control = controls(page);
      const url = page.url();
      const glyph = control.share.locator('span');

      await expect(glyph).toHaveClass('icon-share-2');

      await control.share.click();

      await expect(glyph).toHaveClass('icon-check-circle');
      await expect(control.share).toHaveAccessibleName(strings.shared);
      await expect(control.toast).toHaveAttribute('data-visible', '');
      await expect(toolbar(page).getByRole('status')).toHaveText(strings.shared);
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);
    });

    test('offers a PDF that was actually rendered', async ({ page }) => {
      const link = controls(page).download;
      await expect(link).toHaveAttribute('download', '');

      const href = await link.getAttribute('href');
      expect(href, 'the download link should carry an href').not.toBeNull();
      expect(href, `the ${locale} bar should offer the ${locale} PDF`).toContain(
        locale.toUpperCase(),
      );
      expect(
        existsSync(distPathForHref(href!)),
        `${href} is offered for download but no such file was rendered`,
      ).toBe(true);
    });

    test('repaints all three surfaces, and keeps them apart', async ({ page }) => {
      const html = page.locator('html');
      const paper = sheet(page, 1);
      const panel = paper.locator('.aside');
      const surfaces = async () => ({
        body: await backgroundOf(page.locator('body')),
        sheet: await backgroundOf(paper),
        aside: await backgroundOf(panel),
        asideInk: await inkOf(panel.locator('p').first()),
      });

      await expect(html).toHaveAttribute('data-theme', 'light');
      const before = await surfaces();

      // Three surfaces, and no two of them share a colour: a grey page under the
      // white paper, with the Aside's panel laid on the paper.
      expect(before.body, 'the page and the paper are separate surfaces').not.toBe(before.sheet);
      expect(before.aside, 'the Aside panel is a surface of its own').not.toBe(before.sheet);

      await controls(page).unchosenTheme.click();
      await expect(html).toHaveAttribute('data-theme', 'dark');
      const after = await surfaces();

      // The theme reaches the paper (ADR-0015) and no longer stops at the panel:
      // the Aside is themed rather than pinned to one cream, so all three move,
      // and its ink — no longer pinned either — moves with them.
      expect(after.body, 'the page backdrop').not.toBe(before.body);
      expect(after.sheet, 'the Sheet surface').not.toBe(before.sheet);
      expect(after.aside, 'the Aside panel').not.toBe(before.aside);
      expect(after.asideInk, 'the Aside ink').not.toBe(before.asideInk);

      // Still three surfaces on the dark side. Asserted on both ends of the ramp
      // because there is no longer a fixed cream holding the panel apart from the
      // paper: a panel that landed on the paper's own colour would stop reading
      // as a panel, and nothing but this would say so.
      expect(after.body, 'the page and the paper stay separate').not.toBe(after.sheet);
      expect(after.aside, 'the Aside panel stays a surface of its own').not.toBe(after.sheet);
    });

    test('keeps the Aside legible on its panel in both themes', async ({ page }) => {
      // What the cream pin used to buy by construction, now bought by
      // measurement: the panel takes the theme, so both ends of the ramp have to
      // clear their own surface. The failure this replaces is the one that
      // pinning existed to prevent — an ink that followed the theme onto a fixed
      // #fef9e0, at about 1.05:1.
      const light = await inkOn(page, '.aside p', '.aside');
      expect(light.ratio, 'the Aside ink on its panel, light theme').toBeGreaterThanOrEqual(4.5);

      await controls(page).unchosenTheme.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      const dark = await inkOn(page, '.aside p', '.aside');
      expect(dark.ratio, 'the Aside ink on its panel, dark theme').toBeGreaterThanOrEqual(4.5);
    });

    test('keeps the Main column legible on the dark paper', async ({ page }) => {
      await controls(page).unchosenTheme.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      const body = await inkOn(page, '.main .block--mainSection p', '.sheet');
      expect(body.ratio, 'body copy against the dark paper').toBeGreaterThanOrEqual(4.5);

      const heading = await inkOn(page, '.main h2', '.sheet');
      expect(heading.ratio, 'a section heading against the dark paper').toBeGreaterThanOrEqual(4.5);
    });

    test('remembers the chosen theme across a reload', async ({ page }) => {
      await controls(page).unchosenTheme.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      await openPainted(page, routeFor(locale));

      // Applied pre-paint by BaseLayout's inline script, not on hydration.
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expect(controls(page).themeOption('dark')).toHaveAttribute('aria-checked', 'true');
    });
  });
}

test('offers a different PDF in each Locale', async ({ page }) => {
  const offered = async (locale: Locale): Promise<string | null> => {
    await openPainted(page, routeFor(locale));
    return controls(page).download.getAttribute('href');
  };

  const italian = await offered('it');
  const english = await offered('en');

  // Which file holds which Locale's words is pdf.spec's job.
  expect(italian).not.toBe(english);
});

test.describe('the keyboard', () => {
  test('reaches every control, with the theme pair as one stop', async ({ page }) => {
    await openPainted(page, routeFor('it'));
    const control = controls(page);

    const stops = [
      control.mode,
      control.locale('it'),
      control.locale('en'),
      control.download,
      control.share,
      control.themeOption('light'),
    ];

    for (const stop of stops) {
      await page.keyboard.press('Tab');
      await expect(stop).toBeFocused();
    }

    await page.keyboard.press('Tab');
    await expect(
      toolbar(page).locator(':focus'),
      'the roving tabindex leaves the pair one stop',
    ).toHaveCount(0);
  });

  test('moves within the theme pair with the arrow keys', async ({ page }) => {
    await openPainted(page, routeFor('it'));
    const control = controls(page);
    const html = page.locator('html');

    await control.themeOption('light').focus();
    await page.keyboard.press('ArrowRight');

    await expect(control.themeOption('dark')).toBeFocused();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(control.themeOption('dark')).toHaveAttribute('aria-checked', 'true');
    await expect(control.themeOption('dark')).toHaveAttribute('tabindex', '0');
    await expect(control.themeOption('light')).toHaveAttribute('tabindex', '-1');

    await page.keyboard.press('Home');

    await expect(control.themeOption('light')).toBeFocused();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
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

    await controls(page).unchosenTheme.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await revealed(page), 'the swap should run inside a View Transition').toBe(true);
  });

  // The gate has to live in the island: reset.css collapses transition durations but
  // reaches neither the snapshot pseudo-elements nor `animate()` (coding-standards).
  // `emulateMedia`, not `test.use({ reducedMotion })` — the latter does not reach
  // `matchMedia` here, so it would assert the gate against a query that is never true.
  test('cuts straight to the new theme under reduced motion', async ({ page }) => {
    await watchReveal(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openPainted(page, routeFor('it'));

    await controls(page).unchosenTheme.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await revealed(page), 'no View Transition should have started').toBe(false);
  });
});

test.describe('the rule', () => {
  const ruleWidth = (page: Page): Promise<number> =>
    controls(page).rule.evaluate((element) => element.getBoundingClientRect().width);

  const paperSpan = async (page: Page): Promise<number> => {
    const pad = await lengthOf(page, '--sheets-pad', 'body');
    const paper = await page
      .locator('.sheet')
      .evaluateAll((sheets) => sheets.map((element) => element.getBoundingClientRect()));

    const left = Math.min(...paper.map((box) => box.left));
    const right = Math.max(...paper.map((box) => box.right));
    return right - left + 2 * pad;
  };

  test('spans the paper below it, on both sides of the wrap', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    const measured: Record<number, { rule: number; paper: number }> = {};
    for (const width of [
      VIEWPORTS.twoUp.width + 1,
      VIEWPORTS.twoUp.width,
      VIEWPORTS.twoUp.width - 1,
      VIEWPORTS.stacked.width,
    ]) {
      await page.setViewportSize({ width, height: VIEWPORTS.stacked.height });
      measured[width] = { rule: await ruleWidth(page), paper: await paperSpan(page) };
    }

    for (const [width, { rule, paper }] of Object.entries(measured)) {
      expect(rule, `at ${width}px the rule should span the paper below it`).toBeCloseTo(paper, 1);
    }

    const pair = measured[VIEWPORTS.twoUp.width]!.rule;
    expect(pair, 'one pixel wider changes nothing').toBeCloseTo(
      measured[VIEWPORTS.twoUp.width + 1]!.rule,
      1,
    );
    expect(pair, 'one pixel narrower is the single-Sheet rule').toBeGreaterThan(
      measured[VIEWPORTS.twoUp.width - 1]!.rule,
    );
    expect(measured[VIEWPORTS.twoUp.width - 1]!.rule, 'and stays it all the way down').toBeCloseTo(
      measured[VIEWPORTS.stacked.width]!.rule,
      1,
    );
  });

  test('keeps the paper’s width in Reading Mode, where the column is narrower', async ({
    page,
  }) => {
    await openPainted(page, routeFor('it'));
    const onPaper = await ruleWidth(page);

    await readingMode(page);
    expect(await ruleWidth(page), 'the bar does not follow the Mode').toBeCloseTo(onPaper, 1);

    const column = (await page.locator('.sheets').boundingBox())!;
    expect(await ruleWidth(page), 'and so it overhangs the reading column').toBeGreaterThan(
      column.width,
    );
  });
});

test.describe('contrast', () => {
  type Srgb = [number, number, number];

  interface Swatch {
    selector: string;
    pseudo?: string;
    property: 'color' | 'backgroundColor' | 'borderTopColor';
  }

  const swatches = (page: Page, wanted: Swatch[]): Promise<Srgb[]> =>
    page.evaluate((items) => {
      const context = document.createElement('canvas').getContext('2d')!;

      return items.map(({ selector, pseudo, property }) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`nothing matched ${selector}`);

        context.clearRect(0, 0, 1, 1);
        context.fillStyle = getComputedStyle(element, pseudo)[property];
        context.fillRect(0, 0, 1, 1);
        const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
        return [red!, green!, blue!] as Srgb;
      });
    }, wanted);

  const measure = async (page: Page) => {
    const [barInk, activeInk, localeFill, localeEdge, switchBg, pageBg, paper, panel] =
      await swatches(page, [
        { selector: '.toolbar-mode', property: 'color' },
        { selector: '.toolbar-locale a[aria-current]', property: 'color' },
        { selector: '.toolbar-locale', pseudo: '::before', property: 'backgroundColor' },
        { selector: '.toolbar-locale', pseudo: '::before', property: 'borderTopColor' },
        { selector: '.toolbar-locale', property: 'backgroundColor' },
        { selector: 'body', property: 'backgroundColor' },
        { selector: '.sheet', property: 'backgroundColor' },
        { selector: '.aside', property: 'backgroundColor' },
      ]);

    return {
      activeLabel: contrastRatio(activeInk!, localeFill!),
      localeBorder: contrastRatio(localeEdge!, switchBg!),
      onThePage: contrastRatio(barInk!, pageBg!),
      onThePaper: contrastRatio(barInk!, paper!),
      onThePanel: contrastRatio(barInk!, panel!),
    };
  };

  const expectLegible = (measured: Awaited<ReturnType<typeof measure>>, theme: Theme): void => {
    expect(measured.activeLabel, `the active label on the pill, ${theme}`).toBeGreaterThanOrEqual(
      4.5,
    );

    // The pill's fill measures ~1.1:1 against the page in both themes, and that
    // is expected (spec decision 5): what marks the selection for 1.4.11 is the
    // border, so the border is what is pinned here. Do not "fix" the fill.
    expect(measured.localeBorder, `the language pill's border, ${theme}`).toBeGreaterThanOrEqual(3);

    for (const surface of ['onThePage', 'onThePaper', 'onThePanel'] as const) {
      expect(measured[surface], `the bar's ink ${surface}, ${theme}`).toBeGreaterThanOrEqual(4.5);
    }
  };

  test('clears every surface the bar can float over, in both themes', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expectLegible(await measure(page), 'light');

    await controls(page).unchosenTheme.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expectLegible(await measure(page), 'dark');
  });
});

/** WCAG 2.2 · 2.4.11, inverted: the sticky bar is what a focused control can hide behind now. */
const expectNoControlBehindTheToolbar = async (page: Page): Promise<void> => {
  const targets = await page.locator(':is(a[href], button):visible').all();
  expect(targets.length, 'the page should have something to tab through').toBeGreaterThan(3);

  const obscured: string[] = [];
  for (const target of targets) {
    const verdict = await target.evaluate((element) => {
      // The bar's own controls are inside it by definition.
      if (element.closest('.toolbar')) return null;

      const barBefore = document.querySelector('.toolbar')!.getBoundingClientRect();
      const offset = element.getBoundingClientRect().top - barBefore.height / 2;
      window.scrollTo(0, window.scrollY + offset);
      element.focus();

      const bar = document.querySelector('.toolbar')!.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      const hidden =
        box.left >= bar.left &&
        box.right <= bar.right &&
        box.top >= bar.top &&
        box.bottom <= bar.bottom;

      return hidden ? (element.textContent?.trim().slice(0, 40) ?? '(unnamed)') : null;
    });

    if (verdict) obscured.push(verdict);
  }

  expect(obscured, 'focusing these parked them entirely behind the bar').toEqual([]);
};

test.describe('Focus Not Obscured', () => {
  /**
   * Both Modes, because this width now seeds Reading Mode (ADR-0017, amended)
   * and ADR-0025 measured its one-line thresholds — 354px Paper, 344px Reading —
   * against both. At 368px the bar is one line either way, so neither sweep is
   * expected to find the 12px partial obscuring that ADR records as accepted.
   */
  test.describe('the narrowest column', () => {
    test.use({ viewport: VIEWPORTS.narrowest });

    test('never parks a focused control entirely behind the bar', async ({ page }) => {
      await openPainted(page, routeFor('it'));
      await readingMode(page);
      await expectNoControlBehindTheToolbar(page);
    });

    test('never parks one behind it in Paper Mode either', async ({ page }) => {
      await openPainted(page, routeFor('it'));
      await paperMode(page);
      await expectNoControlBehindTheToolbar(page);
    });
  });

  test.describe('the paper viewport', () => {
    test.use({ viewport: VIEWPORTS.paper });

    test('never parks a focused control entirely behind the bar', async ({ page }) => {
      await openPainted(page, routeFor('it'));
      await expectNoControlBehindTheToolbar(page);
    });

    // Asserted on its own: the sweep proves the rule works, not that it clears the whole bar.
    test('scroll-pads the block start by the whole bar', async ({ page }) => {
      await openPainted(page, routeFor('it'));

      const padding = await page
        .locator('html')
        .evaluate((element) => getComputedStyle(element).scrollPaddingTop);

      expect(padding, 'the bottom row’s padding is gone, not merely renamed').not.toBe('auto');
      expect(Number.parseFloat(padding), 'the pad is the bar’s own token').toBeGreaterThanOrEqual(
        await lengthOf(page, '--toolbar-block-size', 'body'),
      );
      expect(
        Number.parseFloat(padding),
        'and clears the bar as it actually stands here',
      ).toBeGreaterThanOrEqual((await toolbar(page).boundingBox())!.height);
    });
  });
});

test.describe('the stuck state', () => {
  const stuck = (page: Page) => (): Promise<string | null> =>
    toolbar(page).getAttribute('data-stuck');

  test('takes its shadow only once the bar is holding the top edge', async ({ page }) => {
    await openPainted(page, routeFor('it'));
    const bar = toolbar(page);

    await expect.poll(stuck(page), { message: 'at rest the bar is not stuck' }).toBeNull();
    await expect(bar).toHaveCSS('box-shadow', 'none');

    await page.evaluate(() => window.scrollTo(0, 600));

    await expect.poll(stuck(page), { message: 'scrolled, the bar is stuck' }).toBe('');
    await expect(bar).not.toHaveCSS('box-shadow', 'none');

    await page.evaluate(() => window.scrollTo(0, 0));

    await expect.poll(stuck(page), { message: 'back at the top, it lets go' }).toBeNull();
    await expect(bar).toHaveCSS('box-shadow', 'none');
  });
});

test.describe('the language’s travel', () => {
  /**
   * The arriving half cannot be asserted here: headless Chromium skips the
   * cross-document transition it was handed, so `pagereveal` carries nothing.
   * The departing document is deterministic, and it is the one reading this
   * page's own opt-in.
   */
  const watchDeparture = async (page: Page): Promise<void> => {
    await page.addInitScript(() => {
      window.addEventListener('pageswap', (event) => {
        const crossing = (event as unknown as { viewTransition: unknown }).viewTransition;
        try {
          sessionStorage.setItem('departure', crossing ? 'transition' : 'cut');
        } catch {
          // Private modes throw on write; the assertion below then reads null and says so.
        }
      });
    });
  };

  const departure = (page: Page): Promise<string | null> =>
    page.evaluate(() => sessionStorage.getItem('departure'));

  const nameOf = (page: Page, selector: string, pseudo?: string): Promise<string> =>
    page
      .locator(selector)
      .first()
      .evaluate(
        (element, part) => getComputedStyle(element, part).viewTransitionName,
        pseudo ?? null,
      );

  const classOf = (page: Page, selector: string, pseudo?: string): Promise<string> =>
    page
      .locator(selector)
      .first()
      .evaluate(
        (element, part) => getComputedStyle(element, part).viewTransitionClass,
        pseudo ?? null,
      );

  test('names the pill and both labels so the two documents can pair them', async ({ page }) => {
    await openPainted(page, routeFor('it'));

    expect(await nameOf(page, '.toolbar-locale', '::before')).toBe('lang-pill');
    expect(await nameOf(page, '.toolbar-locale a[hreflang="it"]')).toBe('match-element');
    expect(await nameOf(page, '.toolbar-locale a[hreflang="en"]')).toBe('match-element');
    expect(await classOf(page, '.toolbar-locale a[hreflang="it"]')).toBe('lang-label');
    expect(await classOf(page, '.toolbar-locale a[hreflang="en"]')).toBe('lang-label');
  });

  test('leaves for the other Locale as a transition, not a cut', async ({ page }) => {
    await watchDeparture(page);
    await openPainted(page, routeFor('it'));

    await controls(page).locale('en').click();
    await page.waitForURL(routeFor('en'));

    expect(await departure(page), 'the navigation opted into a view transition').toBe('transition');

    await expect(controls(page).locale('en')).toHaveAttribute('aria-current', 'page');
  });

  test('does not travel when the reader arrived directly', async ({ page }) => {
    await watchDeparture(page);
    await openPainted(page, routeFor('en'));

    expect(await departure(page), 'nothing was left behind, so nothing is paired').toBeNull();
  });
});

# 07 — Floating Toolbar (Preact island)

Status: done

## Goal

The single Preact island: a floating Toolbar with four actions, plus the Drawer toggle on mobile.

## Tasks

- **Design:** use skill /frontend-design to generate the floating toolbar component in a style that is consistent with the current application
  - use 2px border radius for toolbar and buttons
  - the tollbar should be on the left side, floating in the middle of the page
  - the toolbar should be as unobtrusive as possible, and should hide the least amount of text
  - on mobile, the toolbar should translate to the right in sync with the drawer (make the drawer width smaller if needed)
  - use the icon font just added in src/assets/fonts
- **Language:** toggle EN/IT — navigate to the equivalent route in the other Locale. (This button does nothing until after task 08)
- **Download:** link to the current Locale's pre-rendered PDF (`Vito_Paparella_Santorsola_CV_<LOC>.pdf`).
- **Share:** copy `window.location.href` to clipboard with a brief confirmation toast/state.
- **Theme:** light/dark toggle; dark mode swaps **only** the background behind the Sheets to the dark-blue token. Persist in `localStorage`; apply pre-hydration to avoid flash.
- Drawer toggle (mobile) wired to ticket 06's Drawer.
  - Remove the current button that the drawer uses to open itself
- Accessible controls (labels, keyboard, focus states); minimal, unobtrusive styling.

## Acceptance

- All four actions work; theme + drawer toggle correctly; theme persists across reloads without flash.
- Sheets and PDF are visually unaffected by dark mode.

## Depends on

- 06

## Comments

### Toolbar and Drawer are now one island

Ticket 06 handed over the choice and this ticket makes it: `ChromeIsland.tsx`
is the site's single island (ADR-0003 describes it that way), and
`DrawerPanel.tsx` / `Drawer.astro` are gone. `Chrome.astro` is what the pages
render into `BaseLayout`'s `chrome` slot.

One tree was not a preference. The Toolbar has to be able to render *inside*
the Drawer's `<dialog>` — see below — and two islands cannot share a subtree.

Files: `chrome/Chrome.astro` · `chrome/ChromeIsland.tsx` · `chrome/Toolbar.tsx`
· `chrome/state.ts` · `chrome/toolbar.css` · `chrome/drawer.css`.

### The Toolbar is rendered twice, and that is what makes it ride the Drawer

The ticket asks for a Toolbar that translates right in sync with the Drawer. A
single Toolbar fixed to the page cannot: `showModal()` puts the panel in the
top layer and holds *everything else* inert behind a backdrop, so that Toolbar
would travel across the screen dimmed and dead — controls that look live and
answer nothing.

So `<Toolbar>` is rendered twice from one component. The `page` copy is fixed
to the left edge. The `drawer` copy is a child of the dialog, absolutely
positioned at `inset-inline-start: 100%` — just outside the panel — so the
panel's own 250ms slide carries it, above the backdrop and inside the focus
trap. Only ever one is on screen: the dialog is `display: none` while closed,
and the page copy drops to `opacity: 0` while it is open, fading back in on a
250ms delay so the two never overlap mid-transition.

Two consequences worth knowing:

- The dialog's `overflow-y: auto` had to move to `.drawer-body`. A scroll
  container clips both axes, and it would have clipped the Toolbar off the
  panel's edge.
- Both copies carry a `role="status"` for the share confirmation, but only one
  is ever in the accessibility tree — the other is either inside a
  `display: none` dialog or inert behind the modal.

`.drawer-toggle` and `.drawer-close` are both deleted. The Toolbar's first
button is the only control that opens or closes the Drawer, and it shows a
cross while the panel is open; Escape and a backdrop click still work.

### The Drawer got narrower, and Reading Mode drops the strip to the bottom

- **Panel width `max(20rem, 85vw)` → `min(19rem, 76vw)`.** At 320px — the
  narrowest width this site targets — the panel is 243px and the Toolbar's
  54px plus its 14px offset land at 311px, clear of the edge. ADR-0006 §4 is
  annotated.
- **In Reading Mode the Toolbar is bottom-left, not centred.** Reading Mode is
  the one tier where the column reaches the Toolbar's edge, so something has
  to give: either the measure narrows to clear the strip, or the strip covers
  text. The owner chose the second, at the bottom — it covers lines the reader
  has already passed rather than the ones under their eye, and the column
  keeps its full width. Both copies move together, so the Drawer's still rides
  the panel's outer edge; only the anchor changes.

  (An earlier pass indented the column by a derived `--toolbar-band` instead.
  The owner asked for this, and the token is gone.)

The button is 2.25rem on the Paper tiers and 2.75rem in Reading Mode, which is
the touch tier.

One overlap the Paper tiers cannot avoid, worth stating rather than glossing:
between 768px and ~840px the unscaled A4 Sheet already fills the viewport
(ADR-0006 removed the scaling), so there is no margin left for the Toolbar to
float over and it sits on the Aside's cream panel. It covers the panel's inset
rather than its text at rest, but the page scrolls sideways at those widths and
scrolling can bring text under it. That is the cost of ADR-0006's decision, not
something this ticket can fix from the Toolbar.

### Theme

`<html data-theme>` is the source of truth, written by an `is:inline` script at
the top of `<head>` — before the stylesheet link, so no paint can precede it
and there is no flash. `localStorage['cv-theme']` when set, the OS preference
otherwise; a visitor with no JS keeps the `prefers-color-scheme` default that
`reset.css` already had.

Dark mode swaps the background behind the Sheets and nothing else, per spec
US16/US17 — the paper stays paper. `global.css` forces the light background
inside `@layer print`, which is what makes "the PDF is unaffected by dark
mode" true rather than merely likely. It lives there and not in `reset.css`
because that file is imported into the `reset` layer, where a `@layer print`
block would nest as `reset.print` and lose to `components`.

The script also writes `style.colorScheme`. Strictly the spec says dark mode
changes "only" the background, but `reset.css` already declared
`color-scheme: light dark` on `<html>`, so the UA's scrollbars follow *a*
theme regardless; without this line they would follow the OS while the page
followed the visitor's choice. It reaches no Sheet, no token and no print
rule.

There is deliberately **no `aria-pressed`** on the theme control. The island
cannot know the stored theme at prerender — the coding standards forbid
reading `localStorage` in a first render, and `client:idle` can be a long way
after first paint — so any signal-driven ARIA state would be *wrong* for a
returning dark-theme visitor for that whole window. Instead the control ships
both accessible names and both glyphs, and `toolbar.css` picks between them off
`[data-theme]`. Correct from the first paint, and no state to hydrate. For the
same reason there is no `theme` signal at all: the attribute is the one answer,
and `toggleTheme()` reads it.

`docs/todos/` carries an owner proposal for a fuller dark palette (dark Sheets,
dark Aside). That is a change to the spec, not to this ticket.

### Icons

The IcoMoon face the ticket added is 105 kB for 491 glyphs; the Toolbar uses
eight. The full file moved to `docs/assets/fonts/icons/` — the same
source-assets convention the other faces follow — and
`scripts/subset-fonts.mjs` now emits `src/assets/fonts/icons/icomoon.woff2` at
**1.2 kB**, small enough that Vite inlines it into the stylesheet as a data
URI, so the icons cost no request at all. `src/styles/icons.css` keeps only
the eight matching rules.

Adding a ninth icon: its codepoint in `scripts/subset-fonts.mjs`, a rule in
`src/styles/icons.css`, and `npm run fonts:subset`. The name → codepoint map is
`docs/assets/fonts/icons/selection.json`.

The theme control's glyph is swapped by CSS keyed on `[data-theme]`, not by the
signal, so it is already correct on the first paint; the signal only drives
`aria-pressed`, which corrects at hydration.

### Verified

`astro check` and `astro build` clean. Against the built output in Chrome, and
against the dev server for hydration (`preact/debug` is dev-only and logged
nothing, including with a stored dark theme):

- **Wide (1700):** four controls, drawer toggle hidden, Toolbar over the page
  margin.
- **Medium (1024):** Sheets stacked at 794px, no horizontal overflow.
- **Reading (320–500):** Toolbar at the bottom-left over the reading column,
  which keeps its symmetric 40/24px padding; opening the Drawer carries the
  Toolbar to the panel's bottom-outer corner with the toggle showing a cross;
  the panel and the Toolbar together clear the viewport edge at 320px, the
  narrowest width targeted. The *page* still scrolls sideways below 368px —
  `.sheets` keeps the `min-width: 23rem` ADR-0006 §5 gave it, which this
  ticket did not touch.
- **Language:** `/` ⇄ `/en/` via `getRelativeLocaleUrl`, labels and `hreflang`
  per Locale, theme survives the navigation.
- **Download:** `…/Vito_Paparella_Santorsola_CV_{IT,EN}.pdf` with `download`.
- **Share:** writes `location.href`, icon → checkmark, toast and `aria-label`
  → "Link copiato"/"Link copied", all reverting after 2s. The Drawer copy's
  toast opens back across the panel — on that copy the page's own side is
  already the screen edge.
- **Theme:** background swaps, Sheet stays white and Aside stays cream, the
  control's icon and accessible name follow, persists across reload and
  navigation, no flash.
- **Keyboard:** Enter on the toggle opens and moves focus into the dialog;
  Escape closes and returns focus to the toggle; growing past 48rem with the
  panel open closes it and releases the inert page.

Print parity is argued, not measured: every rule this ticket adds outside the
`print` layer is inside `@media screen`, and the built `@layer print` block
differs from `06`'s only by `body{background-color:var(--color-main-bg)}` and
by hiding `.toolbar` where it used to hide `.drawer-toggle`. Ticket 08 should
re-run ticket 06's operator-level PDF diff once the capture script exists.

### Handed to ticket 08 (PDF render)

`Chrome.astro` links each Locale to
`${BASE_URL}Vito_Paparella_Santorsola_CV_<LOC>.pdf` — the site root of the
built output, filename upper-cased Locale. Put the generated files there or
change that one line.

### Handed to ticket 12 (E2E)

- The Toolbar's controls are addressable by accessible name (`src/i18n/ui.ts`).
- `.toolbar--page` and `.toolbar--drawer` distinguish the two copies; assert on
  the one that is visible for the tier.
- Theme: assert `html[data-theme]`, `localStorage['cv-theme']`, and that
  `.sheet` stays `oklch(1 0 89.88)` in both.
- Share: stub or grant clipboard permission — reading the clipboard back in an
  automated Chrome prompts and hangs.

### Deliberately not done

Two things a reviewer will reach for, and why they stayed:

- **`src/styles/icons.css` is global, not colocated with the island.** The
  coding standards say only an island's own stylesheet earns that, and these
  `.icon-*` rules only dress the Toolbar. But the file is a font resource and
  its glyph classes — the same category as `fonts.css`, sitting beside it in
  the `base` layer — and splitting the `@font-face` from the eight rules
  generated with it would make "how do I add an icon" a worse question.
- **`'cv-theme'` is written out in both `state.ts` and `BaseLayout.astro`.**
  An inline pre-paint script cannot import a module; that is the whole reason
  it is inline. Both sites say so.

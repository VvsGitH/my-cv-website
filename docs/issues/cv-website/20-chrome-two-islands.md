# 20 — Two Chrome islands, and a Drawer that is not a `<dialog>`

Status: done

## Goal

Split `ChromeIsland.tsx` into the two components it was always two of — a
Toolbar and a Drawer — and let them talk through a signal instead of a shared
tree. The `<dialog>` is what stood in the way, so it goes: the Drawer becomes a
custom modal, held modal by `inert` rather than by `showModal()`.

Nothing about what the site does changes. This is the architecture only.

## Tasks

- `chrome/Drawer.tsx` (new): `role="dialog"` panel plus a backdrop, opened off
  `drawerOpen`. Owns what the platform used to give — page `inert`, scroll
  lock, focus in and back, Escape — and the `matchMedia` close at 48rem.
- `chrome/Toolbar.tsx`: one copy, no `placement` prop, narrower strings.
- `chrome/ChromeIsland.tsx`: deleted. `chrome/Chrome.astro` renders the two
  islands, each `client:idle`.
- `chrome/state.ts`: unchanged logic; `drawerOpen` documented as the one thing
  crossing the island boundary.
- `tokens.css`: `--drawer-width` and `--drawer-slide`, now that the panel and
  the Toolbar's travel have to agree on both.
- `chrome/drawer.css`, `chrome/toolbar.css`: rewritten and pruned respectively.
- Tests: `.toolbar--page` is gone, so `pageToolbar` becomes `toolbar`; four new
  Drawer tests for the behaviour the platform used to guarantee.
- ADR-0007; amend ADR-0003 and `coding-standards.md`, which both said the site
  had one island.

## Acceptance

- `npm run build` (`astro check && astro build`) green: 0 errors, 0 warnings,
  0 hints.
- `npm test` green, including the new Drawer tests.
- The Toolbar's controls answer while the panel is open — the thing a modal
  `<dialog>` made impossible.
- The PDFs are unaffected: the built `@layer print` still hides all of the
  Chrome.

## Depends on

- 07

## Comments

### The `<dialog>` was the reason the Toolbar shipped twice

ADR-0007 records this in full. In short: `showModal()` holds the whole document
inert, so a live Toolbar beside an open panel had to be a second copy *inside*
the dialog. From that one duplication came the `placement` prop, two
`role="status"` regions of which one was always outside the accessibility tree,
`overflow: visible` on the dialog with the scroll pushed to `.drawer-body`, an
opacity cross-fade with a 250ms delay and a `prefers-reduced-motion` override
to cancel it, and tests that had to say which copy they meant. All of it is
gone.

The Toolbar now translates by exactly `--drawer-width` over `--drawer-slide`,
which is what ticket 07's task list asked for before the dialog made it
impossible.

### `inert` is doing the job `showModal()` used to

`Drawer.tsx` sets `inert` on every child of `<body>` that contains neither the
panel nor the Toolbar. That is what confines Tab — no focus trap is written,
because with everything else inert there is nowhere else for Tab to go — and it
also removes the covered content from the accessibility tree, which is why
there is **no `aria-modal`**. `aria-modal` would additionally shut a
screen-reader user out of the Toolbar, and the Toolbar is where the control
that closes the panel lives.

Astro's own `<style>` and its two bootstrap `<script>` elements are top-level
siblings and are covered too. They render nothing, so `inert` reaches nothing;
the alternative — an allow-list of siblings — would fail silently the first
time the layout grew one.

### The scroll lock had to stop reclaiming the scrollbar

`overflow: hidden` takes the scrollbar away, and its width goes straight to the
reading column — which re-wraps every line behind the panel, so the reader
meets a shifted page on the way back out. `drawer.css` reserves the gutter with
`scrollbar-gutter: stable`, in Reading Mode only: it is the one tier with a
Drawer, and the Paper tiers would pay for a gutter nothing ever takes.

Measured at 500px: without it the content box went 485 → 500 on open; with it
`.sheets` stays 485 through open and close. Phones pay nothing — they overlay
their scrollbars and reserve no gutter to begin with — and the case where the
shift is real, a desktop window narrowed past the breakpoint, is where the
property is supported.

### Three things that only showed up against a running browser

**The panel would not take focus.** `useSignalEffect` re-runs the instant the
Toolbar assigns to the signal, which is *before* Preact commits `data-open` to
the DOM — so `focus()` was landing on a panel that `drawer.css` still had at
`visibility: hidden`, and a hidden element swallows `focus()` in silence. The
effect is a plain `useEffect` over the rendered value instead, which runs after
the commit.

**And then it still would not, for a second reason.** With
`transition: visibility 250ms`, the computed value is still `hidden` on the
frame the attribute flips — the transition only reports `visible` from the next
frame on. So the transition is asymmetric: `visibility 0s` when opening, and
`visibility 0s linear var(--drawer-slide)` when closing, which is what keeps the
panel painted while it slides out. The closing *delay* survives
`prefers-reduced-motion` (reset.css collapses durations, not delays), so
drawer.css zeroes it there — the same override, for the same reason, that
toolbar.css used to carry.

**Escape did nothing for the first frame.** Registering the listener inside the
open/close effect looked tidy, but that effect runs *after* the paint that puts
the panel on screen — so there was a window in which the Drawer was visible and
Escape was dead. It came out of a test that pressed Escape promptly rather than
after another interaction, which is also how an impatient reader would. The
listener is registered on mount instead and reads the signal when it fires;
assigning `false` to an already-false signal is a no-op, so the closed state
costs nothing.

### The shared chunk, verified rather than assumed

Two islands mean `drawerOpen` has to be one object at runtime, and Astro's
documentation reaches for Nano Stores at exactly this point. It is not needed
here, but the reason is a build detail and deserved checking rather than
trusting: in `dist/_astro/`, Vite folds `state.ts` into the chunk both island
entries import, and `Toolbar.*.js` and `Drawer.*.js` both import the signal
from that one file. Re-check this if the island count or the bundler config
changes; the E2E test that opens the Drawer from the Toolbar's toggle is the
runtime guard.

### Verified

`astro check` and `astro build` clean; all 63 E2E tests pass, including the
five new ones. Against the built output in Chrome at Reading Mode width:

- opening carries the Toolbar to the panel's outer edge with the toggle showing
  a cross; the strip stays lit and clickable, and the theme control still works
  from there;
- the backdrop paints, focus lands on the panel, `<html>` carries
  `data-drawer-open`, the page behind does not scroll, and the reading column
  keeps its width through the whole open/close cycle;
- `main` and the Colophon carry `inert`, both islands do not;
- Escape closes with focus in the Toolbar; the backdrop click closes; focus
  returns to the toggle;
- growing past 48rem with the panel open closes it and releases the `inert` and
  the scroll lock;
- at 500px the panel, the strip and the share toast all sit inside the
  viewport, the toast opening back across the panel. The 320px arithmetic is
  ticket 07's and unchanged: 243px of panel plus 14px of gap plus 54px of strip.

Against the dev server, where `preact/debug` is injected: no hydration
mismatch logged, including on a reload with a stored dark theme.

The PDFs are untouched — the built `@layer print` hides `.toolbar`, `.drawer`
and `.drawer-backdrop`, and `pdf.spec.ts` and the Colophon's exclusion test
pass against freshly rendered captures.

### Deliberately not done

**`linkCopied` stays a module-level signal.** With one Toolbar instance the
coding standards would now allow `useSignal()` inside the component, but the
2s revert timer would have to move into a `useRef` with a cleanup, for an
island that never unmounts. More machinery for identical behaviour.

**`aria-expanded` / `aria-controls` on the toggle were not added.** A dialog
trigger is not a disclosure, and the toggle already changes its accessible name
between "open" and "close". `useId` is therefore still unused, which
`coding-standards.md` had anticipated for this exact attribute.

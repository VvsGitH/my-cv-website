# 03 — The sticky bar itself

Status: ready-for-agent

Depends on: 01 (the tokens), 02 (the slot).

## Goal

Rewrite the Toolbar: one shape, six controls, two pills, a rule as wide as the content below it.
The largest ticket in this set, and the one most of the spec's decisions land in.

## Files

- `src/components/chrome/Toolbar.astro` — new, the shell
- `src/components/chrome/ModeSwitch.tsx` — new
- `src/components/chrome/LocaleSwitch.astro` — new
- `src/components/chrome/ShareButton.tsx` — new
- `src/components/chrome/ThemeSwitch.tsx` — new
- `src/components/chrome/toolbar.css` — rewritten whole
- `src/i18n/ui.ts`
- `src/components/chrome/Toolbar.tsx` — **delete**
- `src/components/chrome/state.ts` — **delete**

## Detail

### Anatomy

```
<div class="toolbar-sentinel" aria-hidden>   ← zero-height, observed (see Sticky)
<header class="toolbar">                     ← sticky, banner landmark
  <div class="toolbar-rule">                 ← carries the rule and the width
    <div class="toolbar-actions">
      <button class="toolbar-mode">          ← icon + visible label, margin-inline-end: auto
      <div class="toolbar-switch toolbar-locale">   ← two <a>, one aria-current
      <span class="toolbar-divider" aria-hidden>
      <a class="toolbar-button" download>           ← icon-download
      <button class="toolbar-button toolbar-share"> ← icon-share-2 / icon-check-circle
      <span class="toolbar-divider" aria-hidden>
      <div class="toolbar-switch toolbar-theme" role="radiogroup">  ← two role=radio
    </div>
  </div>
  <p class="toolbar-toast" role="status">
</header>
```

`.toolbar-actions` is `display: flex; align-items: center; gap: var(--space-m)`, with
`margin-inline-end: auto` on `.toolbar-mode` alone — that is the brief's `->`: the Mode holds
the inline start, everything else packs to the inline end in the brief's order.
`align-items: center` throughout; the icons align on the centre, never on a baseline.

Dividers are real 1px `<span aria-hidden>` in `--color-text`, as tall as the text. Elements
rather than a `border-inline-start`, because the brief puts them **between** the groups and not
against either one.

Type: `--font-size-toolbar` and `--font-body` (Atkinson) for the labels, `--font-size-button`
for the glyphs. Colour is `var(--color-heading)`, inherited, like the Colophon's.

### The rule's width

Exactly as the spec writes it, including the `+ 1px` and the `100000`. In Reading Mode
`html[data-mode='reading'] .toolbar-rule { inline-size: var(--reading-column-max) }`.

**Verify before trusting it:** the Toolbar's `100%` and `.sheets`' `100%` must resolve against
the same width. Both are full-width block boxes — but only while `<main>` and `<body>` carry no
padding of their own. Check `reset.css` first, and say in the Comments what you found.

The bar is `sticky`, so it is in flow: its `100%` excludes the scrollbar exactly as the
`100cqw` that `.sheets` uses for its `zoom` does. A `fixed` bar would not have that property,
and this is the reason it is not one.

### The two pairs

One mechanism, two consumers: a `position: relative` track with an absolutely positioned
`::before` at `inline-size: 50%` carrying `--color-aside-accent`, `transition: translate`, and
**a 1px border in `--color-text`** — the spec's decision 5, and the thing that makes the
selection visible at all.

Position comes from state, never from JavaScript:

```css
[data-theme='dark'] .toolbar-theme::before { translate: 100%; }
.toolbar-locale:has(> :last-child[aria-current])::before { translate: 100%; }
```

Both are therefore right before hydration (ADR-0003). `:has()` is safe here — `toolbar.css` is
a plain stylesheet, so the Astro-scope trap in `coding-standards.md` does not apply. The
`:last-child` reading is what makes `chromeLinks`' fixed `[it, en]` order load-bearing; comment
it as such.

**One media query this ticket does need, and it is not a width.** With JavaScript off there is
no `[data-theme]` at all and the page follows `prefers-color-scheme`, so the theme pill would
park on `sun` over a dark page. Mirror the ladder in `tokens.css`:

```css
@media (prefers-color-scheme: dark) {
  html:not([data-theme='light']) .toolbar-theme::before { translate: 100%; }
}
```

`aria-checked` cannot follow in that case, because nothing runs to set it. That is honest and
is the no-JS floor.

### Sticky

`position: sticky; inset-block-start: 0; z-index: 1; min-block-size: var(--toolbar-block-size)`,
with `backdrop-filter: blur(8px)` on the bar. **No background** — the blur acting on the text
scrolling under it is the whole effect.

The shadow is on `.toolbar-rule` and appears only under `[data-stuck]`. A zero-height sentinel
before the header is observed by an `IntersectionObserver` in a module `<script>` in
`Toolbar.astro`; while the sentinel is out of view the header carries `data-stuck`. Not an
island: there is no markup to render, and Astro's own `<script>` is the smaller instrument.

Invert WCAG 2.4.11: `:root { scroll-padding-block-start: var(--toolbar-block-size) }`, inside
`@media screen`. The old `scroll-padding-block-end` goes with the bottom row.

`@layer print { @media print { .toolbar, .toolbar-sentinel { display: none } } }` — Chrome is
never captured.

**Delete outright:** both shapes, the cream fill, the toast's two-axis flip, the anchor
positioning if the toast no longer needs it, and the entire
`@media screen and (width < 53.5rem)` block. **No width media query about the Toolbar survives
this ticket.**

### The islands

Three, each `client:idle`, each carrying its own logic. Not `client:only` — the bar must be in
the static HTML (ADR-0003). Not `client:media` — no control depends on a breakpoint any more.

**`ModeSwitch.tsx`.** Flips `<html data-mode>` and writes `localStorage['cv-mode']`. Both glyphs
and both labels ship; CSS picks off `[data-mode]`, so the control is right before hydration.
Paper Mode is the base state, so with no `[data-mode]` at all it offers Reading Mode — honest,
because it cannot work then either.

**`ThemeSwitch.tsx`.** `role="radiogroup"` named by `themeGroup`, two `role="radio"` with a
roving tabindex: `tabindex="0"` on the checked half, `-1` on the other; ArrowLeft/Right/Up/Down
move, select and focus; Home and End go to the ends. Pressing the already-checked half is a
**no-op** — no write, no view transition.

Selecting the other half keeps ADR-0016 whole: `startViewTransition`, the circle from
`event.currentTarget.getBoundingClientRect()`, the `prefers-reduced-motion` gate in JavaScript,
the `.catch` that swallows a superseded `ready`. That code moves out of `state.ts` and into this
component; it does not change.

**`ShareButton.tsx`.** `navigator.clipboard.writeText(location.href)`, the glyph swap
`icon-share-2` → `icon-check-circle`, the name swap `share` → `shared`, and the 2000ms revert.
`linkCopied` becomes **local component state**, not a module-level signal — the standards'
sanctioned exception exists because two islands shared `state.ts`, and after this ticket nothing
does. The toast stays a `<p role="status">` made visible by `opacity`, never `display`: a live
region has to stay in the a11y tree to announce.

**Keep the standards' constraints:** no `localStorage` or `matchMedia` in a module-level
initialiser, and the first render deterministic, or hydration mismatches — which Preact swallows
silently (`docs/hacks/2026-08-01.md` §11).

### `LocaleSwitch.astro` and the pre-paint script

`LocaleSwitch.astro` renders the two `<a>` from `chromeLinks`' `locales` array — `hreflang`,
`lang`, `data-astro-prefetch`, and `aria-current="page"` on the current one. No hydration.

`Toolbar.astro` carries one `is:inline` script that does two things, both of which have to
happen before the paint:

1. Writes `aria-checked` and `tabindex` on the theme pair from `<html data-theme>`, so the pair
   is correct before `client:idle` fires.
2. Attaches the click handler that stores the departing Locale in `sessionStorage`, and reads
   the stored value on landing — ticket 04 owns the landing half.

## Acceptance

- One shape at every width. `grep -n '@media' src/components/chrome/toolbar.css` shows only
  `(hover: hover)`, `(prefers-color-scheme: dark)`, `screen` for the scroll padding and `print`
  — **no width query**.
- The rule measures 1720px at 1721px of viewport, 1720px at 1720px, 856px at 1719px and at
  1024px, and `--reading-column-max` in Reading Mode.
- Mode, theme and language all read correctly with JavaScript disabled.
- Tab reaches Mode, IT, EN, download, share, and the theme pair as **one** stop; arrows move
  within the pair.
- `Ctrl+P` from Reading Mode still yields two A4 pages with no trace of the bar, and
  `npm run captures:render` followed by `assertTwoA4Pages()` stays green.
- Nothing imports `state.ts` and the file is gone.

### `ui.ts`

Out: `language`, `themeChange`, `themeToDark`, `themeToLight`, `modeChange`, `modeToReading`,
`modeToPaper`.

In: `modeReading` / `modePaper` — the **visible** text, "Modalità lettura" / "Modalità carta"
and their English counterparts — plus `themeGroup` / `themeLight` / `themeDark` and
`localeGroup`. `download`, `share` and `shared` are unchanged.

The Mode control's visible text is its accessible name, so it gets no `aria-label` and no
`title`: a second copy would be a 2.5.3 hazard, not a courtesy. The doc comment on
`ToolbarStrings` saying "every control is icon-only, so each of these *is* its accessible name"
is no longer true and must be rewritten.

The Colophon's `localeName` (`Italiano` / `English`) already exists and is the right source for
`localeGroup`'s wording if it needs one — do not add a second spelling of the same idea.

## Out of scope

The language's landing animation (04), the Colophon's dead berth (05), and the tests (06).
`npm run build` is expected to be red on `tests/` type errors until 06 lands — `build` is
`astro check && astro build`, and `astro check` type-checks the suite. Report the count in the
Comments; **zero errors under `src/` is the bar this ticket has to clear.**

## Comments

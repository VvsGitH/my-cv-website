# 06 — Responsive (three tiers + Reading Mode)

Status: done

## Goal

Make the same components respond across the three tiers, including Reading Mode with the Drawer.

## Tasks

- **Wide (≥1632px):** two Sheets side by side, page padding/gap.
- **Medium (816–1632px):** Sheets stacked one per row, scaled to width, rigid A4.
- **Narrow (<816px): Reading Mode** — reflow to single-column, normal text size; Aside content → left slide-in Drawer (toggle); Main is primary scroll; compact header (photo + name + title + contacts) at top.
- Reading Mode must **not** affect Paper Mode/print CSS (mobile is never captured for the PDF).
- Drawer: accessible (focus trap, ESC to close, `aria-*`), animates from left.

## Acceptance

- Layout matches the tier behavior at 1280 / 1024 / 375px.
- Print/PDF output is unchanged by the Reading Mode styles.

## Depends on

- 05

## Comments

### Implementation

The two boundaries are **51rem** and **102rem**, written with media-query range
syntax (`(width < 51rem)`, `(width >= 102rem)`) so each value appears once per
query rather than as a `50.9375rem` twin. Reading Mode's is stated in
`tokens.css`, which is also where its type scale lives; the wide one is stated
in `Document.astro`, the only rule that uses it.

> **Both numbers moved after this ticket shipped.** 06 built them as 48rem and
> 80rem, which was right while the paper scaled to fit. ADR-0006 removed the
> scaling, so a Sheet became a literal 793.7px box and any boundary below the
> paper's own width put a horizontal scrollbar on screen: 51rem (816px) clears
> one Sheet, 102rem (1632px) clears two and the gap between them. The rest of
> this section describes what 06 built, including the `--sheet-fit-width` /
> `--sheet-scale` pair ADR-0006 deleted.

- **`Document.astro`** owns the arrangement: a grid, one Sheet per row by
  default and two `max-content` columns from the wide boundary. It publishes
  `--sheet-fit-width` — the width one Sheet may occupy — per tier.
- **`Sheet.astro`** turns that into `--sheet-scale` and keeps everything else
  it already did. Below 51rem it dismantles the A4 box.
- **`chrome/`** is created here (ADR-0004 said 06/07 would): `Drawer.astro` +
  the `DrawerPanel.tsx` island + `drawer.css`.
- **`i18n/ui.ts`** is new — the Chrome's own strings, per Locale. Ticket 07
  extends it; CV content stays in `src/content/`.

### Scaling: `tan(atan2(a, b))`, and `100vw` over `@container`

The scale is `available ÷ 210mm`, and `calc()` cannot divide two lengths — its
right operand must be a number. `tan(atan2(a, b))` is the documented way to get
the ratio, and it is the only thing in this ticket that needs a comment to
defend.

The available width comes from `100vw` minus the container's own padding, not
from a container query. `@container` would be the more precise instrument (and
is what `coding-standards.md` reaches for when an element's own space is the
trigger), but `container-type: inline-size` implies **layout containment**, and
a layout-contained box is monolithic for fragmentation — put on `.sheets`, it
would sit directly above the `break-before: page` that makes the CV two pages.
`100vw` overstates the width by the scrollbar on platforms that still draw one;
the overspill lands in the 1.5rem gutter, so no horizontal scrollbar appears.

A Sheet is never scaled **above** 1. A4 at 1:1 is the reference rendering, and
enlarging past it is the browser's zoom to offer, not this layout's — so 1024px
shows one Sheet at its true size rather than a 1.23× blow-up. This reads
"scaled to available width" as *scaled down to fit*; the owner confirmed it
during review, and `spec.md` now says so.

### Reading Mode reflows the same components — except the Aside, which is rendered twice

`display: contents` on `.sheet-wrapper`, `.sheet`, `.columns` and `.aside` drops
the A4 geometry, the panel, the insets and the column gap in one move, and the
Blocks of *both* Sheets become items of one reading column. Main reflows with
no second rendering, exactly as the spec asks.

The Aside cannot. Its Blocks have to arrive in one Drawer, and they live in two
different Sheets — CSS has no way to reparent them, `display: contents` cannot
gather boxes from two subtrees into one scrollable panel, and the only single-
DOM alternative is an island moving prerendered nodes at runtime, which would
make Reading Mode depend on JS and would fight hydration. So `Drawer.astro`
renders the same `<Block>` components a second time from the same content
module. Nobody sees both copies: Paper Mode hides the Drawer, Reading Mode
hides the Asides on the paper.

The **portrait is the exception** — it stays in the flow with `order: -1` so it
opens the compact header, which is otherwise the existing `HeaderBlock`
(centred, contacts collapsed from three fixed 145px columns to one).

`display: contents` keeps an element's semantics, so the Aside carrying no
portrait would leave an empty `complementary` landmark; it is dropped via a
`data-carries-portrait` attribute Sheet.astro sets. Sheet 1's Aside does remain
a `complementary` around the portrait — an acknowledged wart, not fixable from
CSS.

### The Drawer is a native modal `<dialog>`

`showModal()`, so the focus trap, the focus return and Escape are the
platform's implementation of the WAI-ARIA APG *Dialog (Modal)* pattern, not
ours. Per that pattern the opening control is a plain button: `aria-expanded`
belongs to disclosures, and the dialog carries its own name (`aria-label`, as
it has no visible title). Backdrop clicks close it — the backdrop belongs to
the dialog, so such a click lands on the dialog element itself.

The consequence, stated plainly: **the Aside is unreachable on a phone without
JS.** Its Blocks are `display: none` on the paper and the Drawer needs
hydration to open, so US5's "one tap away" costs a `client:idle` island. A
CSS-only drawer (`:target`, a checkbox) would survive without JS but cannot
trap focus or make the paper inert, which this ticket asks for by name. If that
trade ever looks wrong, the honest fix is to put the Aside's Blocks back in the
reading flow below the Main column and keep the Drawer as an enhancement.

`drawerOpen` is a module-level signal, exported: **ticket 07's Toolbar imports
it** rather than reaching for the DOM. The island also closes the Drawer when
the window grows into Paper Mode — an open modal dialog holds the rest of the
page inert, and `display: none` from a media query does not take that back.

### Print parity was measured, not asserted

Every Reading Mode rule is `screen and (…)`, but "print is unaffected" is a
claim worth testing, so both Locales were captured with headless Chrome
(`--print-to-pdf`) before and after and compared by inflating the content
streams and diffing every positioned drawing operator. Result: **8112
operators, all identical**, 2 pages, MediaBox 594.96 × 841.92pt — the Italian
PDF is byte-for-byte the size it was at `090ff03`.

Two real defects surfaced only through that comparison:

- **`justify-items: center` now applies in block layout** (Chrome). Left
  unqualified on `.sheets`, it survived the print layer's `display: block` and
  moved the printed Sheet — and every glyph on it — by 0.156px. All alignment
  is now inside `@media screen`; the container has no say in how paper stacks.
- **`--sheet-scale` must be a literal `1` off-screen.** `tan(atan2(210mm,
  210mm))` returns `0.9999999999999999`, which is enough to make
  `transform: scale()` a non-identity matrix and shift glyph positions in the
  capture. The tan() now lives in a `@media screen` override.

Also worth knowing: **the Astro compiler leaves `:global()` untouched inside
`:has()`**, so `.aside:not(:has(> :global(.block--photo)))` shipped verbatim and
browsers dropped the whole rule as an unknown pseudo-class, in silence. Checked
against the built CSS, not the source.

### Handed to ticket 08 (PDF render) — the capture viewport is load-bearing

**Capture at a viewport ≥ 51rem.** This is not cosmetic. Chrome requests a font
only when rendering needs it. In Reading Mode the Aside's Blocks are
`display: none` on the paper and the Drawer is closed, so **Lato-Italic** (the
Languages proficiency labels) and **Primera Signature** (the signature) are
never requested. Print then needs them, `font-display: block` renders nothing
while a face loads, and the PDF comes out **missing that text and missing those
two embedded fonts** — with no error anywhere. This is exactly what a default
800×600 headless window produced here.

`await document.fonts.ready` does **not** save you: it resolves happily when a
face was never requested. Set the viewport first (e.g. `1280×1600`), then load,
then `fonts.ready`, then `page.pdf()`.

The other note from ticket 05 still stands — capture in **print** media. With
`emulateMedia({ media: 'screen' })` the print layer's gutter reset and page
break do not apply, and neither does anything else this ticket put behind
`@media print`.

### Handed to ticket 07 (Toolbar)

- `import { drawerOpen } from '.../chrome/DrawerPanel'` and assign to
  `.value` — no new state, no DOM lookup.
- The Drawer ships its own hamburger, fixed top-left, Reading Mode only. If the
  Toolbar takes over the toggle, delete that button and its `.drawer-toggle`
  rules; keep the signal.
- `BaseLayout` has a `chrome` slot, outside `<main>`. The Toolbar goes there.
- UI strings go in `src/i18n/ui.ts` beside the Drawer's three.
- Two islands will then share a module-level signal. That works (one Vite
  chunk), but it is the moment to decide whether Toolbar and Drawer should
  become one island, as ADR-0003 describes them.

### Handed to ticket 12 (E2E)

Assertions this ticket makes checkable, all against the built output:

```js
// wide (>= 1280): two Sheets on one row, and nothing overflows sideways
expect(sheet1.y).toBeCloseTo(sheet2.y, 0);
expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
// medium (1024): stacked, and never enlarged past A4
expect(sheetWidth).toBeCloseTo(793.7, 0);
// reading (375): one column, the portrait first, the Asides off the paper
expect(topmostVisibleBlock).toHaveClass(/block--photo/); // by y, not by index
expect(asidePanel).not.toBeVisible();
```

Mind what the reading column's items actually are: `display: contents` stops at
`.main`, so the grid holds the portrait and the two `.main` boxes — the Main
Blocks are one level further in. Assert on rendered order (`y`), not on
`.sheets`' children.

For the Drawer: the toggle opens a `:modal` dialog, focus lands inside it,
Escape closes it and returns focus to the toggle, and crossing 51rem with it
open closes it (verified by hand here; all four are cheap in Playwright).

Reference numbers at the time of writing (Chrome, 16px root): 1280 → scale
0.761, two 604px Sheets, 24px gap; 1024 → scale 1, stacked; 790 → 742px;
375 → 327px reading column, 16px body, 28px name.

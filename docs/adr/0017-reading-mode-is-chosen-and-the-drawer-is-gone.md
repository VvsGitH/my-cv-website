# Reading Mode is chosen, not triggered — and the Drawer goes with it

> **Amended on the reading column, 2026-08-31.** Two things this ADR describes have moved; the
> Mode, the Drawer's deletion and the split of the 53.5rem boundary are untouched.
>
> - **`--reading-column-min` is gone entirely**, not merely dropped from `.sheets`. Nothing bounds
>   the column from below any more, which is what "survive a 320px phone" asked for, and
>   `--reading-column-max` — now `75ch`, a measure counted in characters — is the Mode's only
>   width.
> - **The column is painted `--color-page-bg`**, not the paper's colour; see ADR-0015's own
>   amendment. The Aside inks that rejoin the theme here now include the signature and the muted
>   grey, both of which were still pinned to the light ramp when this ADR shipped.

Reading Mode was never a mode. It was `@media screen and (width < 53.5rem)`, repeated in six
files, and the reader had no say in it. **It is now `<html data-mode>`, flipped from the Toolbar
and remembered in `localStorage`, with Paper Mode the default at every width — phone included,
where the Sheet is scaled to fit the device.** The Drawer is deleted.

Three defects fall out of the old arrangement, and this is the one change that answers all three.

**A phone visitor could never see the paper.** The site's whole proposition is that the CV *is* a
document; below 856px the A4 box was dismantled and there was no way back to it. A reader who
wanted the sheet had to download the PDF.

**The Aside had to be rendered twice.** Because the reflow was a width, the Aside's Blocks were
on the paper *and* inside a `<dialog>` — ADR-0008 records why CSS could not reparent them, and
records the price honestly: *"on a phone without JS, the Aside is unreachable."* That second copy
cost a second island, a signal crossing between them, a `matchMedia` guard against a dead-modal
defect, and ~200 lines of `drawer.css`. All of it existed to work around the width.

**Nobody had ever said what the reading order should be.** The single column was DOM order, which
is Explicit Paging's order, which was chosen for the paper — the Aside's five Sheet 2 Blocks sat
between the two halves of Selected Projects, which is why the Continuation needed a
screen-reader marker saying "this resumes" rather than "I went backwards".

## The Mode is an attribute, not a signal

`<html data-mode="paper" | "reading">`, written pre-paint by the same inline `<script>` in
`BaseLayout.astro` that writes the theme, and flipped by `toggleMode()` in `state.ts`. This is
ADR-0003's arrangement for the theme, reused whole, and its reasons carry over: the attribute is
the only source of truth, no signal mirrors it, and the Toolbar's control is switched by CSS off
`[data-mode='reading']` rather than re-rendered — so it is correct before hydration, and the
island does not re-render when the Mode changes.

**The two defaults differ on purpose.** Nobody has to be asked what light they are sitting in, so
the theme falls back to `prefers-color-scheme`. The Mode is a choice about the document itself,
and paper is what the site is for, so it is the default at every width until the reader says
otherwise. Nothing pre-selects Reading Mode — not a narrow viewport, not a touch pointer.

**No View Transition on the swap.** `tokens.css` sets `animation: none` on both root snapshots so
that ADR-0016's circle can be the only thing that moves; `startViewTransition` without a bespoke
animation would buy a hard cut for the price of a transition. Left for a follow-up.

## What the 53.5rem boundary meant, and what it means now

It meant two things at once, and has been split.

- **Paper and type follow the Mode.** The reading type scale, the opened-up spacing, the portrait
  size, the reading column, and the `display: contents` that dismantles the Sheet.
- **The Chrome still follows the width.** `--toolbar-button-size`, `--toolbar-inset`, the
  cluster's row-versus-rail shape, and the `scroll-padding-block-end` that answers WCAG 2.4.11. A
  touch target is a property of the device, never of what the reader chose to look at.

One consequence worth naming: **Reading Mode on a wide screen now exists**, and nothing in the
repo had ever rendered it — a 34rem centred column at reading type, with the Toolbar still a
vertical rail. `--reading-column-min` is dropped from `.sheets` in the same pass: the Mode has to
survive a 320px phone now rather than assume 23rem of room.

## The 107.5rem boundary goes too, and nothing replaces it

`Document.astro` laid the Sheets out on a grid whose track count changed at 107.5rem — a literal
that had to be kept in step with the paper's own width by hand, and had already moved twice for
exactly that reason (ADR-0006's own footnote records both moves). **The grid is now a wrapping
flex line**, `flex-wrap: wrap` with `justify-content: center`, and the pair shares a row when
there is room for it:

> 2 × 840px of paper, the 24px between them, and the 24px gutter either side — **1752px**.

The number still exists; nothing writes it down. It falls out of `--sheet-width` and
`--sheets-gap`/`--sheets-pad`, which is where it should have been coming from all along, and it
now clears the gutter as well as the paper — the old 107.5rem cleared only the paper and let the
pair overrun its own padding by 16px a side.

- **No `flex` on the Sheet at all.** A first pass added `flex: none` against the risk that
  `flex-shrink` would squeeze the paper off A4. Measured: it cannot. A wrapping line moves an item
  that does not fit to the next line rather than shrinking it, and the only item ever wider than
  its line is a zoomed Sheet, which the fit sizes to the content box exactly. The declaration was
  guarding against nothing and is gone.
- **The layout is declared for both media and cancelled in `@layer print`**, rather than fenced
  behind `@media screen`. The owner's call, and the better shape: what the paper is on the page is
  then stated in one place instead of being whatever survived a guard. `print` names `display`,
  `gap`, `padding`, `justify-content` and `container-type`. `coding-standards` carries the rule
  and the two exceptions — the theme ladder and Reading Mode's own block, where cancelling would
  mean restating every value the guard makes inert for free.
- **Measured, so the record is straight:** of those declarations, only `container-type` changes
  anything today. Print rendering was byte-compared under `emulateMedia({ media: 'print' })` with
  each of the others unguarded in turn, and every box was identical to three decimals —
  `justify-content` computes to `center` on the block-level `.sheets` and is inert there, and the
  `zoom` is overridden by `Sheet.astro`'s print rule by cascade layer regardless. An earlier draft
  of this ADR called the `container-type` case a "live defect" that swallowed the page break; that
  was wrong, and the PDF is two pages either way. What it actually is, is below.

## Scale-to-fit comes back, for the one case ADR-0006 removed it for

ADR-0006 §2 deleted the `tan(atan2())` scaling system and guaranteed the Sheet is never scaled.
Paper Mode at 375px makes that guarantee impossible to keep, so half of it is reversed:

```css
zoom: min(1, calc((100cqw - 2 * var(--sheets-pad)) / var(--sheet-width)));
```

- **`zoom`, not `transform`**, for the reason `Sheet.astro`'s print rule already gives: Chrome
  rasterizes a transformed subtree into an XObject when printing and the PDF loses every `/Font`.
  `zoom` scales at layout time, so nothing is left behind and the print layer's own `zoom` still
  wins for the capture. The OG card route was already doing exactly this.
- **`cqw`, not `vw`**, against a new block-level `.paper` container in `Document.astro` — and the
  container is the load-bearing half. A `cqw` with no query container above it falls back to the
  small viewport, which counts the classic scrollbar that `.paper`'s content box does not. Measured
  in a real browser window at 390px with a 15px scrollbar: `100cqw` reports **390** against
  `.paper`'s **375**, so the Sheet is fitted to the wrong width and comes out 342px inside a 327px
  box, eating half the gutter either side. It does not overflow the page — the gutter absorbs it,
  which is why an earlier draft's claim that the Sheet would go "over the edge" was too strong —
  but the paper sits closer to the edges than the design says at every width below 888px.
  **Headless Chromium cannot see any of this:** its scrollbars are overlay and take no space, so
  the two widths agree and every geometric assertion in the suite passes with the container
  deleted. `responsive.spec.ts` therefore pins `container-type` as a property, and says why.
- **`min(1, …)` keeps the half of ADR-0006 that mattered**: fitted down, never up. Above 888px it
  resolves to 1 and every existing tier measures exactly as it did.

**Accepted, and it is the real cost of this ADR:** at 390px the Sheet zooms to ~0.44 and body
text lands near 5px. That is Paper Mode doing what it is for — showing the document as a document
— but it means **the Mode control is this site's answer to WCAG 2.2 · 1.4.4**, and that control
has to stay obvious on a phone. It is the first control in the cluster, at every tier.

## Content declares both positions

`Placement` is renamed rather than extended, so no field is ever read in the context of a Mode it
does not belong to:

```ts
paperSheet: SheetNumber;
paperColumn: Column;
readOrder: number; // 1-based rank in the single reading column
```

- **The reflow is CSS `order`, not a second render.** `Block.astro` emits `--read-order`, and
  `Sheet.astro` applies it once the Blocks have become items of `Document.astro`'s grid. One DOM,
  one copy of every Block — which is the thing the Drawer could not have.
- **`.main` joins `display: contents`.** It did not before: the whole Main column was a single
  grid item, which is why DOM order was the only order available. That one line is what makes
  `order` possible at all, and its absence is the defect this change nearly shipped with.
- **`:first-child` stops describing visual order**, so the section gap moves off the heading and
  onto the Block — every Block carries `margin-block-start: var(--space-xl)`, `.sheets` drops its
  block padding to match, and the head of the column measures the same whichever Block sorts
  there. A `[data-continues]` Block zeroes it and takes the Group gap instead.
- **The permutation is asserted at build time**, in `content/index.ts` beside the Continuation
  check that already guards the paper's order: `readOrder` must be `1..n` with no gaps, and a
  Continuation must read immediately after the Block it resumes. `tsc` validates each field but
  cannot see across Blocks.

**Continuations needed no new machinery.** A Continuation's heading and its resumed Group title
were already `.is-sr-only` (ADR-0005), so with the two halves adjacent the reader simply sees one
section. The one rule that moved is `MainSectionBlock`'s `.group:first-of-type` gap, from a width
to the Mode — on paper a Continuation opens a column and sits flush at the top of it; in Reading
Mode it resumes mid-run and takes the ordinary gap between Groups. That gap is the whole of what
makes the two halves read as one.

## The `:global()` trap

Astro scopes **every** compound of a scoped selector, so `html[data-mode='reading'] .sheet`
compiles to `html[data-astro-cid-x] .sheet[data-astro-cid-x]` and can never match — `<html>`
carries no scope attribute. Inside `Document.astro`, `Sheet.astro`, `MainSectionBlock.astro` and
`Colophon.astro` the Mode is written `:global(html[data-mode='reading'])`. Plain stylesheets
(`tokens.css`, `toolbar.css`) are unaffected.

*Rejected: `@container style(--mode: reading)`, which would avoid `:global` entirely. It is one
novel mechanism where a documented one already exists, and its support floor is newer than this
project's.*

## The Aside's ink had to be indirected

`.aside` pinned `--color-heading`/`-text`/`-muted` to the light ramp, because the cream panel is
the same surface in both themes (ADR-0015). Those custom properties inherit through
`display: contents`, and it never showed because the Aside was hidden in Reading Mode. With the
Aside reading in the column, the pin would have set dark ink on dark paper under the dark theme.

The fix is one level of indirection: `tokens.css` owns `--color-aside-heading`/`-text`/`-muted`,
bound to the light ramp at `:root` and rebound to the *semantic* tokens under
`html[data-mode='reading']`. `.aside` names those and knows nothing about either case. Rebinding
to the semantic tokens rather than to a ramp is what lets one rule serve both themes — the ladder
has already run by the time it resolves on `:root`.

## Print takes the paper back on its own

The Mode is remembered, so a reader can be in Reading Mode when they reach for their own printer.
`Sheet.astro`'s `@layer print` re-asserts `display` on `.sheet`, `.columns`, `.aside` and `.main`
and zeroes the reading `order` and margins. Stated rather than assumed, and **not**
`display: revert-layer`, which would roll back to `components` — where `contents` is exactly what
is standing. `render-captures.mjs` opens a fresh context with empty storage so the build's PDFs
were never at risk, but a leak would still have produced two A4 pages and `assertTwoA4Pages()`
would have passed in silence (ADR-0009). `pdf.spec.ts` asserts it under `emulateMedia`.

## Consequences

- **ADR-0008's Drawer half is superseded.** The native `<dialog>`, the CSS scroll lock, the light
  dismiss, the `matchMedia` guard and the sr-only `<h2>` are all deleted — not because any of
  them was wrong, but because the panel they belonged to has no reason to exist. Everything that
  ADR says about **the Toolbar** stands: the two shapes, the container's chrome at both, the
  reserved berth, and the rail's open overlap defect on the wide tiers.
- **ADR-0007's premise is retired.** There is one island, so there is no state crossing between
  islands and `drawerOpen` is gone. `@preact/signals` stays, for `linkCopied`.
- **ADR-0006 §2 is amended, not reversed.** "Never scaled" becomes "never scaled *up*". Its §1,
  the wide breakpoint that moved from 80rem to 101rem to 107.5rem, is deleted rather than moved
  again — see above.
- **The Toolbar is five controls at every tier**, where it was five and four. The Drawer's toggle
  is replaced by the Mode's, and unlike it, the new one is offered everywhere.
- **`scrollbar-gutter: stable` went with `drawer.css`.** It existed for the scroll lock, and
  there is no longer a lock. If a future overlay reintroduces one, it comes back with it.
- **`--reading-column-min` no longer bounds the supported viewport**, only the column. The
  narrowest supported width is whatever Paper Mode can fit, which is all of them.
- **Open:** the Mode swap is a hard cut. ADR-0016's machinery is right there, and a reflow is a
  better candidate for a transition than a repaint. Tracked in `docs/todos/`.

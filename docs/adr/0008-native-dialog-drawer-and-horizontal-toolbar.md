# A native `<dialog>` Drawer, and a horizontal Toolbar at every tier

The Drawer is a `<dialog>` opened with `showModal()` again, and it carries the control that closes it in a head row of its own, beside a visible `<h2>` name. The Toolbar is one horizontal row at every tier — a bottom cluster of five in Reading Mode whose controls carry their own chrome, and a floating top-centre pill of four in Paper Mode.

This reverses ADR-0007's central decision by name. It keeps everything else that ADR made: two islands, one shared signal, `@preact/signals` rather than Nano Stores, and the Aside's Blocks rendered a second time into the panel.

## What changed under the decision

ADR-0007 rejected `showModal()` for exactly one reason: the Toolbar carried the only way out of the panel, and a modal dialog holds the rest of the document inert, which would have left that way out dead. That reason is now gone. Ticket 21 moves the close control **inside the panel**, at the inline end of a head row — where a reader expects it, and where no amount of inertness elsewhere can reach it.

Every other change here follows from that one:

- The panel goes back to the platform: Escape, the focus trap, the initial focus, the focus return and the top layer are the browser's again. `Drawer.tsx` drops from three effects to two and loses roughly sixty lines.
- Nothing on the page is held `inert` by this project's code. The `inert` sweep over `document.body.children`, and the reasoning about Astro's own `<style>` and bootstrap `<script>` being swept up with it, are both gone.
- The panel's stacking is the top layer's, not ours. The three-level ladder (backdrop 2, panel 3, Toolbar 4) collapses; `.drawer-backdrop` becomes `::backdrop` and the Toolbar's `z-index` falls to 1.
- The Toolbar no longer travels with the panel, so `--drawer-width` stops being a distance as well as a width, and `data-drawer-open` leaves the Toolbar's markup entirely. The island stops reading `drawerOpen`, so it stops re-rendering when the panel opens.
- The toggle stops morphing into a close control and gains no `aria-expanded`. Behind an open panel the Toolbar is not clickable, not focusable and not in the accessibility tree — a control renamed "Close profile and skills" that nobody can reach would be a lie in the markup.

## The exchange, restated

Taken back, for free: the focus trap, Escape, the initial focus, the focus return, the top layer and the backdrop.

**Given up: the Toolbar is inert behind an open panel.** That is the exact inversion of ADR-0007's headline property, and it is the whole price. `tests/toolbar.spec.ts` now asserts the opposite of what it asserted — the test named "leaves the Toolbar operable beside the open panel" is rewritten as its own inverse, and is the clearest marker in the repo of what this ADR reverses.

Kept, because it was never the platform's to give:

- **The scroll lock. ADR-0007:21 is wrong to list it among the things `showModal()` gives "for free".** Measured in Chrome 150 against an isolated repro: with a modal open and no author rule, a trusted `PageDown` scrolled the page 700px. The HTML Standard's rendering rules for `dialog:modal` set `position`/`overflow`/`inset` on the *dialog* and say nothing about the document. The lock is now `html:has(.drawer[open]) { overflow: hidden }` — pure CSS, and the last side-effect this island had on the document goes with the JS that used to set the attribute.
- **`scrollbar-gutter: stable`**, for the reason it already existed: `overflow: hidden` reclaims the scrollbar's width and re-wraps every line behind the panel.
- **The `matchMedia` guard that closes the panel above 48rem**, which is load-bearing rather than tidy. Also measured: an *open* modal forced to `display: none` keeps `open === true`, keeps matching `:modal`, and keeps the document blocked with nothing on screen — a dead page with no way out. So `drawer.css`'s `@media (width >= 48rem) { display: none }` is **deleted**, not adapted, and the guard calls `panel.current?.close()` directly rather than going through the signal, so the panel never survives a render frame in Paper Mode.

## Considered Options

- **Keep the custom modal and only move the close control.** The close control is what makes the platform viable; keeping the hand-written machinery beside it would mean maintaining a focus trap, an `inert` sweep and a document `keydown` listener that the browser now offers to run. Rejected on KISS.
- **`aria-expanded` on the toggle.** Rejected: the APG's Modal Dialog pattern does not put it on its trigger, and ticket 20 already recorded the decision not to add it. `aria-haspopup="dialog"` stays.
- **`aria-modal="true"`.** Not added, but for the opposite reason to ADR-0007's: HTML-AAM makes it implicit on a modal `<dialog>`, so writing it would be redundant rather than wrong.
- **`closedby="any"` for the light dismiss.** It collapses the whole behaviour to one attribute, but it is Chrome/Edge 134+, Firefox 141+ and no Safari stable. A modal dialog's backdrop hit-tests to the dialog element itself, so `event.target === event.currentTarget` is a one-line check that works in every engine. Accepted cost: the dialog's own box must stay fully covered by its children, or a click on bare padding reads as a backdrop click — `display: flex` column with `padding: 0` on the dialog and `flex: 1` on `.drawer-body` achieves it. Revisit when `closedby` reaches Baseline.
- **`useId` for the `aria-labelledby` target.** Rejected: `Chrome.astro` renders exactly one Drawer, so `"drawer-title"` is deterministic by construction and is one fewer moving part than a generated id whose collision domain spans two independently-rendered islands.
- **The full-height left rail and the "tools" speed-dial** that `docs/todos/toolbar-re-design.md` proposed. Rejected against Material 3 and Apple HIG in `docs/research/toolbar-navigation-patterns.md`; ticket 21 records both under `## Out of scope`.

## Consequences

- `.drawer:not([open]) { display: none }` is **load-bearing**. The author `display: flex` in `@layer components` beats the UA's `dialog:not([open])` rule, and without it the closed panel paints a full-height cream column over Sheet 1 — including in the PDF, where it would not change the page count and `assertTwoA4Pages()` would pass. The `@layer print` hide stays as the second belt.
- `overlay` is in the transition list but never depended on: it is Chromium-only and experimental, so Firefox and Safari lose the exit animation and the panel closes instantly. `@starting-style` and `transition-behavior: allow-discrete` are both Baseline newly available (Aug 2024) and *are* load-bearing.
- Initial focus is `autofocus` on the close control, stated rather than inherited. The dialog focusing steps are `autofocus` descendant → first focusable descendant → the dialog itself; only the third branch matched the old intent, and it is now unreachable because the head row contains a focusable control. Without the attribute, the markup order of the head row would silently become the focus policy.
- The panel's name is visible, as an `<h2>` — `drawer.name` moves from `aria-label` to an `aria-labelledby` target. `h2` because `SectionHeading.astro` already emits `h2` for every Block inside the panel and those components are shared with the paper, where they must stay `h2` under the header Block's `h1`. The result is a flat run, which is the Aside's own structure.
- `--toolbar-block-size` stops encoding the control count: one row's block size does not depend on how many controls it holds. The Colophon's reserved berth falls from **300px** to **98px**.
- In Reading Mode the container has no padding, border, background or shadow, so contrast is each control's own to guarantee. `--color-muted` is the one existing token clearing 3:1 against every surface the cluster floats over; `--color-photo-circle` (~1.25:1 against white) is not, and is not reused as an edge. Measured in Chrome off the rendered `oklch()` rather than computed from the source hexes: **4.74:1** against the reading column and against the light theme's page background, **3.29:1** against the dark theme's, and **4.48:1** against the control's own `--color-aside-bg` fill.
- `:root` carries `scroll-padding-block-start` (Paper Mode) and `scroll-padding-block-end` (Reading Mode), inside `@media screen` so print never sees them — the remedy WCAG 2.2 · 2.4.11's Understanding document names, for a cluster that can now obscure a focused control at either edge.

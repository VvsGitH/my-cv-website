# A native `<dialog>` Drawer, and the Toolbar's two shapes

The Drawer is a `<dialog>` opened with `showModal()` again, and it carries the control that closes it in a head row of its own, beside an `<h2>` name that is announced rather than shown. The Toolbar takes one shape per tier, keeping its container's chrome at both: a vertical rail of four against the inline start in Paper Mode, centred on the viewport, and a horizontal row of five against the bottom edge in Reading Mode.

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
- **The `matchMedia` guard that closes the panel above 53.5rem**, which is load-bearing rather than tidy. Also measured: an *open* modal forced to `display: none` keeps `open === true`, keeps matching `:modal`, and keeps the document blocked with nothing on screen — a dead page with no way out. So `drawer.css`'s `@media (width >= 53.5rem) { display: none }` is **deleted**, not adapted, and the guard calls `panel.current?.close()` directly rather than going through the signal, so the panel never survives a render frame in Paper Mode.

## Considered Options

- **Keep the custom modal and only move the close control.** The close control is what makes the platform viable; keeping the hand-written machinery beside it would mean maintaining a focus trap, an `inert` sweep and a document `keydown` listener that the browser now offers to run. Rejected on KISS.
- **`aria-expanded` on the toggle.** Rejected: the APG's Modal Dialog pattern does not put it on its trigger, and ticket 20 already recorded the decision not to add it. `aria-haspopup="dialog"` stays.
- **`aria-modal="true"`.** Not added, but for the opposite reason to ADR-0007's: HTML-AAM makes it implicit on a modal `<dialog>`, so writing it would be redundant rather than wrong.
- **`closedby="any"` for the light dismiss.** It collapses the whole behaviour to one attribute, but it is Chrome/Edge 134+, Firefox 141+ and no Safari stable. A modal dialog's backdrop hit-tests to the dialog element itself, so `event.target === event.currentTarget` is a one-line check that works in every engine. Accepted cost: the dialog's own box must stay fully covered by its children, or a click on bare padding reads as a backdrop click — `display: flex` column with `padding: 0` on the dialog and `flex: 1` on `.drawer-body` achieves it. Revisit when `closedby` reaches Baseline.
- **`useId` for the `aria-labelledby` target.** Rejected: `Chrome.astro` renders exactly one Drawer, so `"drawer-title"` is deterministic by construction and is one fewer moving part than a generated id whose collision domain spans two independently-rendered islands.
- **The "tools" speed-dial** that a since-deleted owner note proposed. Rejected against Material 3's own FAB-menu page and a measured >20% discoverability loss levied on the language switch and the PDF download — which for a CV are the point of the page. See `docs/research/toolbar-navigation-patterns.md` §4. Ticket 21 records it under `## Out of scope` and it stays rejected.
- **The full-height left rail** of the same note, which ticket 21 rejected alongside the speed-dial and which this ADR now **adopts in Paper Mode** — see `## Amended`. The research's two objections are both about *compact* windows: M3's "vertical toolbars aren't recommended for compact windows", and the horizontal budget, where `.sheets`' `min-width: 23rem` means a rail raises the minimum viable viewport and cuts the measure below M3's own 40–60 character floor. Neither reaches Paper Mode, which is not a compact window and whose Sheets are a fixed A4 width with margin either side. Reading Mode *is* one, and keeps the horizontal row for exactly those reasons.

## Consequences

- `.drawer:not([open]) { display: none }` is **load-bearing**. The author `display: flex` in `@layer components` beats the UA's `dialog:not([open])` rule, and without it the closed panel paints a full-height cream column over Sheet 1 — including in the PDF, where it would not change the page count and `assertTwoA4Pages()` would pass. The `@layer print` hide stays as the second belt.
- `overlay` is in the transition list but never depended on: it is Chromium-only and experimental, so Firefox and Safari lose the exit animation and the panel closes instantly. `@starting-style` and `transition-behavior: allow-discrete` are both Baseline newly available (Aug 2024) and *are* load-bearing.
- Initial focus is `autofocus` on the close control, stated rather than inherited. The dialog focusing steps are `autofocus` descendant → first focusable descendant → the dialog itself; only the third branch matched the old intent, and it is now unreachable because the head row contains a focusable control. Without the attribute, the markup order of the head row would silently become the focus policy.
- The panel's name is a real `<h2>`, not an `aria-label` string — `drawer.name` moves to an `aria-labelledby` target. `h2` because `SectionHeading.astro` already emits `h2` for every Block inside the panel and those components are shared with the paper, where they must stay `h2` under the header Block's `h1`. The result is a flat run, which is the Aside's own structure. The heading is `.is-sr-only`: announced, never shown, so the head row is the close control alone at its inline end.
- `--toolbar-block-size` stops encoding the control count. It describes the **Reading Mode row** — one button, plus the container's own padding and border — and that is its only consumer: the Colophon's reserved berth, and `scroll-padding-block-end`. The Paper Mode rail's extent is not a token, because nothing reads it. The Colophon's berth falls from **300px** to **108px**.
- The container keeps its padding, border, background and shadow at both tiers, so its `--color-aside-bg` fill is what guarantees contrast — as it was before this ADR, and at every tier rather than one. The `--color-photo-circle` edge (~1.25:1 against white) is decorative on top of that fill, not the contrast carrier; nothing rests on it.
- `:root` carries `scroll-padding-block-end`, in Reading Mode only, inside `@media screen` so print never sees it — the remedy WCAG 2.2 · 2.4.11's Understanding document names, for a row that floats over the foot of the reading column. Paper Mode has no counterpart and needs none: a rail centred on the block axis against the inline edge cannot be scrolled clear on the block axis, so `scroll-padding` is the wrong instrument. What answers 2.4.11 there is geometry — no focusable control sits in the rail's band at any Paper Mode width, which `'never parks a focused control entirely behind the Toolbar'` holds at both tiers.
- **The Aside's Blocks are rendered a second time into the panel, not moved there.** CSS cannot reparent: `display: contents` cannot gather boxes from two subtrees into one scrollable panel, and the two Sheets' Asides both have to arrive in one Drawer. The only single-DOM alternative is an island moving prerendered nodes at runtime, which would make Reading Mode depend on JS and would fight hydration. Nobody meets both copies — Paper Mode hides the panel, Reading Mode hides the Asides on the paper. The portrait is excluded, being the one Aside Block that stays on the paper in Reading Mode.
- **Accepted cost: on a phone without JS, the Aside is unreachable.** The honest fix, if that ever needs answering, is to put the Aside's Blocks back in the reading flow below the Main column and keep the Drawer as an enhancement.
- `html:has(.drawer[open])` matches because **top-layer promotion does not move the dialog in the DOM tree** — that measured fact is what makes the pure-CSS scroll lock possible at all.
- `autofocus` was confirmed to win on **every** open, not only the first: the dialog focusing steps re-read the attribute per `showModal()`, and Preact core never calls `.focus()` itself.
- **After any change to `drawer.css`, run `npm run captures:render` on its own before Playwright.** A panel leaking into the capture would not change the page count, so it lands in `dist/` silently (ADR-0009).
- **Open, alongside the rail overlap below:** the `--color-heading` focus ring is ~1.4:1 against `--color-dark-bg`, aggravated because the bottom cluster meets that background more often. Tracked in `docs/todos/`.
- **The rail overlaps the paper at the two ends of Paper Mode, and 2.4.11 does not catch it** because what it covers is prose rather than a control. Measured against the built site at `inset-inline-start: var(--space-m)` and a 46px rail, so x ∈ [14, 60]: Sheet 1's left edge sits at 92px at 1024 and 220px at 1280 — clear — but a centred **840px** Sheet only reaches 60px of inline margin at **960px**, so from **856px**, the floor of Paper Mode, up to there the rail lands on the Aside's opening paragraph. The **two-up tier** starts over the same way: the pair is 1704px wide, so it clears the rail only from **1824px**, and between 1720 and that it overlaps too. This is the cost of moving the cluster to the inline edge: the old top-centre pill floated over a block-axis margin that every tier has, and the inline-axis margin only exists in the middle of the range. Open, and not remedied here.

## Amended

**2026-08-01.** Ticket 21 shipped this ADR's Drawer and a Toolbar that was one horizontal row at every tier. After living with that shape the owner reversed three of its decisions by hand, and the sections above are rewritten to describe what is in the tree rather than what was first shipped. The reversals, so the next reader knows they were deliberate rather than drift:

- **Paper Mode's Toolbar is a vertical rail against the inline start**, centred on the viewport, not a floating pill at the top centre. This adopts, for that tier alone, the full-height left rail of that same note, rejected outright when this ADR first shipped — see the split entry under `## Considered Options` for why the research's objection does not reach a non-compact window.
- **The container keeps its chrome in Reading Mode.** The rules that stripped the row's padding, border, background and shadow and moved a `--color-muted` edge onto each control never survived contact; the row is a bar again, and `--color-muted` is not used as a control border anywhere. The measured 3:1 ratios that entry recorded are therefore of a thing that does not exist.
- **The Drawer's `<h2>` is `.is-sr-only`.** The name is announced, not shown, and the head row is the close control alone.

Two defects shipped with the hand-edits and were fixed in the same pass, neither of them about the shape: `--toolbar-block-size`'s Reading Mode override still claimed the row had no container and under-reserved the Colophon's berth by 10px; and the toast was centred on the wrong axis at both tiers, with its clearance gap on the block axis where the rail stands beside it on the inline one.

The Drawer half of this ADR — the native `<dialog>`, the platform's focus and Escape, the CSS scroll lock, the light dismiss, the `matchMedia` guard — is untouched by any of it, as is everything this ADR kept from ADR-0007.

**2026-08-08.** The palette was consolidated by hand and this ADR's colour references went with it. Two things above are now stale, and the second was an open question this closes:

- **`--color-photo-circle` is `--color-accent`.** Same value, honest name: the token was already carrying the Toolbar's border and button hover and the OG card's subtitle, not only the disc behind the portrait. The `## Consequences` entry above still uses the old name; read it as `--color-accent`. `--color-ink` and `--color-bar-track` were dropped in the same pass — the first folded into `--color-heading`, the second into a `color-mix` off `--color-muted`, so a proficiency bar's track can no longer drift from its own fill.
- **The focus ring is `--color-muted`, and the ratio listed as Open is answered.** `--color-heading` measured **1.29:1** against `--color-dark-bg`, which is what the open entry recorded. `--color-muted` is the one token in the palette that clears 3:1 against every surface this project paints a ring on: **4.75:1** on white paper, **3.29:1** on `--color-dark-bg`, **4.48:1** on `--color-aside-bg`, **3.55:1** on `--color-accent` where a hovered Toolbar button sits under it. Measured after the same pass moved all four inks onto hue 264, so the numbers are of the shipped values. The remedy is the ring's colour alone; nothing about the Reading Mode row's geometry changed, and the rail-overlap entry beside it stays open.

**2026-08-31.** The palette moved again under ADR-0015's amendment, and the focus ring's token
went with it. The entry above stays true in its conclusion and false in its material.

- **The ring is still `--color-muted`, but that token is no longer a grey of its own.** Outside
  the cream it is `--color-text`; on the cream — the Aside and this cluster — it is
  `--color-cream-muted`, the literal that inherited the grey the entry above measured as
  `--color-muted-light`. Both of those tokens are deleted, so the four ratios listed there are of
  values that still exist only in part.
- **The 3:1 conclusion holds with more headroom than it had.** Measured on the built site:
  **4.57:1** on the Toolbar's cream in both Modes and both themes, and **7.65:1** light /
  **6.88:1** dark on the page in Reading Mode, where the ring is the body ink.
- **`.sheets` no longer carries `min-width: 23rem`.** The horizontal-budget argument under
  `## Considered Options` names it; the token behind it, `--reading-column-min`, is deleted
  (ADR-0017's amendment). The argument's conclusion — the rail belongs to Paper Mode and the row
  to Reading Mode — is untouched.

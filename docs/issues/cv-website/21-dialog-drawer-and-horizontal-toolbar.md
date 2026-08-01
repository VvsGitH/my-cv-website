# 21 — A native `<dialog>` Drawer, and a horizontal Toolbar at every tier

Status: done

## Goal

The Toolbar answers two complaints recorded in `docs/todos/toolbar-re-design.md`:
opening the Drawer from a control at the foot of the page is not intuitive, and
the strip eats too much of Reading Mode's vertical space. `docs/research/
toolbar-navigation-patterns.md` researched the owner's proposed remedy against
first-party sources and recommended a different shape, which this ticket
implements.

The Toolbar becomes **horizontal at every tier** — a bottom row of five in
Reading Mode where the controls carry their own chrome instead of the
container, and a floating top-centre pill of four in Paper Mode with padding
and a background of its own. The Drawer's toggle stays *inside* the cluster,
beside the other actions, because the Drawer holds substantive content rather
than navigation and every reader has to notice its control.

That in turn makes the native `<dialog>` viable again. ADR-0007 rejected
`showModal()` for one reason — the Toolbar carried the only way out, and a
modal dialog would have left it inert. The panel now carries its own way out: a
head row with the Drawer's name **visible** and a close control at its inline
end, where a reader expects it. So the Drawer returns to the platform, and
roughly sixty lines of hand-written modal go with it.

## Decisions

- **The close control moves inside the panel, and that is what unlocks
  everything else.** Every other decision here follows from it: with the way
  out inside the panel, the Toolbar no longer has to survive an open Drawer, so
  `showModal()` can take back Escape, the focus trap, the initial focus, the
  focus return and the top layer. `Drawer.tsx` drops from three effects to two.
  <br>Accepted cost: the Toolbar becomes inert behind an open panel, which is
  the exact inversion of ADR-0007's headline property. `tests/toolbar.spec.ts`
  must now assert the opposite of what it asserts today.

- **The panel's name becomes visible, as an `<h2>`.** `drawer.name` moves from
  `aria-label` to an `aria-labelledby` target. `h2` because
  `SectionHeading.astro:18` already emits `h2` for every Block inside the
  panel, and those components are shared with the paper where they must stay
  `h2` under the header Block's `h1`. The result is a flat run — "Profile and
  skills, About Me, Tech Skills, …" — which is the Aside's own structure.
  `h3` would claim the Blocks are subsections of the panel, which they are not
  on the paper; `h1` would compete with the owner's name.

- **The id is the literal `"drawer-title"`, not `useId`.**
  `docs/coding-standards.md:54` prescribes `useId` for an id crossing the
  SSR/hydration boundary and then records that nothing needs one yet. The
  Drawer is a singleton — `Chrome.astro:55` renders exactly one — so a literal
  is deterministic by construction and is one fewer moving part than a
  generated id whose collision domain spans two independently-rendered islands.
  Amend `coding-standards.md:54` to say so.

- **Initial focus is `autofocus` on the close control, stated rather than
  inherited.** The HTML dialog focusing steps are `autofocus` descendant →
  first focusable descendant → the dialog itself. Only the third branch matches
  today's intent ("prose, no first control worth preferring"), and it is now
  unreachable: the head row contains a focusable control, so the delegate
  branch always wins. Without `autofocus`, the markup order of the head row
  would silently become the focus policy.

- **Light dismiss stays a handler, not `closedby`.** A modal dialog's backdrop
  hit-tests to the dialog element itself, so `event.target ===
  event.currentTarget` is a one-line, every-engine check. `closedby="any"` is
  Chrome/Edge 134+, Firefox 141+, no Safari stable.
  <br>Accepted cost: the dialog's own box must stay fully covered by its
  children, or a click on bare dialog padding reads as a backdrop click.
  `display: flex` column with `padding: 0` on the dialog and `flex: 1` on
  `.drawer-body` achieves it.

- **`overlay` is included in the transition list but never depended on.**
  It is Chromium-only and experimental; without it the exit animation is lost
  and the panel closes instantly in Firefox and Safari. That degradation is
  what `docs/research/toolbar-navigation-patterns.md:393` already ruled for.
  `@starting-style` and `transition-behavior: allow-discrete` are both Baseline
  newly available (Aug 2024) and are load-bearing.

- **The scroll lock stays, as pure CSS.** ADR-0007:21 lists the scroll lock
  among the things `showModal()` gives "for free". It does not — see
  `### Measured rather than assumed`. `html:has(.drawer[open]) { overflow:
  hidden }` replaces both the `html[data-drawer-open]` rule and the JS that set
  the attribute, which is the last side-effect this island had on the document.
  `scrollbar-gutter: stable` survives unchanged, for the reason it already
  exists: `overflow: hidden` reclaims the scrollbar's width and re-wraps every
  line behind the panel.

- **`drawer.css`'s `@media (width >= 48rem) { display: none }` is deleted, not
  adapted.** An *open* modal forced to `display: none` keeps `open === true`,
  keeps matching `:modal`, and keeps the document blocked with nothing on
  screen — a dead page with no way out. That rule is what creates the state,
  and it is now redundant: a closed `<dialog>` is already `display: none`, and
  JS is the only thing that can open it.

- **`--toolbar-block-size` stops encoding the control count.** Today's
  `calc(5 * …)` couples the Colophon's layout to how many controls the Toolbar
  has, by a literal. A single row's block size does not depend on the count, so
  the new formula is one button plus the container's own padding and border.

- **The toggle stops morphing, and gains no `aria-expanded`.** While the panel
  is open the Toolbar is not clickable, not focusable and not in the
  accessibility tree. A control renamed "Close profile and skills" that nobody
  can reach is a lie in the markup. One icon, one name, one action.
  `aria-haspopup="dialog"` stays; the APG's Modal Dialog pattern does not put
  `aria-expanded` on its trigger, and ticket 20 already recorded the decision
  not to add it.

- **The container's fill is what guarantees contrast today, so removing it in
  Reading Mode needs a border that does not.** `--color-photo-circle`
  (`#efdf9e`) is ~1.25:1 against white — unusable as a per-control edge.
  `--color-muted` (`#737373`) is the one existing token clearing 3:1 against
  both surfaces the cluster floats over: ~4.5:1 vs `--color-main-bg`, ~3.5:1 vs
  `--color-dark-bg`, ~4.2:1 vs its own `--color-aside-bg` fill. Reuse it rather
  than mint a token.
  <br>Accepted cost: those ratios are arithmetic on declared hexes. Measure
  them in a browser before shipping.

- **ADR-0008 is required.** This reverses ADR-0007's central decision by name
  and is not reversible by deleting a file.

## Tasks

### The Toolbar

- `chrome/toolbar.css`: rewritten. Base is the Paper Mode pill —
  `position: fixed`, `inset-block-start: var(--toolbar-inset)`,
  `inset-inline-start: 50%`, `translate: -50% 0`, `display: flex` in a row,
  keeping the padding, border, background and shadow it has today. One
  `@media screen and (width < 48rem)` block moves it to
  `inset-block: auto var(--toolbar-inset)` and strips the container's padding,
  border, background and shadow, putting a `var(--toolbar-border-size) solid
  var(--color-muted)` border and a `--color-aside-bg` fill on `.toolbar-button`
  instead. Delete `flex-direction: column`, `transform: translateY(-50%)`,
  `transition: translate`, the `.toolbar[data-drawer-open]` travel rule and the
  toast's flip rule. `z-index: 4` → `1`: the top layer outranks it now, so the
  stated justification is gone and the number should not outlive it.
- `chrome/toolbar.css`: the toast is centred on the cluster at both tiers —
  below the pill in Paper Mode, above the cluster in Reading Mode. `opacity`,
  not `display`, stays: the live region has to remain in the accessibility tree
  between announcements.
- `chrome/toolbar.css`: `scroll-padding-block-start` (Paper Mode) and
  `scroll-padding-block-end` (Reading Mode) on `:root`, inside `@media screen`
  so print never sees them — the remedy WCAG 2.2 · 2.4.11's Understanding
  document names, for a cluster that can now obscure a focused control at
  either edge.
- `chrome/Toolbar.tsx`: drop `data-drawer-open` from the root; the toggle stops
  morphing (`icon-menu` and `drawer.open` unconditionally, `onClick` sets
  `true` rather than toggling); rewrite the docblock. The island stops reading
  `drawerOpen` altogether, so it stops re-rendering when the panel opens.

### The Drawer

- `chrome/Drawer.tsx`: a `<dialog class="drawer">` with `aria-labelledby`, an
  `onClose` that writes `drawerOpen.value = false`, and an `onClick` light
  dismiss. Inside it, a head row with `<h2 id="drawer-title" class="drawer-title">`
  and a `.drawer-close` control carrying `autofocus` and `drawer.close`, then
  `.drawer-body` with the children. Two effects: one `[open]` calling
  `showModal()` and `close()` in its cleanup, one `[]` for the `matchMedia`
  guard — which now calls `panel.current?.close()` directly rather than going
  through the signal, so the panel never survives a render frame in Paper Mode.
  Delete the `.drawer-backdrop` element, `role="dialog"`, `tabindex={-1}`, the
  opener snapshot, the `inert` sweep, the `dataset` write and the document
  `keydown` listener. Do not add `aria-modal` — HTML-AAM makes it implicit.
- `chrome/drawer.css`: `::backdrop` replaces `.drawer-backdrop`; `[open]`
  replaces `data-open`; the entry and exit transitions use `@starting-style`
  plus `display`/`overlay` with `allow-discrete`, written as a plain shorthand
  first so an engine without `allow-discrete` drops only the second
  declaration. Delete the three-level stacking and the `visibility` machinery
  it depended on, the `prefers-reduced-motion` block (it existed only to cancel
  a `transition-delay` the new list does not have), the `html[data-drawer-open]`
  lock and the `@media (width >= 48rem)` hide.
- `chrome/drawer.css`: **`.drawer:not([open]) { display: none }` is
  load-bearing** — the author `display: flex` in `@layer components` beats the
  UA's `dialog:not([open])` rule, and without it the closed panel paints a
  full-height cream column over Sheet 1, including in the PDF. Keep the
  `@layer print` hide as the second belt.
- `chrome/Chrome.astro`: pass `close={strings.drawer.close}` to `<Drawer>`.

### Geometry and the Colophon

- `tokens.css`: `--toolbar-inset` (new, `var(--space-m)`) so the cluster's berth
  from the viewport edge lives in one place; `--toolbar-block-size` becomes
  `calc(var(--toolbar-button-size) + 2 * var(--space-xs) + 2 *
  var(--toolbar-border-size))` — **46px** in Paper Mode — and is overridden to
  a bare `var(--toolbar-button-size)` — **44px** — in the Reading Mode block,
  which has no container. Optionally add `env(safe-area-inset-bottom, 0px)` to
  `--toolbar-inset` there, now that the cluster lives on the bottom edge.
  Rewrite the geometry preamble and `--drawer-width`'s justification: neither
  the travel nor the "~54px of strip" survives.
- `chrome/Colophon.astro`: same formula shape, new inputs —
  `calc(var(--toolbar-block-size) + var(--toolbar-inset) + var(--space-xl))` =
  **98px**, down from **300px**. Rewrite the comment; it currently argues about
  a strip that drops to the foot of the viewport.

### Tests

- `tests/support/page.ts`: delete the `drawerBackdrop` locator; update the
  `drawer` locator's comment.
- `tests/toolbar.spec.ts` `'opens and closes from the keyboard'`: focus lands on
  `.drawer-close`, not the panel; drop the assertion that the toggle is renamed
  `strings.close`; add that `.drawer-title` shows `strings.name`.
- `tests/toolbar.spec.ts` `'holds the paper and the Colophon inert'` → rewritten.
  The browser owns inertness now and exposes no attribute for it, so assert what
  is observable: focus cannot leave the panel, and `body > [inert]` has count
  **0** while open — the inverse of today's assertion, which would fail loudly
  if the hand-built machinery came back. Swap the `html[data-drawer-open]` pair
  for `toHaveCSS('overflow', …)`.
- `tests/toolbar.spec.ts` `'leaves the Toolbar operable beside the open panel'` →
  rewritten as its own inverse: the Toolbar is inert behind the open panel.
  This test asserted the whole point of ADR-0007 and is the clearest marker of
  what ADR-0008 reverses.
- `tests/toolbar.spec.ts` `'closes on a click beside the panel'`: `.drawer-backdrop`
  is gone; click absolute coordinates over the backdrop instead.
- `tests/toolbar.spec.ts` `'does not widen the reading column'`: keep verbatim —
  both the `scrollbar-gutter` and the `.sheets` width assertions stay true and
  stay necessary. Update the comment to point at the `:has()` rule.
- New: `'closes itself when the window grows into Paper Mode'`. The highest-value
  test in the set — the failure mode it guards is a permanently dead page.
- New: `'names and closes from the panel's own head'`, per Locale.
- New: `'runs its controls in one horizontal row'` at both tiers — equal `y`,
  distinct `x`, five controls in Reading Mode and four in Paper Mode.
- New: `'floats over the page without moving the paper'` — the pill is far
  narrower than the viewport, is centred, and Sheet 1's top is where it was.
- New: `'draws the backdrop behind the open panel'` — guards `::backdrop`'s
  custom-property inheritance.
- New: extend `'never parks a focused control entirely behind the Toolbar'` with
  a second describe at `VIEWPORTS.paper`; the top pill is a new obscuring
  surface and is currently untested. Assert the `scroll-padding` itself, so a
  token change that silently drops it is caught.

### Documents

- `docs/adr/0008-…`: what it reverses (the custom modal, the hand-written
  `inert`/focus/Escape, the "no `aria-modal`" argument, the three-level
  stacking, the travelling strip, and ADR-0007:21's factual claim about the
  scroll lock) and what survives (two islands, one shared signal,
  `@preact/signals` over Nano Stores, the Aside rendered a second time).
- `CONTEXT.md`: the Toolbar's definition ("A vertical strip against the left
  edge, centred on the viewport; in Reading Mode it rides the Drawer's outer
  edge") is now false. Extend the Drawer's entry too — it stops being a bare
  panel.
- `docs/coding-standards.md`: `:39` add ADR-0008; `:54` the singleton-id
  reasoning; `:58` the Toolbar opens the panel and the Drawer writes it back
  from the `close` event.
- `chrome/state.ts:19-25` and `chrome/Toolbar.tsx:24-25`: both claim the Toolbar
  is the only writer of `drawerOpen`. **That is already false** —
  `Drawer.tsx:78`, `:91` and `:105` all write it — and the new shape makes the
  correct statement simple: the Toolbar opens it, and the `<dialog>`'s `close`
  event is the single funnel every way out passes through.
- Add this ticket as item 21 in `spec.md`'s implementation-ticket index.

## Out of scope

- **The "tools" speed-dial of `docs/todos/toolbar-re-design.md`.** Rejected on
  four contraindications on M3's own FAB-menu page and a measured >20%
  discoverability loss, levied on the language switch and the PDF download —
  which for a CV are the point of the page. See
  `docs/research/toolbar-navigation-patterns.md` §4.
- **The full-height left rail** of the same note. M3: "Vertical toolbars aren't
  recommended for compact windows." It also has no horizontal budget here:
  `.sheets` already carries `min-width: 23rem`, so a rail raises the minimum
  viable viewport and cuts the measure below M3's own 40–60 character floor.
- **A scroll-aware Toolbar** that yields while reading. A good phase 2 once
  98px has been lived with; it fixes neither complaint on its own and adds a
  scroll listener to an island whose first principle is KISS.
- **A Drawer in Paper Mode.** Above 48rem `Sheet.astro:35-37` renders the same
  Aside Blocks on the paper. There is nothing to open, so the pill has four
  controls.
- **The `--color-heading` focus ring's ~1.4:1 against `--color-dark-bg`.**
  Pre-existing, and the bottom cluster meets that background more often than
  the old strip did. Worth its own ticket.
- **`closedby="any"`.** Revisit when it reaches Baseline; it collapses the light
  dismiss to one attribute.

## Acceptance

**Build and suite**

- `npm run build` (`astro check && astro build`) green: 0 errors, 0 warnings,
  0 hints.
- `npm test` green, including the six new tests.

**Toolbar**

- The Toolbar runs as one horizontal row at every tier: five controls at the
  bottom in Reading Mode, four in a floating pill at the top centre in Paper
  Mode.
- In Reading Mode the container has no padding, border, background or shadow,
  and each control carries its own — measured at ≥3:1 against both the reading
  column and the page background, in both themes.
- In Paper Mode the pill has its own padding and background, is far narrower
  than the viewport, and does not move the Sheets: Sheet 1's top is where it
  was before the change.
- No focusable element is entirely obscured by the Toolbar when focused, at
  either tier (WCAG 2.2 · 2.4.11), and `:root` carries the `scroll-padding`
  that keeps it that way.
- The Colophon's reserved berth is 98px, and its last line still never
  intersects the cluster at full scroll.

**Drawer**

- The panel is a `<dialog>` opened with `showModal()`, shows its name as a
  visible `h2`, and carries the control that closes it at the head's inline
  end.
- Opening moves focus to that control; Escape, the control and a click beside
  the panel all close it; every one of them returns focus to the toggle.
- The page behind an open panel cannot be scrolled, cannot take focus, and no
  element carries a hand-written `inert`.
- Growing the window past 48rem with the panel open closes it and leaves the
  page scrollable and focusable — never a blocked document with nothing on
  screen.
- Under `prefers-reduced-motion: reduce` the panel does not stick at
  `display: flex`.

**Unchanged**

- The PDFs are byte-comparable in structure: still exactly two A4 pages, no
  cream band on Sheet 1, and none of the Chrome's words in the text layer.
- Both Locales, both themes, theme persistence across reload, and the share
  toast all behave as they do today.

## Depends on

- 06 (Reading Mode, the 48rem boundary), 07 (Toolbar placement and `ui.ts`),
  12 (E2E suite), 17 (`--space-*` scale), 19 (the Colophon's reserved berth and
  WCAG 2.2 · 2.4.11), 20 (two islands, the shared signal, ADR-0007)

## Comments

### Origin

`docs/todos/toolbar-re-design.md`, 2026-07-31. The owner named two complaints —
the Drawer's toggle at the foot of the page is not intuitive, and the strip
costs too much vertical space in Reading Mode — and proposed a full-height left
rail with a "tools" speed-dial expanding upward from the bottom.

That proposal was researched against first-party sources before anything was
designed; the result is `docs/research/toolbar-navigation-patterns.md`. Two of
its ideas are directly endorsed by both Apple HIG and Material 3 — moving the
toggle to a conventional edge, and moving the chrome from the container onto
the controls — and both are adopted here. Two are contradicted by the same
sources and are recorded under `## Out of scope`.

The owner then made two amendments to the recommended shape, both on record:
the Drawer's toggle stays inside the cluster rather than being split off to the
top edge, **because the Drawer holds substantive content rather than
navigation** and every reader has to notice its control; and Paper Mode adopts
the horizontal cluster too — a top-centre pill with its own padding and
background — rather than keeping the vertical strip.

### Measured rather than assumed

Four `<dialog>` behaviours this ticket turns on were run in Chrome 150 against
isolated repros rather than taken from documentation:

- **`showModal()` does not lock the document's scroll.** With a modal open and
  no author rule, a trusted `PageDown` scrolled the page 700px. The HTML
  Standard's rendering rules for `dialog:modal` set `position`/`overflow`/
  `inset` on the *dialog* and say nothing about the document. **ADR-0007:21 is
  wrong on this point** and ADR-0008 should say so rather than quietly inherit
  it.
- **An open modal forced to `display: none` blocks the page.** `open` stays
  `true`, `:modal` still matches, and `focus()` on an outside control does not
  move focus — an invisible, unscrollable, unfocusable page. This is what makes
  the `matchMedia` guard load-bearing rather than tidy, and why
  `drawer.css`'s 48rem hide is deleted instead of adapted.
- **`html:has(.drawer[open])` matches.** Top-layer promotion does not move the
  dialog in the DOM tree, so the pure-CSS scroll lock works.
- **The backdrop hit-tests to the dialog element**, so the one-line light
  dismiss is sound.

`autofocus` was also confirmed to win on *every* open, not only the first — the
focusing steps re-read the attribute per `showModal()` — and Preact core never
calls `.focus()` itself, so the attribute is handled by the platform alone.

### Order of work

Docs first (no test impact), then tokens and the Colophon (the suite stays
green), then the Toolbar's CSS and markup with the one assertion it breaks,
then the new Toolbar tests, then the Drawer's CSS and TSX together — they
cannot be split, since the CSS keys off `[open]` and the TSX depends on
`::backdrop` — with its five rewritten tests, then the new Drawer tests, then a
comment pass.

**Run `npm run captures:render` on its own after the Drawer's CSS lands, before
Playwright.** If `.drawer { display: flex }` ships without
`.drawer:not([open]) { display: none }`, the closed panel paints over Sheet 1 in
the PDF — and because it would not change the *page count*, `assertTwoA4Pages()`
would pass and the corruption would land in `dist/` silently.

Manual checks the suite cannot make: reduced motion; the 3:1 control border in
both themes; the pill's clearance over Sheet 1's top margin at 1280 **and** at
1024, where `toolbar.css` already records that an unscaled Sheet fills the
viewport and there is no margin left to float over.

### Amended after shipping

**2026-08-01.** Everything above records what this ticket shipped and stays as
written. After living with it the owner reversed three of its decisions by hand,
in `Drawer.tsx`, `drawer.css` and `toolbar.css`. `docs/adr/0008-…` was amended in
place rather than superseded, and renamed
`0008-native-dialog-drawer-and-the-toolbar-cluster.md` — its title no longer
holds. What changed:

- **Paper Mode's Toolbar is a vertical rail against the inline start**, centred
  on the viewport, not the top-centre pill of `## Tasks`. This adopts, for that
  tier alone, the full-height left rail this ticket rejected under
  `## Out of scope`. The rejection's two grounds — M3's "vertical toolbars aren't
  recommended for compact windows" and `.sheets`' `min-width: 23rem` horizontal
  budget — are both about compact windows, and Paper Mode is not one. Reading
  Mode is, and keeps the horizontal row.
- **The container keeps its chrome in Reading Mode.** The `@media (width < 48rem)`
  block no longer strips its padding, border, background and shadow, and the
  `--color-muted` per-control border of the contrast decision was deleted with
  it. Contrast is the container's `--color-aside-bg` fill again, at every tier.
  The measured ratios that decision records are of rules that no longer exist.
- **The Drawer's `<h2>` is `.is-sr-only`** — announced, not shown, against the
  "the panel's name becomes visible" decision. The `aria-labelledby` at a real
  `<h2>` rather than an `aria-label` string is unchanged, and so is the
  `h2`-not-`h3` reasoning; only the visibility went. The head row is the close
  control alone, pushed to the inline end by `margin-inline-start: auto`.

Two defects came in with the hand-edits and were fixed in the same pass, neither
about the shape:

- `--toolbar-block-size`'s Reading Mode override still read
  `var(--toolbar-button-size)` under a comment saying the row had no container to
  add to it. With the container back the row is **54px**, not 44, so the
  Colophon's berth and `scroll-padding-block-end` were both under-reserving by
  10px. The override is deleted; the `:root` formula already computes 54. The
  berth is **108px**, not the 98 this ticket's `### Geometry and the Colophon`
  states.
- The toast was centred on the wrong axis at both tiers: `translate: 0 50%`
  pushed it down by half its height in Paper Mode with its clearance gap on the
  block axis, where the rail stands beside it on the inline one; and
  `translate: 0` in Reading Mode cancelled the horizontal centring that
  `inset-inline-start: 50%` sets up, so on a 320px phone it could leave the
  viewport.

Four tests in `tests/toolbar.spec.ts` changed with the shape.
`'runs its controls in one horizontal row in Paper Mode'` became
`'stacks its controls in one vertical rail in Paper Mode'`;
`'floats over the page without moving the paper'` swapped its centring assertion
for the rail's own two; `'scroll-pads the top edge by the whole pill'` was
**deleted** along with the `scroll-padding-block-start` rule it guarded, because
a rail centred on the block axis cannot be scrolled clear on it and no token
value could have satisfied the test; and the comments claiming the panel's name
is visible were corrected. The `toHaveText` assertions on `.drawer-title` stay —
`.is-sr-only` clips but does not remove, and they are what guards the
`aria-labelledby` target having content.

**One thing the reconciliation found and did not fix.** The rail overlaps the
paper at both ends of Paper Mode. Measured against the built site: Sheet 1's
left edge is at 115px at 1024 and 243px at 1280, well clear of the rail's
x ∈ [14, 60] — but at **768–~830px**, Paper Mode's floor, an A4 Sheet is wider
than the viewport and there is no inline margin at all, and the **two-up tier**
fills the width the same way. At 768 and at 1616 the rail lands on the Aside's
opening paragraph. The suite does not catch it because WCAG 2.4.11 is about
focused *controls*, and none sit in the rail's band — it is prose that is
covered. This is the structural cost of the inline edge: the pill this replaced
floated over a block-axis margin, which every tier has, whereas the inline-axis
margin exists only in the middle of the range. It wants its own ticket.

`docs/research/toolbar-navigation-patterns.md` and
`docs/todos/toolbar-re-design.md` were deliberately left alone. The research is
not wrong; the owner overrode its recommendation for one tier, and that override
belongs in the ADR.

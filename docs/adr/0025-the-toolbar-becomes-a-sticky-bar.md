# The Toolbar becomes a sticky bar at the top of the page

The Toolbar stops being a floating cluster with one shape per viewport tier and becomes a
`<header class="toolbar">`, sticky against the top of the document, at every width and in both
Modes. It has no surface of its own — text and icons on the page background, the Colophon's
register at the other end of the document — and the only chrome it carries is a rule underneath,
**as wide as the content below it**. The five actions become six controls in one row: the Mode at
the inline start with a visible label, then the language pair, download and share, then the theme
pair at the inline end, with a divider between the groups.

`state.ts`, `Chrome.astro` and `Toolbar.tsx` are deleted rather than refactored. What replaces the
one Toolbar island is a shell — `Toolbar.astro` — with three small islands inside it
(`ModeSwitch`, `ShareButton`, `ThemeSwitch`), one `.astro` component with no hydration at all
(`LocaleSwitch`), and an `<a download>` that is markup.

**This ADR describes the tree, not the plan.** The work landed over seven tickets, and after the
last of them the owner made a further round of changes by hand. Where the tickets and the tree
disagree the tree is what is recorded here, and each such divergence is named where it occurs —
the language's travel and the theme pair's pre-paint state are the two large ones.

## What this supersedes, amends and leaves standing

- **ADR-0008's Toolbar half is superseded.** The vertical rail, the horizontal row, the container's
  chrome at both, the tier that chose between them and `--toolbar-button-size` / `--toolbar-inset`
  are all gone. Its Drawer half was already superseded by ADR-0017.
  **The rail-overlap defect that ADR-0008 left open is closed by deletion, not by fix**: it was a
  property of a rail standing beside the paper between 856–960px and 1720–1824px, and there is no
  rail. Nothing was measured to close it, because there is nothing left to measure.
- **ADR-0013's reserved berth is superseded.** The Colophon's `padding-block-end` for the
  bottom-edge row, and the *"Horizontal indentation to clear the Toolbar in Reading Mode"* option
  it was chosen over, are both moot: the bar is in flow at the other end of the document and
  reserves its own space by being there. Its neighbouring option, *"Making it fixed or sticky"*,
  still stands as a decision about the Colophon, but half its stated reason is now false — the
  Toolbar is no longer "the site's one fixed element", it is a sticky one. **Everything ADR-0013
  decides about what the Colophon says and does not say is untouched.**
- **ADR-0016 is amended, not superseded.** Its decision holds — the theme still arrives as a circle
  from the control that was pressed. Four of its sentences stopped being true; the amendment is
  written into ADR-0016 itself, dated, as that file's siblings do it.
- **ADR-0017 and ADR-0019 are the load-bearing prerequisites.** ADR-0017 made the Mode a choice
  rather than a width, which is what leaves the Chrome as the only thing a width still governs —
  and this ADR removes that too. ADR-0019 unpinned the cream, which is what makes a bar with no
  background safe (below).
- **ADR-0003's island count changes**, from one to three; ADR-0007's premise was already retired by
  ADR-0017 and its last artefact, `@preact/signals` as a direct dependency, goes here.

## No background is safe only because every surface is themed

The bar paints nothing behind itself. `backdrop-filter: blur(8px)` with no background is the whole
effect: what blurs is the document scrolling under it. The ink is `--color-heading`, and it has to
clear 4.5:1 over every surface the bar can pass over — the page, the paper, the Aside's panel and
the accent. Measured on the built artifact, light / dark:

| the bar's ink over               | light   | dark    |
| -------------------------------- | ------- | ------- |
| the page (`--color-page-bg`)     | 13.27:1 | 11.08:1 |
| the paper (`--color-main-bg`)    | 15.96:1 | 13.93:1 |
| the Aside's panel                | 15.08:1 | 12.80:1 |
| the accent, i.e. the active pill | 11.94:1 | 8.85:1  |

**This would not have been safe before ADR-0019.** While the cream was theme-invariant the Aside
was one surface out of four sitting on a different ramp from the rest, and a single ink could not
have cleared all four in both directions. `toolbar.spec.ts` pins the first three rows and the
active label in both themes; nothing else in the suite can see this.

## The rule's width is a step function built out of `clamp()`

The rule is as wide as the content below it: two Sheets and their gutter when the pair shares a
line, one Sheet and its gutters when it does not. That threshold is not written down anywhere —
ADR-0017 deleted the last breakpoint literal and this must not reintroduce it — so the width is
derived from `--sheet-width`, `--sheets-gap` and `--sheets-pad`, the same three tokens the flex
line's own wrap already falls out of.

CSS cannot ask whether a flex line wrapped. It can be handed a value that changes sign at the
threshold, and `clamp(MIN, VAL, MAX)` — which is `max(MIN, min(VAL, MAX))` — turns that into a
step function: a negative `VAL` yields the MIN, a large enough one yields the MAX.

```css
--rule-one:  min(var(--sheet-width), 100% - 2 * var(--sheets-pad));
--rule-two:  calc(2 * var(--sheet-width) + var(--sheets-gap));
--rule-fits: calc((100% - 2 * var(--sheets-pad) - var(--rule-two) + 0.02px) * 100000);

inline-size: calc(clamp(var(--rule-one), var(--rule-fits), var(--rule-two))
                  + 2 * var(--sheets-pad));
```

**Both constants were paid for by measurement and must not be tidied.**

**The epsilon is `+ 0.02px`, and it is sub-pixel for a reason.** Without it the residue is exactly
`0` at the threshold and `clamp()` takes the MIN for a pair that fits. The branch first shipped
`+ 1px`, which fixed that and opened a worse hole: the residue goes positive at any `W > 1719`
while the flex line stays wrapped until `W ≥ 1720`, so at 1719.19 / 1719.50 / 1719.89 the rule came
out ~1719px — a **third** width, belonging to neither case, and fractional layout widths are
ordinary at browser zoom (2149px at 125% is 1719.2). The epsilon has a floor and a ceiling.
Saturation at the threshold needs `multiplier × epsilon ≥ MAX` (1704px), so `epsilon ≥ 0.01704px`.
What is left wrong is the band where `MIN < multiplier × residue < MAX`, which is
`epsilon − MIN/multiplier` wide — 0.0116px at 0.02 — narrower than Chrome's 1/64px and Gecko's
1/60px layout quantum, so no representable width falls inside it.

**The multiplier is `100000`, not `1000` — and raising it further would make things worse, not
better.** A larger multiplier widens the wrong band rather than narrowing it, because more of the
epsilon saturates to MAX; the band is minimised where `multiplier × epsilon = MAX`, which is
exactly where these two values sit. Both were re-earned by mutation, each patched in alone against
the built CSS and re-measured. Rule width; `*` marks the widths where the pair actually fits:

|                                 | 1024 | 1719 | 1719.5   | 1719.984375 | 1720       | 1721       |
| ------------------------------- | ---- | ---- | -------- | ----------- | ---------- | ---------- |
| **as shipped** (0.02px, 100000) | 856  | 856  | 856      | 856         | **1720\*** | 1720\*     |
| no epsilon (0px, 100000)        | 856  | 856  | 856      | 856         | **856\***  | 1720\*     |
| 1000 instead of 100000          | 856  | 856  | 856      | 856         | **856\***  | **1036\*** |
| the old `+ 1px`                 | 856  | 856  | **1720** | **1720**    | 1720\*     | 1720\*     |

Three failure modes, not two: no epsilon takes the MIN at the threshold; too small a multiplier
*also* fails to saturate at the threshold **and** produces a third width one pixel above it; too
large an epsilon claims the fit for widths below it.

**The suite pins this from the paper's own boxes, not from a literal.** `toolbar.spec.ts` measures
the Sheets' bounding boxes and adds `2 × --sheets-pad` resolved off the page, so it reads
1720 / 1720 / 856 / 856 at 1721 / 1720 / 1719 / 1024px without any of those numbers appearing in
the file, and stays correct if `--sheet-width`, `--sheets-gap` or `--sheets-pad` ever move.
`VIEWPORTS.twoUp` remains the one place the threshold is computed — now for the rule as well as
for the flex line. Both constants were verified able to fail: removing the epsilon reddens the
test with `Expected 1720, Received 856`, and `1000` with `Expected 1720, Received 1016`.

## The bar deliberately does not follow the Mode

Two separate things are meant by that, and both are decisions.

**The rule keeps the paper's width in Reading Mode, and therefore overhangs the reading column.**
Measured at 1280px: the rule is 856px against a reading column of 777.59px. `toolbar.css` carries
no `[data-mode='reading']` rule for the rule's width, and `toolbar.spec.ts` asserts the overhang
rather than tolerating it. The bar belongs to the document, whose width the paper sets; the reading
measure is a property of the text, not of the page it is set on.

**The bar's spacing is frozen literals with one reader, not scale tokens.** `toolbar.css` declares
`--toolbar-space-xs / -s / -m` (0.25 / 0.375 / 0.75rem) and `--toolbar-action-size` /
`--toolbar-toggle-size`, and nothing in the bar reads `--space-*`. It shipped mid-branch reading
`--space-m` and `--space-s`, which Reading Mode rebinds, so the bar re-laid-out on a Mode flip —
the row's max-content width went 457.84 → 593.70px and its one-line threshold 474 → 610px.
**ADR-0011 says the paper's spacing scale is authoritative; the Chrome is not the paper.** A touch
target and a control gap are properties of the device and of the control, never of what the reader
chose to look at — which is the same argument ADR-0017 used to split the 53.5rem boundary, applied
to the half of it that is left.

## The pill takes a border, because its fill cannot carry the state

Both pairs are one mechanism: a `position: relative` track with an absolutely positioned `::before`
at `inline-size: 50%` carrying `--color-aside-accent`, and `transition: translate` between the two
halves. Position comes from state, never from JavaScript —

```css
[data-theme='dark'] .toolbar-theme::before { translate: 100%; }
.toolbar-locale:has(> :last-child[aria-current])::before { translate: 100%; }
```

— so both are correct in the static HTML, before hydration (ADR-0003). The `:last-child` reading is
what makes `chromeLinks`' fixed `[it, en]` order load-bearing, and it is commented as such at both
ends. `:has()` is safe here only because `toolbar.css` is a plain stylesheet: inside an Astro scope
the compiler would leave `:global()` untouched and the browser would drop the whole rule silently
(coding-standards).

**With JavaScript off there is no `[data-theme]` at all**, so the theme pill would park on `sun`
over a dark page. `toolbar.css` mirrors `tokens.css`'s ladder for exactly that case:
`@media (prefers-color-scheme: dark) { html:not([data-theme='light']) .toolbar-theme::before }`.
`aria-checked` cannot follow, because nothing runs to write it — see below; the no-JS floor is that
the pill is right and the announcement is not.

**The fill on its own is a straight WCAG 2.2 · 1.4.11 failure**, because the fill is the only thing
marking which language and which theme are selected. Measured on the built artifact, light / dark:

|                                             | light      | dark       |
| ------------------------------------------- | ---------- | ---------- |
| the active label **on** the pill            | 11.94:1    | 8.85:1     |
| the inactive label on the switch's track    | 15.96:1    | 13.93:1    |
| **the pill's fill against the track**       | **1.34:1** | **1.57:1** |
| the pill's **1px border** against the track | **9.20:1** | **8.65:1** |

The text is fine in both themes. The pill is invisible. So the pill carries a 1px border in
`--color-text`, which is what answers 1.4.11 — `toolbar.spec.ts` asserts the border row at ≥3:1 and
deliberately does **not** assert the fill, with a comment saying so, because the ~1.1–1.6:1 reading
is expected rather than broken. Proved able to fail: re-pointing the border at
`--color-aside-accent` reddens the test at 1.11.

**This replaces, rather than inherits, the failure the abandoned first attempt recorded.** That one
was ink at ~1.1:1 *on* a theme-invariant accent; ADR-0019 made the accent themed and the ink is now
fine in both directions. The defect moved from the label to the pill's own edge, and the earlier
remedy — pinning the light ramp on the active half — is deleted rather than kept.

**The pill is `box-sizing: border-box` explicitly, and it has to be.** `reset.css` does not reach
it (see *Consequences*), so it computed `content-box`: `inline-size: 50%` plus a 1px border gave a
border box of `50% + 2px`, `translate: 100%` resolved against that, and the travelled pill's inline
end landed at `100% + 4px`: **an overhang of 4.00px past its own group, in both pairs and at every
width**, since the figure is the border's 2px doubled and does not depend on the group's size. It
was measured on the built artifact at 1280px in both pairs before the fix, and again after — border
box exactly half the group, overhang 0.00. Since the border is what carries 1.4.11, the pill's edge
has to coincide with the half it marks.

## The language travels as a cross-document View Transition

Switching language is a real navigation to another document. The theme's swap has a circle
(ADR-0016); the language's had a hard cut, on the one control whose whole job is to tell a reader
which of two languages they are reading.

The mechanism is two lines of CSS and one set of names:

- `reset.css` opts the document in with `@view-transition { navigation: auto }`, and opts back out
  inside its `prefers-reduced-motion: reduce` block with `@view-transition { navigation: none }`.
- `toolbar.css` names `lang-pill` on `.toolbar-locale::before` and `lang-it` / `lang-en` on the two
  links, times `::view-transition-group(lang-pill)` at 320ms, and lifts the two labels above the
  pill with `z-index` so they are not covered while it travels.
- `::view-transition-old(root)` / `-new(root)` already carry `animation: none` for ADR-0016's
  circle, so the root snapshot does not crossfade on a navigation either: **the pill is the only
  thing that moves**, which is exactly the brief.

**This reverses the branch's own plan, and the reversal is the decision.** Tickets 04 and 06
specified — and shipped — a `sessionStorage` key (`cv-locale-from`) written on the way out, read
and cleared pre-paint by an `is:inline` script in `Toolbar.astro`, driving a one-shot `@keyframes`
off a `data-locale-from` attribute cleared on `animationend`. The brief had ruled
`@view-transition { navigation: auto }` out by name and the spec recorded it as rejected. **That
machinery is gone**: no storage key, no attribute, no keyframes, no landing script, and no
`animationend` listener. What it bought — the pill starting from the departing half, before the
first paint, with the reduced-motion opt-out — the platform now provides, and the platform's
version survives a reload and a direct load without a guard for either. The brief's objection was a
preference, and the owner changed it.

**Two things about testing it must not be re-litigated**, because both look like gaps and are not.
They are logged with their measurements in `docs/hacks/2026-08-01.md` (entries 13 and 14): the
travel is asserted on the **departing** document, because headless Chromium skips the arriving
transition; and the reduced-motion opt-out for a cross-document navigation is **not assertable at
all** — a test for it was written, proved vacuous by deleting `navigation: none` from the built CSS
and watching it still pass, and removed.

## The theme is a radiogroup; the language is two links

Both pairs look the same and are marked up differently, because they do different things.

**The language is two `<a hreflang>`, the current one carrying `aria-current="page"`.** They are
navigations to `/it/` and `/en/`: they have to stay links to work with JavaScript off, to keep
`data-astro-prefetch`, and to be crawled. Each carries `lang` as well as `hreflang`, since each is
written in the language it points at. The wrapper is a `<nav aria-label>` rather than a
`role="group"` — Biome's `useSemanticElements` rejects the role and offers `<fieldset>`, which
would be wrong for two links, and `<nav>` is the semantic element for exactly this.

**The theme is `role="radiogroup"` with two `role="radio"` and a roving tabindex.** It genuinely
*is* a choice between two mutually exclusive states, which is what `radio` means and what
`aria-pressed` only approximates. One tab stop for the pair, arrows within it, Home and End at the
ends, and pressing the already-checked half is a no-op — no write, no view transition. `role` on a
`<button>` costs one `biome-ignore` with its reason, because the same rule wants
`<input type="radio">`, which cannot be this pill.

**Accepted, deliberately: the theme pair announces the wrong theme until the island hydrates, and
permanently with JavaScript off.** The spec put an `is:inline` script in `Toolbar.astro` to write
`aria-checked` and `tabindex` from `<html data-theme>` before the paint; **there is no `is:inline`
script in the tree.** `ThemeSwitch.tsx` renders with light checked from SSR and corrects itself in a
`useEffect` on hydration. So a reader on a dark theme meets a radiogroup that says *light, checked*
for the moment between paint and `client:idle`, and forever if scripting is off. **The visual state
is right throughout** — the pill is placed by the `prefers-color-scheme` mirror in CSS above, which
needs nothing to run. The owner accepted this knowingly: *"it is for a very brief instant"*, against
one more inline script in a rewrite whose whole direction is subtraction. The cost is stated here
rather than buried: this is the one place in the bar where the announced state and the painted state
can disagree.

## The shadow costs an `IntersectionObserver`, and it is the only JavaScript this adds

The blur is always on, in CSS. The **shadow is not**: a zero-height `.toolbar-sentinel` before the
header is observed, and the header carries `data-stuck` while the sentinel is out of view. A
zero-area target is "intersecting" only while it is contained in the root, which is exactly the test
wanted. It is an Astro module `<script>` in `Toolbar.astro`, not an island — there is no markup to
render, and `<script>` is the smaller instrument.

**Everything else in this rewrite is subtraction, and it is worth saying so plainly.** This is the
one piece of JavaScript it adds.

**The shadow is on `.toolbar`, which is viewport-wide, not on `.toolbar-rule`.** The bar therefore
casts its edge across the whole viewport when stuck, not only under the content-width rule. The
ticket specified the rule; the tree has the header, and it is the better reading — what is holding
the top edge is the bar, not the rule inside it.

## WCAG 2.4.11 inverts, and there is a width band it does not cover

`scroll-padding-block-end`, which cleared the bottom-edge row, becomes
`scroll-padding-block-start: var(--toolbar-block-size)` on `:root`, which clears the sticky bar. It
sits plainly in `@layer components` with **no `@media screen` guard**: the coding standards say
screen-only layout is cancelled in `@layer print` rather than fenced, with two named exceptions this
is not, and scroll padding is inert in a paginated context anyway. It computes `46px` under print
media instead of `auto`, and nothing there reads it.

**`.toolbar` carries `min-block-size`, not a fixed `block-size`, and below a measured width the bar
outgrows its own pad.** The action row is `flex-wrap: wrap`, so on a narrow viewport the theme pair
drops to a second line and the bar grows, while the scroll padding stays one row tall. Measured on
the built artifact:

|                              | Paper Mode | Reading Mode |
| ---------------------------- | ---------- | ------------ |
| one line from                | **354px**  | **344px**    |
| the bar, one line            | 46px       | 46px         |
| the bar, wrapped             | 58px       | 58px         |
| `scroll-padding-block-start` | 46px       | 46px         |

So below 354px in Paper Mode and below 344px in Reading there is a **12px partial obscuring** of a
focused control scrolled to the top. **2.4.11 *(Minimum, AA)* permits it** — it forbids the focused
control being *entirely* hidden — and 2.4.12 *(Enhanced, AAA)*, which the Colophon does not claim,
would not. **The owner accepted this knowingly**: it is a phone, and a focused control parked exactly
there is unlikely. It is recorded as a known limitation rather than left to be rediscovered.
Reading Mode's threshold is 10px lower only because its Mode label is the shorter of the two
("Mod. Carta" against "Mod. Lettura"), which is content rather than spacing.

The suite asserts the two halves separately, and the split is deliberate: the sweep runs at 368px
and at 1280px and asserts only that no focused control is *entirely* behind the bar; `pad ≥ token`
and `pad ≥ the bar's measured height` are asserted at the paper viewport, where the bar is one line.
Asserting `pad ≥ height` at 375px would be asserting AAA on a site that does not claim it.

**One thing about that sweep must survive**, because it is the kind of thing a later pass
"simplifies": **it has to park each target under the bar before focusing it, or it cannot fail.**
Focus scrolling uses `block: nearest`, which only ever brings a following element up to the *bottom*
edge of the scrollport, so a forward sweep never delivers anything to the top edge where a sticky bar
stands — verified by forcing `scroll-padding-block-start: 0` onto the built page and watching the
sweep report 0 obscured either way. The honest version scrolls the target's top to half the bar's
height first, then focuses. With the rule deleted, both sweeps go red naming the header Block's two
contact links.

## The Toolbar's tokens live with their only reader

`tokens.css` holds **no Chrome geometry at all** any more. `toolbar.css` opens with a `:root` block —
inside its `@layer components` wrapper — holding `--toolbar-block-size`, `--toolbar-space-xs / -s /
-m`, `--toolbar-action-size`, `--toolbar-toggle-size` and `--font-size-toolbar`. `--font-size-button`,
`--toolbar-button-size` and `--toolbar-inset` are deleted outright, and `tokens.css` gained
`--sheets-gap` and `--sheets-pad` in their place, promoted up from `.sheets` because the rule's
arithmetic is their third reader.

They are declared on `:root` rather than on `.toolbar` on purpose, and it is load-bearing in two
directions: `scroll-padding-block-start` is set on `:root`, and `tests/toolbar.spec.ts` resolves
`--toolbar-block-size` *from `body`*. **A Toolbar geometry token must stay inherited by the document,
not scoped to `.toolbar`.**

**Worth knowing before adding a seventh name there:** `global.css` imports `tokens.css` with
`layer(base)`, and `toolbar.css` declares `@layer components`, so on any future collision the
Toolbar's declaration wins over the palette's regardless of import order — `components` is later in
the `@layer reset, base, components, print` statement. There is no collision today; all six names
were checked against `tokens.css` and none of them appears there.

## Considered Options

- **`aria-pressed` buttons for both pairs.** What the abandoned first attempt chose, and its reason
  was real — a roving tabindex is machinery. Rejected: the theme pair is a choice between two
  mutually exclusive states, and `radio` is the role that says so.
- **`role="radio"` on the language links.** Faithful to the brief's word and to the mockup, and a
  lie: a screen reader would announce a radio button on something that navigates.
- **`animation-timeline: scroll()` for the stuck shadow.** Pure CSS, no sentinel, no observer.
  Rejected pending Firefox: an effect that simply never appears in one engine is worse than the
  observer it saves. Revisit when it reaches Baseline.
- **The shadow always on.** What the abandoned attempt shipped, and it gives up exactly the
  distinction between resting and moving that the shadow is for.
- **`sessionStorage` plus a one-shot `@keyframes` for the language's travel.** Built, shipped, and
  then deleted in favour of the cross-document View Transition — see above. Recorded as rejected
  *after* being tried, which is the stronger form of the record.
- **A new `--color-accent` pair at ≥3:1 against the page**, which would need no pill border.
  Rejected: it is a palette change that touches ADR-0015 and ADR-0019 and has to be re-verified on
  the portrait's disc and on the Aside, for a border this ADR can afford.
- **An inverted pill filled with `--color-heading`.** The highest contrast available, and it takes
  the accent out of the Toolbar, which is the opposite of what the brief asks.
- **A media query at 1720px for the rule's width.** It reads at a glance, and it reintroduces by
  hand the one written-down breakpoint ADR-0017 deleted — a number somebody then has to keep in
  step with `--sheet-width`.
- **A rule as wide as the page.** Simplest of all, and it says nothing about the content: in the
  stacked tier a full-width rule under a single 840px Sheet belongs to the viewport rather than to
  the document.
- **Renaming the domain term.** *Masthead* was rejected as a new term for a thing that does the same
  job, at the cost of every file and every test selector; *Header* collides with the header Block —
  the name, title and contacts at the top of Main — which is a different thing in the same
  vocabulary. The term stays `Toolbar`; `CONTEXT.md`'s entry is rewritten around the new shape and
  `header` leaves its `_Avoid_` list.
- **Islands for the download and the language pair**, against the brief's *"ogni pulsante … un
  componente preact"*. Rejected: the download is an `<a download>` with no logic to encapsulate, and
  the language pair is two links that must exist in the static HTML and work with JavaScript off.
  Hydrating an island to attach nothing is precisely the excess this rewrite is deleting.

## Consequences

- **`toolbar.css` has four `@media` rules and none of them is a width**: `(hover: hover)`,
  `(prefers-color-scheme: dark)`, `(prefers-reduced-motion: reduce)` and `print`.
  `grep -rn '53.5rem' src/ scripts/` is empty. The tier machinery is gone from the shipped CSS, not
  only from the source.
- **The hover fill reaches three of the seven controls, and that is correct.**
  `@media (hover: hover)` gates `:is(.toolbar-mode, .toolbar-button):hover`, so the Mode, the
  download and the share take a fill and the two language links and two theme radios take none. The
  fill is `--color-aside-accent`, which is *exactly* the pill's own fill, so a hovered half of
  either pair would paint the selected state onto an unselected control — the one distinction the
  pill's border exists to preserve. It was never written down before; it is here and beside
  `docs/hacks/2026-08-01.md` entry 10.
- **`reset.css`'s forgiving `:where()` lists do not reach pseudo-elements, and this bar is the first
  thing in the tree to need them to.** `:is()`/`:where()` cannot contain a pseudo-element and their
  selector lists are *forgiving*, so `:where(*, *::before, *::after, *::backdrop)` parses down to
  `:where(*)`. Two rules in `reset.css` are affected and both cost this bar something: the
  `box-sizing` rule at the head of the file (the 4.00px pill overhang above) and the reduced-motion
  rule at its foot (the pill's travel ran the full 260ms for a reader who asked for stillness). Both
  are worked around locally — `box-sizing: border-box` on `.toolbar-switch::before`, and a
  `@media (prefers-reduced-motion: reduce)` block inside `toolbar.css` — and **both workarounds are
  load-bearing, not redundant.** `reset.css`'s own comment (*"`::backdrop` is a descendant of
  nothing, so `*` does not reach it"*) records the belief that the list works, and is false. Opened
  as `docs/issues/reset-pseudo-elements/`.
- **A divider dangles when the row wraps.** The two dividers are real flex items, because the brief
  puts them *between* the groups rather than against either one, so on the wrap the second becomes
  the last item of line one — a 1px rule with nothing after it. Measured at 320px Paper: the divider
  occupies `[299.0, 300.0]` with the row's own right edge at 312.0 and the theme pair on line two.
  Cosmetic, and not fixed here because CSS has no "last item on a wrapped line" selector and every
  alternative restructures the markup. We don't care: it's an edge case.
- **A live print from Reading Mode is three A4 pages, and it predates this branch.**
  `Document.astro`'s Reading Mode block sets `margin-block-end: var(--space-xl)` on `.sheets` and its
  `@layer print` block cancels `display`, `gap`, `padding`, `justify-content` and `container-type`
  but not `margin`, so 48px survives into print: `documentElement` measures **2293px** against the
  **2245px** two A4 pages need. Exactly the failure `coding-standards.md` describes — the print layer
  must *name* what it neutralises. `pdf.spec.ts` cannot see it: capture runs from a fresh context,
  which is Paper Mode. Opened as `docs/issues/reading-mode-print/`.
- **`@preact/signals` is no longer a direct dependency.** Deleting `state.ts` removed its only
  importer; `linkCopied` is `useState` in `ShareButton.tsx` with the revert timer in a `useRef` and a
  cleanup effect — which is exactly the shape the standards' sanctioned exception predicted it would
  need, and it is the right trade now that there is no second island to share a module with. The
  package is out of `package.json`; `@astrojs/preact@6.0.5` declares `^2.8.2` of its own, so the
  three islands are unaffected. `docs/coding-standards.md`'s sanctioned module-level-signal exception
  is deleted rather than re-pointed, and so is the paragraph about two islands sharing a Vite chunk.
- **Three islands hydrate where there was one**, all `client:idle`. `openPainted()`'s
  `expect(page.locator('astro-island[ssr]')).toHaveCount(0)` therefore gets stronger, not vacuous —
  `toHaveCount` is auto-retrying, so it cannot pass before all three have shed the attribute. A
  guard asserting islands are *present* was tried and reverted: `/it/og/` and `/en/og/` render no
  Toolbar and no islands at all, and `openPainted` serves both kinds of route.
- **The bar is first in `<body>`, before `<main>`**, which `position: sticky` requires and which is
  correct reading order for a `banner` regardless. It is filled through a named `masthead` slot the
  page passes, not written into `BaseLayout` — `og.astro` builds its own `<html>` and nothing here
  may leak into it.
- **The Mode control's visible text is its accessible name** (WCAG 2.5.3), so it carries neither
  `title` nor `aria-label`. The download and the share have no visible text and keep both, with the
  same string in each, so there is nothing for 2.5.3 to disagree with. `src/i18n/ui.ts`'s Toolbar
  block is now `download`, `share`, `shared`, `modeReading`, `modePaper`, `themeGroup`, `themeLight`,
  `themeDark`, `localeGroup`.
- **A `ch` token resolves against the element that reads it, and the bar sets its own font.**
  `--font-size-toolbar` is declared on `.toolbar`, so anything inside the bar resolving
  `--reading-column-max` (`75ch`) gets a different number from the reading column itself. The bar
  reads it nowhere today — which is the point of *the bar does not follow the Mode* above — but the
  suite's `lengthOf` helper resolves a token **inside the element that reads it** for exactly this
  reason, and a future rule in `toolbar.css` that names the measure would come out narrow without
  anything erroring.
- **The suite is 95 tests, all green**, from 90 before the branch. `astro check` is clean over 55
  files and `npx biome check .` over 68.
- **`astro build` empties `dist/`, where the PDFs and the OG cards live.** Never run Playwright
  straight after a bare build: it gives a false 27 failures on missing files. `npm run pretest`
  chains `build` and `captures:render` and is the correct entry point.

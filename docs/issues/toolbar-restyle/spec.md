# Spec: the Toolbar becomes a sticky bar

Status: ready-for-agent

The Toolbar (`CONTEXT.md`) stops being a floating cluster with two shapes and becomes a sticky
bar at the top of the page, in the Colophon's register — text and icons on the page background,
no surface of its own, one rule underneath. This is a **destructive** rewrite: the markup, the
stylesheet and the tokens are replaced rather than adapted, and `state.ts`, `Chrome.astro` and
`Toolbar.tsx` are deleted rather than refactored.

Background: `docs/adr/0008` (the two shapes this supersedes), `0013` (the Colophon's berth),
`0015` (the theme reaches the paper), `0016` (the theme's circle), `0017` (the Mode is chosen),
`0019` (the Aside — and with it this cluster's surface — took the theme).

**This spec contradicts `CONTEXT.md` by design**, and `docs/agents/domain.md` asks that it be
said rather than done quietly. The glossary defines the Toolbar as *"the floating control
cluster … the site's only fixed chrome"* and lists **`header`** among the terms to avoid. It
becomes exactly a header here. The entry is rewritten in ticket 07; the term itself does not
change — see decision 6.

## Problem Statement

The Toolbar takes one shape per viewport tier — a vertical rail against the inline start in
Paper Mode, a horizontal row against the bottom edge below 53.5rem (ADR-0008). Three things
have gone wrong with that arrangement.

**The shape is a compromise, and ADR-0008 records its own defect.** The rail overlaps the
Aside's opening paragraph between 856px and 960px, and again between 1720px and 1824px. The
entry has stood open since it shipped. Neither shape has a width that means anything with
respect to the paper it floats over — the cluster is beside the document rather than part of
the page it belongs to.

**Two of the five actions never show their state.** Language and theme are icon-only toggles
that render the destination, not the position: a reader sees where the control would take them
and never sees where they are. For the language that is worse than opaque — the one thing a
reader needs to know is which of two languages they are reading, and the control shows the
other one.

**The tier machinery outlives its reason.** `53.5rem` is the one breakpoint literal left in the
stylesheets, and all three of its occurrences exist for this cluster: `tokens.css` grows the
touch target and adds a safe-area inset, `toolbar.css` turns the rail on its side and inverts
the toast, `Colophon.astro` reserves the berth the bottom row would otherwise cover. One shape
retires all three.

## Solution

One bar, sticky at the top, at every width and in both Modes.

**It is text and icons on the page background.** No panel, no border box, no fill — the
Colophon's own register, at the other end of the document. The one piece of chrome it carries
is a rule underneath, in the ink colour, and the rule is **as wide as the content below it**:
two Sheets and their gutter when the pair shares a line, one Sheet and its gutters when it does
not, the reading measure in Reading Mode. That width is what makes the bar belong to the page
rather than hover over it, and it is derived from `--sheet-width` rather than written down —
the same arithmetic that already decides when the flex line wraps (ADR-0017).

**No background is safe here only because of ADR-0015 and ADR-0019.** Every surface the bar can
float over — the page, the paper, the Aside's panel, the accent — is on one ramp per theme, so
one ink clears AA over all four. It would not have been safe before ADR-0019 unpinned the cream.
Ticket 06 measures it rather than assuming it.

**The five actions become six controls**, in one row: the Mode at the inline start, then —
after a space-between — the language pair, download and share, then the theme pair at the
inline end, with a divider between the groups.

| Action   | Was                                                         | Becomes                                                                                  |
| -------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Mode     | icon-only toggle, `file-text` / `list`                      | icon **and visible label** — `list` + "Modalità lettura", `file-text` + "Modalità carta" |
| Language | one link to the other Locale, labelled with the target code | **both Locales written out**, `IT` / `EN`, the current one active                        |
| Download | `download`                                                  | unchanged                                                                                |
| Share    | `share-2`, becoming `check-circle`                          | unchanged                                                                                |
| Theme    | one `moon`/`sun` toggle                                     | **both offered**, `sun` / `moon`, the current one active                                 |

Every glyph the new bar needs is already subset: `fonts.config.mjs` carries `file-text`, `list`,
`download`, `share-2`, `sun`, `moon` and `check-circle`. **No font work is required by this
spec** — the icon face arrived with ADR-0024, after the first attempt at this rewrite was
abandoned.

**The active half of each pair sits on `--color-aside-accent`**, under a pill that slides
between the two positions. The two pairs are the same mechanism: the theme's pill follows
`html[data-theme]`, the language's follows which link carries `aria-current`, so both are
correct before hydration and neither needs JavaScript to be placed.

## User Stories

1. As a reader, I want the controls at the top of the page where I look for them first, so that
   I do not have to find a floating cluster beside the paper.
2. As a reader, I want the bar to stay reachable as I scroll, so that I can switch Mode or
   language from anywhere in the document.
3. As a reader, I want the bar to look like it belongs to the page under it, so that the site
   reads as one composed document rather than a viewer with a widget bolted on.
4. As a reader, I want to see which language I am reading and which theme I am in, not only
   where the control would take me.
5. As a reader, I want the Mode control to say what it does in words, since it is the one
   control a phone visitor has to find (WCAG 2.2 · 1.4.4, ADR-0017).
6. As a reader switching language, I want the change to feel like the theme's — the active
   marker travelling rather than the page cutting.
7. As a keyboard user, I want to tab through every control and never have the focused one
   hidden behind the sticky bar (WCAG 2.2 · 2.4.11).
8. As a reader in either theme, I want to be able to *see* which half of each pair is selected,
   not only to have a screen reader told (WCAG 2.2 · 1.4.11).
9. As the owner, I want the tier machinery gone — one shape, no toolbar media queries, no token
   that encodes a control count.
10. As the owner, I want the rule's width to come out of the paper's own measurements, so that
    changing `--sheet-width` does not leave a breakpoint behind to update by hand.

## Implementation Decisions

Six were settled with the owner before this spec; they are decisions, not defaults.

### 1. The language is two links; the theme is a radiogroup

Both pairs look the same — one segmented control, one sliding pill — and are marked up
differently, because they do different things.

**The language is two `<a hreflang>`, the current one carrying `aria-current="page"`.** They
are navigations to `/it/` and `/en/`: they have to stay links to work with JavaScript off, to
keep `data-astro-prefetch`, and to be crawled. Each carries `lang` as well as `hreflang`, since
each is written in the language it points at.

**The theme is `role="radiogroup"` with two `role="radio"` and a roving tabindex** — the
mockup's own pattern (`docs/issues/toolbar-restyle/toolbar-mockups.htm`, concept 3). One tab stop for the pair,
arrows within it, `aria-checked` following `<html data-theme>`.

**Rejected: `aria-pressed` buttons for both pairs.** This is what the abandoned first attempt
chose, and its reason was real — a roving tabindex is machinery. But the theme pair genuinely
*is* a choice between two mutually exclusive states, which is what `radio` means and what
`aria-pressed` only approximates.

**Rejected: `role="radio"` on the language links.** Faithful to the brief's word and to the
mockup, and a lie: a screen reader would announce a radio button on something that navigates.

### 2. The theme's circle survives, and starts from the new position

ADR-0016 stands. The swap is still a View Transition, the circle still grows from
`event.currentTarget.getBoundingClientRect()` — a keyboard activation carries the control but no
coordinates — and `prefers-reduced-motion` is still gated in JavaScript, where `reset.css`
reaches neither `::view-transition-*` nor `Element.animate()`. The three
`::view-transition-*(root)` rules in `tokens.css` are untouched.

What changes is **where the wave starts**. ADR-0016 describes two origins — *"a rail at the
inline start in Paper Mode, so the wave crosses diagonally, and a row on the bottom edge in
Reading Mode, so it opens upward"* — and neither exists after this spec. The circle now opens
downward from the bar's inline end. The new ADR amends ADR-0016 on that paragraph and on
nothing else.

The "simple CSS animation" the brief asks for is the pill's travel, not the circle.

### 3. Shadow only when stuck, and it costs an IntersectionObserver

The blur is always on, in CSS: `backdrop-filter` on the bar, with no background behind it, so
the text scrolling under is the whole effect. The **shadow is not**. A zero-height sentinel
before the bar is observed, and the bar carries `data-stuck` while the sentinel is out of view.

**This is the only JavaScript this rewrite adds rather than deletes**, and it is worth saying
so plainly: everything else here is subtraction.

**Rejected: `animation-timeline: scroll()`.** Pure CSS, no sentinel, no observer. Firefox
support has to be confirmed before anything can rest on it, and an effect that simply never
appears in one engine is worse than the observer it saves.

**Rejected: shadow always on.** What the abandoned attempt chose, and it gave up exactly the
distinction between resting and moving that the brief asks for.

### 4. The language animates from `sessionStorage`, before the paint

No View Transition on the navigation.

- On click, the language pair writes the departing Locale to `sessionStorage`.
- On landing, an `is:inline` script in `Toolbar.astro` reads the key, clears it, and — if it
  differs from this page's Locale — writes `data-locale-from` on the bar.
- CSS runs a one-shot `@keyframes` from that position to the resting one. No key, no attribute,
  no animation.

**Pre-paint rather than at hydration, and that is the decision.** `client:idle` runs after the
first paint, so a hydrated island would find the pill already painted at its destination and
would have to jump it backwards before animating forwards. The script therefore joins the two
`is:inline` scripts `BaseLayout.astro` already runs for the theme and the Mode, and for the same
reason. The brief accepts *"un breve delta in cui nessuna delle due lingue è selezionata"* — that
delta is the pill's travel.

**Rejected: `@view-transition { navigation: auto }`.** Two lines of CSS and no storage at all,
and it is what the abandoned attempt shipped. The brief rules it out by name.

### 5. The pill takes a border, because its fill cannot carry the state

`--color-aside-accent` stays the fill — it is the project's accent, and the brief asks for it —
but it cannot mark the selection on its own. Measured on the master palette:

|                                        | light      | dark       |
| -------------------------------------- | ---------- | ---------- |
| Active label **on** the pill           | 11.93:1    | 9.85:1     |
| Inactive label on the page             | 7.76:1     | 7.13:1     |
| **The pill against `--color-page-bg`** | **1.12:1** | **1.11:1** |

The text is fine in both themes. The **pill is invisible**: `#efdf9e` on `#eaebef` and `#771f4e`
on `#2b3747` are both about 1.1:1. Since the fill is the only thing marking which language and
which theme are selected, that is a straight WCAG 2.2 · 1.4.11 failure on the control the
reader is looking at.

So the pill carries a 1px border in `--color-text`, which measures **7.76:1** light and
**7.13:1** dark against the page — well past the 3:1 that 1.4.11 asks. Ticket 06 pins all three
rows of that table, in both themes.

**This replaces, rather than inherits, the failure mode the abandoned attempt recorded.** That
one was ink at ~1.1:1 *on* a theme-invariant accent; ADR-0019 made the accent themed and the
ink is now fine in both directions. The defect moved from the label to the pill's own edge, and
the earlier remedy — pinning the light ramp on the active half — is deleted rather than kept.

**Rejected: a new `--color-accent` pair** at ≥3:1 against the page, which would need no border.
It is a palette change: it touches ADR-0015 and ADR-0019 and has to be re-verified on the
portrait's disc and on the Aside as well as here, for a border this spec can afford.

**Rejected: an inverted pill** filled with `--color-heading`. The highest contrast available,
and it takes the accent out of the Toolbar, which is the opposite of what the brief asks.

### 6. The domain term stays `Toolbar`

`CONTEXT.md`'s entry is rewritten around the new shape and `header` leaves its `_Avoid_` list;
`navbar` and `controls` stay on it. Nothing in the code, the classes or the test selectors is
renamed.

**Rejected: `Masthead`.** A new term for a thing that does the same job, at the cost of touching
every file and every test selector.

**Rejected: `Header`.** It collides with the header Block — the name, title and contacts at the
top of Main — which is a different thing in the same vocabulary.

### The architecture

`Toolbar.astro` is a shell, with Preact islands only where one is needed:

```
Toolbar.astro                      the shell, <header class="toolbar">, banner landmark
├── ModeSwitch.tsx     client:idle icon + visible label, writes data-mode
├── LocaleSwitch.astro             two <a>, aria-current, no hydration
├── <a download>                   markup in the shell, no logic
├── ShareButton.tsx    client:idle clipboard + toast role="status"
└── ThemeSwitch.tsx    client:idle radiogroup, roving tabindex, ADR-0016's circle
```

`state.ts` is deleted and each island carries its own logic. `linkCopied` — the module-level
signal `docs/coding-standards.md` sanctions as its one exception — becomes local state in
`ShareButton`, and the standards entry that defends it goes with it.

**Two controls deliberately do not become islands**, against the brief's "ogni pulsante … un
componente preact". The download is an `<a download>` with no logic to encapsulate. The language
pair is two links that must exist in the static HTML and work with JavaScript off; the only
JavaScript that concerns them is the `sessionStorage` write, which belongs beside the pre-paint
read that consumes it — splitting the two halves of one mechanism across an island boundary
would hide that they are one. Hydrating an island to attach a single `setItem` is precisely the
excess this rewrite is deleting.

**`toolbar.css` stays a plain stylesheet** in `@layer components`. Astro's scoping does not
reach a `.tsx`, so a scoped `<style>` in the shell would dress the shell and leave the three
islands bare. This is one of the two exceptions `docs/coding-standards.md` allows.

**`aria-checked` is the one thing CSS cannot write.** The same pre-paint script as decision 4
writes it on the theme pair from `<html data-theme>`, so the pair is correct before hydration
and the island only has to keep it correct afterwards. Everything else — which glyph, which
label, where the pill sits — is chosen by CSS off `[data-theme]` and `[data-mode]`, as ADR-0003
requires.

### The rule's width is a step function built from `clamp()`

CSS cannot ask whether a flex line wrapped. It can be handed a value that changes sign at the
threshold, and `clamp(MIN, VAL, MAX)` — which is `max(MIN, min(VAL, MAX))` — turns that into a
step: a negative `VAL` yields the MIN, a large one yields the MAX.

```css
--rule-one:  min(var(--sheet-width), 100% - 2 * var(--sheets-pad));
--rule-two:  calc(2 * var(--sheet-width) + var(--sheets-gap));
--rule-fits: calc((100% - 2 * var(--sheets-pad) - var(--rule-two) + 1px) * 100000);

inline-size: calc(clamp(var(--rule-one), var(--rule-fits), var(--rule-two))
                  + 2 * var(--sheets-pad));
```

Two constants in there were paid for by measurement and must not be tidied:

- **The `+ 1px` is load-bearing.** At the exact threshold the residue is `0`, and `clamp()`
  would take the MIN for a pair that fits.
- **The multiplier is `100000`, not `1000`.** With `1000`, at a 1720px viewport the residue
  yields `1000px`, which falls *between* MIN (840px) and MAX (1704px): `clamp()` returns it and
  the rule comes out 1016px, a width belonging to neither case. Measured: 1016px with `1000`,
  1720px with `100000`.

**Consequence:** `--sheets-gap` and `--sheets-pad` stop being local to `.sheets` and move to
`:root`. They were already the source of both the fit and the wrap threshold; they now have a
third reader.

**Rejected: a media query at 1720px.** It reads at a glance, and it reintroduces by hand the one
written-down breakpoint ADR-0017 deleted — a number that then has to be kept in step with
`--sheet-width` by somebody remembering to.

**Rejected: a rule as wide as the page.** Simplest of all, and it says nothing about the
content: in the stacked tier a full-width rule under a single 840px Sheet is a line that belongs
to the viewport rather than to the document.

### Accessibility

- The bar is a `banner` landmark, first in the DOM, before `<main>` — required for `position:
  sticky` to work at all, and correct as reading order regardless.
- The Mode control's visible text **is** its accessible name (2.5.3 label in name); the sr-only
  pair it used to carry goes, and it gains neither `title` nor `aria-label`.
- WCAG 2.4.11 inverts: `scroll-padding-block-end`, which cleared the bottom row, becomes
  `scroll-padding-block-start`, which clears the sticky bar.
- 1.4.11 is answered by the pill's border (decision 5), not by its fill.
- 1.4.4 is unaffected: the Mode control stays first in the row and gains a visible label, which
  makes it more findable on a phone than it was, not less (ADR-0017).
- `prefers-reduced-motion`: the pill's travel is an ordinary CSS transition, so `reset.css`
  collapses it. The language's landing animation is a `@keyframes` and is collapsed the same
  way. ADR-0016's JavaScript gate on the theme's circle is untouched — `reset.css` cannot reach
  that one, which is the whole reason it is in JavaScript.

## Out of Scope

- Any change to the paper: the Sheets, the Blocks, the type scale and the PDF are untouched.
- Any font work. Every glyph is already subset (ADR-0024).
- A View Transition on the **Mode** swap. ADR-0017 leaves it open and it stays open.
- Any new Toolbar action. It is the same five. The Command Bar in `docs/todos/ideas.md` is the
  next piece of work, not this one.

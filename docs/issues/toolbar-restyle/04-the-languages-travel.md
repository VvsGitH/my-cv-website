# 04 — The language pill travels across the navigation

Status: ready-for-agent

Depends on: 03.

## Goal

Make the language pill animate from where it was on the page the reader left, using
`sessionStorage` and no View Transition.

## Why

Switching language is a real navigation to another document. The theme's swap has a circle
(ADR-0016); the language's had nothing, and a hard cut on the one control that shows which
language you are reading is the thing the brief singles out.

`@view-transition { navigation: auto }` would do it in two lines of CSS. The brief rules it out
by name, and this is the alternative it specifies.

## Files

- `src/components/chrome/Toolbar.astro` — the `is:inline` script
- `src/components/chrome/LocaleSwitch.astro` — the click that stores
- `src/components/chrome/toolbar.css` — the `@keyframes`

## Detail

**On the way out.** A click on either language link writes the **departing** page's Locale to
`sessionStorage` under one key. It is a plain delegated listener in the same `is:inline` script,
not an island — see the spec's architecture note on why these two halves stay together.

**On the way in**, before the paint:

```
read the key
clear the key                      ← unconditionally, so a reload never re-animates
if absent            → do nothing
if === this Locale   → do nothing  ← a reload, or a link to the page you are on
otherwise            → write data-locale-from="<departing locale>" on the bar
```

**Pre-paint, and that is the decision.** `client:idle` runs after the first paint: a hydrated
island would find the pill already painted at its destination and would have to jump it
backwards before animating forwards. This script therefore joins the two `is:inline` scripts
`BaseLayout.astro` already runs for the theme and the Mode, and for the same reason. Reuse
their shape: a `try`/`catch` around the storage access, because private modes throw on read as
well as write, and a failure there must leave the pill at rest rather than break the bar.

**The animation** is a one-shot `@keyframes` on `.toolbar-locale::before`, from the departing
half's position to the resting one, running only under `[data-locale-from]`. The resting
position is still what the `:has(> :last-child[aria-current])` rule says — the keyframe animates
*to* it, it does not replace it. Two rules, one per direction, because there are exactly two
Locales and a generated offset would be more machinery than the case has.

Clear `data-locale-from` on `animationend` so nothing re-runs on a later reflow, or set it to
`animation-fill-mode: none` and let the rule's own state take over — either is fine, but say
which in the Comments and why.

**The brief accepts the gap.** *"accettiamo che per un breve delta nessuna delle due lingue sia
selezionata"* — that delta is the pill in flight, between the two halves. It is not a bug to be
tuned away.

**Reduced motion needs nothing extra.** `reset.css` collapses animation durations across `*`,
which reaches a `@keyframes` — unlike ADR-0016's `Element.animate()`, which is why *that* gate
is in JavaScript. Confirm it collapses rather than assuming it, and record the check.

## Acceptance

- From `/it/`, clicking `EN` lands on `/en/` with `data-locale-from="it"` on the bar and the
  pill travelling from the IT half to the EN half.
- The same in the other direction.
- A **direct load** of `/en/` — typed, bookmarked, or a fresh tab — has no attribute and no
  animation.
- A **reload** of either page has no attribute and no animation: the key is cleared on read.
- With `sessionStorage` unavailable, both pages render with the pill at rest and nothing throws.
- Under `prefers-reduced-motion: reduce` the pill arrives without travelling.
- `aria-current` is on the right link on both pages, with or without JavaScript.

## Out of scope

The Mode's swap, which ADR-0017 leaves un-animated and this does not change. The theme's
circle, which is ADR-0016's and ticket 03's.

## Comments

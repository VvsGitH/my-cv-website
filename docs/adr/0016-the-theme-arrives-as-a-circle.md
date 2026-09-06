# The theme arrives as a circle, and the button is where it starts

ADR-0015 gave the theme the paper. It still arrived the way a repaint arrives: `data-theme`
flipped, the browser redrew in the same frame, and nothing told the reader that the page they
were looking at was the same page. **The swap is now a View Transition** â€” the incoming theme
is revealed by a circle growing out of the control that was pressed, over 620ms.

Four things follow, and each is a decision rather than a detail.

**The circle starts at the button, not at a corner.** `docs/todos/ideas.md` asked for a corner;
the button is the better answer twice over. It ties cause to effect â€” the press is visibly what
sent the wave â€” and it survives the keyboard, which the pointer does not. `state.ts` reads
`event.currentTarget.getBoundingClientRect()` rather than `clientX`/`clientY`, because an Enter
or a Space on a focused control fires a `click` whose coordinates are `0,0` and whose
`currentTarget` is exactly right. `toolbar.spec.ts` already drives the theme that way, so a
coordinate-based origin would have shipped with a passing test and a wave from the wrong place.
The radius is the distance from that centre to the furthest viewport corner â€”
`Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))` â€” which is the smallest
circle that covers the screen from wherever the Toolbar happens to be. That matters here because
the Toolbar has two homes (ADR-0008): a rail at the inline start in Paper Mode, so the wave
crosses diagonally, and a row on the bottom edge in Reading Mode, so it opens upward.

**Nothing ever contracts.** One animation serves both directions, because the new snapshot is
layered over the old one â€” `::view-transition-new(root)` at `z-index: 1`, the old at `0` â€” and
the clip-path only ever grows. Going dark, darkness spreads; going light, the light uncovers the
dark that is standing still underneath. The symmetric alternative, expanding one way and
contracting the other, needs a second animation and an inverted stack for a difference no reader
would be able to name.

**The UA crossfade has to be turned off, or there is no wave.** `animation: none` on both root
pseudo-elements, in `tokens.css` â€” the file that already owns what flipping `data-theme` means,
and where ADR-0015 put its narrative. Not `toolbar.css`: the coding standards allow a global
stylesheet for an island's own markup, and the root snapshot tree is the document's, not the
Toolbar's. It sits outside `@media screen`, unlike the ladder above it, because a View Transition
cannot begin during a print or a headless capture; the PDF and the OG card are out of reach by
construction rather than by a query.

**Reduced motion is gated in JavaScript, and that is not the usual place.** `reset.css` collapses
transition and animation durations across `*`, and it is enough for everything else this project
animates. It reaches neither `::view-transition-*` nor a Web Animations `animate()` call, so a
reader who asked for stillness would have got the full 620ms sweep from a rule that looks like it
covers everything. `toggleTheme` therefore asks `matchMedia` itself and, when the answer is
`reduce`, skips `startViewTransition` entirely rather than shortening it. This is the same trap
the standards already record for `transition-delay` (`coding-standards.md`), one layer further out.

## Considered Options

- **A `transition` on the five semantic tokens.** Rejected: a custom property does not transition
  without `@property`, and even registered it would cross-fade every surface independently â€” a
  soup, not a gesture. It would also have had to be excluded from `print` by hand, which the
  ladder currently gets for free.
- **`clip-path` on a real overlay element painted by the Toolbar island.** Works without the API,
  and was rejected on cost: the overlay has to be inserted, positioned above fixed chrome, kept
  out of the a11y tree, out of `print`, and torn down â€” against `startViewTransition`, which
  snapshots the whole document and removes itself.
- **The corner origin, as written in `ideas.md`.** Rejected above; recorded here because the todo
  file said otherwise and the divergence is deliberate.
- **Astro's `<ClientRouter />`.** Not considered seriously. It is for navigations, and this project
  has none worth animating; the theme swap is a same-document DOM change and calls the API directly.

## Consequences

- **The Aside is what does not move.** The cream panel is the same colour in both themes
  (ADR-0015), so as the circle sweeps past it the two snapshots agree there and it sits still while
  the ground changes around it. That was a constraint; it is now the effect's best moment. The
  Toolbar, pinned to the same light ink for the same reason, behaves the same way.
- **The fallback is the old behaviour, exactly.** No `startViewTransition` (Firefox before 144), or
  a reader who asked for reduced motion, and `applyTheme()` runs on its own â€” the instant repaint
  this project shipped before. There is no second code path to keep correct.
- **`toggleTheme` now takes the click event**, which it always received and ignored, so
  `Toolbar.tsx` is unchanged. `applyTheme` is the callback handed to the transition, which keeps
  the `data-theme` write, the `color-scheme` write and the `localStorage` write in one atomic step
  between the two snapshots.
- **`ready` is allowed to reject.** A second toggle skips the first transition and rejects its
  promise; the `.catch` swallows it because a superseded animation is not an error.
- **The tests pin the gate from both ends** â€” `toolbar.spec.ts` asserts a View Transition starts
  normally and does not start under reduced motion, by wrapping `document.startViewTransition` in
  an init script rather than by timing anything. Note that `test.use({ reducedMotion: 'reduce' })`
  does **not** reach `matchMedia` in this Playwright version, and would have asserted the gate
  against a query that is never true; `page.emulateMedia` does.

## Amended

**2026-09-06.** The Toolbar became a sticky bar at the top of the page (ADR-0025). The decision
above holds whole — the swap is still a View Transition, the circle still grows from
`event.currentTarget.getBoundingClientRect()`, the reduced-motion gate is still in JavaScript for
the reason given, and one animation still serves both directions. Four sentences of it are now
false, and all four are about *where* things are rather than *what* they do.

- **The paragraph on the circle's two origins describes a Toolbar that no longer exists.** It reads
  *"a rail at the inline start in Paper Mode, so the wave crosses diagonally, and a row on the
  bottom edge in Reading Mode, so it opens upward"*. Neither shape exists. There is one bar, at the
  top of the page in both Modes, and the wave now opens **downward** from wherever in that row the
  activated half of the theme pair sits — the inline end at every width. The radius arithmetic is
  untouched and is what makes that work without a second case: it is still the smallest circle that
  covers the screen from wherever the control happens to be.
- **The three `::view-transition-*(root)` rules moved to `src/components/chrome/toolbar.css`.**
  This ADR argues them into `tokens.css` by name — *"Not `toolbar.css`: … the root snapshot tree is
  the document's, not the Toolbar's"* — and the owner moved them anyway, so that the whole reveal,
  the circle's own narrative comment included, sits beside the component that starts it. The
  argument was about ownership, not about behaviour: both files are plain stylesheets in the same
  cascade, and the move puts the rules in `components` where `global.css`'s
  `@import … layer(base)` had them in `base`. Nothing measured changed — nothing else in the tree
  styles a root snapshot, so there is no rule for the later layer to start winning against. Read
  the paragraph as a record of why it was once the other way.
- **`state.ts` is deleted; `revealFrom`, `applyTheme` and `swapTheme` live in
  `chrome/ThemeSwitch.tsx`.** Every reference to `state.ts` and to `Toolbar.tsx` above should be
  read as pointing there.
- **`applyTheme` takes its target instead of toggling, and the sweep is 500ms rather than 620.** A
  radiogroup selects a value; it does not flip one, and pressing the already-checked half is a
  no-op that starts no transition at all. The easing is `ease-in`. `toolbar.spec.ts` still pins the
  gate from both ends, and its `page.emulateMedia` warning still applies.

**One thing this ADR did not have to consider and now does:** the document opts into
**cross-document** View Transitions, `@view-transition { navigation: auto }` in `reset.css`, for the
language pill's travel between the two Locales (ADR-0025). The `animation: none` on both root
snapshots above is what keeps the two from colliding — a navigation gets no root crossfade either,
so the pill is the only thing that moves — and the reduced-motion opt-out for that one is
`@view-transition { navigation: none }` in CSS, not the JavaScript gate this ADR argues for. The
gate here is still in JavaScript, and still for the reason stated: `reset.css` reaches neither
`::view-transition-*` nor `Element.animate()`.

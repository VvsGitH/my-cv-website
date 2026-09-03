# The Aside takes the theme, and the cream becomes one end of a pair

ADR-0015 decided that the theme reaches the paper **and stops at the cream**: the Aside's panel,
and the Toolbar that borrows its surface, were the same `#fef9e0` in both themes, and re-declared
the light inks locally so nothing printed white text on cream. **The cream now moves with
everything else.** `--color-aside-bg` and `--color-aside-accent` are ordinary themed pairs —
`#fef9e0` / `#520d33` and `#efdf9e` / `#771f4e` — rebound by the same ladder as the page and the
paper, and every ink on the panel simply follows the theme it is printed on.

That reverses this project's one deliberate exception, and ADR-0015 named the reversal as the
option it would not take: *"Darkening the Aside too, and re-pitching the whole Sheet. Not
considered seriously — the cream panel is the CV's one piece of visual identity, and it is what the
printed document looks like."* The second half of that sentence is still true and is why print is
untouched (below). The first half was a preference, and the owner changed it.

## What the exception cost, and what deleting it removes

The cream was one line of design and five mechanisms. All five are gone:

- **`--color-aside-heading` / `-text` / `-muted`** — the indirection layer ADR-0017 had to add so
  the pins could lift in Reading Mode, where there is no panel. `Sheet.astro` named those; it now
  names nothing, because there is no case to distinguish.
- **The Reading Mode rebinding block** in `tokens.css`, which pointed those three plus
  `--color-signature` back at the semantic tokens. `html[data-mode='reading']` no longer touches a
  colour at all.
- **`--color-cream-muted` and `--color-muted`.** The grey existed only to answer to the cream. With
  the panel themed there is nothing for it to answer to, and its two consumers — the proficiency
  bars and the focus ring — read `--color-text` instead. The token is deleted rather than rebound:
  ADR-0015's amendment had already reduced it to "`--color-text` except on the cream", so removing
  the cream removed the exception and the name with it.
- **`--color-accent`,** which was theme-invariant for the same reason the panel was. It is
  `--color-aside-accent` now, named for the surface it belongs to and paired like it.
- **The Toolbar's four pins,** and with them the last place in the tree that re-declared a semantic
  token locally.

`--color-signature` keeps its pair but loses its special case: it was consulted only in Reading
Mode, because on paper the cream underneath it ignored the ladder. Now it is read in both Modes
like any other themed ink, so `--color-signature-themed` goes too.

## The Toolbar's two dressing rules were held up by the pins

The cluster's border was `--color-accent` — a warm ring on cream — and its shadow was
`color-mix(in oklab, var(--color-heading) 18%, transparent)`, dark only because `--color-heading`
was pinned to the light ramp beside it. Unpinning both without touching them left a border the
same colour as its own background and a **near-white glow** on a dark page, which is a shadow
pointing the wrong way.

**The border is deleted and the shadow is a literal black:** `0 0 8px oklch(0% 0 0 / 0.45)`, the
same shape the OG card's `.paper` already uses. A shadow is dark in both themes by definition and
has no light end of a ramp to be paired against, so a literal is the honest spelling — the
alternative was for a component to read `--color-heading-light`, a raw pair, which the token block
says no component does.

With the border gone, `--toolbar-border-size` is deleted and `--toolbar-block-size` drops the
`2 * var(--toolbar-border-size)` term. That matters beyond the cluster: the Colophon reserves the
Toolbar's berth from that formula (ADR-0013) and the narrow tier's `scroll-padding-block-end` reads
it for WCAG 2.4.11, so leaving the term would have over-reserved by 2px against a border that no
longer exists.

## Nothing about print or the card changes

The whole ladder still sits inside `@media screen`, so under `print` the base values — the light
ones — are what remains, and the panel prints cream exactly as before. `render-captures.mjs` opens
a fresh context with empty storage, so the generated PDFs were never reachable from a reader's
theme either. ADR-0015's first Consequence holds verbatim; it is the reason "what the printed
document looks like" survived the reversal that changed everything on screen.

`src/pages/[locale]/og.astro` gains one raw-pair read, `--color-aside-accent-light` for the card's
subtitle, alongside the `--color-main-bg-dark` and `--color-heading-dark` it already had. The card
is a fixed dark ground with a light Sheet on it regardless of theme, so the pairs are the right
material there; each of the three is commented at its call site.

## What replaces the pin as the safety net

ADR-0015's last Consequence read: *"A themed token is only safe where the surface under it is
themed too."* That is now trivially satisfied — every surface is themed — and the failure mode it
guarded against is gone by construction rather than by pinning. What is left to get wrong is
narrower and both halves are measured on the built site:

| | light | dark |
|---|---|---|
| Aside body copy on its own panel | 8.69:1 | 7.95:1 |
| Aside heading on its own panel | 15.08:1 | 12.80:1 |
| Signature on its own panel | 8.80:1 | 11.35:1 |
| Focus ring, worst surface (hovered Toolbar button) | 6.89:1 | 5.49:1 |
| Proficiency bar, fill against its own 20% track | 6.25:1 | 5.46:1 |

`toolbar.spec.ts` is rewritten around the new invariant. The old test asserted the panel and its
ink *did not move* — the mechanism — and had to go. The two things worth keeping are that the ink
clears 4.5:1 on the panel **in both themes** (not just the dark one the pin was protecting), and
that page, paper and panel stay three distinct surfaces on both ends of the ramp. The second is the
assertion the cream used to make for free: nothing now holds the panel apart from the paper, and a
`--color-aside-bg-dark` that landed on the paper's own colour would stop reading as a panel. Both
were verified by mutation — setting the dark panel to `--color-main-bg-dark` fails the new test in
both Locales.

## Consequences

- **`tokens.css` has no local re-declaration left anywhere in the tree.** Every colour resolves on
  `:root` through one ladder, which is what ADR-0015 wanted in the first place and could not have
  while one surface refused to participate.
- **`--color-muted` is gone and the palette is five semantic tokens plus two Aside surfaces.** The
  proficiency bar's track is still a `color-mix` off its own fill, so the two halves cannot drift;
  the ratio is unchanged at 20% and reads higher than it did, because the body ink is stronger than
  the grey it replaced.
- **The hue rule in `spec.md` is retired.** It said the inks sit on hue 264, the paper surfaces on
  ~97 light and 259 dark, and that *"new colours should pick a side rather than a third hue"*. The
  panel's dark end is hue 352 and was chosen on the eye, so the rule no longer describes the
  palette and is deleted rather than left as an aspiration nothing follows. What governs a new
  colour now is the contrast table above and nothing else.
- **ADR-0008's focus-ring entry is on its third token.** `--color-heading` → `--color-muted` →
  `--color-text`. Its 3:1 conclusion has held through all three and has the most headroom it has
  ever had; that ADR carries the new measurements.
- **The Toolbar is no longer "the same surface the Aside is on paper" in any pinned sense** — it
  simply reads `--color-aside-bg`, and follows the theme because that token does. CONTEXT.md's
  Toolbar entry never claimed otherwise.
- **Open: the Toolbar's toast inverts with the theme now,** a dark chip on a light page and a light
  chip on a dark one, where the pin made it dark in both. Left as it is deliberately: it inverts
  against the *page* in each theme, which is what a toast should do, and the pin only ever existed
  to make it invert against a cream that is gone. Measured 16:1 light, 13.9:1 dark.
- **Open: neither the shadow nor the deleted border has a test.** The near-white glow shipped and
  was found by hand, reading `getComputedStyle` off the built site. An assertion that the shadow's
  lightness stays dark in both themes would close it; it is not written.

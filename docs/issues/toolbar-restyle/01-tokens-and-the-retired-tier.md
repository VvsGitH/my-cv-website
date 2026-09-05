# 01 — Tokens: promote the gutters, retire the tier

Status: ready-for-agent

Depends on: nothing.

## Goal

Make `tokens.css` describe one Toolbar shape instead of two, and expose the two measurements
the rule's width needs.

## Files

- `src/styles/tokens.css`
- `src/components/structure/Document.astro`

## Detail

**Promote to `:root`**, beside `--sheet-width` where the arithmetic they feed belongs:

- `--sheets-gap: 1.5rem` and `--sheets-pad: 0.5rem`, moved up from `.sheets`. They already set
  both the fit and the wrap threshold (ADR-0017); the Toolbar's rule is the third reader, and a
  token two components share does not belong to one of them.

**Add:**

- `--toolbar-block-size: 3.25rem`. Same name, different meaning: it is now the bar's own height,
  a literal, not a formula over a control count. ADR-0008's note that it "does not encode the
  control count" finally becomes true by construction.
- `--font-size-toolbar: 0.875rem`. The bar's label size — Atkinson, independent of the paper's
  type, matching the 14.5px of `docs/issues/toolbar-restyle/toolbar-mockups.html` concept 2.

**Delete:** `--toolbar-button-size`, `--toolbar-inset`, the old `--toolbar-block-size` formula,
and the whole `@media screen and (width < 53.5rem)` block at the foot of the file. That query
existed to grow the touch target and to clear a notched phone's home indicator on the
bottom-edge row; there is no bottom-edge row.

`--font-size-button` stays — one size for every glyph in the bar. Tune it against
`--font-size-toolbar` so the icon reads as optically equal to the label rather than larger; the
mockup's ratio is 17px glyph to 14.5px label.

**Neither new token is rebound under `html[data-mode='reading']`**, and that is deliberate:
`--font-size-button` already sits outside that block for the same reason. The Chrome does not
follow the Mode.

**Leave the three `::view-transition-*(root)` rules alone.** ADR-0016 stands (spec, decision 2)
and they are what makes the theme's circle possible.

**`Document.astro`:** drop the two custom-property declarations from `.sheets` and keep the
comment that explains what they set, reworded to say where they went. Everything else — the
wrapping line, the `zoom`, the print layer's literal `padding: 0` — is untouched.

## Acceptance

- `npm run build` passes.
- Paper Mode measures identically at 375px, 856px, 1024px, 1280px and 1720px: promoting the two
  gutters must move nothing on the paper. `paper.spec.ts` and `responsive.spec.ts` stay green.
- `grep -rn 'toolbar-inset\|toolbar-button-size\|toolbar-border-size' src/` returns only the
  hits in `toolbar.css` and `Colophon.astro` that tickets 03 and 05 delete.
- `grep -rn '53.5rem' src/` returns only `toolbar.css` and `Colophon.astro` — the `tokens.css`
  occurrence is gone.
- `npm test` still passes except where it asserts the old tier behaviour, which tickets 03 and
  06 own.

## Out of scope

The Toolbar's own stylesheet and markup, and the `scroll-padding` inversion — all ticket 03.

## Comments

# 05 — Clear away what the floating cluster left behind

Status: ready-for-agent

Depends on: 03.

## Goal

Delete the accommodations the rest of the site made for a cluster that floated over it.

## Files

- `src/components/chrome/Colophon.astro`

## Detail

The Colophon reserves a rectangle at the foot of the page for the bottom-edge row — ADR-0013's
decision to reserve the berth rather than indent out of the column to dodge it. Below 53.5rem it
pays `--toolbar-block-size + --toolbar-inset + --space-xl` of `padding-block-end` for a row that
no longer exists at any width, and reads two tokens ticket 01 has already deleted.

Delete the `@media screen and (width < 53.5rem)` block and the comment that justifies it.
Nothing replaces it: the bar is in flow at the other end of the document and reserves its own
space by being there.

Everything else in the Colophon stands — the `max-width: 200ch`, the Reading Mode measure, the
tracking, the underlined channels, the print layer. **Its register is the one the new bar is
modelled on; do not adjust it to match the bar.** If the two look out of step, the bar is what
moves.

## Acceptance

- No `--toolbar-*` token is read anywhere outside `toolbar.css`.
- `grep -rn '53.5rem' src/` returns nothing at all once this lands.
- The Colophon's last line clears the foot of the page at 375px in both Modes, with nothing
  floating over it — check with `elementsFromPoint` on that line, not by eye.
- `npm run build` is no worse than ticket 03 left it.

## Out of scope

`Document.astro`'s gutter tokens, which ticket 01 owns. The test that asserts the berth, which
ticket 06 removes — expect `colophon.spec.ts` to be the one place that still knows about it.

## Comments

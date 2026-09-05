# 06 — Rewrite the suite around the new anatomy

Status: ready-for-agent

Depends on: 03, 04, 05.

## Goal

Re-point the tests at one shape, six controls and a rule with a measurable width — and pin the
two things this rewrite can break in silence.

## Files

- `tests/support/page.ts`
- `tests/toolbar.spec.ts` — a rewrite, not an edit
- `tests/mode.spec.ts`, `tests/pdf.spec.ts` — re-point selectors
- `tests/colophon.spec.ts`, `tests/responsive.spec.ts` — pruning only
- `tests/paper.spec.ts`, `tests/locales.spec.ts` — untouched

ADR-0010 governs: assert externally observable behaviour of the **built** artifact, never a
component's internals. `npm test` runs `npm run build && npm run captures:render` first.

## Detail

**`support/page.ts`.** `toolbar()` points at the bar's root; `readingMode()` still clicks
`.toolbar-mode`. `VIEWPORTS.twoUp` keeps computing the threshold rather than writing it down —
it is now the rule's threshold as well as the flex line's, which makes it more load-bearing, not
less.

`openPainted()` ends with `expect(page.locator('astro-island[ssr]')).toHaveCount(0)`. There are
three islands now instead of one, so this assertion gets **stronger**, not vacuous — but check
it actually waits for all three rather than passing on the first frame.

**`toolbar.spec.ts`.** Per Locale: the accessible name of every control; `aria-checked`
following `[data-theme]` on the theme pair; `aria-current` following the route on the language
pair; the Mode control's accessible name being **exactly** its visible text, with no `title` and
no `aria-label`; share copying the URL and swapping its glyph; download pointing at this
Locale's PDF **and that file existing in `dist/`** (`distPathForHref` + `existsSync` — keep it,
it is the assertion that catches a renamed capture); the toast announcing through
`role="status"`.

**The assertion that matters most — the rule's width.** It is the only thing keeping the
step-function `clamp()` honest, and it must be measured on **both sides of the threshold**:

| viewport | expected `.toolbar-rule` |
|---|---|
| 1721px | 1720px |
| `VIEWPORTS.twoUp` (1720px) | 1720px |
| 1719px | 856px |
| `VIEWPORTS.stacked` (1024px) | 856px |
| any width, Reading Mode | `--reading-column-max` |

The 1719/1720 pair is the whole point: it is where a missing `+ 1px`, a too-small multiplier and
a media query at the wrong number all show up, and nothing else in the suite would see any of
them.

**Contrast, in both themes.** Reuse `tests/support/contrast.ts` and pin all three rows of the
spec's table:

- the active label on the pill, ≥4.5:1;
- **the pill's border against `--color-page-bg`, ≥3:1** — the 1.4.11 assertion, and the reason
  the border exists at all;
- the bar's labels ≥4.5:1 over **every** surface the bar can float over: the page, the paper,
  the Aside's panel and the accent. That is what "no background" costs, and no other test in the
  suite can see it.

The pill's fill against the page will measure ~1.1:1 and **that is expected** — assert the
border, not the fill, and say so in a comment so nobody later "fixes" the wrong number.

**Focus, not obscured.** Tab through the controls with the page scrolled and assert none is
behind the sticky bar — the 2.4.11 assertion that used to be about the bottom row, pointed at
the top one. Note the theme pair is **one** tab stop; test the arrow keys separately.

**The stuck state.** `data-stuck` is absent at `scrollY = 0` and present once scrolled; the
shadow follows. This is the only behaviour in the bar that depends on an observer, so it is the
only one that can fail on a slow frame — give it a real `expect.poll` rather than a timeout.

**The language's travel.** From `/it/`, clicking `EN` lands on `/en/` with `data-locale-from`
present; a direct `goto('/en/')` has no such attribute. Assert the attribute, not the pixels —
an animation's midpoint is not a stable thing to measure.

**Prune.** `colophon.spec.ts` loses "leaves the Toolbar its berth at the foot of the scroll".
`responsive.spec.ts` loses the rail-versus-row assertions per tier and keeps everything about
the paper — which is most of it, and none of it should move. `pdf.spec.ts` keeps its theme and
Mode clicks but points them at the new controls: `.toolbar-theme [aria-checked="false"]` rather
than `.toolbar-theme`, which is now the group. `mode.spec.ts`'s `a[hreflang]` now matches two
links and fails strict mode — name the half it means.

## Acceptance

- `npm test` is green.
- `npm run build` is green — including `astro check` over `tests/`, which ticket 03 left red.
- Every assertion listed above exists and fails if its subject is broken. Verify at least the
  rule's width and the pill's border by deliberately breaking each once and watching the test
  go red; record that in the Comments.

## Out of scope

The record — ADRs and glossary — which is ticket 07.

## Comments

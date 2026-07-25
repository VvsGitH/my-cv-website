# 12 — Playwright E2E tests

Status: ready-for-agent

## Goal

Establish the single test seam: Playwright end-to-end against the built output (rendered Locale pages + generated PDFs). Tests assert external behavior only — never component internals.

## Tasks

- Run against the `astro build` output (served/previewed locally), the same artifact CI deploys.
- **Content & structure:** `/` (IT) and `/en/` render the expected Blocks in the correct Sheet/column; IT vs EN text differs where expected.
- **Toolbar:** language toggle navigates to the equivalent route in the other Locale; theme toggle changes the background but not the Sheet surface; share writes the current URL to the clipboard; download links to the correct per-Locale PDF filename.
- **Responsive tiers:** viewport emulation asserts 2-up (≥1280px), stacked (768–1280px), Reading Mode + operable Drawer (<768px).
- **PDF validity:** each generated PDF is exactly 2 A4 pages, has CV fonts embedded, and contains expected key strings for its Locale.
- **Accessibility smoke:** Toolbar and Drawer keyboard-operable and labeled.
- **No content overflows its Sheet** — see the handover from ticket 11 below.
- Wire the suite into the CI job (ticket 09) after the PDF render step.

## Acceptance

- Suite passes against a fresh build for both Locales and fails on a regression in any of the above.

## Depends on

- 07 (interactive site), 08 (PDFs). Runs in CI from 09.

## Comments

### Handed over from ticket 11 — the overflow assertion

Ticket 11's first full Italian draft **overflowed Sheet 1 Main by 15.4px**:
the last bullet would have been clipped at the page edge, and nothing would
have failed. `astro check` cannot see it, and the PDF still reported 2 pages
because the spill is smaller than the sheet's own bottom margin. It was found
by measuring on purpose, with a throwaway script — which means the next time
either Locale's wording grows, nothing catches it.

This is the highest-value assertion missing from the suite, and it is cheap.
For each Locale, each Sheet, each column, measure the last Block's bottom
against the paper and require it to be inside:

```js
// per Sheet: the last Block in each column must sit inside the paper
const lastBottom = (root) =>
  Math.max(...[...root.querySelectorAll(':scope > .block')]
    .map((b) => b.getBoundingClientRect().bottom));

expect(sheetRect.bottom - lastBottom(main)).toBeGreaterThan(0);
expect(sheetRect.bottom - lastBottom(aside)).toBeGreaterThan(0);
```

Two traps worth knowing before writing it:

- **Don't assert against the Aside *panel* bottom.** Privacy is
  bottom-anchored with `margin-block-start: auto` (ticket 05), so on Sheet 2
  the last Block sits flush with the panel foot and the slack is legitimately
  `+0`. Measure to the Sheet, not the panel — or allow exactly 0 there.
- **Await `document.fonts.ready` first.** Line wrapping — and therefore every
  one of these numbers — depends on the real faces being loaded.

Reference values at the time of ticket 11 (slack in px, last Block to Sheet
bottom), useful as a regression baseline:

| | aside → sheet | main → sheet |
|---|---|---|
| EN Sheet 1 | +105.6 | +56.6 |
| EN Sheet 2 | +19.4 | +98.7 |
| IT Sheet 1 | +81.9 | +26.4 |
| IT Sheet 2 | +19.4 | +112.0 |

Italian Sheet 1 Main is the tight one at +26.4px — under two lines of prose.
Treat it as the canary.

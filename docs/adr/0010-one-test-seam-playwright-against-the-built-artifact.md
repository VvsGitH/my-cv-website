# One test seam: Playwright end-to-end against the built artifact

The project has exactly one kind of test: Playwright, run against the output of `astro build` — the rendered Locale pages and the generated PDFs, the same artifact CI deploys. Tests assert **externally observable behavior** and nothing else: never component internals, never CSS class names as a contract, never file structure. A test should survive any refactor that leaves the rendered CV and the PDFs unchanged.

This is the highest available seam, and it reuses a dependency the build already needs (ADR-0001). A static two-page CV has no units worth isolating; what can actually break is the rendered document.

## Considered Options

- **Component tests (Vitest + Testing Library).** Rejected: the components are presentational and take typed data, so a component test would assert that a template renders its props. The failures that matter here — a Block overflowing its Sheet, a font missing from the PDF, a tier laying out wrong — are all only visible in the assembled artifact.
- **Visual regression / pixel diffing.** Deliberately out of scope. Fidelity against the reference CV is checked manually against the reference PNGs; a pixel-diff suite would need a baseline per tier per Locale per theme and would fail on font-rendering noise.
- **Asserting a slack floor rather than `> 0`.** Rejected: the invariant is "it fits", and a floor would be a second number to keep in sync with every content edit.

## The overflow assertion

The highest-value assertion in the suite, and the reason it exists: Italian's first full draft **overflowed Sheet 1 Main by 15.4px**. `astro check` passed, and the PDF still reported two A4 pages because the spill is smaller than the sheet's own bottom margin. Nothing would have caught it.

It was then rehearsed against a real regression rather than merely written — adding one sentence to the Italian About Block spilled Sheet 1's Aside by 8.1px, `astro check` passed, the PDF still reported two A4 pages, and the suite failed with `Sheet 1 aside runs 8.1px past its panel`.

Its design, each part load-bearing:

- **Measure the Aside to its own panel, the Main to the Sheet.** The two reference lines differ by ~20px. The Aside against the panel is the stricter and more meaningful check.
- **Await the fonts first.** Line wrapping — and therefore every number — depends on the real faces being loaded.
- **Set a viewport ≥ 53.5rem.** Below it the page is in Reading Mode, where the Asides are `display: none` on the paper: the test would measure a column that is not there. This trap applies to **every** paper measurement in the suite, including the two-column heading alignment.
- **Assert `> 0`, not a floor.**

**The canary is Sheet 1's Aside, and it has almost no air left.** Remeasured after the designed type scale, which grew the prose faster than the paper grew under it: IT `+5.0` / EN `+4.0` on Sheet 1's Aside, against `+98.5` for Sheet 1 Main and `+57.2` / `+64.4` for Sheet 2 Main.

## Consequences

- **`npm test` builds and captures first, through a `pretest` hook.** The suite reads the built pages *and* the rendered PDFs off disk, so without it a local run could pass against a `dist` that no longer matched the source — the one failure mode a suite like this must not have. **CI calls `npx playwright test` instead**, because its own steps have already done that work, and keeping them separate is what makes a build failure read as a build failure.
- **The PDF text assertion inflates content streams rather than taking a PDF text reader.** Chromium writes a `ToUnicode` CMap for every font it embeds, so `tests/support/pdf.ts` walks the content stream directly instead of adding a 15MB dependency for one assertion. Two traps if it ever needs touching: **Type0 fonts address glyphs with two-byte codes and Type3 with one** — getting that wrong makes half the characters come out blank — and Chromium positions one glyph at a time, so the extracted run has no usable word spacing and both sides of a comparison have their whitespace stripped. The Type3 branch is dead code today (ADR-0024) and deliberately kept: it costs a line and it is what a re-added CFF face would need.
- **"Fonts embedded" is asserted as embedding *and* by name.** The suite asserts that no font relies on a face the reader must supply, that every named font is one of the CV's, and that **none of the CV's faces is missing** — the set, by name, in both directions. Getting there was ADR-0024: while Garet and Now were CFF, Chromium redrew them as unnamed Type3 faces (ADR-0009) and the only handle on them was **counting Type3 fonts**, which left a hole an entire re-set CV could walk through. Every face is TrueType and named now, so the count is gone and the assertion is stricter than the thing it replaced. The two halves are kept as separate expectations for their error messages: one says *`Courier New` is not one of the CV's faces*, the other says *these faces stopped reaching the PDF*.
- Expected PDF strings are derived from `src/content/`, not listed in the test: each Locale's PDF must contain every visible section heading of its own Locale and none unique to the other. Continuation headings are excluded — they are screen-reader-only copies (ADR-0005) and prove nothing about which file you are holding.
- **The Drawer's toggle has no accessible name in Paper Mode**, because it is `display: none` above 53.5rem and therefore absent from the accessibility tree entirely. That is correct — four controls on paper, five in Reading Mode (`CONTEXT.md`) — but an accessible-name assertion written at the default viewport fails against it. Name assertions live in the Reading Mode block; the Paper Mode block asserts the toggle is *absent*.
- The suite is wired into `deploy.yml` between `captures:render` and the artifact upload, so a regression publishes nothing.

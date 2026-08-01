# 12 — Playwright E2E tests

Status: done

## Goal

Establish the single test seam: Playwright end-to-end against the built output (rendered Locale pages + generated PDFs). Tests assert external behavior only — never component internals.

## Tasks

- Run against the `astro build` output (served/previewed locally), the same artifact CI deploys.
- **Content & structure:** `/` (IT) and `/en/` render the expected Blocks in the correct Sheet/column; IT vs EN text differs where expected.
- **Toolbar:** language toggle navigates to the equivalent route in the other Locale; theme toggle changes the background but not the Sheet surface; share writes the current URL to the clipboard; download links to the correct per-Locale PDF filename.
- **Responsive tiers:** viewport emulation asserts 2-up (≥1632px), stacked (816–1632px), Reading Mode + operable Drawer (<816px), and no sideways scroll at any supported width from 375px up.
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

### Handed over from ticket 17 — the baseline moved, and one trap above is stale

Two things in the handover from ticket 11 no longer hold.

**Privacy is no longer bottom-anchored.** Ticket 17 deleted
`.aside .block--privacy { margin-block-start: auto }`, so Sheet 2's Aside no
longer sits flush with the panel foot — it ends ~207px above it, and the empty
cream band below the signature is intended. The "allow exactly 0 there"
carve-out can go: every column now has real positive slack, and asserting
against the **panel** bottom rather than the Sheet is the stricter and more
meaningful check for the Aside. Pick one reference line and say which in the
test; the two differ by ~20px.

**The reference table is out of date twice over** (tickets 16 and 17). Current
slack, measured with all eight faces `loaded` — Aside to the panel's bottom
edge, Main to the Sheet's:

| | aside → panel | main → sheet |
|---|---|---|
| IT Sheet 1 | +56.2 | +44.6 |
| IT Sheet 2 | +206.8 | +32.0 |
| EN Sheet 1 | +42.8 | +60.0 |
| EN Sheet 2 | +222.2 | +67.4 |

**The canary moved.** Italian Sheet 1 Main is no longer the tight one; the
tightest columns are now IT Sheet 2 Main (+32.0) and EN Sheet 1 Aside (+42.8).

### Also from ticket 17 — assert the two columns' first headings align

Sheet 1's Aside and Main first section headings sit on the same line
(currently y≈280, 0.11px apart). That is now a stated design intent rather
than a hand-tuned coincidence, and it is held up by four independent values —
the Aside's `padding-block-start`, the photo Block's height, the `--space-xl`
scale step, and the header's own height — with `--main-first-heading-gap`
derived from all four. Any of them drifting breaks the alignment silently.

> **Amendment.** `--space-xl` was 42px when this ticket shipped; the user
> later hand-tuned the scale (`docs/issues/cv-website/17-spacing-scale.md`,
> "Extras beyond the ticket: named tokens") and it is now 40px. The y≈280 /
> 0.11px figures above, and the slack table below, predate that change and
> were not remeasured — `--main-first-heading-gap` is a `calc()` in
> `tokens.css` so it should still self-correct, but measure on the live page
> rather than assume before writing the actual test.

```js
expect(Math.abs(asideFirstHeadingY - mainFirstHeadingY)).toBeLessThanOrEqual(1);
```

### From ticket 06 — the responsive tiers, and one trap for every test here

The three-tier assertions and the Drawer's behaviour are written out in
`06-responsive.md`'s handover, with the reference numbers measured when it
landed (1280 → two 604px Sheets on one row; 1024 → one 793.7px Sheet, never
enlarged; 375 → a 327px reading column with the portrait first).

**The trap applies to every measurement in this file:** below 51rem the page is
in Reading Mode, where the Asides are `display: none` on the paper. Any test
that measures paper — the slack table above, the two columns' first headings —
must set a viewport ≥ 51rem first, or it will measure a column that isn't
there. Playwright's default 1280×720 is fine; an explicit
`test.use({ viewport: … })` is better, since the number is load-bearing rather
than incidental.

### Closing notes — what shipped

40 tests in `tests/`, run by `npm test` against `astro preview` on a pinned
port (4322). Four files, one per area the ticket names: `paper.spec.ts`
(structure, overflow, heading alignment), `toolbar.spec.ts` (the four actions,
the Drawer, accessible names, keyboard), `responsive.spec.ts` (the three tiers),
`pdf.spec.ts` (the generated files). Wired into `deploy.yml` between
`captures:render` and the artifact upload, so a regression publishes nothing.

`npm test` builds and captures first, through a `pretest` hook. The suite reads
the built pages *and* the rendered PDFs off disk, so without it a local run
could pass against a `dist` that no longer matched the source — the one failure
mode a suite like this must not have. CI calls `npx playwright test` instead,
since its own steps have already done that work and keeping them separate is
what makes a build failure read as a build failure.

**The overflow assertion was rehearsed against a real regression, not just
written.** Adding one sentence to the Italian About Block spilled Sheet 1's
Aside by 8.1px; `astro check` passed and the PDF still reported two A4 pages,
and the suite failed with `Sheet 1 aside runs 8.1px past its panel`. That is the
exact failure mode ticket 11 handed over.

**Two things in the handovers above were stale, and one measurement moved.**

- The wide tier is **102rem (1632px)**. The task list above said 1280px when
  this ticket was written — ADR-0006 moved it and removed `--sheet-scale` with
  it, and both have since been brought in line. A Sheet is a literal 210×297mm
  box at every width above 51rem, so the suite asserts two-up at exactly 1632
  and stacked at 1631.
- The slack table predated the `--space-xl` 42→40px hand-tune. Remeasured with
  all faces loaded, Aside to the panel's bottom edge and Main to the Sheet's:

| | aside → panel | main → sheet |
|---|---|---|
| IT Sheet 1 | +65.2 | +57.7 |
| IT Sheet 2 | +207.6 | +50.0 |
| EN Sheet 1 | +51.8 | +73.1 |
| EN Sheet 2 | +223.0 | +85.4 |

  The canary is now **IT Sheet 2 Main (+50.0)**, with EN Sheet 1 Aside (+51.8)
  just behind it. The test asserts `> 0` rather than a floor — the invariant is
  "it fits", and a floor would be a second number to keep in sync.
- The two first headings of Sheet 1 now align **exactly** (both at y=278.19, not
  the y≈280 / 0.11px in the handover). `--main-first-heading-gap` self-corrected
  through its `calc()` when the scale step changed, as ticket 17 predicted.

**On the PDF text assertion.** Ticket 08 handed over that `pdf-lib` reads
structure but not text, and that `pdfjs-dist` or content-stream inflation would
be needed. Inflation turned out to be enough: Chromium writes a `ToUnicode` CMap
for every font it embeds, including the Type3 ones, so `tests/support/pdf.ts`
walks the content stream directly rather than taking a 15MB dependency for one
assertion. Two things to know if it ever needs touching: Type0 fonts address
glyphs with **two-byte** codes and Type3 with **one** — getting that wrong is
what makes half the characters come out blank — and Chromium positions one glyph
at a time, so the extracted run has no usable word spacing and both sides of a
comparison have their whitespace stripped.

The expected strings are derived from `src/content/`, not listed here: each
Locale's PDF must contain every visible section heading of its own Locale and
none of the headings unique to the other. Continuation headings are excluded —
they are screen-reader-only copies (ADR-0005) and prove nothing about which file
you are holding.

**"Fonts embedded" is asserted as embedding, not by name.** Garet and Now come
out of Chromium as **Type3** fonts — glyph procedures with no `BaseFont` — so
they cannot be checked by name. What the suite asserts instead is that no font
in either PDF relies on a face the reader has to supply, and that every font
that *is* named is one of the CV's (Lato ×3, icomoon, Primera_Signature). A face
that failed to load would surface there as whatever system fallback Chromium
reached for.

That leaves one hole, which the count closes: since the display faces are the
unnamed Type3 ones, a CV reset entirely in Lato would satisfy everything above.
So the suite also requires at least one Type3 font per file. It is the only
handle those two faces offer.

**One trap found while writing it.** The Drawer's toggle has no accessible name
in Paper Mode, because it is `display: none` above 51rem and so is not in the
accessibility tree at all. That is correct — the Toolbar carries four actions on
paper and five in Reading Mode (CONTEXT.md) — but an accessible-name assertion
written at the default viewport fails against it. The name assertions live in
the Reading Mode block; the Paper Mode block asserts the toggle is *absent*.

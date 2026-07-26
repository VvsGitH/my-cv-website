# 08 — Build-time PDF render (Playwright)

Status: ready-for-agent

## Goal

A post-build Node script that renders one A4 PDF per Locale from the built site (ADR-0001).

## Tasks

- After `astro build`, serve/preview the built output locally.
- For each Locale (`it`, `en`): Playwright headless Chromium → `goto` the CV page → `await page.evaluate(() => document.fonts.ready)` → `page.pdf({ preferCSSPageSize: true, printBackground: true, margin: 0 })`.
- Ensure both Sheets render on their own A4 pages (`break-before: page` at the boundary; validate the 2-page split in output).
- If the live paper look lives under `@media screen`, `emulateMedia({ media: 'screen' })` before capture; otherwise keep screen/print identical.
- Write `Vito_Paparella_Santorsola_CV_IT.pdf` and `_EN.pdf` into the built assets. Do **not** commit them.

## Acceptance

- Two PDFs, each exactly 2 A4 pages, fonts embedded, cream/colored backgrounds present, visually identical to the desktop Sheets.

## Depends on

- 05 (renderable Sheets); ideally 07 for the built site.

## Comments

Two things ticket 05 left on this ticket's doorstep:

- **Do not `emulateMedia({ media: 'screen' })`.** Task 3 above offers it as
  an option; 05 took the other branch. The Sheets themselves are identical
  under both media, but the *gutter around them* (`.sheets` padding/gap in
  `CvDocument.astro`, a screen affordance) is neutralised in the `print`
  layer, along with `break-before: page` at the Sheet seam. Emulating screen
  media skips both, which pushes Sheet 1 off its page and spills each Sheet
  onto a second. Verified with a real `page.pdf()` at 05's default (print)
  emulation: exactly 2 pages, MediaBox 595×842pt. If 07's Toolbar makes
  screen emulation necessary, move those two rules rather than dropping the
  media query.
- **The signature has no self-hosted script font yet** (spec US29). It
  currently falls back to a system cursive, which headless Chromium in CI
  won't have — the PDF would render it in a default face. Needs an owner
  decision on which script face to license and self-host; blocks this
  ticket's "visually identical to the desktop Sheets" acceptance.
  **Resolved in ticket 13** — Primera Signature is now self-hosted, so this
  is no longer a blocker.

### From ticket 06 — set the viewport before you load the page

**Capture at a viewport ≥ 48rem (e.g. 1280×1600).** Below that the page lays
out in Reading Mode, where the Aside's Blocks are `display: none` on the paper
and the Drawer is closed. Chrome requests a font only when rendering needs one,
so **Lato-Italic** (Languages proficiency labels) and **Primera Signature**
(the signature) are never fetched; the print pass then needs them, and
`font-display: block` paints nothing while a face loads. The PDF comes out
missing that text and missing those two embedded fonts, with no error anywhere.
A default 800×600 headless window reproduces it every time.

`await document.fonts.ready` does **not** protect you here — it resolves
happily for a face that was never requested. Order: set viewport → `goto` →
`fonts.ready` → `page.pdf()`.

Ticket 06 verified print parity this way (both Locales, all 8112 drawing
operators identical to ticket 17's output), so this is a known-good recipe, not
a precaution.

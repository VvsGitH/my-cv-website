# 08 — Build-time PDF render (Playwright)

Status: done

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

### Implementation notes

`scripts/render-pdf.mjs`, run as `npm run pdf:render` after `npm run build`. It
starts Astro's own preview server through the JS API (`preview()` from `astro`)
rather than shelling out, and takes the base, the out dir and the Locale list
from `astro.config.mjs`. Two new devDependencies: `playwright` (the capture)
and `pdf-lib` (the guard below).

The **file name** is the one thing that is written down twice — here and in
`Chrome.astro`, which points the download control at it. Sharing it would mean
a module the `.astro` side and a plain Node script can both import, which is
more machinery than the risk deserves; both ends carry a pointer to the other,
and ticket 12 is already chartered to assert that "download links to the
correct per-Locale PDF filename".

**The portrait was missing from the first PDF of every run.** Astro's `<Image>`
is `loading="lazy"` by default, and the print pass reached the photo before the
network did — the IT capture came out with no image XObject at all while EN,
rendering second off a warm HTTP cache, had it. `document.fonts.ready` says
nothing about images, and nothing errors: the disc just prints empty. The fix
is one line next to the font wait —
`Promise.all(Array.from(document.images, (image) => image.decode()))` — which
forces the load and rejects if it fails. Left `PhotoBlock.astro` alone; making
the portrait eager would also be right (it is the LCP element), but that is a
page decision, not a capture one.

**The 2-page split is asserted, not assumed.** `assertTwoA4Pages` re-opens each
written PDF with `pdf-lib` and fails the build unless it is exactly two pages
of A4. Verified that the guard bites by capturing the forbidden branch on
purpose: with `emulateMedia({ media: 'screen' })` the IT page comes out as
**4** A4 pages, confirming ticket 05's measurement above.

**Acceptance, as measured on the output.** Both PDFs: 2 pages, MediaBox
594.96×841.92pt (A4 within Chromium's mm→px→pt rounding); 9 embedded faces —
Garet-Heavy, Garet-Book, Now-Bold, Now-Regular, Lato-Regular/Bold/Italic,
icomoon, Primera Signature; the Aside cream (`.9959 .9765 .8784 rg`) filling a
full-height rect on both Sheets, so `printBackground` is doing its job; one
image XObject (the portrait); and no Toolbar or Drawer — the only icomoon glyph
painted is the link mark in the Certifications Block, which is CV content.

Note for **ticket 12**: `pdf-lib` reads structure but not text. Asserting "key
strings per Locale" needs a text-extracting reader (`pdfjs-dist`) or an
inflate-and-scan of the content streams; Garet and Now come out as **Type3**
fonts (Chromium redraws CFF outlines as glyph procedures), which a naive
`/BaseFont` scan will not list.

Note for **ticket 09**: the CI order is `npm ci` →
`npx playwright install --with-deps chromium` → `npm run build` →
`npm run pdf:render`. Deliberately *not* an npm `postbuild` hook: that would
break `npm run build` on any machine without the browser binary.

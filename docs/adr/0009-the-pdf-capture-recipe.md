# The PDF capture recipe, and why each step is load-bearing

`scripts/render-captures.mjs` captures in a fixed order — **set the viewport → `goto` → decode every image → `document.fonts.ready` → `page.pdf()`** — at a viewport of 1280×1600 and under Chromium's default *print* emulation. Every one of those choices exists because the alternative fails **silently**: the capture succeeds, `assertTwoA4Pages()` passes, and the PDF is wrong.

This ADR is the reasoning behind the constants in that script. ADR-0001 decides *that* the PDF is captured at build time; this decides *how*.

## The four silent failures

**Capture below 51rem and two fonts vanish.** Below the Reading Mode boundary the page lays out with the Aside's Blocks `display: none` on the paper and the Drawer closed. Chrome requests a font only when rendering needs one, so **Lato-Italic** (the Languages proficiency labels) and **Primera Signature** are never fetched. The print pass then needs them, and `font-display: block` paints nothing while a face loads. The PDF comes out missing that text *and* missing those two embedded faces, with no error anywhere. A default 800×600 headless window reproduces it every time.

`await document.fonts.ready` does **not** protect against this — it resolves happily for a face that was never requested. Only the viewport does.

**Screen emulation produces four pages, not two.** The Sheets are identical under both media, but the gutter around them (`.sheets` padding and gap, a screen affordance) is neutralised in the `print` layer, along with the `break-before: page` at the Sheet seam. `emulateMedia({ media: 'screen' })` skips both, which pushes Sheet 1 off its page and spills each Sheet onto a second. Measured: the IT page comes out as **4** A4 pages. If a future change makes screen emulation necessary, **move those two rules rather than dropping the media query.**

**The portrait is missing from the first PDF of every run.** Astro's `<Image>` is `loading="lazy"` by default and the print pass reaches the photo before the network does — the IT capture came out with no image XObject at all, while EN, rendering second off a warm HTTP cache, had it. `document.fonts.ready` says nothing about images, and nothing errors: the disc just prints empty. `Promise.all(Array.from(document.images, (image) => image.decode()))` forces the load and rejects if it fails.

**Capture is not an npm `postbuild` hook.** It runs as its own `npm run captures:render` step, deliberately, because a `postbuild` hook would break `npm run build` on any machine without the browser binary.

## Considered Options

- **Make the portrait `loading="eager"` instead of decoding in the script.** It would also be right — the portrait is the LCP element — but that is a page decision, not a capture one, and it would leave the capture depending on a property of a component it does not own.
- **Assert the page count by eye.** Rejected: `assertTwoA4Pages()` re-opens each written PDF with `pdf-lib` and fails the build unless it is exactly two A4 pages. The guard was verified to bite by capturing the forbidden screen-emulation branch on purpose.
- **A shared module for the PDF filename.** The name is written down twice — here and in `Chrome.astro`, which points the download control at it. Sharing it would mean a module both the `.astro` side and a plain Node script can import, which is more machinery than the risk deserves. Both ends carry a pointer to the other, and the E2E suite asserts the download links to the correct per-Locale filename (ADR-0010).

## Consequences

- **Print parity is provable, and was proved.** The method: inflate both renderings' content streams and diff every positioned drawing operator. Both Locales came out with all **8112** operators identical. That is the only stated way to demonstrate that the PDF is the desktop rendering rather than merely resembling it — reach for it whenever a change touches the `print` layer or the Sheet geometry.
- `@media print` in `Document.astro` does not touch the paper. It resets only the screen gutter *around* the Sheets, which is why print emulation is the correct capture medium rather than a compromise.
- The A4 tolerance in the script is not slack for drift: Chromium's mm → px → pt rounding lands ~0.3pt short of nominal, so a captured page measures 594.96×841.92pt. That **is** A4.
- Garet and Now come out of Chromium as **Type3** fonts — glyph procedures with no `BaseFont` — because Chromium redraws CFF outlines as glyph procedures. Any assertion or tooling that scans `/BaseFont` will not list them (ADR-0010 records what the test suite does instead).
- After any change to the Drawer's CSS, run `npm run captures:render` **on its own, before Playwright**. A closed panel that leaks into the capture would not change the page count, so it would land in `dist/` silently (ADR-0008).
- The same script captures the per-Locale link-preview image off the same page, screenshotting the card element rather than the viewport so the card stays the one place its size is written down.

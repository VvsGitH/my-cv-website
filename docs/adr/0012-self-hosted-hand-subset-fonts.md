# Self-hosted, hand-subset fonts, from a git-ignored raw-drop folder

Every face the CV uses is self-hosted and subset by hand. The owner drops raw source files into **`docs/assets/`, which is git-ignored**; `scripts/subset-fonts.mjs` (`npm run fonts:subset`) reads from there and writes `.woff2` into **`src/assets/`, which is committed**. The script is manual and out-of-band: **CI never touches `docs/assets/` and never runs the subsetter.**

Get that split wrong — add a face to `FACES` and commit without running the script, or make the build depend on the raw folder — and CI fails on a path that does not exist in a clean clone.

## Considered Options

- **Google Fonts or another CDN.** Rejected: a network dependency in the PDF capture is a determinism hazard (ADR-0009), and three of the four families are licensed files the owner supplies rather than anything a CDN serves.
- **Subsetting at build time.** Rejected: it would put the raw sources in the repo or in CI, and the subsetting tool in the production dependency tree, to save a step that runs when a font changes — roughly never.
- **`fonttools` / `pyftsubset`.** Rejected in favour of the `subset-font` npm package (harfbuzz/wasm), which keeps the toolchain to Node with **no Python dependency**.
- **Subsetting to the literal glyphs the content uses.** Rejected: the charset is Basic Latin + Latin-1 + Latin Extended-A + common typographic punctuation — enough for any Italian or English CV copy. Glyph-exact subsets would mean **re-subsetting after every content edit**, and this has already paid off: the Italian translation needed no re-subset.
- **A real signature image.** Rejected on the owner's behalf: the signature is a script-font approximation precisely **so the owner's actual signature is never published on a public site**. Do not "improve" it into a scan.

## Consequences

- Only the faces actually used are shipped — subsetting cut each file 75–80%.
- **`font-display: block`, never `optional`.** `optional` is a determinism hazard for PDF capture; capture is gated on `document.fonts.ready` instead (with the viewport caveat in ADR-0009).
- The `fontaine` Vite plugin generates metric-matched `local()` fallbacks (`size-adjust` and the override trio) for every `@font-face` in `fonts.css` indiscriminately, so a new face gets one for free and needs no per-font config. Those fallbacks resolve against whatever the machine has, so one going missing is expected rather than a failure.
- `--font-weight-signature` exists despite the face having one weight, so the signature is not the single role that inlines its weight.
- `.signature` is set at 1.6rem rather than the reference-derived 1.05rem: the system-cursive placeholder and the real script face do not share metrics, and 1.6rem is what matches the reference at the real face's proportions.
- The role-to-face mapping is read out of the reference PDF's own font resources (ADR-0014), not inferred by rendering comparison — an earlier pass did the latter and got Now and Garet swapped. **`src/styles/fonts.css` is the accurate record.**
- Adding a face is three steps in order: drop the source into `docs/assets/fonts/`, add it to `FACES` in `subset-fonts.mjs`, run `npm run fonts:subset`, then commit the generated `.woff2`. Skipping the last two breaks CI silently in the sense that nothing local reproduces it.

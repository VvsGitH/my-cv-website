# 02 — Fonts

Status: done

## Goal

Self-host Garet, Now, and Lato as web fonts and expose them via tokens, matching the reference CV's weights.

## Tasks

- Copy source faces from `docs/assets/fonts/` into the project. Subset to Latin + the glyphs used.
- `@font-face` declarations with `font-display: block` (offline-rendered; avoid `optional`).
- Weight mapping to verify against `docs/assets/CV_page1.png` / `CV_page2.png`:
  - Garet-Heavy → name + section headings; Garet-Book → lighter display text ("Professional software developer").
  - Confirm where Now vs Lato is used (sub-headings vs body) and map accordingly.
- Expose font-family tokens for headings / display / body.

## Acceptance

- All faces load locally (no network), verified via `document.fonts`.
- Rendered headings/body visually match the screenshots.

## Depends on

- 01

## Comments

> **Superseded — the mapping below is wrong.** It was inferred by comparing
> renders against the screenshots; ticket 05 read the roles straight out of
> the reference PDF's font resources and found Now and Garet swapped. The
> source actually uses **Now-Bold** for the name, **Now-Regular** for the
> subtitle, **Garet-Bold** for section headings / entry titles / contact
> labels, **Garet-Regular** for employer-period lines and most Aside prose,
> and **Lato** for dense prose. Two further faces (Now-Regular, Lato-Italic)
> were subset in 05. `src/styles/fonts.css` is now the accurate record; the
> rest of this section is kept for the subsetting and fallback decisions,
> which still hold.

Weight mapping confirmed by rendering each candidate face against the CV
screenshots (`docs/assets/CV_page1.png`/`CV_page2.png`) rather than eyeballing:

- Name + all section headings (About Me, Experience, Tech Skills, Selected
  Projects, etc.) → **Garet Heavy** (`usWeightClass: 850`).
- Tagline / lighter display text ("Professional software developer") →
  **Garet Book** (`usWeightClass: 300`), same family as headings, lighter weight.
- Sub-headings (job titles, project titles, contact labels, subsection
  labels) → **Now Bold** (`700`) — confirmed over Now-Black (too heavy) and
  over Garet/Lato by rendering comparison.
- Body copy (paragraphs, bullets, contact values, dates) → **Lato**
  (400 regular / 700 bold for inline emphasis).

Exposed four tokens, not three, since the visual evidence showed four
distinct roles: `--font-heading`, `--font-display`, `--font-subheading`,
`--font-body` (plus matching `--font-weight-*`). `--font-heading` and
`--font-display` both resolve to the `Garet` family — the two static files
are registered as one `@font-face` family at two `font-weight` values
(300/850) rather than two separate family tokens, so callers select the
role via weight.

Subsetting: used the `subset-font` npm package (harfbuzz/wasm, no Python
dependency) via `scripts/subset-fonts.mjs` (`npm run fonts:subset`),
covering Basic Latin + Latin-1 + Latin Extended-A + common typographic
punctuation — Italian and English CV copy, not literal final glyphs (the
content model doesn't exist yet, see 04). Only the five faces actually
used are shipped (Garet-Book, Garet-Heavy, Now-Bold, Lato-Regular,
Lato-Bold); this cut each file 75-80%.

Verified via Chrome DevTools against the built+previewed output: all five
`@font-face` entries resolve and `document.fonts.load()` succeeds for each
with zero network requests outside `localhost`/the Pages base path.
Headings/body applied to the ticket-01 placeholder markup (`h1`/`p`) for a
visual smoke check, since the real Sheet/heading layout doesn't exist until
05 — full pixel-perfect matching is out of scope here per the spec.

Post-review fixes (`/code-review`):
- Added the `fontaine` Vite plugin (astro.config.mjs) to generate
  metric-matched local `@font-face` fallbacks (`size-adjust`,
  `ascent-override`, `descent-override`, `line-gap-override` against
  `local(Arial)`) per the coding-standards Fonts rule ("Add `size-adjust`
  on the fallback to keep line breaks stable"). Tokens now read
  `'Garet', 'Garet fallback', sans-serif` etc., per fontaine's documented
  pattern for CSS-variable-driven font stacks.
- Moved the `h1`/`p` token wiring out of the two per-page `<style>` blocks
  (duplicated across `index.astro`/`en/index.astro`) into one
  `:global(main h1)`/`:global(main p)` rule in `BaseLayout.astro` — both
  pages already share that layout, so one place to change base typography
  going forward.

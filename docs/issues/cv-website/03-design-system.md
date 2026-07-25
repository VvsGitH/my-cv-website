# 03 — Design system & A4 Sheet primitive

Status: done

## Goal

Establish the design tokens, global styles, and the reusable A4 Sheet primitive.

## Tasks

- CSS custom properties for the tokens in the spec (colors, type scale). Dark-blue background token for dark theme.
- Global reset + base typography using the font tokens from 02.
- **Sheet primitive**: a `210mm × 297mm` element with `@page { size: A4; margin: 0 }`, scalable via `transform: scale(var(--k))` without changing the mm box. Wrapper reserves the scaled height.
- Establish `print-color-adjust: exact` / `-webkit-print-color-adjust: exact` globally so cream Aside, photo disc, and proficiency bars keep their color in print/PDF.
- Ensure paper styles are identical under `screen` and `print` media.

## Acceptance

- A bare Sheet renders at exact A4 proportions on screen and prints/exports to a single A4 page with no scaling drift.
- Background colors survive a Chromium print preview.

## Depends on

- 02

## Comments

Colors converted from the spec's sRGB hex values to OKLCH by hand (standard
Björn Ottosson OKLab formulas), then round-tripped back to hex to confirm an
exact match before committing to the numbers — see `src/styles/tokens.css`.
Only `--color-dark-bg` varies by theme (Sheets stay white paper in both
themes per spec); applied via `light-dark()` on the `body` background with
a plain-value fallback declaration + `@media (prefers-color-scheme: dark)`
override for browsers without `light-dark()` support, per the coding
standards' "keep a prefers-color-scheme fallback" note.

Cascade layers: `@layer reset, base, components, print;` must be declared
as a bare statement *before* the `@import` lines in `global.css` — that's
the one place a `@layer` statement is allowed to precede `@import`, and
it's load-bearing here: with the bare statement placed *after* the
imports instead, the production build's CSS minifier hoisted it in a way
that reordered the effective layer precedence (verified by inspecting the
built `dist/index.html` output directly — `components`/`print` ended up
before `reset`/`base`). `components`/`print` are declared but left empty
for tickets 05+.

Sheet primitive uses `--sheet-scale` (not `--k` as literally named in the
ticket) for readability; ticket 06 (responsive) will set it per breakpoint.
Verified empirically rather than just by inspection:
- On-screen: `getBoundingClientRect()` on a scale=1 Sheet matches the exact
  210mm/297mm → px conversion, and the wrapper's reserved footprint tracks
  `--sheet-scale` exactly (tested at 0.5) with zero drift between the two.
- Print/PDF: used an ephemeral local Playwright install (`npm install
  --no-save playwright`, not added to the project — that's ticket 08's
  job) to capture a real `page.pdf()` of an isolated bare Sheet (the
  ticket-01 placeholder content was stripped via `page.evaluate` first,
  since leaving it in place pushed the Sheet across two pages — a test-
  harness artifact, not a primitive defect). Result: exactly 1 page, page
  size within ~0.1mm of true A4 (Chromium's own PDF-export quantization,
  not scaling drift — confirmed stable across repeated captures), and an
  injected swatch using `--color-aside-bg` (`oklch()`) survived
  `printBackground: true` essentially exactly (off by 1/255 per channel —
  rendering noise). Screen vs print use one unified rule set with no
  `@media print` geometry overrides, so they're identical by construction.

The bare-Sheet demo left in `index.astro`/`en/index.astro` (below the
ticket-02 placeholder h1/p) is temporary, same as the placeholder content
itself — both get replaced by the real CV layout in ticket 05.

Post-review fix (`/code-review`): `Sheet.astro`'s scoped styles were
unlayered, which would have permanently beaten every layered rule —
including the `print` layer this ticket declares as highest-precedence —
regardless of what 05+ puts there. Wrapped `.sheet-wrapper`/`.sheet` in
`@layer components`; confirmed in the built output that Astro's scoping
attribute still applies correctly inside the layer block, and re-verified
the Sheet renders identically on screen.

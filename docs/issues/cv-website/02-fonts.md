# 02 — Fonts

Status: ready-for-agent

## Goal

Self-host Garet, Now, and Lato as web fonts and expose them via tokens, matching the reference CV's weights.

## Tasks

- Copy source faces from `docs/assets/fonts/` into the project; generate `.woff2` where missing (`Lato-*` is ttf-only, `Now*` is otf-only; `Garet-*` already has woff2). Subset to Latin + the glyphs used.
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

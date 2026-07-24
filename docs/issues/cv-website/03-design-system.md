# 03 — Design system & A4 Sheet primitive

Status: ready-for-agent

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

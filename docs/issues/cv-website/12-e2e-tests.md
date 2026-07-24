# 12 — Playwright E2E tests

Status: ready-for-agent

## Goal

Establish the single test seam: Playwright end-to-end against the built output (rendered Locale pages + generated PDFs). Tests assert external behavior only — never component internals.

## Tasks

- Run against the `astro build` output (served/previewed locally), the same artifact CI deploys.
- **Content & structure:** `/` (IT) and `/en/` render the expected Blocks in the correct Sheet/column; IT vs EN text differs where expected.
- **Toolbar:** language toggle navigates to the equivalent route in the other Locale; theme toggle changes the background but not the Sheet surface; share writes the current URL to the clipboard; download links to the correct per-Locale PDF filename.
- **Responsive tiers:** viewport emulation asserts 2-up (≥1280px), stacked (768–1280px), Reading Mode + operable Drawer (<768px).
- **PDF validity:** each generated PDF is exactly 2 A4 pages, has CV fonts embedded, and contains expected key strings for its Locale.
- **Accessibility smoke:** Toolbar and Drawer keyboard-operable and labeled.
- Wire the suite into the CI job (ticket 09) after the PDF render step.

## Acceptance

- Suite passes against a fresh build for both Locales and fails on a regression in any of the above.

## Depends on

- 07 (interactive site), 08 (PDFs). Runs in CI from 09.

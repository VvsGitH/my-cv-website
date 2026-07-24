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

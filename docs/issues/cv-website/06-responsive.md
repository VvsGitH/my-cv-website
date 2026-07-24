# 06 — Responsive (three tiers + Reading Mode)

Status: ready-for-agent

## Goal

Make the same components respond across the three tiers, including Reading Mode with the Drawer.

## Tasks

- **Wide (≥1280px):** two Sheets side by side, page padding/gap.
- **Medium (768–1280px):** Sheets stacked one per row, scaled to width, rigid A4.
- **Narrow (<768px): Reading Mode** — reflow to single-column, normal text size; Aside content → left slide-in Drawer (toggle); Main is primary scroll; compact header (photo + name + title + contacts) at top.
- Reading Mode must **not** affect Paper Mode/print CSS (mobile is never captured for the PDF).
- Drawer: accessible (focus trap, ESC to close, `aria-*`), animates from left.

## Acceptance

- Layout matches the tier behavior at 1280 / 1024 / 375px.
- Print/PDF output is unchanged by the Reading Mode styles.

## Depends on

- 05

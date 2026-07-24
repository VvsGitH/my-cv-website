# 07 — Floating Toolbar (React island)

Status: ready-for-agent

## Goal

The single React island: a bottom-right floating Toolbar with four actions, plus the Drawer toggle on mobile.

## Tasks

- **Language:** toggle EN/IT — navigate to the equivalent route in the other Locale.
- **Download:** link to the current Locale's pre-rendered PDF (`Vito_Paparella_Santorsola_CV_<LOC>.pdf`).
- **Share:** copy `window.location.href` to clipboard with a brief confirmation toast/state.
- **Theme:** light/dark toggle; dark mode swaps **only** the background behind the Sheets to the dark-blue token. Persist in `localStorage`; apply pre-hydration to avoid flash.
- Drawer toggle (mobile) wired to ticket 06's Drawer.
- Accessible controls (labels, keyboard, focus states); minimal, unobtrusive styling.

## Acceptance

- All four actions work; theme + drawer toggle correctly; theme persists across reloads without flash.
- Sheets and PDF are visually unaffected by dark mode.

## Depends on

- 06

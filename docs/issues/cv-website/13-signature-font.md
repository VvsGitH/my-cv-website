# 13 — Signature font

Status: done

## Goal

Self-host the owner-provided script face and wire it into the Privacy block's signature line, resolving the "needs an owner decision" blocker ticket 05 left and unblocking ticket 08's PDF-fidelity acceptance (spec US29).

## Tasks

- Add `docs/assets/fonts/primera-signature/PrimeraSignature-ALLy7.ttf` to `scripts/subset-fonts.mjs`'s `FACES` list, subset to `src/fonts/primera-signature/PrimeraSignature.woff2`.
- `@font-face` in `src/styles/fonts.css`: family `Primera Signature`, `font-display: block` (never `optional` — determinism for PDF capture).
- Expose `--font-signature` / `--font-weight-signature` tokens.
- Replace `.signature`'s system-cursive fallback stack (`Segoe Script`, `Brush Script MT`) in `PrivacyBlock.astro` with the tokens.

## Acceptance

- `document.fonts` resolves `Primera Signature` locally, zero network requests.
- The signature renders in the script face consistently across environments (including headless Chromium in CI, which has neither `Segoe Script` nor `Brush Script MT`) — ticket 08 no longer blocked.

## Depends on

- 02 (subsetting pipeline), 05 (Privacy block, `.signature` rule)

## Comments

### Implementation

Owner dropped `docs/assets/fonts/primera-signature/PrimeraSignature-ALLy7.ttf` (single weight, 400/normal). Ran it through the existing `subset-fonts.mjs` pipeline unchanged — same Basic Latin + Latin-1 + Latin Extended-A + punctuation charset as the other five faces, for consistency with the "Italian and English CV copy, not literal final glyphs" rationale from ticket 02, since the signature text (`signature: 'Vito Paparella Santorsola'`) could in principle change. 11,160 → 6,684 bytes.

`--font-weight-signature` was added even though there's only one weight, matching the pattern every other role token follows (`--font-weight-name`, `--font-weight-heading`, etc.) rather than being the one role that inlines its weight.

`.signature`'s `font-size` was bumped from 1.05rem to 1.6rem — the system-cursive placeholder and the real script face don't share metrics, and 1.05rem rendered the real face too small/thin to read comfortably at the reference's scale. Checked visually in the browser (light theme, both Sheets) against `CV_page2.png`; 1.6rem is the closest match. `line-height` (1.6) and the `--color-signature` token were untouched.

Not re-litigated: the `fontaine` fallback config (`astro.config.mjs`) already applies to every `@font-face` in `fonts.css` indiscriminately (`fallbacks: ['Arial']`), so the new face gets a metric-matched fallback for free, same as the other five — no per-font config needed.

# 0006 — Post-ticket 06 responsive adjustments

**Status**: done (tracking deviations from ticket 06)

**Author**: Vito Paparella Santorsola  
**Date**: 2026-07-26

## Overview

Commit `b72bbaa` ("Fix: some fixes post 06") introduced several changes to the responsive behavior and typography that deviate from the explicit design documented in ticket 06. This ADR tracks those deviations and their rationale.

> **The implementation tickets have since been deleted.** "Ticket 06" below is the historical design this ADR was written against; the `Before` snippets quote it verbatim and are the only surviving record of it. Nothing here needs the ticket to be readable.

> **Both boundaries moved once more after this ADR was written.** Reading Mode's went from 48rem to **53.5rem** and the wide tier's from 101rem to **107.5rem**, so that neither tier can start below the width of the paper it has to show — a Sheet wider than its own boundary is a horizontal scrollbar. Both were raised again when the paper itself grew to 840px. The reasoning lives in `tokens.css`; the `Before (ticket 06)` snippets below are quoted as 06 wrote them and are deliberately not updated.

## Deviations from ticket 06

### 1. Wide breakpoint moved from 80rem to 101rem

**What changed:**
- Ticket 06 specified two boundaries: **48rem** (Reading Mode threshold) and **80rem** (wide mode threshold for two-column layout)
- Commit `b72bbaa` changed the wide breakpoint from `80rem` to `101rem` in `Document.astro` (since moved again, to `107.5rem` — see the note above)

**Before (ticket 06):**
```css
@media screen and (width >= 80rem) {
  .sheets {
    --sheet-fit-width: calc((100vw - 2 * var(--sheets-pad) - var(--sheets-gap)) / 2);
    grid-template-columns: repeat(2, max-content);
  }
}
```

**After (commit b72bbaa, line 49 Document.astro):**
```css
@media screen and (width >= 101rem) {
  .sheets {
    grid-template-columns: repeat(2, max-content);
  }
}
```

**Rationale**: At 80rem (1280px), the scaled Sheet width was causing overflow or layout issues. The new threshold of 101rem (1616px) ensures two Sheets fit comfortably without needing aggressive scaling.

**Impact on spec**: Ticket 06's acceptance criteria stated layout should match at **1280px (wide mode)**, but that now falls into medium mode instead.

---

### 2. Sheet scaling system removed entirely

**What changed:**
- Ticket 06 implemented a dynamic `--sheet-fit-width` calculation and `--sheet-scale` system using `tan(atan2(a, b))` to scale Sheets down to fit the viewport
- Commit `b72bbaa` removed both the `--sheet-fit-width` declaration and the `--sheet-scale` calculation

**Before (ticket 06, Document.astro):**
```css
@media screen and (width >= 48rem) {
  .sheets {
    --sheet-fit-width: calc(100vw - 2 * var(--sheets-pad));
  }
}

@media screen and (width >= 80rem) {
  .sheets {
    --sheet-fit-width: calc((100vw - 2 * var(--sheets-pad) - var(--sheets-gap)) / 2);
  }
}
```

**Before (ticket 06, Sheet.astro):**
```css
@media screen and (width >= 48rem) {
  .sheet-wrapper {
    --sheet-scale: min(1, tan(atan2(var(--sheet-fit-width, 210mm), 210mm)));
  }
}
```

**After**: Both removed. `--sheet-scale` is declared once in `tokens.css` as `1`, and the OG card route is its only consumer; the Sheet is unscaled in every screen mode above 53.5rem.

**Rationale**: Forcing `--sheet-scale: 1` ensures Sheets always render at full size. The scaling system was causing precision issues and complexity without clear benefits at modern viewport widths.

> **"Full size" is no longer 210mm × 297mm.** 
> The Sheet is now an **840px box held in A4's 210/297 ratio** (`--sheet-width`, `--sheet-ar`), and millimetres reach only the print layer, where `Sheet.astro` applies `zoom: calc(210mm / var(--sheet-width))` to take it back to A4 for the capture (ADR-0009 records why that is `zoom` rather than a transform).  
> Fidelity to A4 *proportions* is what this decision preserves; the paper renders larger than 1:1 on screen because the screen is not paper.  
> .sheet-wrapper and --sheet-scale were also removed, since `zoom` made them obsolete.

**Impact on spec**: Ticket 06 explicitly stated "A Sheet is never scaled **above** 1" and "scaled down to fit", implying Sheets *would* scale down when needed. That guarantee is now a guarantee they never scale.

---

### 3. Reading Mode typography reduced

**What changed:**
- Several font sizes in Reading Mode (< 48rem at the time, < 53.5rem now) were reduced in `src/styles/tokens.css`

**Before (ticket 06 defaults):**
- `--font-size-subtitle: 0.9375rem`
- `--font-size-subheading: 1.0625rem`
- `--font-size-body: 1rem`

**After (commit b72bbaa):**
- `--font-size-subtitle: 1rem` (increased slightly)
- `--font-size-heading: 1.25rem` (new, added)
- `--font-size-subheading: 1rem` (reduced from 1.0625rem)
- `--font-size-body: 0.875rem` (reduced from 1rem)

**Rationale**: Ticket 06 did not specify exact font sizes for Reading Mode—it only said content should reflow "at normal text size". The reductions fit more content vertically on narrow viewports and improve readability with actual content.

**Impact on spec**: No direct contradiction; ticket 06 left typography implementation to the design system, not the responsive spec.

---

### 4. Drawer width formula changed from `min()` to `max()`

**What changed:**
- Drawer width in `src/components/chrome/drawer.css` changed from `min(20rem, 85vw)` to `max(20rem, 85vw)`

**Before:**
```css
width: min(20rem, 85vw);
```

**After:**
```css
width: max(20rem, 85vw);
```

**Rationale**: The `min()` formula meant the Drawer could never exceed 20rem even on large phone widths. `max()` ensures the Drawer takes up 85vw when available (up to full-width phones), while preserving the 20rem minimum for very narrow viewports.

**Impact on spec**: Ticket 06 did not specify exact Drawer dimensions, only that it should be "as wide as a phone can spare". This change aligns better with that intent.

**Superseded**: the width is now derived rather than written down. The Toolbar no longer rides the panel's outer edge at all — see ADR-0008 and the `--drawer-width` derivation in `tokens.css`.

---

### 5. Reading Mode spacing normalized

**What changed:**
- Removed explicit gap between Sheets in Reading Mode (set to `0` instead of `var(--space-xl)`)
- Added `min-width: 23rem` to `.sheets` in Reading Mode to prevent over-compression
- Removed `margin-block-start` from header contacts (HeaderBlock.astro)
- Added explicit `margin-block-start: var(--space-m)` to first groups in both Main and Aside for Reading Mode

**Rationale**: Ticket 06's `display: contents` approach dropped the A4 geometry but left spacing inconsistencies. These changes ensure:
- No extra gaps between content from different Sheets
- The column stays readable (23rem minimum)
- Consistent spacing around section headers regardless of Sheet boundaries

**Impact on spec**: Ticket 06 mentioned spacing but did not detail the Reading Mode gap behavior. These are implementation refinements within the bounds of the spec.

---

## Summary

The commit introduces **three categories** of changes:

1. **Breaking spec change** (breakpoint + scaling): The responsive tiers no longer match ticket 06's documented behavior at 80rem/1280px. This is intentional and needs a new spec in ticket 06 or a follow-up ticket.

2. **Within-spec implementation** (typography, Drawer width, spacing): Refines details ticket 06 left to implementation.

3. **Preservation of core design**: Reading Mode still dismantles the A4 box, the Drawer is still accessible, print output is unaffected — the core promises of ticket 06 hold.

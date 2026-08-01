# Deferred work

Known, deliberate follow-ups. Each was decided against *for now* rather than rejected — the reasoning lives in the ADR named beside it.

## Align the two columns with subgrid, and delete `--header-height`

Reopened. ADR-0011 rejected subgrid because it would force the Aside's and Main's block insets to become equal — they now *are* equal, one `--sheet-pad-block-start`, so the objection has expired. It is the only remaining way to stop hand-measuring the header Block's height (`hacks/2026-08-01` §5, §6).

## A scroll-aware Toolbar

Hiding or shrinking the Reading Mode row on scroll-down. Deliberately deferred as a phase 2, once the current shape has been lived with. ADR-0008.

## The rail overlaps the paper at both ends of Paper Mode

Measured and unremedied: from 856px up to 960px, and again between 1720px and 1824px, the vertical rail lands on the Aside's opening paragraph. WCAG 2.4.11 does not catch it because what it covers is prose rather than a control. ADR-0008 carries the numbers.

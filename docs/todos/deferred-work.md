# Deferred work

Known, deliberate follow-ups. Each was decided against *for now* rather than rejected — the reasoning lives in the ADR named beside it.

## Collapse the six "heading → first content" rules

`--space-m` is written into six components (`AboutBlock`, `BulletsBlock`, `CertificationsBlock`, `LanguagesBlock`, `PrivacyBlock`, `SkillsBlock`) to express one rule: the first content under a section heading sits 14px down. One selector in `Sheet.astro` — `.block > .section-heading + *` — would say it once.

Not done because it restructures the cascade in a fidelity-critical document. The sr-only Continuation case and `BulletsBlock`'s wrapper `div` both need handling, and it invalidates every measured spacing number. ADR-0011.

## No half pixels

After the initial pdf-to-web port, the style is left with lots of half pixel measures. The only main constraint is the A4 proportions.

## A scroll-aware Toolbar

Hiding or shrinking the Reading Mode row on scroll-down. Deliberately deferred as a phase 2, once the current shape has been lived with. ADR-0008.

## The rail overlaps the paper at both ends of Paper Mode

Measured and unremedied: from 816px up to ~914px, and again between 1632px and ~1731px, the vertical rail lands on the Aside's opening paragraph. WCAG 2.4.11 does not catch it because what it covers is prose rather than a control. ADR-0008 carries the numbers.

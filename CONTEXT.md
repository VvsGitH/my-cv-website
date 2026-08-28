# CV Website

A single-purpose site that presents Vito Paparella Santorsola's CV as sheets of paper and offers it as a downloadable PDF. Bilingual (Italian default, English secondary).

## Language

**Sheet**:
One A4 page of the CV. The CV is two Sheets. A Sheet has fixed dimensions in A4's 210/297 ratio — an 840px box on screen, taken back to a physical 210×297mm in the print layer — and is the unit that maps 1:1 to a page in the generated PDF.
_Avoid_: page (ambiguous with browser/site page), card

**Aside**:
The narrower left column of a Sheet, rendered on a cream panel — holds About Me, Tech Skills, Soft Skills, Languages, Certifications, Other Info, Privacy. The panel is the same cream in both themes, and takes its dark ink with it (ADR-0015); when the paper darkens around it, the Aside is what does not move. It is a Paper Mode structure only: in Reading Mode there is no panel, its Blocks read in the one column, and their ink rejoins the theme (ADR-0017).
_Avoid_: sidebar, left column

**Main**:
The wider right column of a Sheet — holds the header (name, title, contacts), Experience, Selected Projects, Education.
_Avoid_: content column, right column

**Block**:
An individually placeable unit of CV content — one titled section of the CV, or as much of one as fits in a single column of a single Sheet. Each Block is assigned to a Sheet and a column via Explicit Paging.
_Avoid_: section (a Block may be only part of a section), item

**Group**:
A titled sub-unit of a Block — one job, one project, one qualification, one cluster of skills.
_Avoid_: entry, record, item

**Continuation**:
A Block or Group that resumes one interrupted by a Sheet boundary. It repeats the interrupted heading rather than restating it, and never introduces new material. The repeat is announced, never drawn, so in Reading Mode — where `readOrder` puts the two halves next to each other — the reader sees one unbroken section (ADR-0005, ADR-0017).
_Avoid_: followup, overflow, reflow (reserved for what Explicit Paging refuses to do)

**Explicit Paging**:
The rule that every Block declares where it belongs, in the content itself, rather than letting content flow automatically — once per Mode (ADR-0017). For Paper Mode that is a Sheet and a column (`paperSheet`, `paperColumn`); for Reading Mode it is a rank in the single column (`readOrder`), a permutation of `1..n` the build asserts. The two are independent: neither sequence is derived from the other.
_Avoid_: pagination, auto-flow

**Mode**:
Which of the two presentations the reader is looking at — Paper or Reading. It is their choice, not their screen: `<html data-mode>` is its only source of truth, set pre-paint, flipped from the Toolbar and remembered across visits. Paper Mode is what a first visit gets, at every width (ADR-0017).
_Avoid_: view, layout, breakpoint (the Mode is not a width — what is left of the widths governs the Chrome alone)

**Paper Mode**:
The Mode where Sheets keep rigid A4 geometry, and the default one. Two Sheets side by side when wide, stacked one per row when medium, and — below the paper's own width, a phone included — one Sheet scaled to fit the device rather than allowed over the edge (ADR-0017). It is what the PDF is captured from, and what a print takes back to whatever the reader's Mode is.
_Avoid_: desktop view, print view

**Reading Mode**:
The Mode where the same content reflows into a single column at reading type, abandoning A4 geometry — every Block of both Sheets and both columns, in the order `readOrder` declares. Available at any width, and never captured for the PDF. On a phone it is also the site's answer to WCAG 2.2 · 1.4.4, since Paper Mode there is A4 fitted to the device.
_Avoid_: mobile view, responsive view

**Toolbar**:
The floating control cluster carrying the five actions — Mode, language, download, share, theme — at every tier. One shape per tier (ADR-0008): a vertical rail against the inline start when there is room beside the paper, centred on the viewport, and a horizontal row against the bottom edge on the narrow tier. Its container carries the chrome at both. The shape is a width; what the Mode control offers is not (ADR-0017). The site's only fixed chrome.
_Avoid_: header, navbar, controls

**Colophon**:
The block at the foot of the page, below the paper, carrying the five statements the site makes about itself — who owns the work, what regime the personal data on the page falls under, where the other Locale lives, how to reach the owner, and what accessibility standard the site is composed to. It speaks about the site, never about the person, which is what keeps it out of the PDF. It emits a `<footer>` because that is the correct landmark, and is the only Chrome in normal flow.
_Avoid_: footer (the running foot repeated at the bottom of every printed page — this appears once, is not on the Sheets, and is excluded from the PDF), credits

**Chrome**:
Everything the site shows that is not the paper — the Toolbar and the Colophon. Never captured into the PDF.
_Avoid_: UI, shell, frame

**Locale**:
One of the two supported languages, `it` (default) or `en`. Each Locale has its own content, its own route, and its own generated PDF.
_Avoid_: language variant, translation

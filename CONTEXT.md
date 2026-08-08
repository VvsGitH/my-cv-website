# CV Website

A single-purpose site that presents Vito Paparella Santorsola's CV as sheets of paper and offers it as a downloadable PDF. Bilingual (Italian default, English secondary).

## Language

**Sheet**:
One A4 page of the CV. The CV is two Sheets. A Sheet has fixed dimensions in A4's 210/297 ratio — an 840px box on screen, taken back to a physical 210×297mm in the print layer — and is the unit that maps 1:1 to a page in the generated PDF.
_Avoid_: page (ambiguous with browser/site page), card

**Aside**:
The narrower left column of a Sheet, rendered on a cream panel — holds About Me, Tech Skills, Soft Skills, Languages, Certifications, Other Info, Privacy. The panel is the same cream in both themes, and takes its dark ink with it (ADR-0015); when the paper darkens around it, the Aside is what does not move.
_Avoid_: sidebar (reserved for its mobile form, the Drawer), left column

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
A Block or Group that resumes one interrupted by a Sheet boundary. It repeats the interrupted heading rather than restating it, and never introduces new material.
_Avoid_: followup, overflow, reflow (reserved for what Explicit Paging refuses to do)

**Explicit Paging**:
The rule that every Block declares which Sheet and which column (Aside/Main) it belongs to, in the content itself — as opposed to letting content flow across Sheets automatically.
_Avoid_: pagination, auto-flow

**Paper Mode**:
The presentation where Sheets keep rigid A4 geometry — used on desktop/tablet and captured for the PDF. Two Sheets side by side when wide, stacked one per row when medium.
_Avoid_: desktop view, print view

**Reading Mode**:
The mobile presentation where the same content reflows into a single readable column at normal text size, abandoning A4 geometry. Never captured for the PDF.
_Avoid_: mobile view, responsive view

**Drawer**:
The left slide-in panel, in Reading Mode only, that holds the Aside content behind a toggle. A modal `<dialog>` (ADR-0008), opened from the Toolbar and closed from its own head row — which carries the control that dismisses it at its inline end, beside the panel's name as a heading that is announced rather than shown.
_Avoid_: sidebar, menu

**Toolbar**:
The floating control cluster carrying the four actions — language, download, share, theme — plus the Drawer's toggle in Reading Mode. One shape per tier (ADR-0008): a vertical rail against the inline start in Paper Mode, centred on the viewport, and a horizontal row against the bottom edge in Reading Mode, where the column reaches the rail's own edge. Its container carries the chrome at both. The site's only fixed chrome; it goes inert behind an open Drawer.
_Avoid_: header, navbar, controls

**Colophon**:
The block at the foot of the page, below the paper, carrying the five statements the site makes about itself — who owns the work, what regime the personal data on the page falls under, where the other Locale lives, how to reach the owner, and what accessibility standard the site is composed to. It speaks about the site, never about the person, which is what keeps it out of the PDF. It emits a `<footer>` because that is the correct landmark, and is the only Chrome in normal flow.
_Avoid_: footer (the running foot repeated at the bottom of every printed page — this appears once, is not on the Sheets, and is excluded from the PDF), credits

**Chrome**:
Everything the site shows that is not the paper — the Toolbar, the Drawer and the Colophon. Never captured into the PDF.
_Avoid_: UI, shell, frame

**Locale**:
One of the two supported languages, `it` (default) or `en`. Each Locale has its own content, its own route, and its own generated PDF.
_Avoid_: language variant, translation

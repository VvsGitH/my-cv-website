# CV Website

A single-purpose site that presents Vito Paparella Santorsola's CV as sheets of paper and offers it as a downloadable PDF. Bilingual (Italian default, English secondary).

## Language

**Sheet**:
One A4 page of the CV (210×297mm). The CV is two Sheets. A Sheet has fixed physical dimensions and is the unit that maps 1:1 to a page in the generated PDF.
_Avoid_: page (ambiguous with browser/site page), card

**Aside**:
The narrower left column of a Sheet, rendered on a cream panel — holds About Me, Tech Skills, Soft Skills, Languages, Certifications, Other Info, Privacy.
_Avoid_: sidebar (reserved for its mobile form, the Drawer), left column

**Main**:
The wider right column of a Sheet — holds the header (name, title, contacts), Experience, Selected Projects, Education.
_Avoid_: content column, right column

**Block**:
An individually placeable unit of CV content (e.g. one Experience entry, the Languages section). Each Block is assigned to a Sheet and a column via Explicit Paging.
_Avoid_: section (a Block may be part of a section), item

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
The left slide-in panel, in Reading Mode only, that holds the Aside content behind a toggle.
_Avoid_: sidebar, menu

**Toolbar**:
The floating control cluster (bottom-right) carrying the four actions: language, download, share, theme. The site's only chrome.
_Avoid_: header, navbar, controls

**Locale**:
One of the two supported languages, `it` (default) or `en`. Each Locale has its own content, its own route, and its own generated PDF.
_Avoid_: language variant, translation

# The Colophon: what the site says about itself, and what it deliberately does not

The Colophon carries five statements — copyright and ownership, the data regime, the other Locale, the contact channels, and the accessibility aim. It speaks about **the site**, never about **the person**, and that line is what keeps it out of the PDF: a printed CV has no business saying "this site is accessible". Everything it states is either derived from content that already exists or is new site-level text; nothing on the paper is repeated.

The decisions worth recording are almost all **negative** — what the Colophon does not claim, and why claiming it would be worse than silence.

## What it deliberately does not say

- **No formal accessibility statement.** The AgID-registered artifact required by Directive (EU) 2016/2102 and, in Italy, L. 4/2004 as amended by D.Lgs. 82/2022, binds public bodies and private entities above **€500M** average turnover. A private individual's CV site is neither, and is outside the European Accessibility Act (Dir. 2019/882) too. Publishing a heading called "Dichiarazione di accessibilità" would assert a filed document that does not exist — **worse than silence.**
- **"Designed to meet WCAG 2.2 level AA", not "conforms to".** Conformance is asserted after an audit. This repo has an accessibility smoke test (ADR-0010), which is a good thing and not an audit.
- **WCAG 2.2, not 2.1**, despite EN 301 549 currently harmonising to 2.1 — 2.2 is the current Recommendation and the higher aim. Of its two new criteria that bear on this site, **2.5.8 Target Size** passes with margin; **2.4.11 Focus Not Obscured** is the one that needed work (ADR-0008).
- **No cookie banner and no privacy-policy page.** With no forms, no analytics and one functional `localStorage` key, a policy page would say "nothing is collected" at length. One clause says it.
- **`Località` is not listed.** It carries no `url`, so it is not an action; repeating "Bari, Italia" in a colophon is restatement, not information.

## Considered Options

- **Naming it "Footer".** Rejected: a footer is the running foot repeated at the bottom of *every* printed page, whereas this appears once, is not on the Sheets, and is excluded from the PDF by construction — every property of the thing contradicts the name, in a project whose governing metaphor is print. It emits a `<footer>` element regardless, because that is the correct landmark.
- **Restating the contacts in `ui.ts`.** Rejected: with a second copy, a changed address leaves two valid `string`s and no compile error. The Colophon derives them with `contacts.filter(c => c.url)`, the same pattern that fills the Drawer from the paper's Blocks.
- **Making it fixed or sticky.** Rejected: at the Medium tier an unscaled Sheet already fills the viewport (ADR-0006), so a second fixed strip would mean shrinking the paper to make room for the frame. The Toolbar is the site's one fixed element, and **being the only one is what gives it weight.**
- **Horizontal indentation to clear the Toolbar in Reading Mode.** Rejected in favour of vertical clearance: the reserved band is exactly the rectangle the Toolbar floats in, so it reads as the strip's berth rather than dead space, and the Colophon stays aligned with the Sheet column above it. Indentation would wrap short lines on narrow screens — a permanent typographic defect traded for an overlap only seen at full scroll.
- **Labelling the language link in the page's own language** ("Leggi in inglese", as the Toolbar's control does). Rejected: someone looking for the English version may not read Italian, so that label is unreadable to exactly the person who needs it. The link is labelled with the target Locale's **endonym** and carries `lang` (WCAG 3.1.2 — without it an Italian screen reader pronounces "English" with Italian phonetics) as well as `hreflang`. This divergence from the Toolbar's wording is deliberate: **an icon needs a describing sentence; a text link is the thing itself.** It is not a no-JS fallback — the Toolbar's control is a real `<a href>`, prerendered.

## Consequences

- **The data notice faces the opposite direction from the Aside's Privacy Block.** The Aside carries the candidate-authorises-employer clause; the Colophon states that the personal data displayed belongs to the owner and that the site collects nothing about visitors. That opposition is why the two coexist without duplication, and why the Aside's Block is untouched.
- **The second clause of the data notice becomes false the day analytics are added.** It carries a comment beside the string, where whoever adds them will meet it.
- **The copyright year comes from the build**, so it follows publication rather than page load — the correct reading of a copyright notice. This makes the HTML non-deterministic over time, which does not reach the PDFs. Consequently **the E2E suite asserts the owner's name, not the year**, or it would break itself every 1 January.
- **The Colophon is sensitive to the header Block's shape.** Drop LinkedIn's `url` and it silently loses a link — the right direction to break in, since it stops advertising a channel the CV itself has withdrawn.
- **One size, one ink, and tracking is the entire hierarchy.** The brief — minimal, no background, 12–14px, black or white, legible in both themes — forbids both usual hierarchy devices: there is no step down from 12px inside the brief, and no tone between black and the background to demote a line with. What is left is the letterpress colophon's own device: the © line alone is set uppercase and tracked.
- The colour follows `reset.css`'s three steps — `light-dark()`, a `prefers-color-scheme` fallback, and `html[data-theme]` overrides — because anything less leaves a case where the background flips and the ink does not.
- A plain `.astro` component with a scoped `<style>`, not part of an island: five statements and three links have nothing to hydrate.

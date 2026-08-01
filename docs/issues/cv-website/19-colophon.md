# 19 — Colophon

Status: done

## Goal

Add the **Colophon** — a third piece of Chrome, after the Toolbar and the
Drawer — carrying the five standard site-level statements the paper does not
and should not make: who owns the work, what regime the personal data on the
page falls under, where the other Locale lives, how to reach the owner, and
what accessibility standard the site is composed to.

The Colophon speaks about *the site*, not about *the person*. That line is what
keeps it out of the PDF: a printed CV has no business saying "this site is
accessible". Everything it states is either derived from content that already
exists or is new site-level text — nothing on the paper is repeated.

This ticket also carries the accessibility work the Colophon's WCAG claim
obliges: the Toolbar's controls take their accessible name from `title` alone,
and WCAG 2.2's *Focus Not Obscured* needs checking against the fixed Toolbar in
Reading Mode. Bundled here at the owner's explicit direction, over the
recommendation to split it out — see *Accessibility debt* below, which keeps it
separately searchable and separately acceptable.

## Decisions

- **The Colophon is Chrome, not paper.** It renders from `Chrome.astro` into
  `<slot name="chrome" />`, outside `<main>`, on the page background. It never
  declares `sheet`/`column`, never enters the PDF, never touches A4 geometry.
  This contradicts `spec.md`'s "Nothing else frames the paper", which this
  ticket amends. No ADR: the decision is reversible by deleting one file and
  one line.
- **A plain `.astro` component, not part of the island.** ADR-0003 fixes the
  site at exactly one Preact island. The Colophon has no interactivity to
  hydrate — five statements and three links — so it ships as static HTML and
  costs zero JavaScript. Scoped `<style>`, per the coding standards, which
  `toolbar.css` and `drawer.css` can only decline because they dress `.tsx`.
- **Named "Colophon", not "Footer".** `CONTEXT.md` already rejects "page" as
  *"ambiguous with browser/site page"*, and "footer" carries the same disease in
  a project whose governing metaphor is print: a footer is the running foot
  repeated at the bottom of *every* printed page, whereas this appears once, is
  not on the Sheets, and is excluded from the PDF by construction. Every
  property of the thing contradicts the name. A colophon is the traditional
  end-of-book block naming who made the work, when, and on what terms — which
  is exactly the payload. It emits a `<footer>` element regardless, because that
  is the correct landmark; the glossary entry says so.
- **Contacts are derived, never restated.** The Colophon receives `CvContent`
  and takes `contacts.filter(c => c.url)` — which is precisely the email and the
  LinkedIn profile, and excludes `Località`, which is not an action. This is the
  same pattern `Chrome.astro:27-29` already uses to fill the Drawer from the
  paper's Blocks. The point is one source of truth: with a second copy in
  `ui.ts`, a changed address leaves two valid `string`s and no compile error.
  The copyright holder's name is derived the same way, from the header Block.
  <br>Accepted cost: the Colophon is sensitive to the header's shape. Drop the
  `url` from LinkedIn and the Colophon silently loses a link — which is the
  break in the right direction, since it stops advertising a channel the CV
  itself has withdrawn.
- **The language link is labelled in the target language** — `English` on the
  Italian page, `Italiano` on the English page — and carries `lang` as well as
  `hreflang`. Someone looking for the English version may not read Italian, so
  "Leggi in inglese" is unreadable to exactly the person who needs it. `lang`
  is WCAG 3.1.2 (Language of Parts, AA): without it an Italian screen reader
  pronounces "English" with Italian phonetics.
  <br>This deliberately diverges from the Toolbar's `language` string ("Leggi in
  inglese", `ui.ts:55`), which stays as it is. An icon needs a describing
  sentence; a text link is the thing itself.
  <br>The Toolbar's control is already a real `<a href>` (`Toolbar.tsx:54-61`)
  and `client:idle` still pre-renders it into the static HTML, so the Colophon's
  link is **not** a no-JS fallback. It is there because a globe glyph is
  ambiguous by construction and names itself only on hover.
- **The data notice is the owner's own, not a processing authorisation.** The
  Aside already carries the candidate-authorises-employer clause
  (`it.ts:276-287`); repeating it here would be noise. The Colophon states the
  opposite-facing pair of facts: the personal data displayed belongs to the
  owner and is protected under the GDPR, and the site collects nothing about
  visitors. Both are true of the code as it stands — no forms, no analytics
  (`spec.md:132`), and `localStorage['cv-theme']` only, which is
  user-requested functionality needing no consent.
- **The accessibility line states an aim and a channel, not a certification.**
  "Designed to meet WCAG 2.2 level AA", not "conforms to". Conformance is
  asserted after an audit; this repo has an a11y smoke test (ticket 12), which
  is a good thing and not an audit. **No formal accessibility statement**: the
  AgID-registered artifact required by Directive (EU) 2016/2102 and, in Italy,
  L. 4/2004 as amended by D.Lgs. 82/2022, binds public bodies and private
  entities above €500M average turnover. A private individual's CV site is
  neither, and is outside the European Accessibility Act (Dir. 2019/882) too.
  Publishing a heading called "Dichiarazione di accessibilità" would assert a
  filed document that does not exist — worse than silence.
- **WCAG 2.2, not 2.1**, despite EN 301 549 currently harmonising to 2.1. 2.2 is
  the current W3C Recommendation and the higher aim. Its two new criteria that
  bear on this site were checked: **2.5.8 Target Size (Minimum)** already passes
  with margin (36px / 44px controls, `toolbar.css:14-15`), and **2.4.11 Focus
  Not Obscured** is what *Accessibility debt* below exists to settle.
- **In normal flow, never fixed or sticky.** The site's premise is showing a
  rigid A4 Sheet as large as it will go, and at the Medium tier that height is
  already spent — ADR-0006 records that an unscaled Sheet fills the viewport,
  leaving the Toolbar no margin to float over. A second fixed strip would mean
  shrinking the paper to make room for the frame. The Toolbar is also the site's
  one fixed element, and being the only one is what gives it weight.
- **Reading Mode reserves vertical clearance for the Toolbar.** Below 51rem the
  Toolbar drops to the bottom of the viewport (`toolbar.css:157-162`) and stays
  a five-control vertical strip, so it covers roughly the bottom-left 4.2rem ×
  16rem — and on a `min-width: 23rem` column (`Document.astro:71-72`) that is
  18% of the measure, inside the text column, not the gutter. The Toolbar's own
  justification for that position (*"it covers the lines a reader has already
  passed instead of the ones under their eye"*) is the one place it fails: below
  the Colophon there are no already-passed lines, because there is nothing.
  <br>Vertical clearance beats horizontal: the reserved band is exactly the
  rectangle the Toolbar floats in, so it reads as the strip's berth rather than
  dead space, and the Colophon stays aligned with the Sheet column above it.
  Horizontal padding would indent the Colophon permanently and wrap short lines
  on narrow screens — a visible typographic defect in exchange for fixing an
  overlap only seen at full scroll.
- **The clearance is derived, not measured by hand.** `--toolbar-button-size`
  is promoted from `.toolbar` to a shared token so the relationship is declared
  rather than remembered; otherwise a changed button size drifts the clearance
  out of sync in silence.

## Content

Five lines. Nothing here restates the paper.

| # | Line | Source |
|---|---|---|
| 1 | `© <build year> <owner name>` | `getFullYear()` + header Block's `name` |
| 2 | Data notice | new `ui.ts` string |
| 3 | `English` / `Italiano` link | i18n route + the other Locale's endonym |
| 4 | Email + LinkedIn | derived: `contacts.filter(c => c.url)` |
| 5 | Accessibility aim + reporting channel | new `ui.ts` string |

Line 1's year comes from the build. The site rebuilds on every push (ticket 09),
so the year follows publication on its own; if a year passes untouched it stays
at the last build, which is the correct reading of a copyright notice — it dates
publication, not page load. This makes the HTML non-deterministic over time,
which does not reach the PDFs (Chrome is excluded) and does not conflict with
byte-level reproducibility (out of scope, `spec.md:130`). It does mean **the E2E
test asserts the name, not the year**, or the suite breaks itself every 1 January.

Draft copy, for the owner to refine — the wording of line 2 is a legal statement
and is the owner's to validate:

- **IT · 2** — "I dati personali in questa pagina sono di Vito Paparella
  Santorsola, pubblicati per finalità di ricerca e selezione del personale e
  tutelati dal GDPR (Regolamento UE 2016/679). Questo sito non raccoglie dati
  sui visitatori."
- **IT · 5** — "Questo sito è progettato per essere conforme alle WCAG 2.2
  livello AA. Se incontri una barriera, scrivimi."
- **EN · 2** — "The personal data on this page belongs to Vito Paparella
  Santorsola, published for recruitment purposes and protected under the GDPR
  (EU 2016/679). This site collects no visitor data."
- **EN · 5** — "This site is designed to meet WCAG 2.2 level AA. If you hit a
  barrier, email me."

Line 2's second clause **becomes false the day analytics are added.** Carry that
as a comment beside the string, where whoever adds them will meet it.

## Tasks

### The Colophon

- `src/components/chrome/Colophon.astro`, taking `content: CvContent`. Emits a
  `<footer>` with an accessible name, holding the five lines above. Scoped
  `<style>` in `@layer components`, plus its own
  `@layer print { @media print { display: none } }` block — the per-component
  pattern `toolbar.css:167-172` and `drawer.css:91-95` already establish, so
  nothing shared is touched.
- `src/components/chrome/Chrome.astro`: render `<Colophon content={content} />`
  as a sibling of `<ChromeIsland>`. Both land in `<slot name="chrome" />`
  (`BaseLayout.astro:92`), outside `<main>`, which is where a page-level
  `<footer>` landmark belongs.
- `src/i18n/ui.ts`: a `ColophonStrings` interface joining `UiStrings`, against
  the same one-entry-per-Locale shape, so a missing translation is a compile
  error. Fields: the landmark's accessible name, the data notice, the
  accessibility line, and `localeName` — each Locale's **endonym** (`it` →
  "Italiano", `en` → "English"), so the component reads
  `ui[otherLocale].localeName` and the label is automatically in the target
  language rather than duplicated per page.
- The `©` line needs no string: `©`, a numeral, and a proper noun are the same
  in both Locales, and the name is derived.

### Reading Mode clearance

- `src/styles/tokens.css`: promote `--toolbar-button-size` (`2.25rem`, and
  `2.75rem` below 51rem) out of `.toolbar`, and add a derived
  `--toolbar-block-size` alongside it, documented as the strip's full height —
  five controls, four inner gaps and two of padding at `--space-xs`, plus
  borders.
- `src/components/chrome/toolbar.css`: consume the tokens instead of declaring
  the size locally. No visual change intended.
- `Colophon.astro`: below 51rem only, `padding-block-end` of
  `calc(var(--toolbar-block-size) + var(--space-m) + var(--space-xl))` — the
  strip's height, its offset from the viewport bottom, and breathing room.

### Accessibility debt

Separately acceptable from the Colophon; see the *Acceptance* split.

- `src/components/chrome/Toolbar.tsx`: add `aria-label` to each control
  alongside the existing `title`. The docblock (`Toolbar.tsx:16-18`) already
  claims `aria-label`; the code has used `title` since ticket 07. `title` does
  produce an accessible name and satisfies 4.1.2, but it is the last resort in
  the accname chain, never surfaces on touch, and is deprioritised by some
  assistive-tech configurations. Keep `title` — it is what draws the tooltip.
- Verify **WCAG 2.2 · 2.4.11 Focus Not Obscured (Minimum)** across Reading Mode,
  not only against the Colophon: tab through every focusable element below 51rem
  and confirm none lands entirely behind the fixed Toolbar. The Colophon's own
  clearance settles its case; this checks the rest.

### Documents

- `CONTEXT.md`: new **Colophon** entry; amend **Chrome**, which today reads
  *"the Toolbar and the Drawer"*. Glossary only — no implementation detail.
- `spec.md`: strike "Nothing else frames the paper" (line 13) and describe the
  Colophon; add user stories for the owner-facing statements and the
  end-of-document contact; add this ticket to the index.

### Tests

Extend the ticket 12 suite, against the built output as ever:

- The Colophon renders on both `/` and `/en/`, outside `<main>`.
- Its language link points at the equivalent route in the other Locale and
  carries `lang` and `hreflang` for that Locale.
- Its email and LinkedIn hrefs equal the header's — the derivation holds.
- The copyright line contains the owner's name. **Not the year.**
- Below 51rem, the Colophon's content is not overlapped by the Toolbar at full
  scroll.
- Neither PDF contains any Colophon string, in either Locale.

## Out of scope

- **The Aside's Privacy Block is untouched.** It is CV content — the candidate
  authorising an employer — and a different statement in the opposite direction
  from the Colophon's.
- **`Località` stays off the Colophon.** No `url`, so not an action; repeating
  "Bari, Italia" in a colophon is restatement, not information.
- **No separate privacy-policy page.** With no forms, no analytics and one
  functional `localStorage` key, it would say "nothing is collected" at length.
  Line 2 says it in a clause.
- **No AgID accessibility statement**, for the reasons in *Decisions*.
- **No cookie banner.** Nothing to consent to.
- **The Toolbar's `language` string** (`ui.ts:55`) keeps its current wording.
- **No ADR.** Reversible by deleting a file; the contradicted claim is amended
  where it lives, in the spec.

## Acceptance

**Colophon**

- `npm run build` green: 0 errors, 0 warnings, 0 hints.
- The Colophon shows all five lines on both Locales, sits outside `<main>`, and
  is on the page background rather than a Sheet surface.
- Email, LinkedIn and the owner's name are byte-identical to the header's,
  because they are the same values — no second copy of any of them exists in
  `src/`.
- Both PDFs are still exactly 2 A4 pages (`assertTwoA4Pages`,
  `render-captures.mjs:84`) and contain no Colophon text. The OG card
  (`[data-og-card]`, `render-captures.mjs:90`) is unchanged.
- At 23rem width, scrolled to the bottom, no Colophon text is behind the
  Toolbar; the Colophon is not indented relative to the Sheet column.
- `CONTEXT.md` defines Colophon and no longer says Chrome is only two things;
  `spec.md` no longer claims nothing else frames the paper.

**Accessibility debt**

- Every Toolbar control exposes an `aria-label` matching its `ui.ts` string, and
  the docblock's claim is true of the code.
- No focusable element in Reading Mode is entirely obscured by the Toolbar when
  focused (WCAG 2.2 · 2.4.11).

## Depends on

- 04 (content model, `Contact.url`), 06 (Reading Mode, 51rem), 07 (Toolbar
  placement and `ui.ts`), 08 (PDF capture and its page assertion), 12 (E2E
  suite), 17 (`--space-*` scale)

## Comments

### Origin

Grilling session, 2026-07-27. The request was "a minimal footer with the
standard information". Reading the code first changed its shape: three of the
five items already existed on the page — the GDPR clause as an Aside Block
(`it.ts:276-287`), email and LinkedIn as header contacts (`it.ts:126-135`), the
language switch as a Toolbar control (`Chrome.astro:40`) — so the design work
was mostly deciding what the Colophon must *not* repeat, and in which direction
each statement faces.

The owner chose to keep the Toolbar accessibility work in this ticket rather
than split it into ticket 20, against the recommendation. The concern on record:
the Colophon cannot be called done until an unrelated pre-existing defect is
fixed, and anyone later searching for when the Toolbar's accessible names were
corrected will find it under a ticket named for the footer. Mitigated by keeping
it a named section with its own acceptance block.

### Implementation notes

Four things the ticket left open, and how they were settled.

- **One size, one ink, and tracking for the whole hierarchy.** The owner's
  brief for the visual design was: minimal, no background, small text in black
  or white, 12–14px, legible in both themes. That forbids both of the usual
  hierarchy devices — there is no step down from 12px that stays inside the
  brief, and there is no tone between black and the background to demote a line
  with. What is left is the letterpress colophon's own device: the © line is
  the only one set uppercase and tracked (`--font-display`, 0.14em), and
  everything else is one Lato paragraph after another at `--font-size-meta`,
  which is already 12px on paper and 14px in Reading Mode. The Toolbar's toast
  takes its size from the same token, so the Chrome keeps one scale.
- **The colour follows reset.css's three steps**, not one: `light-dark()` for a
  visitor without JS, a `prefers-color-scheme` rule for a browser without
  `light-dark()`, and `html[data-theme]` overrides for the Toolbar's explicit
  choice. Anything less leaves a case where the background flips and the ink
  does not — the E2E suite measures the contrast ratio in both themes rather
  than asserting a hex value.
- **`©` was not in the font subset.** `scripts/subset-fonts.mjs` covered Basic
  Latin from space to tilde and Latin-1 from `À` up, so the imprint's first
  glyph would have fallen back to a system face beside Garet. U+00A9 joins the
  punctuation set and the text faces were regenerated; seven of the eight
  changed, the signature face having no `©` to keep.
- **The theme control keeps `title` and no `aria-label`.** The acceptance says
  "every Toolbar control exposes an `aria-label`", but that control's name has
  to be correct before hydration and therefore comes from the pair of
  visually-hidden labels CSS chooses between — an `aria-label` would outrank
  and silence them, and the control would be named "Cambia il tema" instead of
  naming the theme it switches *to*. The other four carry it. The docblock's
  own wording already recorded the exception; the test now asserts it.

WCAG 2.2 · 2.4.11 needed no code: with the Colophon's clearance in place, no
focusable element in Reading Mode lands entirely inside the Toolbar's rectangle
when focused. `tests/toolbar.spec.ts` tabs through them all and would catch a
regression.

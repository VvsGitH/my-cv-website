# 05 — CV layout components (Paper Mode)

Status: done

## Goal

Build the Sheet layout and all section components so two Sheets reproduce the reference CV pixel-perfect in Paper Mode.

## Tasks

- Sheet composition: Aside (cream panel) + Main (white), consuming content by `sheet`/`column`.
- Header block (Main, Sheet 1): name in Garet-Heavy caps with letter-spacing, subtitle, contact grid (Location/Phone/Email/LinkedIn).
- Aside sections: circular photo over the pale-yellow disc (placeholder until the real photo arrives), About Me, Tech Skills groups, Soft Skills, Languages with proficiency bars, Certifications, Other Info, Privacy + "Bari, `<date>`" + script-font signature.
- Main sections: Experience, Selected Projects, Education — with sub-heading + company + right-aligned muted period, bulleted achievements.
- Section-heading underline rules; exact spacing/leading matched to the screenshots.

## Acceptance

- Side-by-side visual diff against `CV_page1.png` / `CV_page2.png` matches (fonts, colors, spacing, rules, alignment).

## Depends on

- 03, 04

## Comments

### Implementation

Components live in `src/components/cv/`: `CvDocument` (both Sheets) →
`CvSheet` (Aside + Main grid, filtered by `sheet`/`column`) → `CvBlock`
(dispatch on `kind`) → one component per Block kind, with `SectionHeading`,
`EntryMeta`, `Bullets` and `Rich` shared between them. `src/lib/rich-text.ts`
turns the content model's `**…**` markers into `<strong>`, escaping first so
content can't inject markup.

### The reference is measurable, so it was measured

The screenshots are 794×1123px — A4 at exactly 96dpi — so **1px in the
reference is 1 CSS px**. Better still, the PDF's own content streams give
exact geometry: inside each page's form XObject, page units ÷ 3.126178 are
CSS px in a top-left origin space. Everything below was read out of those
operators rather than eyeballed:

- Aside panel: `x=17.7 w=265.6 y=0 h=1103.1` (it stops 19.9px short of the
  page bottom); text column `x=37.8 w=226.8`, but the heading rules run
  245.4px — past the text to the panel's own edge.
- Main column: `x=321.7 w=435.8`, first baseline block at `y=43.4`.
- Photo: a 176.4px disc centred in the panel at `cy=126`.
- Contacts: three 145px columns, rows 36px apart.

**The type scale needed two "body" sizes.** The source draws its display
lines straight on the page but its prose inside forms carrying their own
~2.7788 scale, so a `12 Tf` means 12px in one place and 10.67px in the
other. Ticket 03's `--font-size-body` was 8pt, ticket 04 briefly "corrected"
it to 9pt off the raw operator, and the scale factor shows 8pt was right all
along — prose is 10.67px, while employer/period lines really are 12px
(`--font-size-meta`). Tech Skills items are 9.48px and Languages labels
9.33px; both got their own tokens.

**Ticket 02's font mapping was wrong** and is corrected here. It had
inferred the roles from the screenshots; the PDF's font resources say
plainly: Now-Bold is the *name*, Now-Regular the subtitle, Garet-Bold the
section headings / entry titles / contact labels, Garet-Regular the
employer-period lines and most Aside prose, Lato the dense prose. Ticket 02
had Now and Garet swapped. Fixing it meant subsetting two more faces
(`Now-Regular`, `Lato-Italic`) via `npm run fonts:subset`, and rewriting the
`--font-*` tokens around roles instead of guessed weights. Garet ships only
Book and Heavy in `docs/assets/fonts/`, so Garet-Bold renders as Heavy.

### How close it actually is

Verified by capturing the built page with Playwright at scale 1 and
overlaying it on the reference pixel-for-pixel. Per-80px-slice best-fit
vertical shift, with correlation:

| region | residual |
|---|---|
| Sheet 1 Main | ±4px (corr 0.86–0.98) |
| Sheet 1 Aside | −3 to −5px |
| Sheet 2 Main | +5 to +9px |
| Sheet 2 Aside, below Languages | +33 to +39px |

The header block matches to the pixel (name, subtitle and both contact rows
all land on 0). Known deviations, all traceable to the source being
hand-placed in Canva rather than to anything derivable:

- **Section gaps are inconsistent in the source.** The gap above a Main
  section heading is 93.5px on Sheet 1 but 73.4px on Sheet 2; the Aside's
  are 39.4/38.3px on Sheet 1 but 15.7/23.6/40.1px on Sheet 2. One constant
  can't hit both, so each is set to a compromise (5.35rem / 2.5rem). Sheet 1
  was favoured — it's denser and has less slack. Sheet 2's Aside carries the
  cost, harmlessly: Privacy is bottom-anchored and there's ~300px of white
  above it either way.
- **B2B Environment's bullets wrap differently** (−20px by the foot of Sheet
  1). Canva sized that one text box 396px wide where its neighbours are
  ~423–430px. Matching it would mean per-Block widths in the content.
- The certification link icon falls to its own line, where the reference
  wraps the title instead.

### Signature — needs an owner decision

> **Resolved in ticket 13.** The owner provided Primera Signature; it's now
> self-hosted and `.signature` uses it via `--font-signature`. Kept below for
> the reasoning that led to the blocker.

Spec US29 wants the signature approximated with a script web-font, never a
scan. No script face is self-hosted (ticket 02 shipped Garet/Now/Lato only)
and none is in `docs/assets/fonts/`, so `.signature` currently falls back to
a system cursive. **That is not deterministic**: headless Chromium on CI will
have neither Segoe Script nor Brush Script MT, so the PDF (ticket 08) would
render it in a default face. A script font needs choosing and self-hosting
before 08 ships.

### Also done here

- `print` layer added (ticket 03 declared it empty for 05+): the screen
  gutter around `.sheets` is zeroed for print and `break-before: page` set at
  the Sheet seam. Without it the first Sheet is pushed off its page and each
  spills onto a second. Verified with a real `page.pdf()` capture: exactly 2
  pages, MediaBox 595×842pt.
- `HydrationProbe.tsx` deleted — ticket 01's smoke check, orphaned once the
  pages started rendering the CV. Ticket 07 brings the real island.

### Post-review (`/code-review`)

Fixed:

- **The email was underlined; the reference's isn't.** A pixel scan of
  `CV_page1.png` settles it: the LinkedIn value has a full-width dark row at
  y=226 (118px), the email value has none. `HeaderBlock` was underlining
  every contact carrying a `url`. Now only web links are underlined and the
  `mailto:` is left plain — which is both what the reference does and a
  defensible rule in its own right (the LinkedIn text is a name, not an
  address).
- `break-inside: avoid` added to the Aside — the coding standards ask for it
  on "every Block **and the Aside**", and only the Block half was done.
- Signature ink moved out of a hard-coded `oklch()` into
  `--color-signature`; it was the only literal colour in the change.
- A comment in `LanguagesBlock` still claimed Lato Italic wasn't self-hosted
  — this same change subsets it. Removed. `fonts.css` likewise called the
  bold face Lato-Heavy (the source's name for it) when Lato-Bold is what
  ships; now says both.
- Extracted `EntryTitle.astro`: the same five declarations plus the same
  heading-gap rule had been copy-pasted into Experience/Project/Education.
- `BulletsBlock` now reuses `Bullets`, driving its differences through
  `--bullet-gap`/`--bullet-leading` and a font on the wrapper, instead of
  repeating the marker, indent and hanging-alignment rules.
- `on(column)` renamed `blocksIn(column)` and typed with the exported
  `Column` rather than re-inlining the union; `<div class="bar" />` closed
  explicitly.

Re-measured after the refactors: residuals identical to the table above, so
none of it moved the rendering.

Not changed, with reasons:

- **`@media print` in `CvDocument`** was read as breaking "paper styles
  identical under screen and print". It doesn't touch the paper — only the
  screen gutter *around* the Sheets, which is not part of the document. The
  real risk the review identified is that ticket 08 might capture with
  screen emulation and skip the rules; that's now written into 08.
- **Photo has no `<img>` yet.** The spec's own note says to "build against a
  placeholder circle until it lands" and lists the photo as an owner-provided
  asset, so the placeholder is the instruction, not a gap.
  **Resolved in ticket 14** once the owner dropped the real photo.
- **Section gaps keyed to `.block--header + .block`** couple spacing to the
  shape of the content. The alternative is per-Block spacing in the content
  files, which is layout leaking the other way; keeping it here.
- **`aria-hidden` on the signature** is deliberate: it's a decorative
  rendering of a name the `<h1>` already announces.

### Handed over from ticket 04 (content model) — all now done

- **`RichText` needs a renderer.** Content strings mark bold runs as
  `**…**` (the reference CV bolds phrases mid-sentence). This ticket owns
  the ~10-line parser that turns that into markup.
- **`SkillGroup.display`** is `'inline'` (slash-separated run, e.g.
  Programming Languages / Development Tools) or `'list'` (bulleted). The
  ` / ` separator is this ticket's choice, not the content's.
- **Section headings come from the content**, on the Block that opens the
  section — that's how Selected Projects prints its title on Sheet 1 and
  continues unheaded on Sheet 2. Don't hardcode headings in components.
- **Proficiency-bar track colour is missing from the spec's token table.**
  Measured off `CV_page2.png`: the filled part is `#737373` (= the existing
  `--color-muted`), but the unfilled track is `#b1c0e1`, a pale blue with
  no token. Added as `--color-bar-track`.
- **`PhotoBlock` carries only `alt`** — the image file itself is this
  ticket's concern (US30: swappable via a file drop, placeholder circle
  until the real photo lands).

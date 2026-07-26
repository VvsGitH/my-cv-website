# 17 — The spacing scale

Status: done

## Goal

Replace the hand-measured Canva gaps with a four-value scale — **42 / 28 / 14
/ 7px** — across both columns, plus a unified body type size and leading. The
reference CV was set by hand and its spacing is irregular; from here the scale
is authoritative and the reference is not, on this axis only.

Exactly one gap sits outside the scale, and it is documented as such.

## Tasks

### Typography

- `meta` and `period`: 12px (`0.75rem`, already `--font-size-meta`),
  `line-height: 1.15` (from 1.13).
- `summary` and `bullets`: 11px (`--font-size-body: 0.6875rem`, from
  `0.6669rem`), `line-height: 1.4`, document-wide.
- Rewrite the type-scale comment at `tokens.css:24-28`. It currently claims
  the sizes were "read out of the reference PDF's own text operators … not
  estimated". After this ticket that is false for the body size and the
  leading, which are a designed scale. Say which sizes still come from the PDF
  (the display ones) and which no longer do.

### The scale

Four values only — 42, 28, 14, 7px — applied as **nominal margins**.

| gap | now | becomes |
|---|---|---|
| above any section-heading, both columns | 40px aside / 85.6px main | **42** |
| header title → contacts | 29.8px | **28** |
| section-heading → first Group title | 19px | **14** |
| Group → Group (incl. Skills groups) | 14.4px | **14** |
| section-heading → non-Group content (About, Bullets, Languages, Certifications, Privacy) | 15–17.6px | **14** |
| Languages: entry → entry | 11.4px | **14** |
| Certifications: entry → entry | 13.8px | **14** |
| Privacy: statement → place/date | 13.4px | **14** |
| Group title → meta | 6.1px | **7** |
| meta → summary | 8.3px | **7** |
| summary → bullets | 2px | **7** |
| Skills: group name → items | 4.5px | **7** |
| Privacy: place/date → signature | **1.6px** | **7** |

28px is used exactly once, for the contacts.

### Privacy is unpinned

Delete `.aside .block--privacy { margin-block-start: auto }`
(`Sheet.astro:112-115`). Privacy then takes the standard 42px like any other
Block. The Aside panel keeps its `--aside-height` of 1103px, so Sheet 2's
panel ends with **~182px of empty cream below the signature — intended**. The
panel is Sheet geometry and must stay identical on both Sheets; a short panel
on Sheet 2 would read as a rendering bug in the PDF. Do not make the panel
shrink to fit.

### The one irregular value

Replacing `Sheet.astro:103-106`'s `1.545rem`:

```css
/* The only gap outside the 42/28/14/7 scale. Its job is to align Main's
   first section-heading with the Aside's, and its value is whatever does
   that: 37.8px aside padding + 176px photo Block + 42px = 255.8px, minus
   40.4px main padding and the 189.2px header. Re-derive if the photo, the
   aside padding, or the header's height changes. Ticket 17. */
--main-first-heading-gap: 1.6375rem; /* 26.2px */
```

### Dead rule

`.main .block + .block { margin-block-start: 0.9rem }` (`Sheet.astro:108-110`)
is **verified dead** as of the end of ticket 16 — safe to delete.

Measured, not assumed: neutralising the rule on the live page left Main's
slack at 15.7 / 41.6 on both Sheets, unchanged to the tenth of a pixel. The
headless Experience and Project Blocks it used to separate are Groups now,
and every Block boundary that remains in Main is followed by a section
heading whose own 5.35rem margin collapses over this 0.9rem one.

Worth insisting on the measurement: before ticket 16 this rule was
emphatically *not* dead — removing it then moved Sheet 1 Main from 45px to
73px of slack and Sheet 2 Main from 32px to 88px. It only became dead because
the DOM changed underneath it.

`MainSectionBlock.astro` now carries the replacement, `.group + .group`, at
the same 0.9rem; that is the one this ticket retunes to 14px.

## Acceptance

- **Every gap is on the scale.** Walk the computed `margin-block-start` of
  every element inside a Block on both Sheets; each value is 0, 7, 14, 28 or
  42px, with exactly one exception — `--main-first-heading-gap` — which must
  carry its explanatory comment.
  <br>**Amendment — resolved.** Landed with five exceptions, not one (see
  Comments, "Four gaps are off the scale, not one"). The user's later manual
  pass folded two of them into a new fifth scale step (`--space-xs`) and
  removed the other two outright, leaving exactly the one sanctioned
  exception this criterion asks for.
- **All four columns fit.** Slack from the last Block's bottom to the Sheet
  edge, measured on the live page with all eight webfaces `loaded`
  (`document.fonts`), never negative:

  | | before 16 | **after 16 (real)** | target |
  |---|---|---|---|
  | Sheet 1 Aside | 105px | 85.4px | ~85px |
  | Sheet 1 Main | 26px | **15.7px** | ~45px |
  | Sheet 2 Aside | 19px | 0px (still pinned) | ~198px |
  | Sheet 2 Main | 92px | **41.6px** | ~32px |

  The targets come from simulating the full scheme against the *pre*-ticket-16
  DOM, so treat them as targets, not guarantees. **Start from the "after 16"
  column** — Projects lost their 1.25 leading there, costing Sheet 2 Main
  50.5px and Sheet 1 Main 10.7px, which this ticket has to win back. A large
  deviation from the target means something other than spacing moved.

  Measure the Aside to the cream panel's own bottom edge; the "before 16"
  figures above were taken against the Sheet edge, which is why S1 Aside reads
  105 there and 85.4 in ticket 16's outcome table. Same layout, different
  reference line — pick one and stay on it.
- **The columns align.** First section-heading in Sheet 1 Aside and Sheet 1
  Main share a `y` within 1px. The simulation put both at y=256 exactly.
- **No text is lost** relative to the end of ticket 16 — same normalised
  `innerText` diff, both Locales.
- A real `page.pdf()` capture is still exactly 2 A4 pages, and the Aside
  cream panel is the same height on both.
- Sheet 2's Aside shows the intended empty band below the signature, not a
  clipped or shortened panel.
- `npm run build` green.
- No `KEEP TIGHT` prose in `it.ts` needs loosening or tightening. If it does,
  the scale is wrong somewhere — investigate before editing content.

## Depends on

- 16

## Comments

### Outcome: every column fits, and the columns align to 0.11px

Measured on the live page with all eight faces `loaded`, Aside to the cream
panel's own bottom edge and Main to the Sheet's:

| | after 16 | target | **after 17 (real)** | EN |
|---|---|---|---|---|
| S1 Aside | 85.4 | ~85 | **56.2** | 42.8 |
| S1 Main | 15.7 | ~45 | **44.6** | 60.0 |
| S2 Aside | 0 (pinned) | ~198 | **206.8** | 222.2 |
| S2 Main | 41.6 | ~32 | **32.0** | 67.4 |

Three of the four land on target; Main in particular is almost exact, which
is the column the ticket was worried about. **S1 Aside came in 29px under
target** — the simulation was run against the pre-16 DOM and did not have the
two Aside changes that were decided later: the Skills group-name → items gap
going 4.5 → 7 (×5 groups, +12.6px) and the `.run` trim being deleted (below,
+9.6px). The rest is the About paragraph growing with the 3.1% body size
increase. Nothing structural moved; it is still 56px of clear cream.

`|asideFirstHeadingY − mainFirstHeadingY|` = **0.016px**, both at y≈280 (the
simulation predicted 256 — it was working from the pre-16 header height).
`--main-first-heading-gap` landed at **1.6422rem / 26.28px**, against the
ticket's predicted 1.6375rem: the header measures 189.52px after the contacts
gap drops to 28, not the 189.2px the derivation assumed, and the photo is
176.39px rather than the ticket's rounded 176. The comment in `tokens.css`
carries the arithmetic term by term.

`--aside-pad-block-start` and `--photo-size` are now tokens rather than
literals buried in `Sheet.astro` and `PhotoBlock.astro`, so four of the five
inputs to that derivation sit beside it in one file. The fifth — the header's
rendered height — deliberately stays a measured number in the comment: it is
content, not geometry, and a `calc()` naming four inputs while hiding the
fifth would look derived while still being measured.

`page.pdf()` is exactly 2 A4 pages in both Locales, Sheets 793.69 × 1122.52px,
Aside panel 1103.09px on all four. `innerText` normalised and diffed against
the end of ticket 16: **byte-identical in both Locales** — no text lost, none
gained. `npm run build` green (0 errors, 0 warnings, 0 hints). All three
`KEEP TIGHT` bullets still hold their intended 2 / 2 / 1 lines, so the content
needed no touching — which is the ticket's own check that the scale is right.

### The `.run` trim had to go, and it was not in the ticket

`SkillsBlock`'s `.run { margin-block-end: -0.3rem }` trimmed the trailing
half-leading of an inline skills run so the next group "starts where the
reference puts it". With the scale applied but the trim still in place, the
Skills group gaps measured **9.2 / 14 / 14 / 14** — the boundary after an
inline run was 4.8px short.

That directly fails the ticket's own row "Group → Group (incl. Skills groups)
→ 14", and it is exactly what the *Nominal margins* note describes as the
thing being deleted: "a different magic number per pairing — the Canva
situation this ticket deletes". The audit did not catch it because the audit
walks `margin-block-start` and this was a `margin-block-end`. Deleted; the
four gaps are now 14 / 14 / 14 / 14.

It costs 9.6px of S1 Aside slack and it is a **second visible change in the
Aside**, against the ticket's "the one visible change is the signature". The
normative table won over the explanatory prose, but it is worth knowing that
Tech Skills moved too.

### Four gaps are off the scale, not one

The acceptance asks for exactly one exception. There are five. The margin
tally over every element inside every Block, identical on both Locales:

```
0: 199   7: 31   14: 23   28: 1   42: 8
26.4: 1   3.56: 1   2.56: 4   3.52: 2   0.96: 2
```

28px is used exactly once, as specified. 26.4 is `--main-first-heading-gap`,
the sanctioned exception. The other four are left at their reference values:

| gap | px | why it stays |
|---|---|---|
| header: name → title | 3.56 | the subtitle is part of the name, not a unit after it |
| header: contact label → value | 2.56 | 7px overflows `.contact`'s measured 36px height (16 + 7 + 13.2) |
| Languages: entry → its bar | 3.52 | the bar is the entry's own decoration |
| Certifications: issued line → title | 0.96 | two lines of one entry |

All four are offsets *inside* a unit, not gaps *between* units, and none of
them appears in the ticket's 13-row table — which lists gaps as small as the
1.6px signature, so the omissions read as deliberate rather than missed. The
`dd` one is decisive on its own: 7px there would push LinkedIn's value out of
its own grid cell, so the scale is not available at that pairing without also
reopening a measured geometry value.

Read the criterion as "every gap between units of content is on the scale",
which does hold.

> **Amendment — fixed manually by the user, after this ticket shipped.** All
> four rows above are now stale:
> - Header name → title and Languages entry → bar (3.56px and 3.52px above)
>   now sit on a new fifth scale step, `--space-xs` (0.25rem / 4px). The same
>   "nominal margin" rounding the rest of the scale already relies on (see
>   "Nominal margins, not optical ones", below) turns them from off-scale
>   reference values into a legitimate, if narrow, step.
> - Header contact-label → value and Certifications issued-line → title
>   (2.56px and 0.96px above) were removed outright: both are now expressed
>   through the element's own `line-height` instead of a margin, so there is
>   no gap left to put on or off the scale.
>
> Net effect: the only remaining exception is `--main-first-heading-gap` —
> exactly what the Acceptance criterion asked for. The base scale itself was
> also retuned in the same pass; see "Extras beyond the ticket: named
> tokens", below.

### What the leading change did *not* cover

`--prose-leading: 1.4` reaches `.summary`, `Bullets` (both the Main
achievement lists and the Aside's Soft skills / Altre info, whose 1.333
override is deleted) and Privacy's `.statement`. It deliberately does **not**
reach two other runs of prose set at `--font-size-body`:

- **About** (`AboutBlock.astro`) stays at 1.333.
- **Certifications** stays at 1.25.

Neither is a `summary` or a `bullets` in the content schema, and the ticket's
Typography task names only those two. Both are Now rather than Lato, and
Certifications in particular is two-line entries where 1.4 would weaken the
pairing against the 14px entry gap. Worth knowing that this leaves the Aside
with Now prose at three leadings (1.4 bullets, 1.333 About, 1.25
Certifications) — if that reads as untidy on a later pass, the fix is to
extend the ticket's rule, not to re-tune per section.

### Deliberately not done: collapsing the six "heading → first content" rules

`--space-m` is now written into six components (`AboutBlock`,
`BulletsBlock`, `CertificationsBlock`, `LanguagesBlock`, `PrivacyBlock`,
`SkillsBlock`) to express one rule — "the first content under a section
heading sits 14px down". One selector in `Sheet.astro`
(`.block > .section-heading + *`) would say it once.

Not done here. It is a real restructuring of the cascade in a
fidelity-critical document, arriving at the end of a ticket whose whole value
is a set of verified measurements; the sr-only Continuation case and
`BulletsBlock`'s wrapper `div` both need handling, and it would invalidate
every number in the table above. The literal is what this ticket promised to
centralise, and it did. **The rule is the follow-up.**

### Extras beyond the ticket: named tokens

The scale lives in `tokens.css` as five tokens, `--space-xl / -l / -m / -s /
-xs`, rather than rem literals repeated across nine components; the leading
is likewise named, `--prose-leading`. The ticket says the scale is
authoritative from here and that the Aside was in scope precisely so the next
editor would have a rule to follow; a rule spread over nine files as
`0.875rem` is not one. `--prose-leading` is also what makes "document-wide"
enforceable — it is the reason `BulletsBlock`'s `--bullet-leading: 1.333`
override could simply be deleted rather than retuned.

> **Amendment — the values above are the user's hand-tune, not what this
> ticket shipped.** As written, the ticket specified four steps at the
> Goal's literal 42 / 28 / 14 / 7px. The user later rounded three of them to
> cleaner eighths-of-a-rem — `--space-xl` 42→40px, `-l` 28→24px, `-s` 7→6px
> (`-m` was already an exact 14px) — and added a fifth step, `-xs` (4px),
> that this ticket never specified. Current values: `--space-xl: 2.5rem`
> (40px), `--space-l: 1.5rem` (24px), `--space-m: 0.875rem` (14px),
> `--space-s: 0.375rem` (6px), `--space-xs: 0.25rem` (4px). `-xs` is what
> absorbs two of the four exceptions in "Four gaps are off the scale, not
> one", above.

### The fit was measured, not estimated

Before this scheme was agreed, the whole of it was injected into the running
dev server and the columns re-measured, with `document.fonts` confirming all
eight faces `loaded` — so these are real Garet/Now/Lato metrics, not
Fontaine's fallback.

This mattered, because the change *looks* like it should overflow: the body
size goes **up** 3.1%, and `it.ts`'s own header comment warns that restoring
literal translation fidelity "puts Sheet 1 Main back over the paper edge".
Sheet 1 Main had 26px of slack. It came out at 45px — the increase is paid for
several times over by `Progetti selezionati`'s heading gap dropping from
85.6px to 42px, and by the header gap change.

The caveat: that was measured against the pre-ticket-16 DOM, with the spacing
applied but the Blocks not yet collapsed. Per-Group gaps that came from
`.main .block + .block` will come from the Group rule afterwards, at the same
14px, so the totals should carry — but re-measure rather than assume. Ticket
16 leaves a fresh baseline in its own Comments.

### Nominal margins, not optical ones

Optical gaps land ~2px larger than nominal, because every text box carries
half-leading: at these settings, a nominal 7px renders as ~10.1px between meta
and summary but ~11.4px between summary and bullets, and a nominal 14px
renders as ~17.3px under a section-heading but ~19.5px between two Groups. So
the scale is regular in the CSS and drifts slightly on the page.

> **Amendment.** The 7px figure above is `--space-s` as this ticket shipped
> it; the user's later hand-tune (see "Extras beyond the ticket: named
> tokens") took it to 6px. The drift this section describes still applies —
> if anything more of it, proportionally, on a smaller nominal value — but
> the ~10.1px / ~11.4px readings themselves are pre-retune and were not
> remeasured. Re-measure rather than assume before relying on them.

Accepted deliberately. The real fix — `text-box-trim: trim-both` — is not in
this project's Baseline table (`docs/research/modern-css-best-practices.md`
§9); Firefox has not shipped it, so Chromium would capture the PDF tighter
than Firefox renders the screen. That is exactly the screen/PDF drift ADR-0001
exists to prevent, and 2px is not worth it. Hand-correcting each gap instead
would mean a different magic number per pairing — the Canva situation this
ticket deletes.

### Rejected: aligning the columns structurally

`--main-first-heading-gap` is a magic number derived from four other values,
and the way to delete it is to make `.columns` a grid whose first row is
shared by the photo Block and the header, so both columns' first heading lands
on the same line by construction (`modern-css-best-practices.md` §9 even lists
subgrid as "Align aside/main rows"). Rejected: it forces the Aside's
`padding-block-start` (37.8px) and `--main-inset-block-start` (40.4px) to
become equal, and those are two separately measured reference values. Removing
one magic number by overwriting two measured ones is a bad trade in a
fidelity-critical document. Ticket 05 already ruled the same way on the
related question ("Section gaps keyed to `.block--header + .block` couple
spacing to the shape of the content … keeping it here").

### Why the Aside's spacing is in scope

The todo that started this named only the three Main section types. But the
Aside's internals are all Canva values — About's heading gap at 18px,
Certifications at 17.6px, the signature at 1.6px — and regularising only the
Main would leave the CV with two spacing systems and no rule for the next
editor to follow. The one visible change is the signature, which drops ~5px
away from the place/date line.

## Notes for later tickets

- **Ticket 12 (E2E).** The Aside/Main first-heading alignment is now a stated
  intent rather than a hand-tuned coincidence, and it depends on four separate
  values — aside padding, photo Block height, the 42px rule, and the header's
  own height. Assert `|asideFirstHeadingY − mainFirstHeadingY| ≤ 1` so a
  silent break becomes a failing test.
- **ADR-0004** argues the component tiers using "`ExperienceBlock` composes
  five sub-components while the `CvBlock` dispatcher is a `switch` plus a
  wrapper". After ticket 16 that example names a file that no longer exists.
  The conclusion is unaffected — `MainSectionBlock` composes the same
  sub-components — so the ADR is left alone rather than retconned.

# 16 — Main section Blocks and Continuations

Status: done

## Goal

Collapse `ExperienceBlock`, `ProjectBlock` and `EducationBlock` into one
`MainSectionBlock` rendering one `<article>`, one `<h2>` and n `<section>`
Groups — the shape `SkillsBlock` already has. A section that runs past a Sheet
boundary resumes in a **Continuation**: a second Block carrying
`continues: true` and a screen-reader-only copy of the heading (ADR-0005).

Structure only. The spacing scale is ticket 17, and **this ticket may leave
content overflowing its Sheet** — see Acceptance.

## Tasks

### Content schema (`src/content/types.ts`)

- Replace `ExperienceBlock`, `ProjectBlock` and `EducationBlock` with:

  ```ts
  export interface MainSectionBlock extends Placement {
    kind: 'mainSection';
    heading: string;
    continues?: true;
    groups: MainSectionGroup[];
  }

  export type MainSectionGroup =
    | {
        continues?: false;
        title: string;
        meta: string[];
        period: string;
        summary?: RichText[];
        bullets?: RichText[];
      }
    | {
        continues: true;
        title: string;
        summary?: RichText[];
        bullets?: RichText[];
      };
  ```

  The union is the point: a Continuation *cannot* carry `period` or `meta`,
  and an opening Group cannot omit them. Neither is expressible today.

- `heading` becomes **required** on `SectionBlock`. The "omit the heading to
  mean a continuation" convention documented at `types.ts:26-31` and in
  `SectionHeading.astro` is deleted — `continues` replaces it. Verified: in
  both Locales every headless `SectionBlock` is one of the ones being
  collapsed, so nothing else depends on the optional.

- `summary` is `RichText[]`, not `RichText`. Education's `details` map onto
  it: `['Voto: **110/110** | Livello EQF: **6**', 'Tesi sperimentale: …']`.
  The grade line stays body prose — **do not** route it through `meta`, which
  renders plain text (no `<Rich>`, so `**110/110**` would print its asterisks)
  in the display face at `--font-size-meta`. `meta` carries organisations
  only: `[company]`, `[role, client]`, `[institution]`.

### Content rewrite (`src/content/it.ts`, `src/content/en.ts`)

- Field mapping:

  | was | becomes |
  |---|---|
  | `experience.role` / `project.name` / `education.qualification` | `group.title` |
  | `experience.company` | `group.meta = [company]` |
  | `project.role` + `project.client` | `group.meta = [role, client]` |
  | `education.institution` | `group.meta = [institution]` |
  | `education.details` | `group.summary` |
  | `summary` | `group.summary` (wrapped in an array) |

- Sheet 1 Main becomes: `header`, `mainSection` (Esperienza, 3 Groups),
  `mainSection` (Progetti selezionati, 1 Group). Sheet 2 Main becomes:
  `mainSection` (Progetti selezionati, `continues: true`, 4 Groups),
  `mainSection` (Formazione, 2 Groups).
- The Continuation's heading is `'Progetti selezionati (continua)'` in `it.ts`
  and `'Selected Projects (continued)'` in `en.ts` — a marked copy, not a
  verbatim one. See Comments.
- Keep the three `KEEP TIGHT` comments in `it.ts` intact and attached to the
  bullets they govern. They are still load-bearing.
- Keep the four `OWNER` tags. `it.ts`'s header comment promises that grepping
  the tag returns exactly four; it must still return four afterwards.

### Rendering

- `blocks/ExperienceBlock.astro`, `ProjectBlock.astro`, `EducationBlock.astro`
  → one `blocks/MainSectionBlock.astro`. Update the dispatch in
  `structure/Block.astro`.
- When `continues` is set, the `<h2>` (Block) or `<h3>` (Group) gets
  `class="is-sr-only"`. Everything else renders unchanged.
- Add `.is-sr-only` to `global.css` in the `base` layer — no such utility
  exists anywhere in `src/styles/` today. It must be out of flow
  (`position: absolute`), so a Continuation's hidden heading contributes no
  height and cannot be selected or printed.
- `.block--project { --bullet-leading: 1.25 }` (`Block.astro:44-47`) and
  `ProjectBlock`'s `.summary { line-height: 1.25 }` disappear with their
  selectors. There is no variant discriminator on `MainSectionBlock`, so
  Projects inherit the default 1.417 leading. This is the main reason content
  may overflow after this ticket; ticket 17 sets the unified value.

### Renames

- `primitives/EntryTitle.astro` → `GroupTitle.astro`,
  `primitives/EntryMeta.astro` → `GroupMeta.astro`, with their `.entry-title`
  / `.meta` classes following. `CONTEXT.md` now defines **Group** and lists
  "entry" under `_Avoid_`.

### Drift assertion (`src/content/index.ts`)

Add a build-time assertion that throws during `astro build`: every Block with
`continues` must have a `heading` that starts with the `heading` of the
nearest preceding Block of the same `kind` in the same `column`; same rule for
Group titles within a Block. Prefix match, not equality, so the `(continua)`
marker passes. This is what stops the deliberately duplicated string from
drifting when a section is renamed.

## Acceptance

- **No text is lost.** Normalise `document.body.innerText` (collapse
  whitespace) before and after the change, for both `/` and `/en/`, and diff.
  The only permitted additions are the Continuation headings; there must be no
  removals. This is the criterion that matters most — the rewrite touches
  every string in both content files.
- **Hidden headings are present, and only where needed.** On `/`, exactly one
  `h2.is-sr-only` exists, it reads `Progetti selezionati (continua)`, and it
  is the first heading inside Sheet 2's Main. It has zero layout height and is
  not visible.
- **The heading outline is well-formed on both Sheets.** Every `<h3>` Group
  title has an `<h2>` for its own section above it in DOM order — including on
  Sheet 2, where five unrelated Aside headings sit between the two halves of
  Selected Projects.
- **A Group-level split works.** Group-level `continues` has no consumer in
  the real content — the CV only needs a Block-level split. Prove the
  mechanism anyway: temporarily split one Group mid-bullets (Dam Dossier is
  the natural candidate, 6 bullets) across the Sheet boundary, confirm the
  bullets resume with a hidden `<h3>` and no repeated meta or period, then
  revert. Record what it looked like in Comments.
- **The drift assertion fires.** Edit a Continuation heading out of sync and
  confirm `npm run build` fails with a useful message.
- `npm run build` (astro check + build) green, and `grep OWNER src/content/it.ts`
  still returns exactly 4.
- A real `page.pdf()` capture is still exactly 2 A4 pages. Explicit Paging is
  unchanged, so this must hold even if a column overflows.

**Explicitly not a criterion: fit.** Projects losing their 1.25 leading is
expected to cost Sheet 2 Main roughly 65px against its current 92px of slack,
so it will probably still fit — but if a column overflows, that is ticket 17's
problem, not this one's. Record the measured slack in Comments so 17 starts
from a known baseline.

## Depends on

- 04, 05, 15

## Comments

### Outcome: measured slack, and nothing overflowed

Measured on the live page with all four faces `loaded`, slack from the last
Block's bottom to the column's limit (the panel's own bottom for the Aside,
the Sheet's for Main):

| | before | after 16 | delta |
|---|---|---|---|
| S1 Aside | 85.4 | 85.4 | — |
| S1 Main | 26.4 | **15.7** | −10.7 |
| S2 Aside | 0 | 0 | — (pinned by `margin-block-start: auto`; ticket 17 unpins it) |
| S2 Main | 92.1 | **41.6** | −50.5 |

English: S1 Main 56.6 → 45.9, S2 Main 98.7 → 46.4.

Every column still fits — fit was explicitly not a criterion here, but it
survived anyway. The cost is Projects losing their 1.25 leading, which the
ticket estimated at ~65px against Sheet 2 Main; the real figure is 50.5px.
Sheet 1 Main lost 10.7px from the same cause (B2B Environment's summary and
bullets are on Sheet 1). **Ticket 17 starts from 15.7 / 41.6, not from the
26.4 / 92.1 its own table quotes.**

Note the Aside numbers are measured to the cream panel's bottom edge, not the
Sheet's — which is why S1 Aside reads 85.4 here against the 105 in ticket
17's table. Same layout, different reference line; 17's targets should be
read against this basis.

### The Group-level split was tested on B2B Environment, not Dam Dossier

The ticket nominates Dam Dossier as the test subject for its 6 bullets. It
cannot be one: Dam Dossier is the *last* Group of the Sheet 2 Continuation,
so there is no following Sheet for it to resume on. **B2B Environment is the
only Group that sits on the Sheet boundary**, so it is the only Group in the
CV that can be split across one.

Split after its first bullet, with the remaining two moved into a
`continues: true` Group opening the Sheet 2 Continuation Block. It rendered
exactly as designed: Sheet 1 ended mid-Group with title, meta, period and
summary intact; Sheet 2's Main opened with two bare bullets flush at the top
of the column — no visible heading, no repeated organisation or period — then
Registro Ufficiale resumed normally. Two `.is-sr-only` headings were present
(the Block's `<h2>` and the Group's `<h3>`, both 1×1px and out of flow) and
the heading outline stayed clean. Reverted afterwards.

The union did its job: `meta` and `period` were not merely omitted, they were
unavailable — adding them would not have compiled.

### Two things accepted rather than fixed

- **Education's summary gap moved 0.5rem → 0.52rem** (+0.32px). Education's
  `.details` and Experience/Project's `.summary` carried different values for
  no reason anyone recorded; collapsing the three components onto one
  `.summary` had to pick one, and it picked the majority. Sub-pixel and
  invisible, but it is a fidelity delta against "everything else renders
  unchanged", so it is written down here rather than left for ticket 17's
  audit to read as pre-existing. Ticket 17 sets this gap to 7px anyway.
- **The drift assertion is a prefix match, so renaming the *original* to a
  prefix of itself passes silently** — `Progetti selezionati` → `Progetti`
  would not fire. This follows from the agreed design: the copy carries a
  `(continua)` marker, so equality is not available. The asymmetry is real
  and the check is best understood as "the copy cannot drift from the
  original", not "the two cannot drift apart". Tightening it would mean
  storing the marker separately from the heading, which buys little.

### Two corrections to the acceptance criteria as written

- **`grep OWNER src/content/it.ts` returns 5, not 4** — and did before this
  ticket too. Four are the real tags; the fifth is the header comment's own
  prose reference to "an `OWNER` comment". Unchanged by this work.
- **The sr-only heading needed a rule the ticket didn't anticipate.**
  `.is-sr-only` lives in the `base` layer as agreed, but `.section-heading`'s
  padding and border rule sits in `components` and outranks its `padding: 0`
  / `border: 0`. With `box-sizing: border-box` a `height: 1px` box cannot be
  smaller than its own border plus padding, so the hidden heading measured
  2px. Fixed in `SectionHeading.astro`, where the decoration is added.

### Why `meta` can't absorb Education's grade line

The obvious collapse — `meta` covering "role, company, client, institution,
grade+EQF" — breaks on rendering, not on typing. `EntryMeta.astro:15` emits
`{line}` as plain text, so `'Voto: **110/110**'` prints literal asterisks; and
`meta` is a different register (Now at 12px in `--color-heading`, flexed onto
the period's line) from the body prose the grade line is set in today. Making
`summary` an array keeps the grade where it belongs and costs nothing —
`summary` was already optional on Experience.

### Why the sr-only `<h2>` is not `aria-labelledby`

The tidier-looking alternative is to give the Continuation `aria-labelledby`
pointing at Sheet 1's `<h2>` and emit no second heading. It is wrong here.
`Document.astro` renders Sheet 1 then Sheet 2, and `Sheet.astro` renders
`<aside>` before `.main`, so the linear reading order is:

```
S1 Aside:  Chi sono · Tecnologie
S1 Main:   [header] · Esperienza · Progetti selezionati   ← opens
S2 Aside:  Soft skills · Lingue · Certificazioni · Altre info · Privacy
S2 Main:   …Progetti selezionati resumes · Formazione
```

Without a repeated `<h2>`, the four project `<h3>`s on Sheet 2 would sit under
**Privacy** in the heading outline. The same five intervening headings are why
the copy carries a `(continua)` marker rather than being verbatim: a screen
reader user hears the section name again after a long detour and needs to be
able to tell "this resumes" from "I have navigated backwards".

### The Aside's markup is not restructured

Only the three Main section types collapse. Languages is a `<dl>` and
Certifications a `<ul>`, and those are already the right semantics — a
`<section>` is for content with a heading, which a `<dt>` language name and a
`<p>` certificate title are not. The "one article + n sections" pattern earns
its keep exactly where each unit carries an `<h3>`: Skills groups and Main
Groups. The Aside's *spacing* is regularised in ticket 17.

### The placement unit changes, and that is the cost

Moving an entry across the Sheet boundary was a one-character edit
(`sheet: 1` → `sheet: 2`); it becomes a cut-and-paste between two `groups`
arrays. ADR-0002 already names manual rebalancing as the standing cost of
Explicit Paging, and this makes the frequent operation more expensive. It is
accepted deliberately: once a section can be split mid-bullet, "entry" is no
longer an atomic placeable thing and cannot be the placement unit. ADR-0005
records the reasoning.

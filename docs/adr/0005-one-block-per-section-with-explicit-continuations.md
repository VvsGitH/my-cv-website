# One Block per section, with explicit Continuations

Experience, Selected Projects and Education were three Block types, one Block
per entry, with the section heading carried by whichever Block opened the
section and omitted by the rest. They become a single `MainSectionBlock`
holding n Groups — one `<article>`, one `<h2>`, n `<section>` — and a section
that runs past a Sheet boundary resumes in a **Continuation**: a second Block
marked `continues: true`, carrying a copy of the heading rendered for screen
readers only. This refines ADR-0002 rather than replacing it: every Block
still declares its own `sheet` and `column`, and paging is still explicit.
What changes is the unit — from "one entry" to "a run of entry material that
sits in one column of one Sheet".

## Considered Options

- **Keep one Block per entry.** Placement stayed a one-character edit
  (`sheet: 1` → `sheet: 2`), which ADR-0002 already names as the standing cost
  of explicit paging. Rejected because the markup was wrong in a way that
  compounds: three sibling `<article>`s each implicitly claiming to be
  "Esperienza", and a heading whose *absence* was the only signal that a
  section continued. It also made spacing a set of sibling-selector special
  cases (`.block + .block`, `:first-child`, `.block--header + .block`) rather
  than rules inside one container.

- **Derive the Continuation's heading instead of copying it.** The renderer
  could look back for the nearest preceding Block of the same kind and reuse
  its heading, removing the duplicated string. Rejected: `Block.astro` receives
  only the Block it renders, and threading the whole document through it to
  resolve one label couples every Block to its siblings across Sheets. The
  duplication is instead policed by a build-time assertion in
  `content/index.ts`, consistent with this project's habit of failing the
  build rather than shipping a broken layout.

- **`aria-labelledby` on the Continuation, no second heading.** Avoids the
  duplicate `<h2>` entirely. Rejected on the actual reading order: Sheet 2's
  Aside — five headings, Soft skills through Privacy — sits between the two
  halves of Selected Projects in the DOM, so without a repeated `<h2>` the
  continued project `<h3>`s would be orphaned under "Privacy" in the heading
  outline.

- **Auto-flow.** Already rejected in ADR-0002 and rejected again here for the
  same reason; the `_Avoid_` list on **Continuation** in `CONTEXT.md` exists
  to stop a reader assuming this mechanism is reflow by another name.

## Consequences

- Moving an entry across the Sheet boundary is now a cut-and-paste between two
  `groups` arrays, not an edit to one number. This is the main ergonomic cost
  and it is deliberate: once a section can be split mid-bullet, "entry" is no
  longer an atomic placeable thing and cannot be the placement unit.
- A section may be split at any point — between Groups, between a summary and
  its bullets, or between two bullets — because every field except `title` is
  optional on a continued Group, enforced by a discriminated union on
  `continues`.
- `heading` becomes required on every section Block. The "headless means
  continuation" convention is gone, and with it the class of bug where a
  forgotten heading silently reads as a continuation.
- Two strings in the content are duplicates by design (the section heading, and
  a Group title when a Group itself is split). A build-time prefix assertion
  keeps them in sync; the copy carries a `(continua)` / `(continued)` marker,
  so the check is a prefix match rather than equality.
- `CONTEXT.md` gains **Group** and **Continuation**, and **Block** loses "one
  Experience entry" from its definition.
- The three types collapse without a variant tag, so Projects lose their
  tighter bullet leading. That was a Canva artefact, and the spacing work in
  ticket 17 more than repays the height it costs — but between tickets 16 and
  17 a column may overflow, which is accepted.

# Domain-named component tiers

`src/components/` is split into three tiers by how independently a piece can stand on a Sheet — `primitives/` (reusable, never autonomous), `blocks/` (the Blocks of CONTEXT.md, autonomous units of CV content), `structure/` (the Document → Sheet → Block spine) — plus a fourth sibling, `chrome/`, for everything that is not paper. The tiers are named in the project's own vocabulary rather than atomic design's `atoms`/`molecules`/`organisms`, and the tier is the first level under `components/` rather than nesting under a feature folder.

The A4 geometry primitive (`components/Sheet.astro`) was merged into `structure/Sheet.astro` at the same time, and the `Cv` prefix dropped from `CvDocument`/`CvSheet`/`CvBlock`.

## Considered Options

- **`atoms` / `molecules` / `organisms`** — the recognisable convention, readable by any frontend developer without explanation. Rejected on two counts. First, `molecule` would become a second name for a concept `CONTEXT.md` already defines as **Block**, with its own `_Avoid_` list — precisely the drift the glossary exists to prevent. Second, the labels would misdescribe this codebase: `ExperienceBlock` composes five sub-components while the `CvBlock` dispatcher is a `switch` plus a wrapper, so calling the former a molecule and the latter an organism inverts the actual complexity gradient. The gradient that matters here is *autonomy on a Sheet*, not composition depth.
- **Family-first (`components/cv/{…}` beside `components/chrome/`)** — isolates the CV from the chrome, but with ~20 components it buys depth (`components/cv/primitives/Rich.astro`) and forces a decision about whether the 2-file chrome also sub-divides into tiers. Rejected: one family dominates and the CV *is* the site.
- **Keeping the A4 primitive as a separate component** — geometry and internal composition do change for different reasons, which normally justifies two files. Rejected on evidence: its `class` prop was dead (`.cv-sheet` was styled nowhere), `--sheet-scale` had no producer anywhere in the codebase, ticket 10's OG image snapshots the rendered page rather than instantiating a bare Sheet, and ticket 03's isolation test was a one-off whose demo ticket 05 already deleted. Decisively, ticket 06 must *dismantle* the A4 box below 816px for Reading Mode, and a scoped-style boundary sitting exactly where an override is needed would have to be crossed with `:global()` — a cost this codebase already documents in `EntryTitle.astro`.

## Consequences

- A reader expecting `atoms/molecules/organisms` will not find it; this ADR is the answer to "why not?".
- `CONTEXT.md` gains **Chrome** as a term, since it is now the concept justifying the fourth folder rather than an informal aside in the Toolbar entry.
- One term, one component: `Sheet` in the glossary now maps to exactly one file, resolving an ambiguity where both `Sheet.astro` ("A Sheet has fixed physical dimensions") and `CvSheet.astro` (the Aside/Main columns the glossary attributes to a Sheet) could claim it.
- `chrome/` is created by ticket 06/07, not now — git does not track empty directories.
- Placing a genuinely reusable, non-CV-specific component becomes a judgement call: `primitives/` is scoped to the CV's typographic leaves by name.
- No path aliases were introduced; the move made imports shallower (`../../content/types`), so there is nothing to abbreviate.

# 15 — Folder structure

Status: done

## Goal

Reorganise `src/` so assets sit under `src/assets/` and components are grouped by how independently a piece can stand on a Sheet, replacing the single `components/cv/` bucket (ADR-0004).

## Tasks

- Move `src/fonts/` → `src/assets/fonts/` and `src/images/` → `src/assets/images/`; update the 8 `@font-face` URLs in `fonts.css`, the 8 destination paths in `scripts/subset-fonts.mjs`, and `PhotoBlock`'s image import.
- Split `src/components/` into `primitives/` (Rich, SectionHeading, EntryTitle, EntryMeta, Bullets), `blocks/` (the 11 `*Block.astro`), `structure/` (Document, Sheet, Block). Reserve `chrome/` for the Toolbar and Drawer — created by ticket 06/07, not here.
- Merge the A4 geometry primitive `components/Sheet.astro` into `structure/Sheet.astro`; drop its dead `class` prop and the unstyled `class="cv-sheet"`.
- Drop the `Cv` prefix: `CvDocument` → `Document`, `CvSheet` → `Sheet`, `CvBlock` → `Block`.
- Keep the `Block` suffix on the 11 content components.

## Acceptance

- `npm run build` (astro check + build) green.
- A real `page.pdf()` capture is still exactly 2 A4 pages at MediaBox 595×842pt.
- All 8 self-hosted faces still resolve from the new paths, with no external requests.
- No visual change: the rendering is byte-for-byte equivalent modulo antialiasing.

## Depends on

- 05, 13, 14

## Comments

### Why not `atoms` / `molecules` / `organisms`

Recorded in ADR-0004. Short version: `molecule` would have become a second
name for **Block**, which `CONTEXT.md` already defines with its own `_Avoid_`
list; and the atomic-design labels misdescribe this codebase, where
`ExperienceBlock` composes five sub-components while the `CvBlock` dispatcher
is a `switch` plus a wrapper. The gradient that matters here is *autonomy on
a Sheet*, not composition depth — so the folders are named for that.

`chrome/` exists as a decision, not yet as a directory. The word is not
invented: `CONTEXT.md`'s Toolbar entry already called it "the site's only
chrome", and the term is now promoted to the glossary because it is what
justifies a fourth folder sitting beside three document tiers.

### The A4 primitive was a premature abstraction

`components/Sheet.astro` existed from ticket 03 as "the reusable A4 Sheet
primitive" and had exactly one consumer. Four pieces of evidence said it was
not earning its keep:

- Its `class` prop was dead — `CvSheet` passed `class="cv-sheet"` and
  `.cv-sheet` was styled nowhere.
- `--sheet-scale` had no producer anywhere; it existed only as
  `var(--sheet-scale, 1)` inside the primitive itself.
- Ticket 10's OG image explicitly "can reuse the Playwright step to snapshot
  page 1 to PNG" — it photographs the rendered page, so it will not become a
  second consumer either.
- Ticket 03's isolated `page.pdf()` was a one-time verification, and the
  bare-Sheet demo it left in the two pages was deleted by ticket 05.

The argument *for* keeping it was real — geometry and internal composition
change for different reasons — but it loses to a concrete cost: ticket 06
must dismantle the A4 box below 768px for Reading Mode, and a scoped-style
boundary sitting exactly where an override is needed has to be crossed with
`:global()`. `EntryTitle.astro` already carries a comment documenting that
exact pain ("`.section-heading` comes from the SectionHeading component, so
it carries a different scope hash and has to be matched globally"). Merging
keeps geometry and reflow in one scope for ticket 06.

`--sheet-scale` survives the merge — it is ticket 03's documented contract
and the medium tier of ticket 06 will finally set it.

### The `Block` suffix stays, against the stutter

`blocks/AboutBlock.astro` stutters, and dropping the suffix would also have
closed a latent collision (the component `AboutBlock` and the *type*
`AboutBlock` from `content/types.ts` share a name; nothing imports both
today). Two concrete cases decided it the other way:

- **`Header`** — `CONTEXT.md` says Main "holds the header (name, title,
  contacts)" and ticket 06 adds a *compact header* for Reading Mode that will
  live in `chrome/`. `blocks/Header.astro` and that one would be
  indistinguishable.
- **`Languages`** — the language-proficiency Block versus the Toolbar's
  **Language** action (ticket 07). `blocks/Languages.astro` beside a future
  `chrome/LanguageToggle.tsx` is a trap.

Naming `structure/Block.astro` is not a collision with the `blocks/` folder:
that file renders `<article class="block block--{kind}">`, so it *is* the
Block; the 11 files are its bodies, one per `kind`.

### Verified

Not trusted to `astro check` alone, since the change touches both paper
geometry and font URLs — the two things with documented acceptance criteria.

| check | result |
|---|---|
| `astro check` + `astro build` | 0 errors, 0 warnings, 31 files |
| real `page.pdf()` | **2 pages**, MediaBox `594.96 × 841.92pt` = 595×842 |
| Sheet layout box | 793.69 × 1122.52px = A4 at 96dpi, ×2 |
| `document.fonts` | all 8 faces `loaded`, 0 external requests, 0 failures |
| visual before/after | Aside panel edges identical (x=421→685); 0.0059% of subpixels differ by >8, mean delta 0.019 — antialiasing only |

`Document` as a component name shadows the DOM's `Document` in those two
modules. It is legal, module-scoped, and `astro check` is clean; neither page
touches the DOM type.

### Found in passing

**Ticket 08's task list contains a call that would throw.** It specifies
`page.pdf({ preferCSSPageSize: true, printBackground: true, margin: 0 })`,
but Playwright's `margin` takes an object, not a number — `margin: 0` fails
with "expected object, got number". The verification here used
`margin: { top: 0, right: 0, bottom: 0, left: 0 }`. Left for ticket 08 to
correct in its own implementation rather than editing a ticket that hasn't
started.

**Unrelated: much of the CV content renders empty.** The About paragraph,
several bullet lists and most entry titles are blank strings in
`src/content/it.ts` / `en.ts`. Out of scope here — flagged for whichever
ticket owns filling them in.

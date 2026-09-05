# 07 — Write down what was decided

Status: ready-for-agent

Depends on: 06. Written last, describing what is in the tree rather than what was planned.

## Goal

Record the decisions and the ADRs this work supersedes, and bring the glossary and the standards
back in step with the code.

## Files

- `docs/adr/0025-the-toolbar-becomes-a-sticky-bar.md` — new
- `CONTEXT.md`
- `docs/coding-standards.md`
- `docs/issues/cv-website/spec.md`
- `docs/hacks/2026-08-01.md`
- `docs/todos/ideas.md`
- `docs/prompts/new-toolbar-prompt.md` — delete
- `docs/issues/toolbar-restyle/` — **delete the whole directory**, this ticket included

## Detail

**ADR-0025.** 0012, 0020, 0022 and 0023 are gaps in the sequence; 0025 is the first free number.
Follow the house form: a decision in the title, `## Considered Options` with the rejections and
their reasons, `## Consequences` with what was measured, and say what the numbers are *of*.

It has to carry, by name:

- the sticky bar and the two shapes it replaces;
- the step-function `clamp()`, why the threshold stays emergent, and both constants — the
  `+ 1px` and the `100000` — with the 1016px measurement that forced the second;
- **the pill's border, and the 1.4.11 failure that forced it**, with all three rows of the
  contrast table and a note that the earlier attempt's failure mode was a different one that
  ADR-0019 had already closed;
- the language's `sessionStorage` travel, with `@view-transition { navigation: auto }` recorded
  as rejected and *why* — the brief, not a technical objection;
- the shadow's `IntersectionObserver`, recorded honestly as the one piece of JavaScript this
  rewrite adds, with `animation-timeline: scroll()` rejected pending Firefox;
- the radiogroup for the theme and links for the language, and why the two pairs are marked up
  differently despite looking the same;
- the inversion of 2.4.11 from `block-end` to `block-start`.

State what it supersedes rather than leaving the reader to infer it:

- **ADR-0008** — the two shapes, and the rail-overlap defect that stood open, both gone. Its
  Drawer half was already superseded by ADR-0017. **Say that the open defect is closed by
  deletion, not by fix** — the shape that had it no longer exists.
- **ADR-0013** — the reserved berth. The Colophon's own decisions stand untouched.
- **ADR-0016** — amended, not superseded. Its decision holds; only the sentence describing the
  circle's two origins is now false, because neither origin exists. Write the amendment into
  ADR-0016 itself in the house style, dated, as that file's own earlier amendments are.

**`CONTEXT.md`.** Rewrite the **Toolbar** entry around the new shape — sticky at the top of the
page, five actions in six controls, text and icons on the page background, a rule as wide as the
content below — and drop `header` from its `_Avoid_` list, keeping `navbar` and `controls`. The
**Chrome** and **Colophon** entries stay true as written; do not touch them.

**`docs/coding-standards.md`.** Four things there are now false:

- the `components/chrome/` line still names the Drawer;
- the Preact section still calls it "two hydrated client islands";
- **the sanctioned module-level-signal exception for `linkCopied`** — its reason was that two
  islands shared `state.ts`, and neither the second island nor `state.ts` exists. Delete the
  entry rather than re-pointing it, and say in the ADR that it went;
- the `client:idle` note, which now governs three islands and should say which ones and why
  neither `client:only` nor `client:media` fits.

Check the CSS section too: it names `components/chrome/drawer.css` as the example of the plain-
stylesheet exception, and that file is gone. `toolbar.css` is the surviving example.

**`docs/issues/cv-website/spec.md`.** Its `### Toolbar` section describes two shapes and five
icon-only actions; update it. Its token table gains the pill's border. While you are in there,
its stated Paper Mode floor of `888px` is **stale** — the tree says 856, from the older 24px
gutter; fix it or say why not.

**`docs/hacks/2026-08-01.md`.** Entry 10 (`@media (hover: hover)` on the Toolbar's controls)
survives if the rewrite keeps the gate — check, and update the file path if the entry stays.
Entries 1–4 are about `drawer.css` and `Drawer.tsx`, deleted by ADR-0017; strike them under
`## Removed` if nobody has yet, keeping the numbering gaps as that file's own preamble requires.

**`docs/todos/ideas.md`.** The uncommitted diff already retitles `# CR` to `# NEXT STEPS` and
drops the toolbar block, leaving the Command Bar. Commit that; the brief it carried has been
carried out.

**`docs/prompts/new-toolbar-prompt.md`.** Delete it. It is an untracked brief whose content now
lives in the spec and the ADR — the same treatment `TODO.md` got.

**`docs/issues/toolbar-restyle/`.** Delete it — the spec and all seven tickets, this one last.
This follows the precedent the project set and wrote down: the 21 tickets that built the site
were deleted in `a9589dd` once their load-bearing content had been salvaged into `docs/adr/`.

**Nothing load-bearing may be deleted without a home.** Before removing the directory, check that
each of these has landed somewhere permanent: the two `clamp()` constants and what happens
without them, the contrast table, the fixed `[it, en]` order and what reads it, the pre-paint
reason for the language script, and the no-JS `prefers-color-scheme` rule in `toolbar.css`.

## Acceptance

- `docs/adr/0025-*.md` exists and names its four relationships explicitly.
- ADR-0016 carries a dated amendment on the circle's origin.
- `CONTEXT.md`'s Toolbar entry describes the bar in the tree, and `header` is off its
  `_Avoid_` list.
- `grep -rn 'Drawer\|drawer\|state.ts\|linkCopied' docs/coding-standards.md` returns nothing
  that is still false.
- `docs/issues/toolbar-restyle/` and `docs/prompts/` are gone.
- `npm run build` and `npm test` are still green — this ticket touches no code.

## Out of scope

Any code change. If writing this up reveals something wrong in the tree, open it as its own
ticket rather than fixing it here; a record that quietly changes what it records is not a
record.

## Comments

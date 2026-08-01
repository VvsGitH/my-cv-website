# The spacing scale is authoritative; the reference CV is not

Vertical spacing comes from a five-step scale — `--space-xl / -l / -m / -s / -xs` (32 / 24 / 14 / 6 / 4px) in `tokens.css` — applied as **nominal margins**, plus one document-wide `--prose-leading`. The reference CV was set by hand in Canva and its gaps are irregular; from here **the scale is authoritative and the reference is not**.

That started as an exception on the spacing axis only. **It is now the rule for the paper's measurements generally**: the type scale is a designed set of round sizes rather than the reference's transcribed ones, and the Sheet is an 840px box in A4's ratio whose insets are derived from `--sheet-pad-*` rather than measured off Canva. What still answers to the reference (ADR-0014) is the copy, the colors, the faces and the layout's shape — not its numbers.

Reading Mode takes its own three steps (`--space-s / -m / -xl` at 8 / 24 / 48px), because it is a phone rather than paper. `--space-m` meeting `--space-l` there is deliberate: at that size the two express one gap.

Exactly one gap sits outside the scale: `--main-first-heading-gap`, whose job is to align Main's first section heading with the Aside's and whose value is whatever does that. It carries its derivation term by term in `tokens.css`.

## Considered Options

- **`text-box-trim: trim-both`, the real fix for optical drift.** Rejected: it is not in this project's Baseline table (`docs/research/modern-css-best-practices.md` §9) and Firefox has not shipped it, so **Chromium would capture the PDF tighter than Firefox renders the screen** — exactly the screen/PDF drift ADR-0001 exists to prevent. Two pixels is not worth it.
- **Hand-correcting each gap to be optically equal.** Rejected: that is a different magic number per pairing, which is precisely the Canva situation the scale replaced.
- **Aligning the two columns structurally, with subgrid.** The obvious way to delete `--main-first-heading-gap` — make `.columns` a grid whose first row is shared by the photo Block and the header, so both first headings land on the same line by construction. `modern-css-best-practices.md` §9 even lists subgrid under "Align aside/main rows", **so this will be re-proposed.** Rejected at the time: it forces the Aside's `padding-block-start` (37.8px) and `--main-inset-block-start` (40.4px) to become equal, and those were two separately measured reference values. Removing one magic number by overwriting two measured ones was a bad trade in a fidelity-critical document.

  **That objection has since expired.** The two insets *are* one value now — both columns take `--sheet-pad-block-start` — so subgrid would no longer overwrite anything, and `--main-first-heading-gap` is down to three terms of which one is still the hand-measured `--header-height`. **The rejection above is the thing to revisit**, and it is the only remaining way to delete that measurement (`hacks/2026-08-01` §5, §6).
- **Regularising only the Main column.** Rejected: the Aside's internals are all Canva values too, and fixing one column would leave the CV with two spacing systems and no rule for the next editor to follow.

## Consequences

- **Optical gaps land ~2px larger than nominal**, because every text box carries half-leading. The scale is regular in the CSS and drifts slightly on the page. Accepted deliberately — see the two rejected fixes above.
- **Sheet 2's Aside ends well above the bottom of its cream panel, and that empty band is intended.** `.aside .block--privacy { margin-block-start: auto }` was deleted, so Privacy is no longer bottom-anchored. The panel keeps a fixed `--aside-height` because it is Sheet geometry and must be identical on both Sheets — **a panel that shrank to fit would read as a rendering bug in the PDF. Do not close that gap.**
- **The scale is named tokens, not rem literals.** A rule spread over nine files as `0.875rem` is not a rule. `--prose-leading` is what makes "document-wide" enforceable.
- **Three runs of prose sit outside `--prose-leading`**: About stays at 1.333 and Certifications at 1.25 — both are Now rather than Lato, and Certifications is two-line entries where 1.4 weakens the pairing against the 14px entry gap. If the Aside's three leadings read as untidy on a later pass, **the fix is to extend the rule, not to re-tune per section.**
- **`--main-first-heading-gap` is a `calc()` over two tokens plus one measured number** — `--photo-size + --space-xl - --header-height`, the last being the header Block's rendered height, which stays a literal because it is content, not geometry. A `calc()` naming its other inputs while hiding that one would look derived while still being measured. Any of the three drifting breaks the two columns' alignment silently, which is why ADR-0010's suite asserts it. It lost two terms when the Aside's and Main's block insets became one token — see the reopened subgrid option above.
- Four gaps that were originally left off the scale are gone: two now sit on `--space-xs`, and two are expressed through the element's own `line-height` rather than a margin.
- **Open follow-up.** `--space-m` is written into six components to express one rule — "the first content under a section heading sits 14px down". One selector, `.block > .section-heading + *`, would say it once. Not done, because it restructures the cascade in a fidelity-critical document; the sr-only Continuation case and `BulletsBlock`'s wrapper `div` both need handling. Tracked in `docs/todos/`.
- Beware when auditing: an audit that walks `margin-block-start` misses a `margin-block-end`. That is how `SkillsBlock`'s `.run { margin-block-end: -0.3rem }` trim survived the first pass while making one Skills gap 4.8px short.

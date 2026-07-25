# 11 — Italian content (translation)

Status: done

## Goal

Populate the Italian content module with a faithful translation of the English CV, for the owner to refine.

## Tasks

- Translate all Blocks (About, experience bullets, project descriptions, section headings, soft skills, other info, privacy statement) into Italian, keeping a professional CV register.
- Re-assess Explicit Paging: Italian text runs ~10–15% longer, so re-check each Block's `sheet`/`column` and rebalance so both Sheets still fit.
- Keep proper nouns / product names as-is where appropriate.
- Flag any wording that needs the owner's judgment.

## Acceptance

- Italian Locale renders as two well-balanced Sheets with no overflow.
- Owner reviews and signs off on the wording.

## Depends on

- 04, 05

## Comments

- The owner owns the final professional wording; this ticket produces a first draft only.

### Implementation

`src/content/it.ts` had every translatable field deliberately set to `''`
(ticket 04's choice: an empty string renders as visibly missing, so an
untranslated CV can't ship silently). All of them are now filled from
`en.ts`, keeping the Block structure and array order untouched.

Register: first person, professional, matching the English. Left verbatim as
proper nouns: company and product names, technologies, both certificate
titles, and the thesis title (already Italian in the source).

Two translations are deliberately *not* literal, because the English was
itself a rendering of an Italian original:

- **The privacy statement** is the canonical Italian clause — "Autorizzo il
  trattamento dei miei dati personali ai sensi del D.lgs. 101/2018 e
  dell'art. 13 GDPR (Regolamento UE 2016/679)…" — not a back-translation of
  the English paraphrase.
- **"I own a car"** → **"Automunito."**, the idiomatic term on an Italian CV,
  which is also three words shorter.

### Owner decisions

Four, each marked in place; `grep -n "OWNER:" src/content/it.ts` returns
exactly those four. The rationale lives in the code beside the text it
governs — this list is the index, not a second copy:

| # | Decision | Alternative if you disagree |
|---|---|---|
| 1 | English kept for **all** role and technical labels | a fully Italian register — one global change, not per-line |
| 2 | Soft-skill loanwords ("Growth mindset", "Leadership", "Problem solving") | "Mentalità di crescita" etc. |
| 3 | "Laurea in Ingegneria dell'Informazione e dell'Automazione" | the official wording on your certificate |
| 4 | "Diploma di Maturità Scientifica" (assumes the Liceo Scientifico track) | "Diploma di scuola secondaria superiore" |

Decision 1 is deliberately **one** decision covering every English label —
`role` fields, "Senior frontend engineer", "Subject matter expert",
"Technical leader", "Lead frontend developer" and "State management:". An
earlier draft scattered these as separate notes, which understated the cost:
changing register means changing all of them together, not one.

### Explicit Paging could not absorb the overflow — the prose had to

Italian ran long exactly as the ticket predicted, and the first full draft
**overflowed Sheet 1 Main by 15.4px**. Measured per Block against English:

| Sheet 1 Main Block | EN | IT | delta |
|---|---|---|---|
| header | 191.3 | 191.3 | +0 |
| experience (RCS) | 282.1 | 312.3 | **+30.2** |
| experience (Software Dev) | 147.4 | 147.4 | +0 |
| experience (Trainee) | 78.2 | 93.3 | **+15.1** |
| project (B2B) | 187.5 | 214.1 | **+26.6** |
| | 886.5 | 958.4 | **+71.9** |

English had only 56.6px of slack, so +71.9 put it 15.4px past the paper.

**Rebalancing Blocks across Sheets — the ticket's suggested fix — does not
work here, but not for arithmetic reasons.** Two Blocks could move:

- **B2B Environment** is the semantically correct boundary (it opens
  "Progetti selezionati", so the section could simply start on Sheet 2), but
  it costs ~300px — the Block plus the 85.6px section gap its heading carries
  — against Sheet 2 Main's 112px of slack. It would overflow *worse*, and
  leave a 300px hole on Sheet 1 against the reference.
- **The Trainee experience Block fits.** 93.3px plus a 14.4px inter-Block
  margin is 107.7px, inside 112px, with 4.3px to spare. It is rejected on
  meaning, not on space: it carries no `heading` of its own (the
  `heading: 'Esperienza'` sits on the RCS Block, so the section prints its
  title once), so on Sheet 2 it would land after Dam Dossier and before
  Formazione as an unheaded Experience entry stranded among Projects. Reading
  order breaks.

An earlier draft of this note claimed B2B was "the only movable Block". That
was wrong by the measurements in the table above, and the code review caught
it. The honest statement is narrower: **no Block move preserves reading
order**, because Explicit Paging's granularity is a Block (ADR-0002) and the
one Block small enough to fit is the one that cannot be separated from its
heading.

So the draft prose was tightened instead — three bullets that had each gained
a wrapped line, rephrased. They are marked `KEEP TIGHT (n of 3)` in `it.ts`,
because restoring the literal reading silently reintroduces the overflow:

- RCS "Lead frontend developer": "coordinamento dello sviluppo e
  responsabilità sui compromessi tra" → "coordinando sviluppo e trade-off
  tra". 3 lines → 2.
- B2B setup bullet: commas to a colon, "della struttura delle cartelle e dei
  pattern" → "di struttura cartelle e pattern". 3 lines → 2.
- B2B coordination bullet: dropped two redundant articles. 2 lines → 1.

Result: **+26.4px slack** on Sheet 1 Main.

One nuance did shift rather than merely tighten, and is worth the owner's
eye: English has *"coordinating development and **owning** stability and
performance trade-offs"*, where the Italian "coordinando sviluppo e trade-off"
folds coordination and ownership into one verb. "in corso" (the English
"ongoing") was dropped in a first pass and has been restored — it cost
nothing, the bullet still holds 2 lines.

### Verified

The pre-agreed test seam is Playwright E2E against the built output, and
**ticket 12 hasn't built it yet** — so this was verified with a throwaway
measurement script in the same style tickets 05 and 15 used. Ticket 12 should
formalise the overflow assertion below; it is the one check that would have
caught this defect automatically.

Slack from each column's last Block to the paper edge, both Locales:

| | aside → panel | aside → sheet | main → sheet | PDF |
|---|---|---|---|---|
| EN Sheet 1 | +86.2 | +105.6 | +56.6 | 2 pages |
| EN Sheet 2 | +0 | +19.4 | +98.7 | |
| IT Sheet 1 | +62.5 | +81.9 | **+26.4** | 2 pages |
| IT Sheet 2 | +0 | +19.4 | +112.0 | |

`aside → panel +0` on Sheet 2 is not an overflow — Privacy is bottom-anchored
with `margin-block-start: auto` (ticket 05), so it sits flush with the panel
foot by design. It reads +0 in **both** Locales, which is the proof.

**Why Italian has *more* slack than English on Sheet 2 Main** (+112.0 vs
+98.7), despite every Block there holding longer prose and none of the three
tightening edits touching Sheet 2. The review flagged this as suspicious —
correctly, since it is the figure the rebalancing argument rests on. Measured
per Block, the whole difference is one Block:

| Sheet 2 Main Block | EN | IT |
|---|---|---|
| project · RUOP | 196.8 | **183.5** |
| project · Beyond Knowledge | 143.5 | 143.5 |
| project · VEDO / ABC | 130.1 | 130.1 |
| project · Dam Dossier | 170.1 | 170.1 |
| education · Laurea | 137.0 | 137.0 |
| education · Diploma | 62.8 | 62.8 |

RUOP is 13.3px — exactly one project-bullet line — *shorter* in Italian. Not
dropped content (structural parity is verified: identical bullet counts), just
more economical wrapping: "Sviluppo di una web application single-page e
responsive in React.js" against "Development of a single-page, responsive, web
application in React.js". Italian is longer *on average*, not uniformly.

`astro check`: 0 errors. No font re-subsetting was needed — the Italian
accents (`à è é ì ò ù È`), typographic apostrophe and curly quotes are all
inside the Latin-1 + punctuation ranges ticket 02 already ships.

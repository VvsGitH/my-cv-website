# 04 — Content model

Status: done

## Goal

Define the shared typed content schema and the per-Locale TypeScript content modules, with Explicit Paging tags (ADR-0002).

## Tasks

- Shared schema (types) covering: header (name, title, contacts), About, skill groups, experience entries (role, company, period, bullets), projects, education, languages (with proficiency), certifications, soft skills, other info, privacy text.
- Every Block carries `sheet: 1 | 2`, `column: 'aside' | 'main'`, and ordering. Invalid values must fail `tsc`.
- English content module populated from the source CV (`docs/assets/...pdf` / screenshots).
- Italian content module scaffolded (filled in ticket 11).
- Content strictly separate from layout.

## Acceptance

- `tsc` rejects a bad `sheet`/`column` value.
- English content reproduces the reference CV's blocks and their sheet/column placement.

## Depends on

- 01

## Comments

Lives in `src/content/` — `types.ts` (schema), `en.ts`, `it.ts`, `index.ts`
(`cv: Record<Locale, CvContent>`). Confirmed `astro build` does *not* treat
`src/content/` as a content collection (no `src/content.config.ts`, no
collection subdirectories), so the plain-typed-data-file rule from the
coding standards still holds.

**Block granularity.** Per CONTEXT.md ("e.g. one Experience entry, the
Languages section") each experience / project / education *entry* is its own
Block, while aside sections are one Block each. Section headings are carried
by the Block that *opens* the section (`heading?`) and omitted by the rest —
that's what lets Selected Projects start on Sheet 1 (B2B Environment) and
continue on Sheet 2 without reprinting its title, exactly as the reference
CV does.

**Ordering is array position**, not an `order: number`. Explicit ordinals
are a footgun (duplicates, gaps, two places to edit); the layout filters
`blocks` by `sheet`/`column` and renders survivors in place.

**Inline emphasis.** The reference CV bolds phrases mid-sentence
(`Corriere della Sera`, `Subject matter expert`, `110/110`…), so that
information has to live in the content. Modelled as `RichText = string` with
a `**…**` marker rather than arrays of typed spans — the CV is prose, and
user story 20 is the owner editing wording in a content file. Trade-off: the
marker is not compiler-checked. The ~10-line parser belongs to ticket 05,
which is where it's rendered.

**Acceptance verified.** `astro check` on a scratch module with `sheet: 3`,
`column: 'left'`, and a missing required field produced three `ts(2322)`
errors, one per line. `package.json`'s `build` was still `astro build` from
ticket 01; changed to `astro check && astro build` per the coding standards
so that gate actually runs in CI. Block map dumped from `en.ts` and diffed
against the spec's content map — matches on all four Sheet/column groups.
EN and IT verified structurally parallel (19 blocks, same kinds, placements
and collection lengths) per user story 23.

**Source extraction.** The PDF's text is unusable — Canva embeds subset
fonts with custom glyph encodings, so `Tj` operands decode to garbage. Text
was transcribed from `CV_page1.png` / `CV_page2.png` (798px wide), read back
at 3× crops via a throwaway PNG cropper. Two things the screenshots don't
carry were recovered from the PDF's `/URI` annotations: the LinkedIn profile
URL and the edX link on the accessibility certificate. Language proficiency
came from measuring the bar pixels — Italian fills the track (1.0), English
stops at 158/226 (0.7); the filled colour is `#737373`, i.e. the existing
`--color-muted` token.

**Punctuation settled from the PDF, not the screenshots.** At 798px a curly
quote and a straight one are a pixel apart, so `/code-review` and I disagreed
about them. Resolved by pulling the character inventory out of the PDF's 11
`/ToUnicode` CMaps, which is exact: U+201C/U+201D (`“ ”`) are present and
U+0022 (`"`) appears nowhere, so the curly double quotes are right; U+2014
(`—`) is present, so the em dash is right; **U+2026 is absent**, so "and
more…" is really "and more..." with three periods — fixed after review.
Apostrophes are genuinely mixed in the source: the per-page font subsets
show U+0027 on one Sheet and U+2019 on the other, in both Garet and Lato.
Normalised to `’` throughout rather than reproducing the inconsistency.

**Verbatim quirks kept** (transcription is faithful; these are the owner's
call, not ours):
- `WC3x.org` — the certification issuer; the edX/W3C site is `W3Cx.org`.
- "Coordination of the **fronted** team" (RUOP) — likely "frontend".
- "an application based **of** Microsoft Power Apps" (VEDO Tool).
- "**Boostrap** 4" (VEDO Tool) — spelled correctly elsewhere.
- "in **an** scrum based project" (Beyond Knowledge).
- "A2A S.p.a" — no closing period, unlike "Leonardo S.p.a.".

**Italian scaffold.** Structure, Explicit Paging tags and locale-invariant
data (names, periods, dates, URLs, product names, proficiency) are final;
section headings, skill-group names and contact labels are translated
because they anchor the structure. Every translatable prose field is `''`,
including the right *number* of empty bullets per Block so ticket 11 can see
the shape it's filling. Empty renders as visibly missing — copying the
English across would have shipped silently. Two exceptions, both from
`/code-review`: the photo `alt` keeps the name (an empty `alt` means
"decorative" and fails *silently*, which is the opposite of the point), and
`period: '2024.05 - now'` became `'2024.05 - oggi'` — it was the one period
carrying a word rather than digits, so calling periods locale-invariant was
wrong.

**Review findings not acted on**, with reasons:
- *`SkillGroup.display` puts presentation in content.* Which groups the
  reference CV sets as a slash-separated run and which as bullets is a fact
  about the source document, per group; deriving it in the component would
  be either magic (guess from item length) or a hardcoded list of group
  names in the layout, which is worse — that's content knowledge leaking
  the other way. The ` / ` separator itself stays in ticket 05.
- *`src/content/` collides with Astro's collections directory.* Verified
  inert (no `src/content.config.ts`, no collection subdirectories) and it's
  the domain's own word. Should collections ever be adopted against the
  standards' advice, the clash is a loud build error, not a silent one.
- *`CvContent.locale` duplicates the `Record<Locale, …>` key.* True, but
  ticket 10 (per-Locale `<title>`, `lang`, `hreflang`) wants a `CvContent`
  that knows its own Locale without the caller passing it alongside.
- *`heading?`, and `summary?`/`bullets?` on experience, are all optional, so
  tsc can't catch a section that lost its heading or an empty job.* Real,
  but the schema can't express "exactly one Block per section carries the
  heading" without machinery well past what two Sheets justify.
- *Ordering as array position isn't the `order` field the ticket names.*
  Deliberate — see above; this Comments section is the amendment.

# 04 — Content model

Status: ready-for-agent

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

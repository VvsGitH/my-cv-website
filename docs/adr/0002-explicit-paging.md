# Explicit paging of CV content onto Sheets

Each content Block declares which Sheet (1 or 2) and which column (Aside/Main) it belongs to, directly in the content data — instead of letting content flow across Sheets automatically via a pagination engine (e.g. Paged.js) or CSS fragmentation. This makes the layout fully deterministic and guarantees the on-screen Paper Mode and the generated PDF can never drift apart.

## Considered Options

- **Auto-flow (Paged.js / CSS fragmentation)** — matches how the original Canva CV was made and needs no manual balancing, but multi-column auto-pagination into fixed on-screen A4 boxes is fragile (CSS Regions are dead), and screen-vs-PDF drift becomes a real risk. Rejected for a fidelity-critical, low-edit-frequency document.

## Consequences

- Adding a lot of content requires manually rebalancing Blocks across the two Sheets.
- Each Locale carries its own page/column tags (Italian text runs ~10–15% longer, so a Block that fits on Sheet 1 in English may need reassigning in Italian).
- The content schema encodes `sheet` and `column`, validated at build by the TypeScript compiler.
- **Refined by ADR-0005.** The rule above is unchanged — every Block still declares its `sheet` and `column` — but the unit it applies to is no longer "one entry". A Block is now a whole section, or as much of one as fits in a column, with the remainder resuming in an explicit Continuation.
- **Ordering is array position, not an `order: number`.** Explicit ordinals are a footgun — duplicates, gaps, and two places to edit for one move. The layout filters `blocks` by `sheet`/`column` and renders the survivors in place, so there is no ordering to keep in sync and none to leave a gap in.
- **Manual rebalancing is the standing cost, and it does not always have a solution.** Measured when Italian ran long: moving the B2B Environment Block costs ~300px — the Block plus the section gap its heading carries — against Sheet 2 Main's 112px of slack, so it overflows worse. The Trainee Block *fits* (107.7px inside 112px) but is rejected on meaning: it carries no `heading` of its own, so on Sheet 2 it would land between two unrelated sections as an unheaded Experience entry. **No Block move preserves reading order.** The remedy is the wording, not the paging — which is why `it.ts` carries `KEEP TIGHT` markers rather than a different paging table.
- Italian is longer **on average**, not uniformly: some Blocks come out shorter in Italian than in English. Do not assume a direction when rebalancing.
- **Inline emphasis is `RichText = string` with a `**…**` marker**, not arrays of typed spans. The CV is prose and the owner edits it in a content file; typed spans would make every sentence a data structure. Trade-off, accepted: the marker is not compiler-checked. The renderer escapes first, so content can never inject markup.
- **`SkillGroup.display` is content, not presentation leaking into it.** Which groups the reference sets as a slash-separated run and which as bullets is a fact about the source document, per group. Deriving it in the component would mean either guessing from item length or hardcoding a list of group names in the layout — content knowledge leaking the other way, which is worse.
- **The boundary runs both ways.** Per-Block widths or per-Block spacing in the content files are layout leaking into content, and are refused for the same reason (see ADR-0014 on B2B Environment's wrap, and ADR-0011 on the spacing scale).

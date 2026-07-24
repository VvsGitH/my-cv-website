# Explicit paging of CV content onto Sheets

Each content Block declares which Sheet (1 or 2) and which column (Aside/Main) it belongs to, directly in the content data — instead of letting content flow across Sheets automatically via a pagination engine (e.g. Paged.js) or CSS fragmentation. This makes the layout fully deterministic and guarantees the on-screen Paper Mode and the generated PDF can never drift apart.

## Considered Options

- **Auto-flow (Paged.js / CSS fragmentation)** — matches how the original Canva CV was made and needs no manual balancing, but multi-column auto-pagination into fixed on-screen A4 boxes is fragile (CSS Regions are dead), and screen-vs-PDF drift becomes a real risk. Rejected for a fidelity-critical, low-edit-frequency document.

## Consequences

- Adding a lot of content requires manually rebalancing Blocks across the two Sheets.
- Each Locale carries its own page/column tags (Italian text runs ~10–15% longer, so a Block that fits on Sheet 1 in English may need reassigning in Italian).
- The content schema encodes `sheet` and `column`, validated at build by the TypeScript compiler.

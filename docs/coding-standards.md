# Coding standards

Prescriptive rules for this project. Each section links to the primary-source research it distills:
[Astro](research/astro-coding-standards.md) · [React 19](research/react-19-best-practices.md) · [Modern CSS](research/modern-css-best-practices.md).

Versions in use: Astro 7.1.3, React 19.2.8, TypeScript, Node ≥22.12.

## Foundational principles

1. **KISS.** Prefer the simplest thing that works. This is a static, content-light, two-page CV — reach for the plain solution before the powerful one. Do not add machinery (state, Effects, Context, content collections, memoization) until a concrete need exists.
2. **Readability first.** Code is read far more than written. Optimize for the next reader: clear names, obvious data flow, small units, no cleverness that needs a comment to defend. When a rule below trades brevity for clarity, clarity wins.
3. **Avoid comments.** Only add a new comment in the code if it's not clear why a portion of its logic does what it does or why it's written in a certain way. If the reason is already explained in an issue or an ADR, simply refer to that section of the document, do not repeat yourself. If you don't know where to put an explanation, always prefer the documentation.

## General

- Static output only. No server, no runtime data fetching — everything is prerendered for GitHub Pages.
- Keep content separate from layout. Content lives in typed data files; components only present it.
- ESM everywhere. Use `import type` for type-only imports.

## GIT

- Do not add a Co-Author in git commits.
- Produce small message commits that fully describe the work: do not enter in the implementation details.

## Astro

- **Author in `.astro` by default.** `.astro` components ship zero client JS. Use React only where interactivity is genuinely required.
- **Keep `output: 'static'`** (the default). No adapter. Never set `output: 'server'` for this project.
- `src/pages/` is the only reserved directory — routes live there. Group the rest under `src/components/`, `src/layouts/`, `src/styles/` by convention. Local fonts and images go under `src/assets/`, matching Astro's own docs.
- **Component tiers** (ADR-0004): `components/primitives/` — reusable, never autonomous; `components/blocks/` — the Blocks of `CONTEXT.md`, autonomous units of CV content, keeping the `Block` suffix; `components/structure/` — the Document → Sheet → Block spine; `components/chrome/` — everything that is not paper (Toolbar, Drawer). The cut is *autonomy on a Sheet*, not composition depth; deliberately not `atoms`/`molecules`/`organisms`.
- Type component props with `interface Props {}` and read via `Astro.props`; destructure with defaults.
- Capitalize component names. Use `class:list` for conditional classes; `define:vars` to pass server values into `<style>`/`<script>`.
- Config via `defineConfig` from `astro/config`. For GitHub Pages set `site` and `base`.
- **Content:** a single-page CV is one record, not a set — use a plain typed `.ts`/`.json` data file. Adopt content collections (Zod schema in `src/content.config.ts`) only if repeated, schema-validated lists appear.
- Write well-formed, explicitly-closed markup — the Astro 7 Rust compiler errors on unclosed tags.

## React islands

React is a hydrated client island (Toolbar, Drawer), not the framework. See [decision table](research/react-19-best-practices.md#2-which-react-19-features-apply-to-this-projects-islands--decision-table).

**Do not use** (server/framework-only or no payoff here):
- Server Components, Server Actions (`"use server"`), `prerender*` — no server exists.
- Actions / `useActionState` / `useFormStatus` / `useOptimistic` — no async mutations to manage.
- `use(Promise)` for data — no runtime fetching.
- `useMemo` / `useCallback` by default — add only for a proven hot path or a `memo`'d child.

**Do adopt** (React 19, client-safe):
- `ref` as a plain prop — no `forwardRef`.
- `<Context value=…>` as its own provider (not `.Provider`); prefer plain props over Context for two small islands.
- Return cleanup functions from ref callbacks (block body, no implicit return).

**Rules (non-negotiable):**
- Follow the Rules of Hooks: top level only, React functions only.
- Derive during render; put action logic in event handlers. Use `useEffect` **only** to sync with an external system (`matchMedia`, `localStorage`, theme class) and always return the matching cleanup.
- Reset state with `key`, not an Effect.
- Keep the island's first render deterministic (no `Date.now()`/`Math.random()`/`window` in initial render) so hydration matches. Write Effects/ref callbacks safe to run twice (StrictMode).
- List keys: stable and unique; never array index when order changes; never `Math.random()`.
- Inputs: `value` requires `onChange`; never switch controlled ↔ uncontrolled.
- Use `useId` for a11y attribute IDs, never for keys.

## TypeScript

- Extend `astro/tsconfigs/strict` (or `strictest`).
- Gate the build: `"build": "astro check && astro build"`.
- `@types/react`/`@types/react-dom` on the v19 line. `useRef(null)` requires an argument.
- Type props with `interface`; children as `React.ReactNode`; events as `React.*Event<HTMLElement>`.

## CSS

Authored as Astro scoped `<style>`, no framework. See [Baseline table](research/modern-css-best-practices.md#9-baseline-availability-summary) before using newer features.

- **Units by role:** `mm` only for the A4 sheet / `@page`; `rem`/`em`/`ch` for all type and reflow. Never size `font-size` in absolute units.
- **Paged media:** `@page { size: A4; margin: 0 }`. The two Sheet components own all layout.
- **Fragmentation:** use modern `break-*`, not `page-break-*`. `break-inside: avoid` on every Block and the Aside; `break-before: page` at the deliberate 2-Sheet seam.
- **Print fidelity:** `print-color-adjust: exact` **plus** `-webkit-print-color-adjust: exact` on colored surfaces; keep screen/print rendering identical.
- **Layout:** Grid with `grid-template-areas` for the Aside/Main sheet (redefine areas at the breakpoint for Reading Mode); Flexbox for 1-D runs; `gap` over child margins.
- **Responsive trigger:** viewport/print → media query; element's own space → `@container`; presence/state of descendants → `:has()`.
- **Theming:** `color-scheme: light dark` on `:root`, tokens as custom properties in `oklch()`, `light-dark()` for per-property pairs (keep a `prefers-color-scheme` fallback since it's only newly available). `@property` only if you animate a custom property.
- **Architecture:** cascade layers (`@layer reset, base, components, print`) instead of specificity fights; native nesting (`&` mandatory for compound selectors); logical properties (`margin-inline`, `padding-block`) for the bilingual content; `:where()` for zero-specificity resets.

## Fonts

- Self-host, `@font-face`. Prefer one variable font to cut requests.
- **Never `font-display: optional`** (determinism hazard for PDF capture) — use `block`/`swap` and gate capture on `document.fonts.ready`. Add `size-adjust` on the fallback to keep line breaks stable.

## Accessibility

- Style focus with `:focus-visible`; never remove an outline without a replacement.
- Collapse transitions under `@media (prefers-reduced-motion: reduce)`.
- Every `<Image>` needs meaningful `alt`. Respect user font scaling (type in `rem`/`em`).

## Tooling

- VS Code + the official Astro extension.
- Format with `prettier-plugin-astro`. `eslint-plugin-astro` optional.
- Keep local images in `src/` and render with `astro:assets` `<Image />` (`alt` mandatory); `public/` only for files that must keep a stable URL.

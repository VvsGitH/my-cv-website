# Coding standards

Prescriptive rules for this project. Each section links to the primary-source research it distills:
[Astro](research/astro-coding-standards.md) · [Preact](research/preact-best-practices.md) · [Modern CSS](research/modern-css-best-practices.md).

Versions in use: Astro 7.1.3, Preact 10.29.7 (+ `@preact/signals` 2.10), TypeScript, Node ≥22.12.

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

- **Author in `.astro` by default.** `.astro` components ship zero client JS. Use Preact only where interactivity is genuinely required.
- **Keep `output: 'static'`** (the default). No adapter. Never set `output: 'server'` for this project.
- `src/pages/` is the only reserved directory — routes live there. Group the rest under `src/components/`, `src/layouts/`, `src/styles/` by convention. Local fonts and images go under `src/assets/`, matching Astro's own docs.
- **Component tiers** (ADR-0004): `components/primitives/` — reusable, never autonomous; `components/blocks/` — the Blocks of `CONTEXT.md`, autonomous units of CV content, keeping the `Block` suffix; `components/structure/` — the Document → Sheet → Block spine; `components/chrome/` — everything that is not paper (Toolbar, Drawer). The cut is *autonomy on a Sheet*, not composition depth; deliberately not `atoms`/`molecules`/`organisms`.
- Type component props with `interface Props {}` and read via `Astro.props`; destructure with defaults.
- Capitalize component names. Use `class:list` for conditional classes; `define:vars` to pass server values into `<style>`/`<script>`.
- Config via `defineConfig` from `astro/config`. For GitHub Pages set `site` and `base`.
- **Content:** a single-page CV is one record, not a set — use a plain typed `.ts`/`.json` data file. Adopt content collections (Zod schema in `src/content.config.ts`) only if repeated, schema-validated lists appear.
- Write well-formed, explicitly-closed markup — the Astro 7 Rust compiler errors on unclosed tags.

## Preact islands

Preact is a hydrated client island (Toolbar, Drawer), not the framework — ADR-0003. See the [decision table](research/preact-best-practices.md#2-which-preact-10-apis-apply-to-this-projects-island--decision-table). `compat` is off, so import hooks from `preact/hooks` and treat the `preact/compat` surface as non-existent.

**Do not use** (compat-only, or no payoff here):
- `forwardRef`, `createPortal`, `memo`, `PureComponent`, `Suspense`, `lazy`, `startTransition`, `useDeferredValue`, `useSyncExternalStore` — all `preact/compat`, unavailable here. `useId` and `toChildArray` **are** in core; use them freely.
- `StrictMode` — in compat it is `Fragment` under another name. Preact has no double-invocation safety net in either mode, so effect idempotence is your job, not a dev-mode check's.
- `useMemo` / `useCallback` by default — add only for a proven hot path or to stabilise a ref callback.

**Rules (non-negotiable):**
- **Never accept `ref` as a component prop.** Preact 10 strips `ref` out of `props` in both `createElement` and the JSX runtime, so `function Drawer({ ref })` silently receives `undefined` — and `forwardRef` is compat-only. Put the `ref` on the DOM element inside the component that owns it, or pass a differently-named prop (`innerRef`).
- **Keep the island's first render deterministic** — no `window`, `localStorage`, `matchMedia`, `Date.now()` or `Math.random()`, **including inside a module-level `signal()` initializer**, which also runs during prerender. A mismatch does not warn: Preact stops hydrating and re-renders silently unless `preact/debug` is loaded, which is why the integration runs with `devtools: true`.
- Follow the Rules of Hooks: top level only, component functions only. **House rule** — preactjs.com has no Rules-of-Hooks page, but Preact's hook state is index-based, so the discipline applies for the same reason it does in React.
- Derive during render; put action logic in event handlers. Use `useEffect`/`useSignalEffect` **only** to sync with an external system (`matchMedia`, `localStorage`, theme class) and always return the matching cleanup.
- An inline ref callback that returns no cleanup is called **twice** per re-render (once with `null`). Return a cleanup, or make the callback stable.
- `onChange` here is the **native** `change` event, not React's input-time synthetic one — use `onInput` for text-ish inputs.
- Reset state with `key`, not an Effect. List keys: stable and unique; never array index when order changes.
- `useId` for any id that crosses the SSR/hydration boundary (the Drawer's `aria-controls`), never for keys.
- `class` and `className` both work — pick one and be consistent. Astro's `class:list` is `.astro`-only; inside a `.tsx` build the string in JS.

**State** — signals are the island's one state API ([why](research/preact-best-practices.md#45-verdict-on-the-prescriptive-rule-signals-for-shared-usestate-for-local)):
- `signal()` at module scope for state that more than one component reads (theme, Drawer open); `useSignal()`/`useComputed()` inside a component for state that lives and dies there. A module-level signal is shared by every instance of a component — the point for the former, a bug for the latter.
- Assign a **new** value: a signal does not update when assigned a value equal to its current one, so mutating an object in place and re-assigning the same reference is a no-op.
- A module-level `effect()` is created once at module scope, with its cleanup — never inside a component body. Signals are lazy outside the component tree: a `computed` nobody reads never recomputes.
- Rendering a signal directly in JSX updates the text node without re-rendering the component; prefer it where it reads naturally.
- This departs from Astro's documented answer for state shared *between* islands (Nano Stores). With a single island the question is moot, and signals ship with the integration anyway.

**Hydration directive:** `client:idle` for the Toolbar, with the theme applied pre-paint by an `is:inline` script outside the island (Astro's own tutorial pattern). **Not** `client:media` — only the Drawer toggle is breakpoint-dependent, and the other four controls would never hydrate on desktop. **Not** `client:only` — the Toolbar would be absent from the static HTML and pop in.

## TypeScript

- Extend `astro/tsconfigs/strict` (or `strictest`).
- Gate the build: `"build": "astro check && astro build"`.
- `jsx: "react-jsx"` + `jsxImportSource: "preact"` is a **mandatory override** — `astro/tsconfigs/base` sets `jsx: "preserve"` and no import source. Preact ships its own types; the project carries no `@types/react`.
- `verbatimModuleSyntax` is on: type-only imports must be `import type`, or `astro check` fails.
- Type props with `interface`; children as `ComponentChildren`; events as `TargetedMouseEvent<HTMLButtonElement>` & co., imported from `preact` (inline handlers infer their target).
- `useRef<HTMLDialogElement>(null)` — unlike React 19 the argument is optional, but pass `null` for the null-check ergonomics.

## CSS

Authored as Astro scoped `<style>`, no framework. See [Baseline table](research/modern-css-best-practices.md#9-baseline-availability-summary) before using newer features.

**One exception, and only this one:** an island's own markup lives in a `.tsx`, which Astro's scoping does not reach. Dress it from a plain stylesheet colocated with the island (`components/chrome/drawer.css`), wrapped in `@layer components` so it lands in the same cascade as the paper. Nothing else earns a global stylesheet.

- **Units by role:** `mm` only for the A4 sheet / `@page`; `rem`/`em`/`ch` for all type and reflow. Never size `font-size` in absolute units.
- **Paged media:** `@page { size: A4; margin: 0 }`. The two Sheet components own all layout.
- **Fragmentation:** use modern `break-*`, not `page-break-*`. `break-inside: avoid` on every Block and the Aside; `break-before: page` at the deliberate 2-Sheet seam.
- **Print fidelity:** `print-color-adjust: exact` **plus** `-webkit-print-color-adjust: exact` on colored surfaces; keep screen/print rendering identical.
- **Layout:** Grid with `grid-template-areas` for the Aside/Main sheet (redefine areas at the breakpoint for Reading Mode); Flexbox for 1-D runs; `gap` over child margins.
- **Responsive trigger:** viewport/print → media query; element's own space → `@container`; presence/state of descendants → `:has()`.
  - **Not `@container` above a page break.** `container-type: inline-size` brings layout containment, and a layout-contained box is monolithic for fragmentation — over the two Sheets it would swallow the `break-before: page` that makes the CV two pages. Size from the viewport there instead (ticket 06).
  - **`:has()` cannot cross an Astro scope.** The compiler leaves `:global()` untouched inside it, and the browser then drops the whole rule as an unknown pseudo-class, silently. Test the built CSS, or key off an attribute the component sets itself.
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

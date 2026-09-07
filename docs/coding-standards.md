# Coding standards

Prescriptive rules for this project. Each section links to the primary-source research it distills:
[Astro](research/astro-coding-standards.md) · [Preact](research/preact-best-practices.md) · [Modern CSS](research/modern-css-best-practices.md).

Versions in use: Astro 7.3, Preact 10.29, TypeScript, Node ≥26. **Preact stays on 10**: 11 is beta and outside `@astrojs/preact@6`'s peer range (ADR-0003). `@preact/signals` is **not** a direct dependency — it arrives only under `@astrojs/preact`, which declares its own (ADR-0025).

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
- **Component tiers** (ADR-0004): `components/primitives/` — reusable, never autonomous; `components/blocks/` — the Blocks of `CONTEXT.md`, autonomous units of CV content, keeping the `Block` suffix; `components/structure/` — the Document → Sheet → Block spine; `components/chrome/` — everything that is not paper (the Toolbar's shell and its four controls, the Colophon). The cut is *autonomy on a Sheet*, not composition depth; deliberately not `atoms`/`molecules`/`organisms`.
- Type component props with `interface Props {}` and read via `Astro.props`; destructure with defaults.
- Capitalize component names. Use `class:list` for conditional classes; `define:vars` to pass server values into `<style>`/`<script>`.
- Config via `defineConfig` from `astro/config`. For GitHub Pages set `site` and `base`.
- **Content:** a single-page CV is one record, not a set — use a plain typed `.ts`/`.json` data file. Adopt content collections (Zod schema in `src/content.config.ts`) only if repeated, schema-validated lists appear.
- Write well-formed, explicitly-closed markup — the Astro 7 Rust compiler errors on unclosed tags.

## Preact islands

Preact is three small hydrated client islands, all of them inside the Toolbar — `ModeSwitch`, `ShareButton` and `ThemeSwitch` (ADR-0003, amended by ADR-0007, ADR-0017 and ADR-0025) — not the framework. The Toolbar itself is an `.astro` shell, and two of its controls are deliberately not islands: the download is an `<a download>` with no logic, and the language pair is two links that must work with JavaScript off. See the [decision table](research/preact-best-practices.md#2-which-preact-10-apis-apply-to-this-projects-island--decision-table). `compat` is off, so import hooks from `preact/hooks` and treat the `preact/compat` surface as non-existent.

**Do not use** (compat-only, or no payoff here):
- `forwardRef`, `createPortal`, `memo`, `PureComponent`, `Suspense`, `lazy`, `startTransition`, `useDeferredValue`, `useSyncExternalStore` — all `preact/compat`, unavailable here. `useId` and `toChildArray` **are** in core; use them freely.
- `StrictMode` — in compat it is `Fragment` under another name. Preact has no double-invocation safety net in either mode, so effect idempotence is your job, not a dev-mode check's.
- `useMemo` / `useCallback` by default — add only for a proven hot path or to stabilise a ref callback.

**Rules (non-negotiable):**
- **Never accept `ref` as a component prop.** Preact 10 strips `ref` out of `props` in both `createElement` and the JSX runtime, so `function ThemeSwitch({ ref })` silently receives `undefined` — and `forwardRef` is compat-only. Put the `ref` on the DOM element inside the component that owns it, or pass a differently-named prop (`innerRef`).
- **Keep the island's first render deterministic** — no `window`, `localStorage`, `matchMedia`, `Date.now()` or `Math.random()`, **including inside a module-level `signal()` initializer**, which also runs during prerender. A mismatch does not warn: Preact stops hydrating and re-renders silently unless `preact/debug` is loaded, which is why the integration runs with `devtools: true`.
- Follow the Rules of Hooks: top level only, component functions only. **House rule** — preactjs.com has no Rules-of-Hooks page, but Preact's hook state is index-based, so the discipline applies for the same reason it does in React.
- Derive during render; put action logic in event handlers. Use `useEffect`/`useSignalEffect` **only** to sync with an external system (`matchMedia`, `localStorage`, theme class) and always return the matching cleanup.
- An inline ref callback that returns no cleanup is called **twice** per re-render (once with `null`). Return a cleanup, or make the callback stable.
- `onChange` here is the **native** `change` event, not React's input-time synthetic one — use `onInput` for text-ish inputs.
- Reset state with `key`, not an Effect. List keys: stable and unique; never array index when order changes.
- `useId` for any id that crosses the SSR/hydration boundary, never for keys. **Nothing needs one**, and the reason is worth keeping: every accessible name in the Chrome is carried by `aria-label` on the element itself rather than by an `aria-labelledby` pointing at a second one, so no id crosses the boundary at all. Reach for `useId` when a component can appear twice and has to name something by id.
- `class` and `className` both work — pick one and be consistent. Astro's `class:list` is `.astro`-only; inside a `.tsx` build the string in JS.
- **`useSignalEffect` re-runs before Preact commits to the DOM.** If the effect needs the committed node, use a plain `useEffect` over the rendered value instead — a hidden element swallows `focus()` in silence, with no error to find.
- **A listener registered inside an open/close effect is dead for the first frame**, because the effect runs after the paint. Register on mount and read the signal when it fires. Found by a test that pressed Escape promptly, which is also how an impatient reader behaves.
- **`src/i18n/ui.ts` feeds island props**, so every string it holds that reaches an island is serialized into both pages' HTML. Page-level strings go in the sibling `meta.ts`, not in `ui.ts`.

**State** — **there is none that crosses a component**, and there is no state library. Every island owns what it needs and nothing else ([why signals would be the choice if that changed](research/preact-best-practices.md#45-verdict-on-the-prescriptive-rule-signals-for-shared-usestate-for-local)):
- **The DOM is the source of truth for the theme and the Mode.** `<html data-theme>` and `<html data-mode>` are written pre-paint by `BaseLayout.astro`'s two `is:inline` scripts, read back by the island that flips them, and everything else — which glyph, which label, where a pill sits — is chosen by CSS off those attributes (ADR-0003, ADR-0017). Do not mirror either into a store. `ThemeSwitch` keeps a `useState` that *follows* `data-theme` for its own `aria-checked`; that is a mirror of the attribute, not a second truth.
- **`useState` for anything local.** `ShareButton`'s `copied` flag is `useState` with the 2s revert timer in a `useRef` and a cleanup effect. This used to be a module-level signal with a written-down exemption; the exemption's reason was that two islands shared a `state.ts` module, and neither the second island nor `state.ts` exists (ADR-0025).
- **`@preact/signals` is not installed as a direct dependency.** If shared state ever becomes real, read the research note above before reaching for Nano Stores — but first check whether an attribute on `<html>` will do, because it has so far.

**Hydration directive:** `client:idle` on all three islands, with the theme and the Mode applied pre-paint by `BaseLayout.astro`'s `is:inline` scripts outside them (Astro's own tutorial pattern). **Not** `client:media` — no control is breakpoint-dependent, and since ADR-0017 not even the Mode's is. **Not** `client:only` — the bar has to be in the static HTML, correct and complete, or it pops in and stops working with JavaScript off. The accepted cost of `client:idle` is stated in ADR-0025: `ThemeSwitch`'s `aria-checked` is wrong until it hydrates, because nothing writes it pre-paint.

## TypeScript

- Extend `astro/tsconfigs/strict` (or `strictest`).
- Gate the build: `"build": "astro check && astro build"`.
- `jsx: "react-jsx"` + `jsxImportSource: "preact"` is a **mandatory override** — `astro/tsconfigs/base` sets `jsx: "preserve"` and no import source. Preact ships its own types; the project carries no `@types/react`.
- `verbatimModuleSyntax` is on: type-only imports must be `import type`, or `astro check` fails.
- Type props with `interface`; children as `ComponentChildren`; events as `TargetedMouseEvent<HTMLButtonElement>` & co., imported from `preact` (inline handlers infer their target).
- `useRef<HTMLDialogElement>(null)` — unlike React 19 the argument is optional, but pass `null` for the null-check ergonomics.

## CSS

Authored as Astro scoped `<style>`, no framework. See [Baseline table](research/modern-css-best-practices.md#9-baseline-availability-summary) before using newer features.

**Two exceptions, and only these two:** an island's own markup lives in a `.tsx`, which Astro's scoping does not reach — dress it from a plain stylesheet colocated with the island (`components/chrome/toolbar.css`), wrapped in `@layer components` so it lands in the same cascade as the paper. That file also owns the Toolbar's own geometry tokens, declared on `:root` inside its layer rather than in `tokens.css` — a token with one reader belongs beside it, and `tokens.css` arrives in `layer(base)`, so a Toolbar name would win a collision either way (ADR-0025). And `src/styles/icons.css`, which pairs a font resource with the glyph classes that use it and has no single owning component. Nothing else earns a global stylesheet.

**Three cascade traps, each of which fails silently:**
- The bare `@layer reset, base, components, print;` statement must come **before** the `@import` lines. Placed after them, the production CSS minifier hoists it in a way that reorders the effective layer precedence — and the failure is **minifier-only**, so dev looks correct and the built site does not.
- **An Astro scoped `<style>` must be wrapped in `@layer components`.** Unlayered, it permanently beats every layered rule, including `print`.
- **Screen-only layout is cancelled in `@layer print`, not fenced behind `@media screen`.** The paper's printed geometry is then stated in one place rather than being whatever a guard happened to leave standing. The hazard is real and this project has shipped it: `justify-items: center` applies in block layout in Chrome, so left unqualified it survived the print layer's `display: block` and moved every printed glyph by 0.156px. The rule is therefore that the print layer must *name* what it neutralises — `display`, `gap`, `padding`, the alignment properties, `container-type` — and a reviewer's question is "does `print` take this back?", never "is this guarded?".
  - **Two exceptions, both where the cancellation would have to restate a value.** The theme ladder stays inside `@media screen` (see below), because cancelling it means writing all five light literals a second time. So does **every** Reading Mode rule, in every file that carries one — `tokens.css`, `Document.astro`, `Sheet.astro`, `HeaderBlock.astro`, `GroupMeta.astro`, `MainSectionBlock.astro`. The Mode's neutral state *is* the paper, so cancelling it means copying the paper's own values into `print` — the whole type scale, `grid-template-columns: 0.8fr 1.1fr 1.1fr`, `min-block-size: var(--photo-size)`, `margin-block-start: var(--space-xl)` — where the copy and the original drift apart in silence. They did: four of those six files had no `print` block at all, and the reading type scale, the centred header and the stacked meta reached paper for a release. The invariant is greppable — **no `data-mode='reading'` outside `@media screen`** — and the two rules exempt from it are Chrome, the Toolbar's and the Colophon's, which `print` hides outright.
  - **The suite could not see it, and now can.** `pdf.spec.ts` asserts page count, page size, embedded fonts and text; a sub-pixel shift of every glyph changes none of them, and neither does reading type on paper — the Sheet is a fixed box, so the type overflows *inside* the paper rather than paging. *prints as paper even from Reading Mode* now compares every Block's printed box between the two Modes under `emulateMedia({ media: 'print' })`. Measure the printed boxes that way when touching layout both media share.

- **Units by role:** `mm` only for the A4 sheet / `@page`; `rem`/`em`/`ch` for all type and reflow. Never size `font-size` in absolute units.
- **Paged media:** `@page { size: A4; margin: 0 }`. The two Sheet components own all layout.
- **Fragmentation:** use modern `break-*`, not `page-break-*`. `break-inside: avoid` on every Block and the Aside; `break-before: page` at the deliberate 2-Sheet seam.
- **Print fidelity:** `print-color-adjust: exact` **plus** `-webkit-print-color-adjust: exact` on colored surfaces; keep screen/print rendering identical.
- **Layout:** Grid with `grid-template-areas` for the Aside/Main sheet (the areas step out of the flow entirely under `[data-mode='reading']` — ADR-0017); Flexbox for 1-D runs, the row of Sheets included, where a wrapping line replaces a wide-tier breakpoint; `gap` over child margins.
- **Responsive trigger:** viewport/print → media query; element's own space → `@container`; presence/state of descendants → `:has()`.
  - **`src/` holds exactly one width literal, and no stylesheet may grow a second.** It is `856px`
    in `BaseLayout.astro`'s Mode script — `--sheet-width + 2 * --sheets-pad` — and it seeds a
    *default*, which is why it is allowed where ADR-0017 deleted every breakpoint: nothing is laid
    out by it, so drift costs a reader one press of a control (ADR-0017, amended). Layout still
    derives its thresholds from the tokens. The invariant is greppable —
    `grep -rn '856' src/ --include='*.astro' --include='*.css' --include='*.ts' --include='*.tsx'`
    returns that one line and its comment; the bare `grep` also hits the icon font's
    `selection.json`, which is generated path data.
  - **Not `@container` above a page break.** `container-type: inline-size` brings layout containment, and a layout-contained box is monolithic for fragmentation — over the two Sheets it would swallow the `break-before: page` that makes the CV two pages. Size from the viewport there instead.
  - **`:has()` cannot cross an Astro scope.** The compiler leaves `:global()` untouched inside it, and the browser then drops the whole rule as an unknown pseudo-class, silently. Test the built CSS, or key off an attribute the component sets itself.
- **Theming:** `color-scheme: light dark` on `:root`, tokens as custom properties in `oklch()`, `light-dark()` for per-property pairs (keep a `prefers-color-scheme` fallback since it's only newly available). `@property` only if you animate a custom property.
  - **Never `light-dark()` in a custom property's value.** A custom property stores its value unparsed, so the plain-value declaration written before it as a fallback is not discarded by a browser lacking `light-dark()` — the second declaration wins anyway and the colour fails at computed-value time, leaving the property unset. The fallback pattern needs parse-time validation, which means per property. Theming a *token* is a cascade job: rebind it on `:root` and on `html[data-theme]` (ADR-0015).
  - **Put the whole theme ladder inside `@media screen`.** One of the two exceptions above, and the guard here is load-bearing rather than precautionary: measured on a machine that prefers dark, `screen and` gives a printed page of white paper and near-black ink, and changing it to `all` gives navy paper and near-white ink. It buys that for no duplicated literal — under `print` the ladder is inert and the base values, the light ones, remain. Cancelling it in the print layer instead would mean restating all five.
- **Architecture:** cascade layers (`@layer reset, base, components, print`) instead of specificity fights; native nesting (`&` mandatory for compound selectors); logical properties (`margin-inline`, `padding-block`) for the bilingual content; `:where()` for zero-specificity resets.

## Fonts

ADR-0024 owns the reasoning, the declaration and the pipeline. The rules that follow:

- **The pipeline is three files, and stays three.** `fonts.config.mjs` declares the families and adapts that declaration (`toAstroFonts()`, `toSubsetTasks()`); `scripts/subset-fonts.mjs` is an Astro integration that **imports nothing from the project** and takes its tasks as input; `astro.config.mjs` is the entrypoint that wires the two.
- Self-host, and **declare every face in `fonts.config.mjs`** — never an `@font-face` in a stylesheet. `<Font>` renders it, once per family, in every head the site has; `src/styles/fonts.css` maps the emitted variables onto role tokens.
- **A new head means a new set of `<Font>` calls.** The variables exist only where the component renders, and an undefined one makes the whole `font-family` declaration invalid.
- **Never depend on the CSS family name.** Astro appends a config hash to it, and the hash moves whenever the family's config does — no literal `font-family: 'JetBrains Mono'`, no assertion on the string. Assert on embedded PostScript names instead, as `tests/pdf.spec.ts` does.
- **Never `font-display: optional`** (determinism hazard for PDF capture) — use `block`/`swap` and gate capture on `document.fonts.ready`. Astro generates the `size-adjust` fallbacks; the `fallbacks` list must end in a generic or it generates none.
- **`src/assets/fonts/` holds the raw faces and only those.** The subsets are cut on every dev start and every build into `.astro/subset-fonts/`, and **nothing derived is ever committed or written back into `src/`** — a subset put where a source belongs round-trips silently and destroys the only copy. The build guards on it: a face that does not shrink is an error.
- **Adding a face**: drop the source in `src/assets/fonts/<family>/`, add a variant in `fonts.config.mjs` — one place, the charset comes from its family — and, for a new family, give its `cssVariable` a role token. Nothing to run, nothing generated to commit.

## Accessibility

- Style focus with `:focus-visible`; never remove an outline without a replacement.
- Collapse transitions under `@media (prefers-reduced-motion: reduce)`.
- **Never put a pseudo-element inside `:is()` or `:where()`.** Neither can contain one, and their selector lists are *forgiving*, so the item is dropped and the rule still parses — `:where(*, *::before, *::after)` is `:where(*)`. Give the pseudo-element compounds their own selector beside the `:where()` one, as `reset.css` does for `box-sizing` and for the reduced-motion collapse, and remember that a bare `::before` is (0,0,1) rather than zero.
- A **cross-document** View Transition is opted out of in CSS, not in JavaScript: `@view-transition { navigation: none }` inside the reduced-motion block. A **same-document** one has to be gated in JavaScript, because `reset.css` reaches neither `::view-transition-*` nor `Element.animate()` (ADR-0016).
- Every `<Image>` needs meaningful `alt`. Respect user font scaling (type in `rem`/`em`).

## Tooling

- **GitHub Action versions:** take the newest major that has had a patch release and a few weeks of soak. Never the majors released days ago and never patched.
- VS Code + the official Astro extension.
- **Formatting and linting are Biome** (ADR-0021), configured in `biome.jsonc`: `npm run lint`
  to check, `npm run lint:fix` to apply. `biome.jsonc`, not `biome.json` — comments in a
  `biome.json` make Biome fall back to its defaults **silently**.
- **Biome formats the `.astro` template and its `<style>`, and sorts the frontmatter imports,
  but does not format the frontmatter TypeScript.** Two flags are needed for even that much:
  `html.experimentalFullSupportEnabled` and `html.formatter.enabled`. Both are experimental
  and go away when Biome's HTML parser stabilises.
- Exempt a rule in `biome.jsonc` scoped to the files that earn it, or with a `biome-ignore`
  carrying its reason — never globally, and never a bare suppression.
- Keep local images in `src/` and render with `astro:assets` `<Image />` (`alt` mandatory); `public/` only for files that must keep a stable URL.

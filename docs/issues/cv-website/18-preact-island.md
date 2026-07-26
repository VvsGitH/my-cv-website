# 18 — Preact instead of React for the island

Status: done

## Goal

Swap the island framework from React 19 to **Preact 10** before ticket 07
writes the first line of island code, and bring the documentation with it.

React is more framework than this site's one island needs: the Toolbar is two
links and three toggles, no React-ecosystem library is in use or planned, and
Preact offers the same JSX authoring model on a runtime an order of magnitude
smaller. The decision was taken against the alternative of dropping the
framework entirely — see the reasoning in the rewritten ADR-0003.

Nothing to migrate: `src/` contains no `.tsx`, and ticket 05 already deleted
ticket 01's `HydrationProbe.tsx`. This is a forward-looking change only.

## Decisions

- **`compat` stays off.** No React-ecosystem package is in use, so the island
  is plain Preact rather than React-on-Preact. One line to enable later if
  that ever changes.
- **`@preact/signals` is adopted**, and pinned as a **direct** dependency even
  though `@astrojs/preact` already pulls it in — depending on npm hoisting for
  something we import is fragile.
- **State rule:** signals are the island's one state API — `signal()` at module
  scope for state more than one component reads (theme, Drawer open),
  `useSignal()` inside a component for state that lives and dies there. A
  module-level signal is shared by every instance of a component, which is the
  point for the former and a bug for the latter.
  <br>The rule started as "signals for shared, `useState` for local"; the
  research moved it. Preact's own answer for "state confined to the component
  that needs it" is `useSignal`, and no primary source endorses `useState` in
  that role — the original rule would have shipped as an uncited house
  preference for no gain.
- **`devtools: true`** on the integration. A hydration mismatch stops hydrating
  and re-renders in silence unless `preact/debug` is loaded; the flag injects
  it, and only when `command === "dev"`.
- **Preact 10, not 11.** Preact 11 is still beta and outside the peer range of
  `@astrojs/preact@6`.

## Tasks

- Dependencies: drop `react`, `react-dom`, `@astrojs/react`, `@types/react`,
  `@types/react-dom`; add `preact`, `@astrojs/preact`, `@preact/signals`.
- `astro.config.mjs`: `integrations: [preact()]`.
- `tsconfig.json`: `jsxImportSource: "preact"` (`jsx: "react-jsx"` stays — it
  names the transform, not the framework).
- Research `docs/research/preact-best-practices.md` from primary sources;
  delete `docs/research/react-19-best-practices.md`.
- Rewrite `coding-standards.md`'s "React islands" section over that research,
  including the state rule above and the TypeScript notes.
- Rewrite ADR-0003 in place as `0003-astro-with-preact-island.md`, demoting
  React to a *Considered Options* entry.
- Update `spec.md` (Stack + ticket 07's index entry), `README.md`, and ticket
  07's title and Goal.

## Out of scope

- **Done tickets (01, 05, 15) and the dated research files are left alone.**
  They record what was done, and what was true on their research date;
  rewriting them would falsify the log. Ticket 01 really did install
  `@astrojs/react`.
- **`src/content/it.ts` and `en.ts` are never touched.** "React.js" there is
  CV content — real work experience.
- `CONTEXT.md` — a glossary of the CV domain, with no implementation detail in
  it. Neither "React" nor "island" appears; nothing to change.
- Writing the island itself. That stays ticket 07.

## Acceptance

- `npm run build` (`astro check && astro build`) green: 0 errors, 0 warnings,
  0 hints.
- No `react` / `react-dom` / `@types/react*` left in `package.json` or the
  lockfile's direct dependencies.
- Outside CV content and the historical documents listed in *Out of scope*,
  no document still tells a reader to use React.
- `coding-standards.md`'s island section links to a research file that exists.

## Notes for later tickets

**Ticket 07 (Toolbar)** — three findings from the research that would otherwise
be discovered the hard way, all now in `coding-standards.md`:

- **`ref` is not a plain prop in Preact 10.** Both `createElement` and the JSX
  runtime strip `ref` out of `props`, so a React-19-style
  `function Drawer({ ref })` receives `undefined` with no error and no warning;
  `forwardRef` is compat-only. Use `innerRef`, or keep the ref inside the
  component that owns the node.
- **`client:media` is the wrong directive**, despite the Drawer toggle being
  mobile-only. Only the toggle is breakpoint-dependent — under
  `client:media="(max-width: …)"` the language, download, share and theme
  controls would never hydrate on desktop. `client:idle` once the theme is
  applied pre-paint by an `is:inline` script, `client:load` otherwise.
- **Hydration mismatches are silent.** The module-level `signal()` initializer
  runs during prerender too, so its value lands in the static HTML: initialise
  the theme signal to a deterministic default and reconcile after mount, or
  drive the icon from the root class via CSS.

**Unverified by the research, so decide deliberately in 07** — `aria-expanded`
semantics, focus trapping, focus return and `Escape` handling for the Drawer
are outside what preactjs.com and docs.astro.build cover. They are WAI-ARIA
APG questions; cite the APG or state them as house convention, but don't
invent a Preact citation. Same for *why* an `is:inline` script prevents the
theme flash: Astro's tutorial demonstrates the pattern without explaining the
timing, so confirm placement empirically.

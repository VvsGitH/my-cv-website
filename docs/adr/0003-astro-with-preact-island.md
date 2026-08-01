# Astro (static) with Preact islands

The site is built with **Astro in static-output mode**, with **Preact islands** for the interactive Chrome — the Toolbar (language, download, share, theme, and the Drawer's toggle) and the Drawer itself. Astro prerenders everything to plain HTML with zero client JS by default — ideal for a content-light, fidelity-critical CV that must host cheaply on GitHub Pages — while the island keeps JSX only where interactivity actually earns it. Preact gives that same JSX authoring model on a runtime an order of magnitude smaller than React's, which is the right trade for one cluster of four controls.

## Considered Options

- **React 19** — this ADR's original decision, reversed by ticket 18 before a single line of island code existed. Nothing in the project reaches for the React ecosystem, and `@astrojs/preact` offers an identical authoring model at a fraction of the payload; `compat` is therefore left off, so the island is plain Preact rather than React-on-Preact.
- **No UI framework at all** — an `.astro` `<script>` would ship 0 KB of runtime for what is ultimately two links and three toggles, and would be the strictest reading of the KISS principle. Rejected: the theme, Drawer and toast state reads better declared than toggled by hand, and the island's runtime is dwarfed by this page's self-hosted fonts, so the payload argument buys little.
- **Vite + React (SPA)** — matches the repo name and gives a single plain-React source, but ships a full client-side app for what is fundamentally two static Sheets, and leaves the prerender-to-HTML wiring to us. Acceptable runner-up.
- **Next.js `output: 'export'`** — works, but a lot of framework for a two-page CV; many features go unused.
- **SolidJS / Angular** — no advantage here; Angular is the heaviest option.

## Consequences

- One component tree is the single source of truth rendered both to the live page and to the PDF-captured page.
- Interactivity is confined to the islands; the Sheets themselves ship no JS.
- **Amended by ADR-0007, and still amended under ADR-0008.** This ADR originally said "exactly one Preact island", and ticket 07 shipped it that way: the Toolbar had to be able to render *inside* the Drawer's `<dialog>`, and two islands cannot share a subtree. Dropping the `<dialog>` for a custom modal removed that constraint, and the Chrome became two islands sharing one signal. ADR-0008 brings the `<dialog>` back without bringing the constraint with it — the panel now carries its own close control, so the Toolbar has no reason to render inside it. The reasoning for one runtime and one authoring model is untouched.
- Astro's built-in i18n routing handles the two Locales.
- `@preact/signals` arrives as a dependency of `@astrojs/preact`, but is pinned as a direct dependency rather than relied on transitively. The rule for when to reach for a signal instead of `useState` lives in `coding-standards.md`.
- JSX is typed by `jsxImportSource: "preact"` and the project carries no `@types/react`, so React-shaped annotations (`React.ReactNode`, `React.MouseEvent`) will not compile.
- **Preact 10, not 11.** Preact 11 is still beta and outside the peer range of `@astrojs/preact@6`. An automated dependency upgrade will hit this blind; the pin is deliberate, not stale.
- **The theme control has no `aria-pressed`, and there is no `theme` signal.** The island cannot know the stored theme at prerender, so any signal-driven ARIA state would be wrong for a returning dark-theme visitor for the whole window between first paint and hydration. Instead the control ships **both** accessible names and both glyphs, and `toolbar.css` picks between them off `<html data-theme>` — correct from the first paint, with no state to hydrate. An "accessibility improvement" adding `aria-pressed` would make the control less accurate, not more.

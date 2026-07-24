# Astro (static) with a single React island

The site is built with **Astro in static-output mode**, with exactly one **React island** for the interactive Toolbar (language, download, share, theme) and the mobile Drawer toggle. Astro prerenders everything to plain HTML with zero client JS by default — ideal for a content-light, fidelity-critical CV that must host cheaply on GitHub Pages — while the island keeps JSX only where interactivity actually earns it.

## Considered Options

- **Vite + React (SPA)** — matches the repo name and gives a single plain-React source, but ships a full client-side app for what is fundamentally two static Sheets, and leaves the prerender-to-HTML wiring to us. Acceptable runner-up.
- **Next.js `output: 'export'`** — works, but a lot of framework for a two-page CV; many features go unused.
- **SolidJS / Angular** — no advantage here; Angular is the heaviest option.

## Consequences

- One component tree is the single source of truth rendered both to the live page and to the PDF-captured page.
- Interactivity is confined to the island; the Sheets themselves ship no JS.
- Astro's built-in i18n routing handles the two Locales.

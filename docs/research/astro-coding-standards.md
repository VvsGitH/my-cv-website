# Astro coding standards, conventions & best practices (for this CV site)

Research date: 2026-07-24. All claims cite PRIMARY sources: the official Astro docs (`docs.astro.build`), first-party integration docs, the published npm package manifests (`astro`, `@astrojs/react`), and the official Astro release blog. Per the brief, blog posts are excluded **except** for authoritative release notes (the Astro 7.0 announcement is used only for release facts). No third-party tutorials are cited.

## Confirmed latest version

- **Latest stable Astro: `7.1.3`** (published 2026-07-20). Astro `7.0.0` shipped 2026-06-22; the `7.x` line is current, so the project's `astro ^7.1.3` pin is real and current (verified against the npm `dist-tags.latest` and version-time metadata of the `astro` package).
- Astro 7 "is all about speed" — the headline feature is a `.astro` compiler rewritten in Rust and an upgrade to Vite 8 ([Astro 7.0 release notes](https://astro.build/blog/astro-7/)).
- **Runtime requirement (from the published `astro@7.1.3` manifest): Node `>=22.12.0`, npm `>=9.6.5`, and Vite `^8`.** These come from the package's own `engines`/`dependencies` fields (primary manifest). The release blog states it "upgrades to Vite 8" but does **not** state a minimum Node version, so the Node floor is cited to the manifest, not the blog ([Astro 7.0 release notes](https://astro.build/blog/astro-7/)).
- Companion packages verified latest: `@astrojs/react` `6.0.1`, `@astrojs/check` `0.9.9`, `react` `19.2.8`. Note: the project pins `typescript ^6.0.3`, but the current latest TypeScript is `7.0.2` — worth a deliberate decision, not covered further here.

## TL;DR / Recommendation for this project

This project is already aligned with the officially-recommended Astro shape for a static, content-light, minimal-JS site. The standards that matter most here:

- **Keep `output: 'static'` (the default) and prerender everything.** Astro prerenders the whole site to HTML by default; the docs explicitly say "Start with the default 'static' mode until you are sure that most or all of your pages will be rendered on demand" ([Rendering modes](https://docs.astro.build/en/basics/rendering-modes/)). No adapter is needed for GitHub Pages.
- **Author the site in `.astro` components (zero client JS by default) and use the React island only where interactivity is genuinely needed.** Framework components render to static HTML unless you add a `client:*` directive; the docs say only hydrate what needs interactivity ([Framework components](https://docs.astro.build/en/guides/framework-components/)). For a CV, prefer `client:visible` or `client:media` over `client:load` so JS is deferred.
- **Type props with a `Props` interface, extend `astro/tsconfigs/strict` (or `strictest`), and wire `astro check` into the build.** The docs recommend `strict`/`strictest` for TypeScript projects and show `"build": "astro check && astro build"` ([TypeScript guide](https://docs.astro.build/en/guides/typescript/)).
- **Keep content in data/collection files separate from layout — the "Astro way."** Content collections are "the best way to manage sets of content," with Zod schemas giving auto-generated types and validation ([Content collections](https://docs.astro.build/en/guides/content-collections/)).
- **Use scoped `<style>` (default) and `astro:assets` `<Image />` (with required `alt`) for any images.** Both are the documented defaults ([Styling](https://docs.astro.build/en/guides/styling/); [Images](https://docs.astro.build/en/guides/images/)).
- **Adopt the official tooling: the Astro VS Code extension, `prettier-plugin-astro`, and `eslint-plugin-astro`** ([Editor setup](https://docs.astro.build/en/editor-setup/)).

Prescriptive vs optional is flagged throughout: Astro reserves very little and calls most structure "a common convention but not required."

---

## 1. Project structure & directory conventions

- **`src/pages/` is the only directory Astro *requires*.** The docs: "`src/pages` is a **required** sub-directory... Without it, your site will have no pages or routes." It is also "the only directory reserved by Astro" — "You are free to rename and reorganize any other directories" ([Project structure](https://docs.astro.build/en/basics/project-structure/#srcpages)).
- **`src/components/`, `src/layouts/`, `src/styles/` are conventions, not requirements.** Each is described as "a common convention in Astro projects, but it is not required" ([Project structure](https://docs.astro.build/en/basics/project-structure/#srccomponents)).
- **`public/` holds unprocessed static assets** copied to the build output untouched (favicons, `robots.txt`, files that must keep a stable URL) ([Project structure](https://docs.astro.build/en/basics/project-structure/#public); [Images](https://docs.astro.build/en/guides/images/)).
- **Config files at project root:** `astro.config.mjs` (`.js`/`.mjs`/`.ts` all supported), `tsconfig.json`, `package.json` ([Project structure](https://docs.astro.build/en/basics/project-structure/)).
- **Default directories are configurable:** `srcDir` defaults to `./src`, `publicDir` to `./public`, `outDir` to `./dist` ([Configuration reference](https://docs.astro.build/en/reference/configuration-reference/)).

**Prescriptive?** Only `src/pages/` is mandatory. Everything else is recommended convention — safe to follow, not enforced.

## 2. `.astro` component authoring

- **Two parts split by a `---` code fence:** the *component script* (frontmatter) and the *component template*. The script "runs at build time" and "will be stripped from the final page sent to your users' browsers" ([Astro components](https://docs.astro.build/en/basics/astro-components/)).
- **No client runtime by default.** Astro components are "HTML-only templating components with no client-side runtime" and "don't render on the client," with "zero JavaScript footprint added by default" ([Astro components](https://docs.astro.build/en/basics/astro-components/); [Islands](https://docs.astro.build/en/concepts/islands/)).
- **Props via `Astro.props`, typed with a `Props` interface.** The idiom is to destructure with defaults (`const { greeting = "Hello", name } = Astro.props;`) and to declare an `interface Props { ... }`, which Astro/the editor picks up for type warnings ([Astro components](https://docs.astro.build/en/basics/astro-components/); [TypeScript guide](https://docs.astro.build/en/guides/typescript/)).
- **Slots:** `<slot />` renders children; named slots use `<slot name="x" />` with `slot="x"` on children, and "named slots must be an immediate child of the component." Fallback content shows only when nothing matches ([Astro components](https://docs.astro.build/en/basics/astro-components/)).
- **Component names must be capitalized** so Astro distinguishes components from plain HTML elements ([Astro components](https://docs.astro.build/en/basics/astro-components/)).
- **Template directives** used in authoring: `class:list` (build class strings, backed by `clsx`), `is:global` (opt a `<style>` out of scoping), `is:inline` (leave a script/style unbundled/unprocessed), `set:html` (inject raw HTML — trusted content only, XSS risk), `define:vars` (pass server values into scripts/styles) ([Directives reference](https://docs.astro.build/en/reference/directives-reference/)).

## 3. Rendering modes & islands (minimizing client JS)

- **Static is the default:** "By default, your entire Astro site will be prerendered, and static HTML pages will be sent to the browser." Opt individual routes out with `export const prerender = false`; switching `output: 'server'` only flips the *default* and "does not bring any additional functionality." On-demand rendering requires a server adapter ([Rendering modes](https://docs.astro.build/en/basics/rendering-modes/)). For GitHub Pages, stay static — no adapter.
- **Islands architecture:** render "the majority of your page to fast, static HTML with smaller 'islands' of JavaScript added when interactivity or personalization is needed." "JavaScript is one of the slowest assets that you can load per-byte, so every byte counts" ([Islands](https://docs.astro.build/en/concepts/islands/)).
- **`client:*` directives** (from the reference, quoting priority/use-case):
  - **`client:load`** — hydrate immediately on page load; priority High; "Immediately-visible UI elements that need to be interactive as soon as possible."
  - **`client:idle`** — hydrate "once the page is done with its initial load"; priority Medium; optional `timeout`.
  - **`client:visible`** — hydrate "once the component has entered the user's viewport"; priority Low; optional `rootMargin`; for elements "far down the page or resource-intensive to load."
  - **`client:media={QUERY}`** — hydrate when a CSS media query matches; for "sidebar toggles, or other elements that might only be visible on certain screen sizes."
  - **`client:only="react"`** — "Skips HTML server rendering, and renders only on the client"; "You must pass the component's correct framework as a value" ([Directives reference](https://docs.astro.build/en/reference/directives-reference/)).
- **Best practice — minimal hydration:** "Only hydrate components that genuinely need interactivity" ([Framework components](https://docs.astro.build/en/guides/framework-components/)).

**Recommendation for the CV:** the single React island should almost never be `client:load`. A toggle/menu that only exists at some breakpoints fits `client:media`; anything below the fold fits `client:visible`; a component that can't server-render (e.g. depends on `window`) needs `client:only="react"`.

## 4. React islands (@astrojs/react)

- **Install with `astro add react`**, which "automates setup and dependency installation"; manual install also needs the peer deps `react`, `react-dom`, `@types/react`, `@types/react-dom` ([React integration](https://docs.astro.build/en/guides/integrations-guide/react/)).
- The integration "enables rendering and client-side hydration for your React components"; React components "require a `client:*` directive to become interactive on the browser" ([React integration](https://docs.astro.build/en/guides/integrations-guide/react/)).
- **React 19 is supported** ([React integration](https://docs.astro.build/en/guides/integrations-guide/react/)). The published `@astrojs/react@6.0.1` manifest declares peer ranges accepting React `^17 || ^18 || ^19` — so the project's React 19 is in range (package manifest, primary).
- Options worth knowing: `experimentalReactChildren` (pass children as React vnodes rather than strings, at a runtime cost), `include`/`exclude` (needed only when mixing multiple JSX frameworks), `experimentalDisableStreaming` (for CSS-in-JS libs incompatible with streaming) ([React integration](https://docs.astro.build/en/guides/integrations-guide/react/)).
- **Constraint:** framework components can't use `.astro` components as children directly, but you can pass Astro-rendered markup into a framework component via slots in an `.astro` file ([Framework components](https://docs.astro.build/en/guides/framework-components/)).

## 5. TypeScript conventions

- **Extend an official preset.** Astro ships `astro/tsconfigs/base`, `.../strict`, `.../strictest`. The docs: "We recommend using `strict` or `strictest` if you plan to write TypeScript in your project," via `{ "extends": "astro/tsconfigs/strict" }` ([TypeScript guide](https://docs.astro.build/en/guides/typescript/)).
- **Type-check with `astro check`**, which validates `.astro` and `.ts` files and requires `typescript` + `@astrojs/check` as deps. Recommended build script: `"build": "astro check && astro build"` ([TypeScript guide](https://docs.astro.build/en/guides/typescript/)). This project already has `@astrojs/check` and `typescript` in devDeps but its `build` script is currently plain `astro build` — adding the check gate is the documented pattern.
- **Prop typing:** declare `interface Props { ... }`; the editor tooling detects it automatically ([TypeScript guide](https://docs.astro.build/en/guides/typescript/)).
- **Use `import type` for type-only imports;** `verbatimModuleSyntax` is enabled by default in all presets ([TypeScript guide](https://docs.astro.build/en/guides/typescript/)).
- **Generated types:** Astro writes types into `.astro/types.d.ts`, referenced (e.g. via `src/env.d.ts`) with `/// <reference path="../.astro/types.d.ts" />`. Content collections generate types automatically from schemas ([TypeScript guide](https://docs.astro.build/en/guides/typescript/); [Content collections](https://docs.astro.build/en/guides/content-collections/)).

## 6. Content collections (separating content from layout)

- **Collections are "the best way to manage sets of content in any Astro project"** — blog posts, profiles, "or any structured content." They are made of entries, loaders, and (optional but recommended) schemas ([Content collections](https://docs.astro.build/en/guides/content-collections/)).
- **Config location is prescriptive:** the config lives in `src/content.config.ts` (`.js`/`.mjs` also accepted). Define each collection with `defineCollection()` from `astro:content` ([Content collections](https://docs.astro.build/en/guides/content-collections/)).
- **Loaders** from `astro/loaders`: `glob()` (many files in a directory — Markdown/MDX/YAML/TOML/JSON) and `file()` (multiple entries from one JSON/YAML/TOML file, each with a unique `id`) ([Content collections](https://docs.astro.build/en/guides/content-collections/)).
- **Schemas via Zod** give autocompletion, **runtime validation**, and **auto-generated TypeScript types** ([Content collections](https://docs.astro.build/en/guides/content-collections/)).
- **Query with `getCollection()` / `getEntry()`**; cross-link with the `reference()` helper resolved by `getEntry()`/`getEntries()` ([Content collections](https://docs.astro.build/en/guides/content-collections/)).
- **Separation of concerns is the stated principle:** content lives in the collection/config, presentation happens in `src/pages/` route files ([Content collections](https://docs.astro.build/en/guides/content-collections/)).

**Applicability note (honest scoping):** the docs also say to *skip* collections for "single pages" and note collections "excel when you have multiple files or data sharing the same structure" ([Content collections](https://docs.astro.build/en/guides/content-collections/)). A one-page CV has a single structured record, not a set of like-structured entries, so a plain typed data file (`.ts`/`.json` imported into the layout) is an equally idiomatic way to keep content separate from layout; content collections become worthwhile if the CV grows repeated lists (jobs, projects, skills) you want schema-validated. The docs are prescriptive about *how* to use collections, not that every site *must* use them.

## 7. Styling conventions

- **`<style>` is "automatically scoped by default"** — Astro compiles selectors with a per-component data attribute so low-specificity selectors are safe from cross-component leakage ([Styling](https://docs.astro.build/en/guides/styling/)).
- **Global styles:** `<style is:global>`, or `:global()` inside an otherwise-scoped block; imported CSS files are also supported ([Styling](https://docs.astro.build/en/guides/styling/)).
- **Dynamic CSS values with `define:vars`** — pass frontmatter values into a `<style define:vars={{ ... }}>` and read them with `var(--name)` ([Styling](https://docs.astro.build/en/guides/styling/); [Directives reference](https://docs.astro.build/en/reference/directives-reference/)).
- **Class composition** with `class:list={['box', { red: isRed }]}` ([Styling](https://docs.astro.build/en/guides/styling/)).
- **Preprocessors/Tailwind:** Sass, Less, Stylus, PostCSS work through Vite natively; Tailwind 4 is added via the `@tailwindcss/vite` plugin (`astro add tailwind`) ([Styling](https://docs.astro.build/en/guides/styling/)).
- **Cascade order:** `<link>` tags → imported stylesheets → scoped styles, with scoped styles winning at equal specificity due to source order ([Styling](https://docs.astro.build/en/guides/styling/)).

## 8. Configuration (`astro.config.mjs`)

- **Use `defineConfig` from `astro/config`** for type hints: `import { defineConfig } from 'astro/config'; export default defineConfig({ ... })` ([Configuration reference](https://docs.astro.build/en/reference/configuration-reference/)).
- **Key options for this project:** `site` (deployed URL — needed for canonical URLs/sitemaps), `base` (base path, important for GitHub Pages project sites), `output` (`'static'` default vs `'server'`), `integrations` (array — e.g. React), and `image` (optimization service, `image.domains`/`image.remotePatterns`, responsive defaults) ([Configuration reference](https://docs.astro.build/en/reference/configuration-reference/)).
- For GitHub Pages, `site` + `base` are the two options most likely to need setting (the config reference documents both; deployment specifics live in the Astro GitHub Pages deploy guide, not re-verified here).

## 9. Images (`astro:assets`)

- **Keep local images in `src/` when possible:** "We recommend that local images are kept in `src/` when possible so that Astro can transform, optimize, and bundle them." Files in `public/` are "served or copied into the build folder as-is, with no processing" ([Images](https://docs.astro.build/en/guides/images/)).
- **`<Image />` from `astro:assets` is the primary tool;** `alt` is **mandatory** — "If no alt text is provided, a helpful error message will be provided reminding you to include the `alt` attribute." It auto-infers dimensions to prevent layout shift and can convert format/quality at build time ([Images](https://docs.astro.build/en/guides/images/)).
- **`<Picture />`** generates multiple formats (e.g. `formats={['avif','webp']}`) and also requires `alt` ([Images](https://docs.astro.build/en/guides/images/)).
- **Images in collections** use the `image()` schema helper: `schema: ({ image }) => z.object({ cover: image() })` ([Images](https://docs.astro.build/en/guides/images/)).
- **Plain `<img>`** is reserved for unsupported formats, intentionally unoptimized images, or client-side dynamic `src`; for a local `src/` import use `importedImage.src` ([Images](https://docs.astro.build/en/guides/images/)).
- **Remote optimization** requires authorizing domains via `image: { domains: [...] }` / `remotePatterns` ([Images](https://docs.astro.build/en/guides/images/); [Configuration reference](https://docs.astro.build/en/reference/configuration-reference/)).

## 10. Linting, formatting & editor tooling (official)

- **VS Code is the recommended editor**, with the official extension `astro-build.astro-vscode` for syntax highlighting, TypeScript info, and IntelliSense: "We maintain an official Astro VS Code Extension that unlocks several key features..." ([Editor setup](https://docs.astro.build/en/editor-setup/)).
- **Prettier:** the docs recommend "the official Astro Prettier plugin" `prettier-plugin-astro` for formatting `.astro` files outside the editor / in CI ([Editor setup](https://docs.astro.build/en/editor-setup/)).
- **ESLint:** `eslint-plugin-astro` provides linting (described as community-maintained rather than labeled "official") ([Editor setup](https://docs.astro.build/en/editor-setup/)).
- **Other editors with first-party/native support:** Zed (Astro extension), JetBrains WebStorm 2024.2+ (Astro Language Server plugin) ([Editor setup](https://docs.astro.build/en/editor-setup/)).

**Prescriptive?** VS Code + its extension is explicitly "recommended"; Prettier plugin is "official." ESLint is available/optional. None are mandatory to build.

## 11. Accessibility & performance guidance (what the docs officially provide)

- **The Dev Toolbar's Audit app** "automatically runs a series of audits on the current page, checking for the most common performance and accessibility issues," flagging problems with a red dot and highlighting affected elements ([Dev toolbar](https://docs.astro.build/en/guides/dev-toolbar/)).
- The docs are explicit about its **limits:** "The basic performance and accessibility audits performed by the dev toolbar are not a replacement for dedicated tools like Pa11y or Lighthouse, or even better, humans!" ([Dev toolbar](https://docs.astro.build/en/guides/dev-toolbar/)). Treat it as a dev-time smoke test, not a compliance guarantee.
- Performance posture is architectural rather than a checklist: ship static HTML, add JS only via islands, and prefer deferred hydration directives — see §3 ([Islands](https://docs.astro.build/en/concepts/islands/); [Framework components](https://docs.astro.build/en/guides/framework-components/)).

## 12. Astro 7 release facts relevant to standards (release notes only)

- Astro 7 "is all about speed": a Rust-based `.astro` compiler and an upgrade to Vite 8 ("the most significant Vite release in years") ([Astro 7.0 release notes](https://astro.build/blog/astro-7/)).
- The new Rust compiler is **stricter about markup**: it no longer silently corrects HTML, and unclosed tags / unterminated attributes now error (JSX-style strictness) ([Astro 7.0 release notes](https://astro.build/blog/astro-7/)). Practical standard: write well-formed, explicitly-closed markup in `.astro` files.
- Upgrade tooling: `npx @astrojs/upgrade` ([Astro 7.0 release notes](https://astro.build/blog/astro-7/)).

> Caveat on §12: figures and internal codenames beyond the two quoted headline points were surfaced via automated page summarization and are not quoted verbatim here; the load-bearing standards claims above (strict markup, Vite 8, speed focus, upgrade command) are the ones I verified as direct statements. The Node `>=22.12.0` floor is cited to the `astro@7.1.3` package manifest, not the blog, because the blog does not state a Node minimum.

---

## Things I could NOT verify from a primary source

- **A specific minimum Node version in the Astro 7 *blog*.** The blog does not state one; the `>=22.12.0` figure is from the published package `engines` field (primary manifest) — trustworthy, but a different source than the release announcement.
- **Exact Astro-7 benchmark percentages and the Rust markdown pipeline's internal name.** These appeared only via automated summarization of the blog and are intentionally not asserted as facts here.
- **GitHub Pages `site`/`base` exact deploy recipe.** The config options are verified in the configuration reference; the step-by-step GitHub Pages/GitHub Actions deploy flow lives in Astro's deployment guide, which was not fetched for this document.
- **Whether this project *should* migrate `typescript ^6` to `^7`.** Out of scope; flagged only because latest TypeScript is now `7.0.2`.

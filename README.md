# CV Management & Display

**Live: <https://vvsgith.github.io/my-cv-website/>**

A single-purpose website that presents Vito Paparella Santorsola's CV as two A4 sheets on screen and offers it as a downloadable PDF. Bilingual (Italian default, English secondary). The page and the PDF are rendered from the same component tree, from typed content files that hold no layout.

## Features

- **Two Modes**: *Paper* keeps the rigid A4 geometry the PDF is captured from, and *Reading* reflows the same content into one column at reading type. The reader picks the Mode, and a first visit opens on the one the viewport can carry.
- **Build-time PDF**: headless Chromium prints each Locale to exactly two A4 pages during the build. The page count and page size are asserted, not assumed.
- **Bilingual**: `it` and `en`, each with its own route, content, PDF and link-preview card.
- **Light and dark themes**, applied before first paint so there is no flash of the wrong theme, and carried through to the paper.
- **Accessibility**: designed to meet WCAG 2.2 level AA, with contrast pinned by the test suite.
- **Minimal JS**: the Sheets ship no JavaScript. Three small Preact islands run the Toolbar's Mode, share and theme controls.

## Tech stack

- [Astro](https://astro.build/): static site generation
- [Preact](https://preactjs.com/): three islands in the Toolbar (Mode, share, theme)
- TypeScript: the content schema is typed, and `tsc` is its validator
- Modern CSS: layers, logical properties, a token-based spacing scale, no CSS framework
- [Playwright](https://playwright.dev/): PDF and link-preview capture, and the end-to-end test suite that runs against the built output
- [pdf-lib](https://pdf-lib.js.org): asserting the PDFs' page count and size
- [subset-font](https://github.com/papandreou/subset-font): self-hosted fonts subset at build time
- [Biome](https://biomejs.dev/): formatting and linting
- GitHub Actions + GitHub Pages: deployment

## Documentation

- [`CONTEXT.md`](CONTEXT.md): the domain language (Sheet, Block, Mode, Explicit Paging…)
- [`docs/adr/`](docs/adr/): the architecture decision records
- [`docs/issues/`](docs/issues/): specs and implementation tickets
- [`docs/coding-standards.md`](docs/coding-standards.md)

## Useful commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`      | Install dependencies                          |
| `npm run dev`       | Start the local dev server                    |
| `npm run build`     | Build the production site                     |
| `npm run captures:render` | Render the PDFs and link-preview images into `dist/` |
| `npm run preview`   | Preview the production build locally          |
| `npm test`          | Build, render the captures, run the Playwright suite |
| `npm run lint`      | Check formatting and lint rules with Biome    |
| `npm run astro ...` | Run Astro CLI commands (e.g. `astro check`)   |

## The captured files

`npm run captures:render` runs after `npm run build`. It previews `dist/`,
opens each Locale's page with headless Chromium and writes, per Locale:

- `Vito_Paparella_Santorsola_CV_<IT|EN>.pdf` — the downloadable CV, two A4
  pages, which the Toolbar's download menu links to as the full CV.
- `Vito_Paparella_Santorsola_CV_<IT|EN>_no-photo.pdf` — the same two pages
  with the portrait left out and its disc kept, for photo-blind applications:
  the menu's second link.
- `og-<it|en>.png` — the 1200×630 link-preview image the page's `og:image`
  points at, screenshotted from the `/og/<locale>/` route.

None of them is committed (ADR-0001), so a build that skipped this step serves a
broken download link and an unfurl with no image.

It needs the browser binary once per machine:

```sh
npx playwright install chromium
```

## Deployment

Every push to `master` runs `.github/workflows/deploy.yml`, which is the whole
publishing action: `npm ci` → `npx playwright install --with-deps chromium` →
`npm run build` → `npm run captures:render` → upload `dist/` → GitHub Pages.
The captures step gates the deploy, so the site never ships without its PDFs
and preview images. Nothing generated is committed back.

Live at <https://vvsgith.github.io/my-cv-website/>. That URL is spelled out in
`astro.config.mjs` as `site` (the origin) + `base` (the repository name); if
the repository is ever renamed, both have to follow.

One manual setting, once, before the first run: **Settings → Pages → Build and
deployment → Source: GitHub Actions**. Without it the deploy job fails, because
no workflow can turn Pages on with the default `GITHUB_TOKEN`.

### Two checks only a human can make, after the first deploy

The test suite runs against the built output, not the deployed site (ADR-0010),
so neither of these will ever close itself:

1. Enable Pages as above, watch the first run through, and open both PDF links
   from the live site.
2. Run both Locales through Facebook's Sharing Debugger and LinkedIn's Post
   Inspector, to confirm the link-preview cards unfurl as intended.

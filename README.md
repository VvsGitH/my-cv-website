# My CV Website

A single-purpose website that presents Vito Paparella Santorsola's CV as two A4 sheets on screen and offers it as a downloadable PDF. Bilingual (Italian default, English secondary).

## Tech stack

- [Astro](https://astro.build/) — static site generation
- [Preact](https://preactjs.com/) — the single interactive island (the Toolbar)
- TypeScript

## Useful commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`      | Install dependencies                          |
| `npm run dev`       | Start the local dev server                    |
| `npm run build`     | Build the production site                     |
| `npm run captures:render` | Render the PDFs and link-preview images into `dist/` |
| `npm run preview`   | Preview the production build locally          |
| `npm run astro ...` | Run Astro CLI commands (e.g. `astro check`)   |

## The captured files

`npm run captures:render` runs after `npm run build`. It previews `dist/`,
opens each Locale's page with headless Chromium and writes, per Locale:

- `Vito_Paparella_Santorsola_CV_<IT|EN>.pdf` — the downloadable CV, two A4
  pages, which the Toolbar's download control links to.
- `og-<it|en>.png` — the 1200×630 link-preview image the page's `og:image`
  points at, screenshotted from the `/og/<locale>/` route.

Neither is committed (ADR-0001), so a build that skipped this step serves a
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

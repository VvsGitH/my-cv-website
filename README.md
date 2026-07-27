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

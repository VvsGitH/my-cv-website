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
| `npm run pdf:render` | Render one A4 PDF per Locale into `dist/`    |
| `npm run preview`   | Preview the production build locally          |
| `npm run astro ...` | Run Astro CLI commands (e.g. `astro check`)   |

## The downloadable PDFs

`npm run pdf:render` runs after `npm run build`: it previews `dist/`, captures
each Locale's page with headless Chromium and writes
`Vito_Paparella_Santorsola_CV_IT.pdf` / `_EN.pdf` into `dist/`. They are never
committed (ADR-0001), so the Toolbar's download link 404s on a build that
skipped this step.

It needs the browser binary once per machine:

```sh
npx playwright install chromium
```

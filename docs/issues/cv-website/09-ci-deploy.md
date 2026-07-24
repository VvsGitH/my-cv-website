# 09 — CI build & GitHub Pages deploy

Status: ready-for-agent

## Goal

GitHub Actions pipeline that builds the site, renders the PDFs, and deploys to GitHub Pages.

## Tasks

- Workflow on push to the default branch: checkout → setup Node → `npm ci` → `npx playwright install --with-deps` → `astro build` → run the PDF render script (ticket 08) → assemble site + PDFs → deploy to Pages (`actions/deploy-pages`).
- Enable Pages for the repo; confirm the `base` path serves correctly.
- PDFs are produced in-pipeline and served as static assets (never committed).

## Acceptance

- A push deploys a working site at `<username>.github.io/react_my-cv/` with both locales and both downloadable PDFs.

## Depends on

- 08

## Comments

- Needs the owner's GitHub username to finalize the public URL / any repo settings.

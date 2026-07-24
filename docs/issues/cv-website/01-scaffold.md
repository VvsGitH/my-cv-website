# 01 — Project scaffold

Status: done

## Goal

Stand up the Astro + TypeScript project with i18n routing, GitHub Pages base config, and React island support.

## Tasks

- Init Astro (static output, strict TypeScript). Add the `@astrojs/react` integration.
- Configure `astro.config` with `base: '/react_my-cv/'` and i18n: locales `it` (default, unprefixed) + `en` (prefixed), `routing.prefixDefaultLocale: false`.
- Route structure: `/` → Italian CV, `/en/` → English CV.
- Verify a trivial React island hydrates on the page.
- `.gitignore`, base scripts (`dev`, `build`, `preview`).

## Acceptance

- `npm run build` produces static output under the Pages base path.
- Both locale routes render; the default route is Italian.
- A React island mounts and is interactive.

## Depends on

- None.

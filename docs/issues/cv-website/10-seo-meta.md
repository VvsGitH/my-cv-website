# 10 — SEO, meta & sharing

Status: ready-for-agent

## Goal

Per-Locale metadata, favicon, and an OpenGraph preview so links unfurl nicely.

## Tasks

- Per-Locale `<title>` and meta description.
- Favicon.
- OpenGraph / Twitter card image: a render of Sheet 1 (can reuse the Playwright step to snapshot page 1 to PNG), per Locale, with `og:locale` set.
- `lang` attribute + `hreflang` alternates between `it` and `en`.

## Acceptance

- Link preview validators show the correct title, description, and Sheet-1 image for each Locale.

## Depends on

- 08 (reuse render for OG image), 09

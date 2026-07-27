# 10 — SEO, meta & sharing

Status: done

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

## Comments

### The site origin was the one owner input

Absolute URLs — `canonical`, the `hreflang` alternates, `og:image`, `og:url` —
need an origin, and `site` was still unset (the spec lists the GitHub username
under "Owner-provided assets / dependencies"). Taken from the `origin` remote
and **confirmed with the owner**: `site: 'https://vvsgith.github.io'`, base
unchanged, so the live URLs are `https://vvsgith.github.io/my-cv-website/` and
`…/en/`. The custom domain the spec defers is now literally this one line.

### Where the words live

`src/i18n/meta.ts`, a sibling of `ui.ts` rather than a group inside it: `ui` is
handed whole to the Preact island as a prop, so anything added there is
serialized into both pages' HTML. The title and description have no business in
the island's payload. Same `Record<Locale, …>` shape, so a missing translation
is still a compile error.

Descriptions are hand-written and 157 characters each — inside the ~160 a search
result shows. Deriving one from About Me was considered and dropped: it reads
like the truncated paragraph it would be.

### The preview image is a route, not a composed screenshot

`src/pages/og/[locale].astro` renders Sheet 1 to scale on the dark ground beside
the name, as a 1200×630 card; `scripts/render-captures.mjs` opens it at exactly
that viewport and screenshots it. The alternative — screenshotting the Sheet 1
element and letting the script letterbox it — puts layout in the capture script,
and a portrait image is the wrong shape anyway: LinkedIn demotes a non-landscape
`og:image` to a small square thumbnail beside the text.

The card reuses the Sheet's own `--sheet-scale` seam rather than re-scaling from
outside, so the A4 box stays real and only its rendering shrinks. Its size and
padding are unitless custom properties because that scale is a ratio of two of
them, and CSS cannot divide one length by another.

1200×630 is written down once, in `src/lib/og-card.ts`. Three things need to
agree on it and all three now read it: the card sets its own box from it,
`BaseLayout` publishes it as `og:image:width`/`height`, and the script
screenshots the `[data-og-card]` **element** rather than a viewport it would
have had to size itself.

The two `/og/…/` routes ship in `dist`. They carry `noindex`, and keeping them
means the card can be opened in `npm run dev` when it needs adjusting.

### The capture script grew a second output

Renamed `scripts/render-pdf.mjs` → `scripts/render-captures.mjs` and
`npm run pdf:render` → `npm run captures:render`: it now captures two things off
the built site, and a second script would have duplicated the preview-server and
browser boot wholesale. The `open()` helper it grew (viewport → `goto` → HTTP
check → images and fonts) is ticket 08's recipe, now shared by both captures —
the card needs it for exactly the same reason the PDF does.

### Favicon

`public/favicon.svg` — a Sheet with its cream Aside on the dark ground, in the
design tokens as literal hex (a file in `public/` never sees the stylesheet).
SVG only: every current browser takes it. No `.ico`, and no
`apple-touch-icon` either — pinning a CV to an iOS home screen is not a case
worth a build-time raster of the same mark. Checked at 16/32/64/112px.

### Acceptance, as measured on the built output

Both pages carry the right per-Locale `<title>`, description, `og:*` set,
`twitter:card`, canonical, and `hreflang` alternates (`it`, `en`, `x-default`
→ Italian), all absolute. Both `og-<locale>.png` come out 1200×630 with the
Sheet, the name and the title legible. The `lang` attribute follows the Locale.

The one acceptance line that **cannot** be met before deployment is its own:
"link preview validators show…" needs a public URL. Note for **ticket 09**:
after the first deploy, run the page through Facebook's Sharing Debugger and
LinkedIn's Post Inspector once, for both Locales.

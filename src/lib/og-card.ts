/**
 * The link-preview card's pixel size (ticket 10) — 1.91:1, the ratio the
 * unfurlers lay out for. Three things need it and must agree: the card route
 * that draws it, the `og:image:width`/`height` BaseLayout publishes, and the
 * screenshot itself, which takes it from the rendered card rather than from
 * here.
 */
export const ogCard = { width: 1200, height: 630 } as const;

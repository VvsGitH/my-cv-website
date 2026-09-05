# 02 — The bar moves to the top of the DOM

Status: ready-for-agent

Depends on: nothing. Land it before ticket 03, so the rewrite arrives where it belongs.

## Goal

Put the Toolbar before `<main>` and dissolve `Chrome.astro`. A pure refactor: with the cluster
still `position: fixed`, nothing on screen changes.

## Why

`position: sticky` sticks within the flow it is in. A bar that comes after `<main>` sits at the
foot of the document and never reaches the top of the viewport. The `banner` landmark belongs
first in reading order regardless.

`Chrome.astro` cannot survive the move: it is one child of `BaseLayout` and would have to fill
two of its slots.

## Files

- `src/layouts/BaseLayout.astro`
- `src/pages/[locale]/index.astro`
- `src/i18n/locale.ts`
- `src/components/chrome/Chrome.astro` — **delete**

## Detail

**`BaseLayout.astro`:** add `<slot name="masthead" />` immediately before `<main>`, keeping
`<slot name="chrome" />` where it is. Both are Chrome and neither is paper (`CONTEXT.md`); the
comment there should now say that the Chrome arrives at both ends of the document, and why the
bar has to be the end that comes first.

Both `is:inline` scripts stay exactly where they are. They are the source of truth for
`data-theme` and `data-mode` (ADR-0003, ADR-0017), and the rewrite depends on them more than the
old cluster did, not less.

**`locale.ts`:** add `chromeLinks(locale)` beside the existing `otherLocale()`. It returns the
`ToolbarLinks` shape, and unlike the old one it carries **both** routes, because the language
pair now renders both:

```ts
interface ToolbarLinks {
  /** Fixed order [it, en] — load-bearing: the CSS reads the last child to place the pill. */
  locales: { locale: Locale; href: string; current: boolean }[];
  pdfHref: string;
}
```

The fixed order must be commented as load-bearing at both ends — here, and at the
`:has(> :last-child[aria-current])` rule in ticket 03 that reads it.

Carry over `Chrome.astro`'s comment on the PDF filename verbatim: it is written down twice on
purpose (ADR-0009), matched by `pdfPath()` in `scripts/render-captures.mjs`, and this move must
not lose the note saying so.

**`src/pages/[locale]/index.astro`:** render `<Toolbar slot="masthead" … />` and
`<Colophon slot="chrome" content={cv[locale]} />` as direct children of `BaseLayout`.

Note that `src/pages/[locale]/og.astro` builds its own `<html>` and never mounts the Chrome.
Nothing here may leak into it — which is why the bar goes in a **slot** filled by the page,
rather than into `BaseLayout` directly.

**Delete `Chrome.astro`.** Its docstring explains why the Chrome was once two islands; that
history lives in ADR-0017 and does not need a file to hang on.

## Acceptance

- The page renders and is **visually identical** to before — the cluster is still fixed, so its
  DOM position does not show.
- The Toolbar's root element is the first element in `<body>`, before `<main>`.
- `/it/og/` and `/en/og/` are unchanged.
- `npm run build` passes; `npm test` passes unchanged, including `pdf.spec.ts` and
  `colophon.spec.ts`.
- No file imports `Chrome.astro`, and the string does not appear under `src/`. The one mention
  left in `scripts/render-captures.mjs` is a comment about the PDF filename contract — re-point
  it at whatever now owns that name, do not simply delete it.

## Out of scope

Any change to the Toolbar's own markup, classes or styles. This ticket moves it and nothing
else. The Toolbar is still `Toolbar.tsx` when this lands.

## Comments

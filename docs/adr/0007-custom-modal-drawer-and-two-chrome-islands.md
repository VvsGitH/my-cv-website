# A custom modal Drawer, and two Chrome islands instead of one

> **Half superseded by ADR-0008.** The custom modal is gone — the Drawer is a
> `<dialog>` opened with `showModal()` again, because the control that closes it
> now lives inside the panel and no longer needs a live Toolbar beside it. The
> two islands and the one shared signal survive unchanged. One claim below is
> also simply **wrong**: `showModal()` does not lock the document's scroll, and
> ADR-0008 records the measurement.

The Drawer is a `role="dialog"` element of our own, held modal by putting the rest of the page in `inert` — **not** a native `<dialog>` opened with `showModal()`. Because the Toolbar no longer has to live inside the panel's subtree, the Chrome ships as **two Preact islands**, `Toolbar` and `Drawer`, sharing exactly one signal (`drawerOpen`, in `components/chrome/state.ts`).

This reverses two things ticket 06 decided and ticket 07 implemented: that Escape, the focus trap and the focus return should be the platform's, and that the Chrome should be a single island. It amends ADR-0003, which described the site as having "exactly one Preact island".

## Why the native dialog had to go

`showModal()` puts the panel in the top layer and holds **the whole rest of the document** inert. The Toolbar has to stay operable beside the open panel — it carries the control that closes it, and ticket 07 asked for a strip that travels with the panel rather than one that goes dim and dead. Under a modal `<dialog>` the only way to have a live Toolbar there is to render a **second copy inside the dialog**, and that is what ticket 07 shipped.

Everything awkward about the old Chrome came from that one duplication:

- two Toolbars to keep in step, told apart by a `placement` prop;
- two `role="status"` live regions for the share confirmation, one of them always outside the accessibility tree — inside a `display: none` dialog, or inert behind the backdrop;
- `overflow: visible` forced onto the dialog, with the scroll pushed down to `.drawer-body`, because the second Toolbar sits outside the panel's edge;
- an `opacity` cross-fade with a 250ms `transition-delay`, and a `prefers-reduced-motion` override existing only to cancel that delay, so the two copies were never on screen together;
- E2E tests that had to name which copy they meant.

## The exchange

Given up: a focus trap, Escape, the focus return, the scroll lock and the top layer, all for free.

Taken on, in `Drawer.tsx`: roughly twenty lines that hold the page inert, lock the scroll with an attribute on `<html>`, move focus into the panel and hand it back to the opener, and close on Escape from a document-level listener — on the document because focus may legitimately be in the Toolbar while the panel is open.

**No focus trap is written.** With every other top-level element inert, the only focusable things left are the panel and the Toolbar, so Tab already cycles between them. That is the same mechanism `showModal()` uses; the difference is only which elements it covers.

**No `aria-modal="true"`.** It would merely *declare* the rest unavailable, where `inert` makes it so — and it would declare too much, shutting a screen-reader user out of the Toolbar, the one place the control that closes the panel lives.

## Considered Options

- **Keep the `<dialog>` and the duplicated Toolbar.** Correct and shipped, and the cost is the whole list above. Rejected: the duplication is load-bearing for a constraint nothing else in the site imposes.
- **`show()` instead of `showModal()`.** A non-modal dialog leaves the page live, which is the goal, but it also gives no backdrop, no inertness and no top layer — every piece of the modal behaviour would have to be built anyway, on top of an element whose one advantage was that it built them.
- **Custom modal with a hand-written focus trap.** The usual shape (a `Tab` handler cycling between the first and last focusable). Rejected: `inert` achieves the containment without a keydown handler to get wrong, and it removes the covered content from the accessibility tree as well as the tab order, which a `Tab` handler does not.
- **One island still, with the Drawer's markup outside the dialog.** Possible, but there is no longer anything to share: with the Toolbar out of the panel's subtree the two components have no common DOM and one prop tree between them. The single island would only be a wrapper.
- **Nano Stores for the state that crosses the two islands**, which is Astro's documented answer. Rejected: `@preact/signals` is already a direct dependency, both islands import `state.ts`, and Vite emits that module once as a chunk they share. Verified against a build rather than assumed — see ticket 20.

## Consequences

- One Toolbar, one live region, one `.toolbar` for the tests to address. `toolbar--page` / `toolbar--drawer` are gone.
- The strip now travels exactly `--drawer-width` over `--drawer-slide` (tokens.css), which is what ticket 07 asked for in the first place, instead of two copies trading places behind a cross-fade.
- The panel's stacking is this project's to maintain, the top layer no longer being involved: backdrop 2, panel 3, Toolbar 4.
- The scroll lock is ours too, and so is what it costs: `overflow: hidden` reclaims the scrollbar's width for the reading column. Reading Mode reserves the gutter with `scrollbar-gutter: stable` so the page behind the panel does not re-wrap.
- What the platform used to guarantee now needs tests to guarantee it. `tests/toolbar.spec.ts` covers the focus return, the inert page, the scroll lock, the backdrop click, and that the Toolbar answers beside an open panel.
- Astro's own `<style>` and bootstrap `<script>` are top-level siblings and are swept into `inert` with the rest. They render nothing, so this reaches nothing; covering a new sibling by default is the safer error.
- Two islands mean two sets of serialised props in the HTML, so each component takes only the strings it uses.

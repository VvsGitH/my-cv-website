import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { drawerOpen } from './state';
import './drawer.css';

/** Mirrors the Reading Mode boundary, which tokens.css documents. */
const PAPER_MODE_QUERY = '(width >= 48rem)';

interface Props {
  /** The panel carries no visible title, so this is its accessible name. */
  name: string;
  children?: ComponentChildren;
}

/**
 * The Drawer (CONTEXT.md) — the panel carrying the Aside's Blocks below 48rem,
 * as a custom modal rather than a `<dialog>`. ADR-0007 has the reasoning; the
 * short of it is that `showModal()` holds *the whole document* inert, which
 * left the Toolbar no way to stay alive beside an open panel.
 *
 * What the platform used to give and this component now owns: the page is held
 * inert, Escape closes, focus moves in on open and back to the opener on close.
 * There is deliberately **no focus trap of our own** — with everything else
 * inert the only focusable things left are this panel and the Toolbar, so Tab
 * already cycles between them.
 *
 * There is also deliberately **no `aria-modal`**. It would only *declare* the
 * rest unavailable, where `inert` makes it so; and it would declare too much,
 * shutting a screen-reader user out of the Toolbar — the one place the control
 * that closes this panel lives.
 */
export default function Drawer({ name, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const open = drawerOpen.value;

  // `useEffect` over the rendered value, and not `useSignalEffect`: a signal
  // effect re-runs the moment the Toolbar assigns, which is *before* Preact
  // commits `data-open` — and focus() on a panel drawer.css still has at
  // `visibility: hidden` is a silent no-op.
  useEffect(() => {
    const panelElement = panel.current;
    if (!open || !panelElement) return;

    const opener = document.activeElement;

    // Everything the panel covers, which is every top-level thing except the
    // Toolbar: it rides the panel's edge and has to answer while it is open.
    // Held as a list rather than re-derived, so the release undoes exactly
    // what this set. Astro's own `<style>` and bootstrap `<script>` are swept
    // up too; they render nothing, so `inert` reaches nothing. Excluding a new
    // sibling would be the dangerous mistake, so the default is to cover it.
    const covered = Array.from(document.body.children).filter(
      (child) => !child.contains(panelElement) && !child.querySelector('.toolbar'),
    );
    for (const element of covered) element.setAttribute('inert', '');

    // The scroll lock, which showModal() used to apply on its own (drawer.css).
    document.documentElement.dataset['drawerOpen'] = '';

    // The Aside is prose, with no first control worth preferring over the
    // panel itself (WAI-ARIA APG, Dialog).
    panelElement.focus({ preventScroll: true });

    return () => {
      for (const element of covered) element.removeAttribute('inert');
      delete document.documentElement.dataset['drawerOpen'];
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open]);

  // On the document, not the panel: focus may legitimately be in the Toolbar
  // while this is open, and Escape has to close from there too. Registered on
  // mount rather than on open, because the effect above only runs after the
  // paint that put the panel on screen — a listener registered there leaves a
  // window in which the Drawer is visible and Escape does nothing.
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') drawerOpen.value = false;
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  // A Drawer left open while the window grows into Paper Mode would be hidden
  // by drawer.css while the page behind it stayed inert and unscrollable —
  // CSS cannot release what the effect above took.
  useEffect(() => {
    const paperMode = matchMedia(PAPER_MODE_QUERY);
    const closeOnPaper = () => {
      if (paperMode.matches) drawerOpen.value = false;
    };

    closeOnPaper();
    paperMode.addEventListener('change', closeOnPaper);
    return () => paperMode.removeEventListener('change', closeOnPaper);
  }, []);

  return (
    <>
      <div
        class="drawer-backdrop"
        aria-hidden="true"
        data-open={open ? '' : undefined}
        onClick={() => (drawerOpen.value = false)}
      ></div>

      <div
        ref={panel}
        class="drawer"
        role="dialog"
        aria-label={name}
        tabindex={-1}
        data-open={open ? '' : undefined}
      >
        <div class="drawer-body">{children}</div>
      </div>
    </>
  );
}

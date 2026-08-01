import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { drawerOpen } from './state';
import './drawer.css';

/** Mirrors the Reading Mode boundary, which tokens.css documents. */
const PAPER_MODE_QUERY = '(width >= 48rem)';

/** A singleton — Chrome.astro renders exactly one (coding-standards: `useId`). */
const TITLE_ID = 'drawer-title';

interface Props {
  /** Shown as the panel's heading, and the `aria-labelledby` target. */
  name: string;
  /** Names the control at the head's inline end. */
  close: string;
  children?: ComponentChildren;
}

/**
 * The Drawer (CONTEXT.md) — the panel carrying the Aside's Blocks below 48rem,
 * as a modal `<dialog>`. ADR-0008 has the reasoning; the short of it is that
 * the way out now lives *inside* the panel, so `showModal()` holding the rest
 * of the document inert costs nothing, and Escape, the focus trap, the initial
 * focus, the focus return and the top layer all go back to the platform.
 *
 * `close` is the one funnel: the control, Escape, the backdrop and the Paper
 * Mode guard all end at the dialog's `close` event, which is where the shared
 * signal is written back (state.ts).
 *
 * No `aria-modal` — HTML-AAM makes it implicit on a modal dialog.
 */
export default function Drawer({ name, close, children }: Props) {
  const panel = useRef<HTMLDialogElement>(null);
  const open = drawerOpen.value;

  useEffect(() => {
    const panelElement = panel.current;
    if (!open || !panelElement) return;

    panelElement.showModal();
    return () => panelElement.close();
  }, [open]);

  // Load-bearing, not tidy: an *open* modal forced to `display: none` keeps
  // `open === true`, keeps matching `:modal`, and keeps the document blocked
  // with nothing on screen (ticket 21, "Measured rather than assumed"). Closing
  // the panel here rather than through the signal keeps it from surviving even
  // one render frame in Paper Mode.
  useEffect(() => {
    const paperMode = matchMedia(PAPER_MODE_QUERY);
    const closeOnPaper = () => {
      if (paperMode.matches) panel.current?.close();
    };

    closeOnPaper();
    paperMode.addEventListener('change', closeOnPaper);
    return () => paperMode.removeEventListener('change', closeOnPaper);
  }, []);

  return (
    <dialog
      ref={panel}
      class="drawer"
      aria-labelledby={TITLE_ID}
      onClose={() => (drawerOpen.value = false)}
      // The whole light dismiss: a modal dialog's backdrop hit-tests to the
      // dialog element itself (ADR-0008, which also records what that asks of
      // drawer.css).
      onClick={(event) => {
        if (event.target === event.currentTarget) panel.current?.close();
      }}
    >
      <div class="drawer-head">
        {/* Announced, not shown (ADR-0008). The name is a real `<h2>` the
            `aria-labelledby` above points at rather than an `aria-label`
            string, and `.is-sr-only` keeps it out of the head row, which
            shows the close control alone. Deliberate: do not unhide it. */}
        <h2 id={TITLE_ID} class="drawer-title is-sr-only">
          {name}
        </h2>

        {/* Stated rather than inherited: without it the head row's markup
            order would silently become the focus policy (ADR-0008). */}
        <button
          type="button"
          autofocus
          class="drawer-close"
          title={close}
          aria-label={close}
          onClick={() => panel.current?.close()}
        >
          <span class="icon-cross" aria-hidden="true"></span>
        </button>
      </div>

      <div class="drawer-body">{children}</div>
    </dialog>
  );
}

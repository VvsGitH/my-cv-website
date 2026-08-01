import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { drawerOpen } from './state';
import './drawer.css';

/** Mirrors the Reading Mode boundary in tokens.css — change both. */
const PAPER_MODE_QUERY = '(width >= 53.5rem)';

/** A singleton — Chrome.astro renders exactly one (coding-standards: `useId`). */
const TITLE_ID = 'drawer-title';

interface Props {
  /** Shown as the panel's heading, and the `aria-labelledby` target. */
  name: string;
  /** Names the control at the head's inline end. */
  close: string;
  children?: ComponentChildren;
}

/** The Drawer (CONTEXT.md), a modal `<dialog>` whose `close` event is the one funnel out (ADR-0008). */
export default function Drawer({ name, close, children }: Props) {
  const panel = useRef<HTMLDialogElement>(null);
  const open = drawerOpen.value;

  useEffect(() => {
    const panelElement = panel.current;
    if (!open || !panelElement) return;

    panelElement.showModal();
    return () => panelElement.close();
  }, [open]);

  // Load-bearing: closes directly rather than via the signal, so no frame of
  // Paper Mode can hide an open modal and leave the document blocked (hacks/2026-08-01 §4).
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
      // The light dismiss: a modal's backdrop hit-tests to the dialog itself (ADR-0008).
      onClick={(event) => {
        if (event.target === event.currentTarget) panel.current?.close();
      }}
    >
      <div class="drawer-head">
        {/* Announced, never shown — deliberate, do not unhide (ADR-0008). */}
        <h2 id={TITLE_ID} class="drawer-title is-sr-only">
          {name}
        </h2>

        {/* Stated, not inherited — else markup order becomes the focus policy (ADR-0008). */}
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

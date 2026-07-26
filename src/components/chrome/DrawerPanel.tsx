import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { signal, useSignalEffect } from '@preact/signals';
import type { DrawerStrings } from '../../i18n/ui';
import './drawer.css';

/**
 * Module scope, and exported: ticket 07's Toolbar opens the Drawer from the
 * other side of the page. `false` is a deterministic first value, so the
 * prerendered HTML and the first client render agree.
 */
export const drawerOpen = signal(false);

/** Mirrors the Reading Mode boundary, which tokens.css documents. */
const PAPER_MODE_QUERY = '(width >= 48rem)';

interface Props {
  strings: DrawerStrings;
  children?: ComponentChildren;
}

/**
 * The Drawer's behaviour, and nothing else: the panel's content is Astro's
 * (see Drawer.astro), so the paper ships no JS.
 *
 * A native `<dialog>` opened with `showModal()`, which is what makes the focus
 * trap, the focus return and Escape the platform's rather than ours — see the
 * WAI-ARIA APG *Dialog (Modal)* pattern, and ticket 06 for how it is applied
 * here.
 */
export default function DrawerPanel({ strings, children }: Props) {
  const drawer = useRef<HTMLDialogElement>(null);

  useSignalEffect(() => {
    const dialog = drawer.current;
    if (!dialog) return;
    // Guarded both ways: showModal() throws on an already-open dialog, and the
    // `close` event below can have run first.
    if (drawerOpen.value && !dialog.open) dialog.showModal();
    if (!drawerOpen.value && dialog.open) dialog.close();
  });

  // A Drawer left open while the window grows into Paper Mode would be hidden
  // by drawer.css and still hold the paper behind it inert — CSS cannot take
  // back what showModal() did.
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
      <button
        type="button"
        class="drawer-toggle"
        aria-haspopup="dialog"
        aria-label={strings.open}
        onClick={() => (drawerOpen.value = true)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M3 6h18M3 12h18M3 18h18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <dialog
        ref={drawer}
        class="drawer"
        aria-label={strings.name}
        onClose={() => (drawerOpen.value = false)}
        onClick={(event) => {
          // The backdrop belongs to the dialog, so a click beside the panel
          // lands on the dialog element itself and nowhere deeper.
          if (event.target === drawer.current) drawerOpen.value = false;
        }}
      >
        <div class="drawer-body">
          <button
            type="button"
            class="drawer-close"
            aria-label={strings.close}
            onClick={() => (drawerOpen.value = false)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
          {children}
        </div>
      </dialog>
    </>
  );
}

import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { useSignalEffect } from '@preact/signals';
import type { UiStrings } from '../../i18n/ui';
import Toolbar, { type ToolbarLinks } from './Toolbar';
import { drawerOpen } from './state';
import './drawer.css';

/** Mirrors the Reading Mode boundary, which tokens.css documents. */
const PAPER_MODE_QUERY = '(width >= 48rem)';

interface Props {
  strings: UiStrings;
  links: ToolbarLinks;
  children?: ComponentChildren;
}

/**
 * The site's one island (ADR-0003): the Toolbar and the Drawer's behaviour.
 * Ticket 06 left the choice between one island and two open; the Toolbar has
 * to be able to render *inside* the Drawer's dialog, which needs one tree.
 *
 * The Drawer is a native `<dialog>` opened with `showModal()`, so the focus
 * trap, the focus return and Escape are the platform's — ticket 06 records
 * why. The panel's content is Astro's, so the paper ships no JS.
 *
 * **The Toolbar is rendered twice**, and that is the load-bearing part here. A
 * modal dialog paints a backdrop over the rest of the document and holds it
 * inert, so a single Toolbar fixed to the page would go dim and dead the
 * moment the Drawer opened. The second copy lives inside the dialog, pinned
 * just outside the panel's inline end (toolbar.css), so the panel's own
 * transition carries it and it is inside the focus trap. Only one is ever on
 * screen — ticket 07 has the rest.
 */
export default function ChromeIsland({ strings, links, children }: Props) {
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
      <Toolbar strings={strings} links={links} placement="page" />

      <dialog
        ref={drawer}
        class="drawer"
        aria-label={strings.drawer.name}
        onClose={() => (drawerOpen.value = false)}
        onClick={(event) => {
          // The backdrop belongs to the dialog, so a click beside the panel
          // lands on the dialog element itself and nowhere deeper.
          if (event.target === drawer.current) drawerOpen.value = false;
        }}
      >
        <Toolbar strings={strings} links={links} placement="drawer" />
        <div class="drawer-body">{children}</div>
      </dialog>
    </>
  );
}

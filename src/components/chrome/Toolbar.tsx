import type { Locale } from '../../content/types';
import type { DrawerStrings, ToolbarStrings } from '../../i18n/ui';
import { copyLink, drawerOpen, linkCopied, toggleTheme } from './state';
import './toolbar.css';

/** Where the Toolbar's two link actions point, for this page's Locale. */
export interface ToolbarLinks {
  /** The equivalent route in the other Locale, and which Locale that is. */
  languageHref: string;
  languageLocale: Locale;
  pdfHref: string;
}

/**
 * The Toolbar (CONTEXT.md: "Toolbar") — language, download, share, theme, and
 * the Drawer's toggle below 51rem. Every control is icon-only and carries its
 * name in `aria-label`, except the theme control, whose name has to be right
 * before hydration and is therefore a pair of visually-hidden labels the CSS
 * chooses between (toolbar.css). The matching `title` rides alongside because
 * it is what draws the tooltip, not because it names anything. The icons are
 * private-use codepoints, hidden from the accessibility tree
 * (src/styles/icons.css).
 *
 * One of the Chrome's two islands (ADR-0007). It *opens* the Drawer without
 * importing it, and that is all it does to `drawerOpen`: every way back out
 * runs through the panel's own `close` event (ADR-0008, state.ts). So the
 * toggle does not morph and carries no `aria-expanded` — behind an open panel
 * this whole cluster is inert, and a control renamed "close" that nobody can
 * reach would be a lie in the markup. The island never reads the signal, so it
 * does not re-render when the panel opens.
 *
 * No `role="toolbar"`: that role obliges arrow-key navigation with a roving
 * tabindex, and five controls in the tab order need no such thing.
 */
interface Props {
  toolbar: ToolbarStrings;
  /** Only `open` is read here: the toggle no longer morphs (ADR-0008). */
  drawer: DrawerStrings;
  links: ToolbarLinks;
}

export default function Toolbar({ toolbar, drawer, links }: Props) {
  return (
    <div class="toolbar">
      <button
        type="button"
        class="toolbar-button toolbar-drawer"
        title={drawer.open}
        aria-label={drawer.open}
        aria-haspopup="dialog"
        onClick={() => (drawerOpen.value = true)}
      >
        <span class="icon-menu" aria-hidden="true"></span>
      </button>

      <a
        class="toolbar-button"
        href={links.languageHref}
        hreflang={links.languageLocale}
        title={toolbar.language}
        aria-label={toolbar.language}
      >
        <span class="icon-earth" aria-hidden="true"></span>
      </a>

      <a
        class="toolbar-button"
        href={links.pdfHref}
        download
        title={toolbar.download}
        aria-label={toolbar.download}
      >
        <span class="icon-download" aria-hidden="true"></span>
      </a>

      <button
        type="button"
        class="toolbar-button"
        title={linkCopied.value ? toolbar.shared : toolbar.share}
        aria-label={linkCopied.value ? toolbar.shared : toolbar.share}
        onClick={copyLink}
      >
        <span class={linkCopied.value ? 'icon-checkmark' : 'icon-link'} aria-hidden="true"></span>
      </button>

      <button type="button" title={toolbar.themeChange} class="toolbar-button toolbar-theme" onClick={toggleTheme}>
        <span class="icon-contrast" aria-hidden="true"></span>
        <span class="icon-sun" aria-hidden="true"></span>
        <span class="is-sr-only toolbar-theme-to-dark">{toolbar.themeToDark}</span>
        <span class="is-sr-only toolbar-theme-to-light">{toolbar.themeToLight}</span>
      </button>

      {/* Empty until the URL is on the clipboard: a live region announces the
          change to its content, so there has to be a change to announce. */}
      <p class="toolbar-toast" role="status" data-visible={linkCopied.value ? '' : undefined}>
        {linkCopied.value ? toolbar.shared : null}
      </p>
    </div>
  );
}

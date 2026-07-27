import type { Locale } from '../../content/types';
import type { UiStrings } from '../../i18n/ui';
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
 * the Drawer's toggle below 48rem. Every control is icon-only and carries its
 * name in `aria-label`, except the theme control, whose name has to be right
 * before hydration and is therefore a pair of visually-hidden labels the CSS
 * chooses between (toolbar.css). The icons are private-use codepoints, hidden
 * from the accessibility tree (src/styles/icons.css).
 *
 * No `role="toolbar"`: that role obliges arrow-key navigation with a roving
 * tabindex, and five controls in the tab order need no such thing.
 */
interface Props {
  strings: UiStrings;
  links: ToolbarLinks;
  /**
   * `page` is the Toolbar against the page; `drawer` is the copy inside the
   * Drawer's dialog, which the panel's slide carries. ChromeIsland explains
   * why there are two.
   */
  placement: 'page' | 'drawer';
}

export default function Toolbar({ strings, links, placement }: Props) {
  const { drawer, toolbar } = strings;

  return (
    <div
      class={`toolbar toolbar--${placement}`}
      data-drawer-open={drawerOpen.value ? '' : undefined}
    >
      <button
        type="button"
        class="toolbar-button toolbar-drawer"
        title={drawerOpen.value ? drawer.close : drawer.open}
        aria-haspopup="dialog"
        onClick={() => (drawerOpen.value = !drawerOpen.value)}
      >
        <span class={drawerOpen.value ? 'icon-cross' : 'icon-menu'} aria-hidden="true"></span>
      </button>

      <a
        class="toolbar-button"
        href={links.languageHref}
        hreflang={links.languageLocale}
        title={toolbar.language}
      >
        <span class="icon-earth" aria-hidden="true"></span>
      </a>

      <a class="toolbar-button" href={links.pdfHref} download title={toolbar.download}>
        <span class="icon-download" aria-hidden="true"></span>
      </a>

      <button
        type="button"
        class="toolbar-button"
        title={linkCopied.value ? toolbar.shared : toolbar.share}
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

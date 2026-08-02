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
 * The Toolbar (CONTEXT.md). ADR-0007 (two islands), ADR-0008 (its two shapes,
 * no `aria-expanded`, no `role="toolbar"`), ADR-0003 (why the theme control is
 * named by a pair of sr-only labels rather than an `aria-label`).
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

      {/* Empty until copied: a live region announces a change, so there must be one. */}
      <p class="toolbar-toast" role="status" data-visible={linkCopied.value ? '' : undefined}>
        {linkCopied.value ? toolbar.shared : null}
      </p>
    </div>
  );
}

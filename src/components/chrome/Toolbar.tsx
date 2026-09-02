import type { Locale } from '../../i18n/locale';
import type { ToolbarStrings } from '../../i18n/ui';
import { copyLink, linkCopied, toggleMode, toggleTheme } from './state';
import './toolbar.css';

/** Where the Toolbar's two link actions point, for this page's Locale. */
export interface ToolbarLinks {
  /** The equivalent route in the other Locale, and which Locale that is. */
  languageHref: string;
  languageLocale: Locale;
  pdfHref: string;
}

/**
 * The Toolbar (CONTEXT.md) — the site's only island since the Drawer went
 * (ADR-0017). ADR-0008 (its two shapes, no `role="toolbar"`), ADR-0003 (why the
 * theme control is named by a pair of sr-only labels rather than an `aria-label`,
 * which the Mode control now follows).
 */
interface Props {
  toolbar: ToolbarStrings;
  links: ToolbarLinks;
}

export default function Toolbar({ toolbar, links }: Props) {
  return (
    <div class="toolbar">
      {/* Five controls at every tier now. On a phone this one is also the answer
          to WCAG 2.2 · 1.4.4: Paper Mode fits A4 to the device, and this is the
          way to type sized for reading rather than for the paper (ADR-0017). */}
      <button
        type="button"
        title={toolbar.modeChange}
        class="toolbar-button toolbar-mode"
        onClick={toggleMode}
      >
        <span class="icon-file-text" aria-hidden="true"></span>
        <span class="icon-book" aria-hidden="true"></span>
        <span class="is-sr-only toolbar-mode-to-reading">{toolbar.modeToReading}</span>
        <span class="is-sr-only toolbar-mode-to-paper">{toolbar.modeToPaper}</span>
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

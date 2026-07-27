import type { Locale } from '../content/types';

/**
 * The Chrome's own words (CONTEXT.md: "Chrome") — the Drawer's and the
 * Toolbar's labels, never CV content, which lives in `src/content/`.
 *
 * One entry per Locale against a shared shape, for the same reason the CV
 * content is: a missing translation is a compile error rather than an English
 * label on the Italian page. Grouped per piece of Chrome, so a component takes
 * its own strings rather than the whole page's.
 */
export interface DrawerStrings {
  /** The Drawer's accessible name — it carries no visible title. */
  name: string;
  /** On the Toolbar's toggle, which is the only thing that opens it now. */
  open: string;
  close: string;
}

/**
 * Every Toolbar control is icon-only, so each of these *is* the control's
 * accessible name — the label a screen reader reads out, not a caption.
 */
export interface ToolbarStrings {
  /** Names the language being switched *to*, not the one on screen. */
  language: string;
  download: string;
  share: string;
  /** Replaces `share` for a moment once the URL is on the clipboard. */
  shared: string;
  /**
   * The theme control names the theme it switches *to*, and both names ship:
   * CSS picks between them off `<html data-theme>`, so the control is named
   * correctly from the first paint rather than from hydration.
   */
  themeChange: string;
  themeToDark: string;
  themeToLight: string;
}

export interface UiStrings {
  drawer: DrawerStrings;
  toolbar: ToolbarStrings;
}

export const ui: Record<Locale, UiStrings> = {
  it: {
    drawer: {
      name: 'Profilo e competenze',
      open: 'Apri profilo e competenze',
      close: 'Chiudi profilo e competenze',
    },
    toolbar: {
      language: 'Leggi in inglese',
      download: 'Scarica il CV in PDF',
      share: 'Copia il link a questa pagina',
      shared: 'Link copiato',
      themeChange: 'Cambia il tema',
      themeToDark: 'Attiva il tema scuro',
      themeToLight: 'Attiva il tema chiaro',
    },
  },
  en: {
    drawer: {
      name: 'Profile and skills',
      open: 'Open profile and skills',
      close: 'Close profile and skills',
    },
    toolbar: {
      language: 'Read in Italian',
      download: 'Download the CV as a PDF',
      share: 'Copy the link to this page',
      shared: 'Link copied',
      themeChange: 'Switch theme',
      themeToDark: 'Switch to the dark theme',
      themeToLight: 'Switch to the light theme',
    },
  },
};

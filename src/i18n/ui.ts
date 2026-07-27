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

/**
 * The Colophon's own words (CONTEXT.md: "Colophon"). The © line needs none and
 * the channels are derived from the CV's own header — ticket 19 has why.
 */
export interface ColophonStrings {
  /** The landmark's accessible name — it carries no visible title. */
  name: string;
  /** Whose the personal data is, and that the site takes none of the reader's. */
  dataNotice: string;
  /** An aim and a channel. Never "conforms to": that is asserted after an audit. */
  accessibility: string;
  /** This Locale's endonym, so a language link can be labelled in the language it leads to. */
  localeName: string;
}

export interface UiStrings {
  drawer: DrawerStrings;
  toolbar: ToolbarStrings;
  colophon: ColophonStrings;
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
    colophon: {
      name: 'Informazioni sul sito',
      // The last clause becomes false the day analytics are added.
      dataNotice:
        'I dati personali in questa pagina sono di Vito Paparella Santorsola, pubblicati per finalità di ricerca e selezione del personale e tutelati dal GDPR (Regolamento UE 2016/679). Questo sito non raccoglie dati sui visitatori.',
      accessibility:
        'Questo sito è progettato per essere conforme alle WCAG 2.2 livello AA. Se incontri una barriera, scrivimi.',
      localeName: 'Italiano',
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
    colophon: {
      name: 'About this site',
      // The last clause becomes false the day analytics are added.
      dataNotice:
        'The personal data on this page belongs to Vito Paparella Santorsola, published for recruitment purposes and protected under the GDPR (EU 2016/679). This site collects no visitor data.',
      accessibility:
        'This site is designed to meet WCAG 2.2 level AA. If you hit a barrier, email me.',
      localeName: 'English',
    },
  },
};

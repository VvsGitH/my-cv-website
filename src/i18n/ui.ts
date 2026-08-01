import type { Locale } from '../content/types';

/**
 * The Chrome's own words, never CV content. Serialized whole into island props,
 * so page-level strings belong in `meta.ts` (coding-standards).
 */
export interface DrawerStrings {
  /** Announced, never shown (ADR-0008). */
  name: string;
  open: string;
  close: string;
}

/** Every control is icon-only, so each of these *is* its accessible name. */
export interface ToolbarStrings {
  /** Names the language switched *to*, not the one on screen. */
  language: string;
  download: string;
  share: string;
  shared: string;
  /** Both theme names ship; CSS picks, so the control is right pre-hydration (ADR-0003). */
  themeChange: string;
  themeToDark: string;
  themeToLight: string;
}

/** The Colophon's own words; the © line and the channels are derived (ADR-0013). */
export interface ColophonStrings {
  name: string;
  dataNotice: string;
  /** An aim and a channel. Never "conforms to" (ADR-0013). */
  accessibility: string;
  /** This Locale's endonym, so the link is labelled in the language it leads to. */
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
      dataNotice:
        'The personal data on this page belongs to Vito Paparella Santorsola, published for recruitment purposes and protected under the GDPR (EU 2016/679). This site collects no visitor data.',
      accessibility:
        'This site is designed to meet WCAG 2.2 level AA. If you hit a barrier, email me.',
      localeName: 'English',
    },
  },
};

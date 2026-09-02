import type { Locale } from './locale';

/**
 * The Chrome's own words, never CV content. Serialized whole into island props,
 * so page-level strings belong in `meta.ts` (coding-standards).
 */
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
  /** The Mode's pair, on the theme's model and for the same reason (ADR-0017). */
  modeChange: string;
  modeToReading: string;
  modeToPaper: string;
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
  toolbar: ToolbarStrings;
  colophon: ColophonStrings;
}

export const ui: Record<Locale, UiStrings> = {
  it: {
    toolbar: {
      language: 'Leggi in inglese',
      download: 'Scarica il CV in PDF',
      share: 'Copia il link a questa pagina',
      shared: 'Link copiato',
      themeChange: 'Cambia il tema',
      themeToDark: 'Attiva il tema scuro',
      themeToLight: 'Attiva il tema chiaro',
      modeChange: 'Cambia visualizzazione',
      modeToReading: 'Passa alla lettura a colonna singola',
      modeToPaper: 'Torna al foglio A4',
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
    toolbar: {
      language: 'Read in Italian',
      download: 'Download the CV as a PDF',
      share: 'Copy the link to this page',
      shared: 'Link copied',
      themeChange: 'Switch theme',
      themeToDark: 'Switch to the dark theme',
      themeToLight: 'Switch to the light theme',
      modeChange: 'Switch view',
      modeToReading: 'Switch to single-column reading',
      modeToPaper: 'Back to the A4 sheet',
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

import type { Locale } from './locale';

/**
 * The Chrome's own words, never CV content. Serialized whole into island props,
 * so page-level strings belong in `meta.ts` (coding-standards).
 */

export interface ToolbarStrings {
  download: string;
  share: string;
  shared: string;
  modeReading: string;
  modePaper: string;
  themeGroup: string;
  themeLight: string;
  themeDark: string;
  localeGroup: string;
}

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
      download: 'Scarica il CV in PDF',
      share: 'Copia il link a questa pagina',
      shared: 'Link copiato',
      modeReading: 'Mod. Lettura',
      modePaper: 'Mod. Carta',
      themeGroup: 'Tema',
      themeLight: 'Tema chiaro',
      themeDark: 'Tema scuro',
      localeGroup: 'Lingua',
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
      download: 'Download the CV as a PDF',
      share: 'Copy the link to this page',
      shared: 'Link copied',
      modeReading: 'Reading Mode',
      modePaper: 'Paper Mode',
      themeGroup: 'Theme',
      themeLight: 'Light theme',
      themeDark: 'Dark theme',
      localeGroup: 'Language',
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

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
  open: string;
  close: string;
}

interface UiStrings {
  drawer: DrawerStrings;
}

export const ui: Record<Locale, UiStrings> = {
  it: {
    drawer: {
      name: 'Profilo e competenze',
      open: 'Apri profilo e competenze',
      close: 'Chiudi',
    },
  },
  en: {
    drawer: {
      name: 'Profile and skills',
      open: 'Open profile and skills',
      close: 'Close',
    },
  },
};

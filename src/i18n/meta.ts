import type { Locale } from '../content/types';

/**
 * What the document says about itself in each Locale — the words a search
 * result and a shared link show. A sibling of `ui.ts` rather than a group
 * inside it: `ui` is handed whole to the island as a prop, and these have no
 * business in that payload (ticket 10).
 */
export interface MetaStrings {
  title: string;
  /** Kept under 160 characters — the length a search result shows. */
  description: string;
  /** `og:locale`, which wants a language_TERRITORY pair rather than a Locale. */
  ogLocale: string;
  /** Describes the preview card, for anyone who meets it without seeing it. */
  ogImageAlt: string;
}

export const meta: Record<Locale, MetaStrings> = {
  it: {
    title: 'CV di Vito Paparella Santorsola — Senior Software Developer',
    description:
      'Senior software developer a Bari — cinque anni su frontend React e Angular, piattaforme news ad alto traffico e app enterprise. Leggi il CV o scarica il PDF.',
    ogLocale: 'it_IT',
    ogImageAlt: 'La prima pagina del CV di Vito Paparella Santorsola',
  },
  en: {
    title: 'Vito Paparella Santorsola — Senior Software Developer CV',
    description:
      'Senior software developer in Bari, Italy — five years on React and Angular frontends, high-traffic news and enterprise apps. Read the CV or download the PDF.',
    ogLocale: 'en_GB',
    ogImageAlt: 'The first page of Vito Paparella Santorsola’s CV',
  },
};

import type { Column, CvContent, Locale } from './types';
import { en } from './en';
import { it } from './it';

/**
 * A Continuation repeats a heading that already exists elsewhere in the
 * content (ADR-0005). That duplication is deliberate — deriving the copy
 * would couple `Block.astro` to its siblings across Sheets — but a duplicate
 * left unpoliced drifts the first time a section is renamed, and the failure
 * is silent: the CV simply shows two different names for one section.
 *
 * So the copy is checked here instead, at module load, which for a static
 * build means `astro build` fails rather than shipping it. Consistent with
 * ADR-0002's habit of failing the build over shipping a broken layout.
 *
 * A *prefix* match, not equality: the copy carries a "(continua)" /
 * "(continued)" marker, so it starts with the original rather than equalling
 * it. The marker itself is not the assertion's business — renaming the
 * section is.
 */
function assertContinuationsMatch(content: CvContent): void {
  // Tracked per column: a Continuation resumes the nearest preceding section
  // in its own column, and the two columns are independent runs of content.
  const lastHeading = new Map<Column, string>();
  const lastGroupTitle = new Map<Column, string>();

  const fail = (what: string, copy: string, original: string | undefined): never => {
    throw new Error(
      original === undefined
        ? `[content/${content.locale}] ${what} “${copy}” is marked \`continues\` but ` +
          `nothing precedes it in its column to continue. Either drop \`continues\` ` +
          `or move the opening half before it.`
        : `[content/${content.locale}] ${what} “${copy}” is marked \`continues\`, so it ` +
          `must start with “${original}” — the one it resumes. Rename both halves ` +
          `together (ADR-0005).`,
    );
  };

  for (const block of content.blocks) {
    if (block.kind !== 'mainSection') continue;

    if (block.continues) {
      const original = lastHeading.get(block.column);
      if (original === undefined || !block.heading.startsWith(original)) {
        fail('section heading', block.heading, original);
      }
    } else {
      // Deliberately not updated by a Continuation: a section split across
      // three Sheets has every copy measured against the original heading,
      // not against the previous copy's marker.
      lastHeading.set(block.column, block.heading);
    }

    for (const group of block.groups) {
      if (group.continues) {
        const original = lastGroupTitle.get(block.column);
        if (original === undefined || !group.title.startsWith(original)) {
          fail('group title', group.title, original);
        }
      } else {
        lastGroupTitle.set(block.column, group.title);
      }
    }
  }
}

/** The CV content for each Locale, keyed for lookup from a route. */
export const cv: Record<Locale, CvContent> = { it, en };

// Derived from `cv` rather than listing the Locales again: a third Locale
// should not be able to join the site without being checked.
for (const content of Object.values(cv)) assertContinuationsMatch(content);

export type * from './types';

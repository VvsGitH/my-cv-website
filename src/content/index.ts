import type { Column, CvContent, Locale } from './types';
import { en } from './en';
import { it } from './it';

/** Fails the build if a Continuation's heading has drifted from the one it resumes (ADR-0005). */
function assertContinuationsMatch(content: CvContent): void {
  // Per column: the two columns are independent runs of content.
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
      // Not updated by a Continuation: every copy is measured against the original.
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

// Derived from `cv`, so a third Locale cannot join unchecked.
for (const content of Object.values(cv)) assertContinuationsMatch(content);

export type * from './types';

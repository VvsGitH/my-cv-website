import type { Locale } from '../i18n/locale';
import { en } from './en';
import { it } from './it';
import type { Column, CvContent } from './types';

/** Fails the build if a Continuation's heading has drifted from the one it resumes (ADR-0005). */
function assertContinuationsMatch(content: CvContent): void {
  // Per column: the two paper columns are independent runs of content.
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
      const original = lastHeading.get(block.paperColumn);
      if (original === undefined || !block.heading.startsWith(original)) {
        fail('section heading', block.heading, original);
      }
    } else {
      // Not updated by a Continuation: every copy is measured against the original.
      lastHeading.set(block.paperColumn, block.heading);
    }

    for (const group of block.groups) {
      if (group.continues) {
        const original = lastGroupTitle.get(block.paperColumn);
        if (original === undefined || !group.title.startsWith(original)) {
          fail('group title', group.title, original);
        }
      } else {
        lastGroupTitle.set(block.paperColumn, group.title);
      }
    }
  }
}

/**
 * The reading column's own sequence (ADR-0017). `tsc` validates each `readOrder`
 * as a number but cannot see across Blocks, so the two things that make the
 * sequence a sequence are asserted here, beside the Continuation check that
 * already guards the paper's.
 */
function assertReadOrder(content: CvContent): void {
  const ordered = [...content.blocks].sort((a, b) => a.readOrder - b.readOrder);
  const actual = ordered.map((block) => block.readOrder);
  const expected = ordered.map((_, index) => index + 1);

  if (actual.join(',') !== expected.join(',')) {
    throw new Error(
      `[content/${content.locale}] readOrder must be 1..${ordered.length} with no gaps ` +
        `or repeats; got ${actual.join(', ')}.`,
    );
  }

  // A Continuation reads as one section with the half it resumes, which is only
  // true if nothing sorts between them — and Sheet.astro closes the gap above it
  // on exactly that assumption.
  ordered.forEach((block, index) => {
    if (block.kind !== 'mainSection' || !block.continues) return;

    const previous = ordered[index - 1];
    if (previous?.kind !== 'mainSection' || !block.heading.startsWith(previous.heading)) {
      throw new Error(
        `[content/${content.locale}] the Continuation “${block.heading}” reads at ` +
          `readOrder ${block.readOrder}, but “${previous && 'heading' in previous ? previous.heading : 'nothing'}” ` +
          `reads before it. A Continuation must follow the Block it resumes.`,
      );
    }
  });
}

/** The CV content for each Locale, keyed for lookup from a route. */
export const cv: Record<Locale, CvContent> = { it, en };

// Derived from `cv`, so a third Locale cannot join unchecked.
for (const content of Object.values(cv)) {
  assertContinuationsMatch(content);
  assertReadOrder(content);
}

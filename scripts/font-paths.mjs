// @ts-check

/**
 * Where a face comes from, and where its subset goes.
 *
 * A leaf on purpose: `fonts.config.mjs` needs `subsetOf()` to declare what Astro
 * loads, and `subset-fonts.mjs` needs the same rule to decide where to write.
 * With both of them importing this and this importing nothing, the manifest and
 * the tool that reads it never form a cycle (ADR-0023).
 *
 * Both paths are relative to the project root, which is what `local()` resolves
 * against — and what `new URL(path, config.root)` turns into a file to read.
 */

/** The sources: raw faces, committed, the only copy of anything in this pipeline. */
export const SOURCES_DIR = './src/assets/fonts/';

/**
 * The subsets, generated on every dev start and every build, never committed.
 *
 * This has to match what `createCodegenDir()` hands the integration, which
 * derives it from the integration's name — the integration asserts that it does
 * rather than trusting this comment.
 */
export const SUBSETS_DIR = './.astro/integrations/subset-fonts/';

/** @param {string} source A key of `FONT_SUBSETS`, e.g. `jetbrains/JetBrainsMono-Bold.woff2`. */
export const sourcePath = (source) => `${SOURCES_DIR}${source}`;

/**
 * The subset tree mirrors the source tree, so the two are read side by side.
 *
 * Always `.woff2`, including for the two `.ttf` sources: Astro reads a face's
 * type off its extension, so a `.ttf` name over woff2 bytes would have it
 * declare `format("truetype")` for a file that is nothing of the kind.
 *
 * @param {string} source A key of `FONT_SUBSETS`.
 */
export const subsetOf = (source) => `${SUBSETS_DIR}${source.replace(/\.[^.]+$/, '.woff2')}`;

// @ts-check

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import subsetFont from 'subset-font';
import { FONT_SUBSETS } from '../fonts.config.mjs';
import { SUBSETS_DIR, sourcePath, subsetOf } from './font-paths.mjs';

/**
 * Cutting the faces down to the charsets the CV actually uses, at build time.
 *
 * The repo holds one file per face — the raw source — and the `.woff2` a visitor
 * downloads is made from it on every dev start and every build (ADR-0023).
 * Nothing derived is committed, so nothing derived can fall out of step with
 * what it was derived from.
 *
 * Run standalone with `npm run fonts:subset` to read the numbers; it writes
 * exactly where the build writes, so what it produces is what would ship.
 */

/** @typedef {{ info: (message: string) => void }} Log */

/** Log to Astro's logger when there is one, to stdout when this runs as a script. */
const stdoutLog = { info: (/** @type {string} */ message) => console.log(message) };

/**
 * One face: read the source, cut it, write it if the bytes moved.
 *
 * @param {string} source A key of `FONT_SUBSETS`.
 * @param {string} charset
 * @param {URL} root
 * @param {Log} log
 */
async function subsetOne(source, charset, root, log) {
  const from = new URL(sourcePath(source), root);
  const to = new URL(subsetOf(source), root);

  // Not caught: a source that cannot be read is a red build, and it has to be.
  // The whole point of doing this here rather than inside a font provider is
  // that a provider's throw is swallowed by unifont and ships the page in
  // Courier New with a warning (ADR-0022).
  const input = await readFile(from);
  const output = await subsetFont(input, charset, { targetFormat: 'woff2' });

  // The guard ADR-0020 asked for. Subsetting is idempotent, so an already-cut
  // face put in the sources round-trips and reports success — and with nothing
  // derived committed, that loss is unrecoverable. A real source always shrinks:
  // the least any of ours gives up is Atkinson's 28%.
  if (output.length >= input.length) {
    throw new Error(
      `${source} came out no smaller than it went in (${input.length} -> ${output.length} bytes). ` +
        'A source that does not shrink has already been subset: restore the original face.',
    );
  }

  const saved = Math.round((1 - output.length / input.length) * 100);
  const existing = await readFile(to).catch(() => null);
  if (existing?.equals(output)) {
    log.info(`${source} unchanged (${input.length} -> ${output.length} bytes, -${saved}%)`);
    return;
  }

  // Only the write is conditional, never the cutting: there is no cache here to
  // go stale, and skipping an identical write is what keeps a running dev server
  // from restarting itself — Astro watches these files and reloads on an mtime.
  await mkdir(dirname(fileURLToPath(to)), { recursive: true });
  await writeFile(to, output);
  log.info(
    `${source} -> ${subsetOf(source)} (${input.length} -> ${output.length} bytes, -${saved}%)`,
  );
}

/**
 * Every face in `FONT_SUBSETS`, in order.
 *
 * @param {URL} root
 * @param {Log} [log]
 */
export async function subsetAll(root, log = stdoutLog) {
  for (const [source, charset] of Object.entries(FONT_SUBSETS)) {
    await subsetOne(source, charset, root, log);
  }
}

/**
 * The subsetting, wired ahead of everything that reads a font file.
 *
 * `astro:config:setup` is early enough — Astro's font pipeline resolves `src`
 * later, in the Vite plugin's `buildStart` — and it is the one place where a
 * throw stops the build.
 */
export function subsetFonts() {
  return {
    // `createCodegenDir()` derives `.astro/integrations/<name>/` from this, so
    // the name and `SUBSETS_DIR` have to agree. The hook checks that they do.
    name: 'subset-fonts',
    hooks: {
      /** @type {import('astro').AstroIntegration['hooks']['astro:config:setup']} */
      'astro:config:setup': async ({ command, config, createCodegenDir, addWatchFile, logger }) => {
        // `preview` serves `dist/`, where the faces were copied at build time,
        // and under `sync` — which is what `astro check` reports as — Astro's
        // font pipeline returns before resolving anything. Neither reads a font
        // file, and `render-captures.mjs` starts a preview server per capture.
        if (command !== 'build' && command !== 'dev') return;

        const codegenDir = createCodegenDir();
        const expected = new URL(SUBSETS_DIR, config.root);
        if (codegenDir.href !== expected.href) {
          throw new Error(
            `The codegen directory moved: Astro gave ${codegenDir.href}, ` +
              `scripts/font-paths.mjs says ${expected.href}. ` +
              'Update SUBSETS_DIR — every `src` in fonts.config.mjs points through it.',
          );
        }

        // So that editing a source during `astro dev` re-runs this hook. Without
        // it the dev server watches only the generated files, and a source edit
        // would do nothing until the next restart.
        for (const source of Object.keys(FONT_SUBSETS)) {
          addWatchFile(new URL(sourcePath(source), config.root));
        }

        await subsetAll(config.root, logger);
      },
    },
  };
}

// `npm run fonts:subset`, from the project root.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await subsetAll(pathToFileURL(`${process.cwd()}/`));
}

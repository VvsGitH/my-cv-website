// @ts-check

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

/** @typedef {{ source: string; target: string; charset: string }} SubsetTask */

/**
 * @param {SubsetTask} task
 * @param {URL} root
 * @param {import('astro').AstroIntegrationLogger} logger
 */
async function subsetOne({ source, target, charset }, root, logger) {
  const input = await readFile(new URL(source, root));
  const output = await subsetFont(input, charset, { targetFormat: 'woff2' });

  if (output.length >= input.length) {
    throw new Error(
      `${source} came out no smaller than it went in (${input.length} -> ${output.length} bytes). ` +
        'A source that does not shrink has already been subset: restore the original face.',
    );
  }

  const to = new URL(target, root);
  const saved = Math.round((1 - output.length / input.length) * 100);
  const existing = await readFile(to).catch(() => null);
  if (existing?.equals(output)) {
    logger.info(`${source} unchanged (${input.length} -> ${output.length} bytes, -${saved}%)`);
    return;
  }

  await mkdir(dirname(fileURLToPath(to)), { recursive: true });
  await writeFile(to, output);
  logger.info(`${source} -> ${target} (${input.length} -> ${output.length} bytes, -${saved}%)`);
}

/**
 * @param {Array<SubsetTask>} tasks
 * @returns {import('astro').AstroIntegration}
 */
export function subsetFonts(tasks) {
  return {
    name: 'subset-fonts',
    hooks: {
      'astro:config:setup': async ({ command, config, addWatchFile, logger }) => {
        if (command !== 'build' && command !== 'dev') return;

        for (const { source } of tasks) {
          addWatchFile(new URL(source, config.root));
        }
        for (const task of tasks) {
          await subsetOne(task, config.root, logger);
        }
      },
    },
  };
}

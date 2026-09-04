// @ts-check
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FontaineTransform } from 'fontaine';

const stylesDir = fileURLToPath(new URL('./src/styles/', import.meta.url));

// Metric-matched `local()` fallbacks, so text does not reflow if the real face
// never arrives (ADR-0012).
//
// Per family rather than one global list. `['Arial']` for everything put a
// proportional face behind a monospace one: JetBrains Mono against Courier New
// comes out at `size-adjust: 99.98%`, against Arial at 134.59% — a fallback
// stretched by a third, in the one place it is most visible, the name. Atkinson
// against Arial is 99.37% and stays.
const fontaine = FontaineTransform.vite({
  fallbacks: {
    'JetBrains Mono': ['Courier New'],
    'Atkinson Hyperlegible': ['Arial'],
    'Primera Signature': ['Arial'],
  },
  // The icon font is the one face a stand-in cannot stand in for: its glyphs are
  // private-use codepoints, so a metric-matched Arial would draw tofu exactly as
  // the generic fallback does. Skipping generation still leaves the name appended
  // to icons.css's literal `font-family` — inert, since a family with no face is
  // passed over, and that declaration had no fallback of its own to lose.
  skipFontFaceGeneration: (fallback) => fallback === 'icomoon fallback',
  resolvePath: (id) => pathToFileURL(resolve(stylesDir, id)),
});

/**
 * The same plugin, moved one stage earlier in the pipeline.
 *
 * As a Vite plugin fontaine runs at `enforce: 'pre'`, which is before Vite
 * inlines CSS `@import`s — so on this project it only ever saw global.css's five
 * import lines, found no `@font-face` among them, and generated nothing at all.
 * PostCSS is the one stage that sees the imports already inlined *and* the
 * `url()`s still as authored: a stage later and they are `__VITE_ASSET__`
 * placeholders, which fontaine skips because they do not end in `.woff2`.
 *
 * So global.css keeps its `@import` chain, and fontaine keeps the whole job —
 * the metric maths and the weight/style plumbing onto each generated face. This
 * only hands it the right text at the right moment.
 *
 * @type {import('postcss').Plugin}
 */
export const fontaineAfterImports = {
  postcssPlugin: 'fontaine-after-imports',
  async Once(root, { postcss }) {
    const file = root.source?.input.file;
    if (!file) return;

    let hasFace = false;
    root.walkAtRules('font-face', () => {
      hasFace = true;
      return false;
    });
    if (!hasFace) return;

    const { transform } = /** @type {any} */ (fontaine);
    const result = await (typeof transform === 'function' ? transform : transform.handler)(
      root.toString(),
      file,
    );
    if (!result?.code) return;

    root.removeAll();
    root.append(postcss.parse(result.code, { from: file }).nodes);
  },
};

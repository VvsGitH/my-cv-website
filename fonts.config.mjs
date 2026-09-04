// @ts-check

import { fontProviders } from 'astro/config';

const FONTS_DIR = './src/assets/fonts/';

/**
 * Every face the CV draws with, declared where Astro can see it.
 *
 * The files are the hand-cut subsets `npm run fonts:subset` writes (ADR-0012,
 * ADR-0020): Astro ships no subsetter, so `local()` consumes what that pipeline
 * produces and the pipeline is untouched by this. What Astro does instead is
 * generate the metric-matched fallbacks — `local()` system faces carrying
 * `size-adjust` and the override trio — which `fontaine` used to do from a
 * PostCSS plugin, and emit the `rel="preload"` links the page never had.
 *
 * Weights and styles are spelled out rather than inferred from the file. The
 * provider would read them (`fonts/providers/local.js`), but an earlier pass
 * declared ExtraBold at 900 and left `font-weight: 800` falling back to Bold,
 * so they belong where a reader can see them.
 *
 * `src/styles/fonts.css` maps these `cssVariable`s onto the role tokens the
 * components actually use, and remains the record of which face plays which
 * role. `optional` is forbidden throughout: it is a determinism hazard for the
 * PDF capture (ADR-0009).
 */

/**
 * `FontFamily` is not exported from `astro`, so it is recovered here: the
 * config's `fonts` is a mapped tuple over the providers it is given, so one
 * provider in and `[number]` out is the element type, with `options` typed for
 * `local()` instead of the `undefined` the unparameterized form gives.
 *
 * @typedef {ReturnType<typeof fontProviders.local>} LocalProvider
 * @typedef {NonNullable<import('astro').AstroUserConfig<never, never, [LocalProvider]>['fonts']>[number]} LocalFontFamily
 */

/** @type {Array<LocalFontFamily>} */
export const ASTRO_FONTS_CONFIG = [
  {
    // The name, its subtitle, section headings, entry titles, contact labels.
    name: 'JetBrains Mono',
    cssVariable: '--font-jetbrains-mono',
    provider: fontProviders.local(),
    display: 'swap',
    fallbacks: ['monospace'],
    options: {
      variants: [
        {
          weight: 400,
          style: 'normal',
          src: [`${FONTS_DIR}jetbrains/JetBrainsMono-Regular.woff2`],
        },
        {
          weight: 700,
          style: 'normal',
          src: [`${FONTS_DIR}jetbrains/JetBrainsMono-Bold.woff2`],
        },
        {
          weight: 800,
          style: 'normal',
          src: [`${FONTS_DIR}jetbrains/JetBrainsMono-ExtraBold.woff2`],
        },
      ],
    },
  },
  {
    // Employer / period lines, the Aside's prose, bullets and summaries.
    name: 'Atkinson Hyperlegible',
    cssVariable: '--font-atkinson',
    provider: fontProviders.local(),
    display: 'swap',
    fallbacks: ['sans-serif'],
    options: {
      variants: [
        {
          weight: 400,
          style: 'normal',
          src: [`${FONTS_DIR}atkinson/AtkinsonHyperlegible-Regular.woff2`],
        },
        {
          weight: 700,
          style: 'normal',
          src: [`${FONTS_DIR}atkinson/AtkinsonHyperlegible-Bold.woff2`],
        },
        {
          weight: 400,
          style: 'italic',
          src: [`${FONTS_DIR}atkinson/AtkinsonHyperlegible-Italic.woff2`],
        },
      ],
    },
  },
  {
    // The Privacy block's signature approximation, never a scan (ADR-0012).
    name: 'Primera Signature',
    cssVariable: '--font-primera-signature',
    provider: fontProviders.local(),
    display: 'swap',
    fallbacks: ['sans-serif'], // 'cursive' would be the honest generic, but Astro carries no metrics for it
    options: {
      variants: [
        {
          weight: 400,
          style: 'normal',
          src: [`${FONTS_DIR}primera-signature/PrimeraSignature-Regular.woff2`],
        },
      ],
    },
  },
  {
    // The Toolbar's glyphs, and the certification link inside Sheet 2.
    name: 'icomoon',
    cssVariable: '--font-icomoon',
    provider: fontProviders.local(),
    display: 'block', // No swap for icons (ADR-0020)
    fallbacks: [], // No fallback for icons (ADR-0020)
    optimizedFallbacks: false,
    options: {
      variants: [
        {
          weight: 400,
          style: 'normal',
          src: [`${FONTS_DIR}icons/icomoon-feather.woff2`],
        },
      ],
    },
  },
];

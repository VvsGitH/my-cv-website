// @ts-check

import { fontProviders } from 'astro/config';
import { subsetOf } from './scripts/font-paths.mjs';

// Basic Latin (space through tilde) + Latin-1 accented letters + Latin
// Extended-A + the typographic punctuation the CV copy actually uses (en/em
// dash, curly quotes, ellipsis, bullet, and the Colophon's ©). Enough for any
// Italian or English CV copy, which is why the Italian translation needed no
// re-cut (ADR-0012).
const BASIC_LATIN =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
const LATIN1_ACCENTS = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ';
const LATIN_EXTENDED_A =
  'ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĴĵĶķĹĺĻļĽľŁłŃńŅņŇňŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž';
const PUNCTUATION = '©–—‘’‚“”„†‡•…‰′″‹›€™';
const TEXT = BASIC_LATIN + LATIN1_ACCENTS + LATIN_EXTENDED_A + PUNCTUATION;

/**
 * Every source the build cuts, and the charset it is cut to.
 *
 * Relative to `src/assets/fonts/`, which holds the raw faces and nothing else:
 * the `.woff2` the browser gets are generated on every build and never
 * committed (ADR-0023). `variants[].src` below names the generated file through
 * `subsetOf()`, so a source that appears here and nowhere else is cut and
 * unused, and one that appears below without a key here fails the build.
 *
 * It cannot ride along inside a family or a variant: Astro's schema rejects an
 * unknown key on a family (`Unrecognized key`) and `Variant` rejects one on a
 * variant (TS2353).
 */
export const FONT_SUBSETS = {
  'jetbrains/JetBrainsMono-Regular.woff2': TEXT,
  'jetbrains/JetBrainsMono-Bold.woff2': TEXT,
  'jetbrains/JetBrainsMono-ExtraBold.woff2': TEXT,
  'atkinson/AtkinsonHyperlegible-Regular.woff2': TEXT,
  'atkinson/AtkinsonHyperlegible-Bold.woff2': TEXT,
  'atkinson/AtkinsonHyperlegible-Italic.woff2': TEXT,
  'primera-signature/PrimeraSignature-Regular.ttf': TEXT,
  'icons/icomoon-feather.ttf': [
    0xe902, // file-text — offers Reading Mode
    0xe904, // list — offers Paper Mode
    0xe901, // download
    0xe903, // link
    0xe907, // share-2
    0xe908, // sun — light theme
    0xe905, // moon — dark theme
    0xe900, // check-circle
  ]
    .map((codepoint) => String.fromCodePoint(codepoint))
    .join(''),
};

/**
 * Every face the CV draws with, declared where Astro can see it.
 *
 * `src` names a file the build generates, not one in the repo: `subsetOf()`
 * points at the subset tree under `.astro/`, cut from `FONT_SUBSETS` above by
 * `scripts/subset-fonts.mjs` before Astro resolves anything (ADR-0023). What
 * Astro does with it is generate the metric-matched fallbacks — `local()` system
 * faces carrying `size-adjust` and the override trio — and emit the
 * `rel="preload"` links the page never had before ADR-0022.
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
          src: [subsetOf('jetbrains/JetBrainsMono-Regular.woff2')],
        },
        {
          weight: 700,
          style: 'normal',
          src: [subsetOf('jetbrains/JetBrainsMono-Bold.woff2')],
        },
        {
          weight: 800,
          style: 'normal',
          src: [subsetOf('jetbrains/JetBrainsMono-ExtraBold.woff2')],
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
          src: [subsetOf('atkinson/AtkinsonHyperlegible-Regular.woff2')],
        },
        {
          weight: 700,
          style: 'normal',
          src: [subsetOf('atkinson/AtkinsonHyperlegible-Bold.woff2')],
        },
        {
          weight: 400,
          style: 'italic',
          src: [subsetOf('atkinson/AtkinsonHyperlegible-Italic.woff2')],
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
          src: [subsetOf('primera-signature/PrimeraSignature-Regular.ttf')],
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
          src: [subsetOf('icons/icomoon-feather.ttf')],
        },
      ],
    },
  },
];

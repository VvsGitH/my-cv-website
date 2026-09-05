// @ts-check

import { fontProviders } from 'astro/config';

const SOURCES_DIR = './src/assets/fonts/';
const SUBSETS_DIR = './.astro/subset-fonts/';

const BASIC_LATIN =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
const LATIN1_ACCENTS = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ';
const LATIN_EXTENDED_A =
  'ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĴĵĶķĹĺĻļĽľŁłŃńŅņŇňŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž';
const PUNCTUATION = '©–—‘’‚“”„†‡•…‰′″‹›€™';

const TEXT = BASIC_LATIN + LATIN1_ACCENTS + LATIN_EXTENDED_A + PUNCTUATION;

const ICONS = [
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
  .join('');

/**
 * @typedef {ReturnType<typeof fontProviders.local>} LocalProvider
 * @typedef {NonNullable<import('astro').AstroUserConfig<never, never, [LocalProvider]>['fonts']>[number]} LocalFontFamily
 * @typedef {NonNullable<LocalFontFamily['options']>['variants'][number]} LocalVariant
 * @typedef {Omit<LocalVariant, 'src'> & { src: string }} FontVariantConfig
 * @typedef {Omit<LocalFontFamily, 'provider' | 'options'> & {
 *   charset: string;
 *   variants: [FontVariantConfig, ...Array<FontVariantConfig>];
 * }} FontFamilyConfig
 */

/** @type {Array<FontFamilyConfig>} */
const FAMILIES = [
  {
    name: 'JetBrains Mono',
    cssVariable: '--font-jetbrains-mono',
    display: 'swap',
    fallbacks: ['monospace'],
    charset: TEXT,
    variants: [
      { weight: 400, style: 'normal', src: 'jetbrains/JetBrainsMono-Regular.woff2' },
      { weight: 700, style: 'normal', src: 'jetbrains/JetBrainsMono-Bold.woff2' },
      { weight: 800, style: 'normal', src: 'jetbrains/JetBrainsMono-ExtraBold.woff2' },
    ],
  },
  {
    name: 'Atkinson Hyperlegible',
    cssVariable: '--font-atkinson',
    display: 'swap',
    fallbacks: ['sans-serif'],
    charset: TEXT,
    variants: [
      { weight: 400, style: 'normal', src: 'atkinson/AtkinsonHyperlegible-Regular.woff2' },
      { weight: 700, style: 'normal', src: 'atkinson/AtkinsonHyperlegible-Bold.woff2' },
      { weight: 400, style: 'italic', src: 'atkinson/AtkinsonHyperlegible-Italic.woff2' },
    ],
  },
  {
    name: 'Primera Signature',
    cssVariable: '--font-primera-signature',
    display: 'swap',
    fallbacks: ['sans-serif'],
    charset: TEXT,
    variants: [
      { weight: 400, style: 'normal', src: 'primera-signature/PrimeraSignature-Regular.ttf' },
    ],
  },
  {
    name: 'icomoon',
    cssVariable: '--font-icomoon',
    display: 'block',
    fallbacks: [],
    optimizedFallbacks: false,
    charset: ICONS,
    variants: [{ weight: 400, style: 'normal', src: 'icons/icomoon-feather.ttf' }],
  },
];

const subsetOf = (/** @type {string} */ src) =>
  `${SUBSETS_DIR}${src.replace(/\.[^.]+$/, '.woff2')}`;

/**
 * @param {FontVariantConfig} variant
 * @returns {LocalVariant}
 */
const toAstroVariant = ({ src, ...variant }) => ({
  ...variant,
  src: /** @type {[string]} */ ([subsetOf(src)]),
});

/**
 * @param {FontFamilyConfig} family
 * @returns {LocalFontFamily}
 */
const toAstroFamily = ({ charset, variants: [first, ...rest], ...family }) => ({
  ...family,
  provider: fontProviders.local(),
  options: { variants: [toAstroVariant(first), ...rest.map(toAstroVariant)] },
});

export const toAstroFonts = () => FAMILIES.map(toAstroFamily);

/** @returns {Array<import('./scripts/subset-fonts.mjs').SubsetTask>} */
export const toSubsetTasks = () =>
  FAMILIES.flatMap(({ charset, variants }) =>
    variants.map(({ src }) => ({
      source: `${SOURCES_DIR}${src}`,
      target: subsetOf(src),
      charset,
    })),
  );

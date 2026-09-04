import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname } from 'node:path';
import subsetFont from 'subset-font';

// Basic Latin (space through tilde) + Latin-1 accented letters + Latin
// Extended-A + typographic punctuation actually used in CV copy (en/em
// dash, curly quotes, ellipsis, bullet, and the Colophon's ©). Covers
// Italian and English CV content without pulling in unrelated scripts.
const BASIC_LATIN =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
const LATIN1_ACCENTS = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ';
const LATIN_EXTENDED_A =
  'ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĴĵĶķĹĺĻļĽľŁłŃńŅņŇňŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž';
const PUNCTUATION = '©–—‘’‚“”„†‡•…‰′″‹›€™';
const TEXT = BASIC_LATIN + LATIN1_ACCENTS + LATIN_EXTENDED_A + PUNCTUATION;

const SOURCE = 'src/assets/raw-fonts/';
const DEST = 'src/assets/fonts/';

const TEXT_FONTS = [
  {
    name: 'atkinson',
    variants: [
      'AtkinsonHyperlegible-Bold.woff2',
      'AtkinsonHyperlegible-Italic.woff2',
      'AtkinsonHyperlegible-Regular.woff2',
    ],
  },
  {
    name: 'jetbrains',
    variants: [
      'JetBrainsMono-Regular.woff2',
      'JetBrainsMono-Bold.woff2',
      'JetBrainsMono-ExtraBold.woff2',
    ],
  },
  { name: 'primera-signature', variants: ['PrimeraSignature-Regular.ttf'] },
];

const ICON_FONTS = [
  {
    name: 'icons',
    variants: ['icomoon-feather.ttf'],
    set: [
      // The list of icons is in SOURCE/icons/selection.json
      0xe902, // file-text - Reading Mode
      0xe904, // list — offers Paper Mode
      0xe901, // download
      0xe903, // link
      0xe907, // share-2
      0xe908, // sun - light theme
      0xe905, // moon - dark theme
      0xe900, // check-cirlce
    ],
  },
];

async function processFont(name, variant, subset) {
  const src = `${SOURCE}${name}/${variant}`;
  const ext = extname(variant);
  const dest = `${DEST}${name}/${variant.replace(ext, '.woff2')}`;

  try {
    const input = await readFile(src);
    const output = await subsetFont(input, subset, { targetFormat: 'woff2' });

    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, output);

    console.log(`${src} -> ${dest} (${input.length} -> ${output.length} bytes)`);
  } catch (err) {
    console.error(`Error while processing ${src}`, err.message);
  }
}

console.log('---------- Start subsetting of text fonts ----------');
for (const { name, variants } of TEXT_FONTS) {
  for (const variant of variants) {
    await processFont(name, variant, TEXT);
  }
}

console.log('---------- Start subsetting of icon fonts ----------');
for (const { name, variants, set } of ICON_FONTS) {
  const iconSet = set.map((codepoint) => String.fromCodePoint(codepoint)).join('');
  for (const variant of variants) {
    await processFont(name, variant, iconSet);
  }
}

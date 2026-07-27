import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import subsetFont from 'subset-font';

// Basic Latin (space through tilde) + Latin-1 accented letters + Latin
// Extended-A + typographic punctuation actually used in CV copy (en/em
// dash, curly quotes, ellipsis, bullet, and the Colophon's ©). Covers
// Italian and English CV content without pulling in unrelated scripts.
const BASIC_LATIN =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
const LATIN1_ACCENTS =
  'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ';
const LATIN_EXTENDED_A =
  'ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĴĵĶķĹĺĻļĽľŁłŃńŅņŇňŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž';
const PUNCTUATION = '©–—‘’‚“”„†‡•…‰′″‹›€™';

const TEXT = BASIC_LATIN + LATIN1_ACCENTS + LATIN_EXTENDED_A + PUNCTUATION;

// The Toolbar's icons, as the private-use codepoints IcoMoon assigned them —
// numeric, because the characters themselves are invisible in an editor. The
// full set is 491 glyphs and 105 kB; eight are used. Adding a ninth means
// adding its codepoint here and a rule to src/styles/icons.css; the
// name -> codepoint mapping is docs/assets/fonts/icons/selection.json.
const ICONS = [
  0xe960, // download
  0xe9bd, // menu
  0xe9ca, // earth
  0xe9cb, // link
  0xe9d4, // sun
  0xe9d5, // contrast
  0xea0f, // cross
  0xea10, // checkmark
]
  .map((codepoint) => String.fromCodePoint(codepoint))
  .join('');

// [source, subset destination, the characters to keep].
const FACES = [
  ['docs/assets/fonts/garet/Garet-Book.otf', 'src/assets/fonts/garet/Garet-Book.woff2', TEXT],
  ['docs/assets/fonts/garet/Garet-Heavy.otf', 'src/assets/fonts/garet/Garet-Heavy.woff2', TEXT],
  ['docs/assets/fonts/now/Now-Bold.otf', 'src/assets/fonts/now/Now-Bold.woff2', TEXT],
  ['docs/assets/fonts/now/Now-Regular.otf', 'src/assets/fonts/now/Now-Regular.woff2', TEXT],
  ['docs/assets/fonts/lato/Lato-Regular.ttf', 'src/assets/fonts/lato/Lato-Regular.woff2', TEXT],
  ['docs/assets/fonts/lato/Lato-Bold.ttf', 'src/assets/fonts/lato/Lato-Bold.woff2', TEXT],
  ['docs/assets/fonts/lato/Lato-Italic.ttf', 'src/assets/fonts/lato/Lato-Italic.woff2', TEXT],
  [
    'docs/assets/fonts/primera-signature/PrimeraSignature-ALLy7.ttf',
    'src/assets/fonts/primera-signature/PrimeraSignature.woff2',
    TEXT,
  ],
  ['docs/assets/fonts/icons/icomoon.woff', 'src/assets/fonts/icons/icomoon.woff2', ICONS],
];

for (const [src, dest, text] of FACES) {
  const input = await readFile(src);
  const output = await subsetFont(input, text, { targetFormat: 'woff2' });
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, output);
  console.log(`${src} -> ${dest} (${input.length} -> ${output.length} bytes)`);
}

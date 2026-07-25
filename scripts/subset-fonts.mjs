import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import subsetFont from 'subset-font';

// Basic Latin (space through tilde) + Latin-1 accented letters + Latin
// Extended-A + typographic punctuation actually used in CV copy (en/em
// dash, curly quotes, ellipsis, bullet). Covers Italian and English CV
// content without pulling in unrelated scripts.
const BASIC_LATIN =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
const LATIN1_ACCENTS =
  'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ';
const LATIN_EXTENDED_A =
  'ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĴĵĶķĹĺĻļĽľŁłŃńŅņŇňŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž';
const PUNCTUATION = '–—‘’‚“”„†‡•…‰′″‹›€™';

const TEXT = BASIC_LATIN + LATIN1_ACCENTS + LATIN_EXTENDED_A + PUNCTUATION;

const FACES = [
  ['docs/assets/fonts/garet/Garet-Book.otf', 'src/fonts/garet/Garet-Book.woff2'],
  ['docs/assets/fonts/garet/Garet-Heavy.otf', 'src/fonts/garet/Garet-Heavy.woff2'],
  ['docs/assets/fonts/now/Now-Bold.otf', 'src/fonts/now/Now-Bold.woff2'],
  ['docs/assets/fonts/now/Now-Regular.otf', 'src/fonts/now/Now-Regular.woff2'],
  ['docs/assets/fonts/lato/Lato-Regular.ttf', 'src/fonts/lato/Lato-Regular.woff2'],
  ['docs/assets/fonts/lato/Lato-Bold.ttf', 'src/fonts/lato/Lato-Bold.woff2'],
  ['docs/assets/fonts/lato/Lato-Italic.ttf', 'src/fonts/lato/Lato-Italic.woff2'],
];

for (const [src, dest] of FACES) {
  const input = await readFile(src);
  const output = await subsetFont(input, TEXT, { targetFormat: 'woff2' });
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, output);
  console.log(`${src} -> ${dest} (${input.length} -> ${output.length} bytes)`);
}

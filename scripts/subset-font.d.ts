/* `subset-font` ships no types (2.7.0: no `types`, no `typings`, no `exports`),
   and `subset-fonts.mjs` is `// @ts-check`ed like the two config files it works
   with. Only the one call this repo makes is declared. */

declare module 'subset-font' {
  export default function subsetFont(
    font: Buffer,
    text: string,
    options?: { targetFormat?: 'woff2' | 'woff' | 'truetype' | 'sfnt' },
  ): Promise<Buffer>;
}

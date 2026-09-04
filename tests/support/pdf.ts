import { readFile } from 'node:fs/promises';
import {
  decodePDFRawStream,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  type PDFPage,
  PDFRawStream,
} from 'pdf-lib';

/** Enough of a PDF reader for ADR-0010's assertions, which also records the two encoding traps. */

export interface PdfFont {
  subtype: string;
  /** Type3 fonts carry no name (ADR-0009). */
  baseFont: string | undefined;
  embedded: boolean;
}

export interface PdfReport {
  pages: { width: number; height: number }[];
  fonts: PdfFont[];
  text: string;
}

/** Chromium positions one glyph at a time, leaving no usable word spacing. */
export const withoutWhitespace = (text: string): string => text.replace(/\s+/g, '');

export async function readPdf(path: string): Promise<PdfReport> {
  const document = await PDFDocument.load(await readFile(path));
  const pages = document.getPages();

  return {
    pages: pages.map((page) => page.getSize()),
    fonts: pages.flatMap(fontsOf),
    text: withoutWhitespace(pages.map(textOf).join('')),
  };
}

function fontResources(page: PDFPage): [string, PDFDict][] {
  const dict = page.node.Resources()?.lookup(PDFName.of('Font'), PDFDict);
  if (!dict) return [];
  return dict
    .entries()
    .map(([key, ref]): [string, PDFDict] => [
      key.toString(),
      page.node.context.lookup(ref, PDFDict),
    ]);
}

function fontsOf(page: PDFPage): PdfFont[] {
  return fontResources(page).map(([, font]) => {
    const subtype = String(font.get(PDFName.of('Subtype')));
    const descriptor = descriptorOf(font);

    return {
      subtype,
      baseFont: font.has(PDFName.of('BaseFont'))
        ? String(font.get(PDFName.of('BaseFont'))).replace(/^\/(?:[A-Z]{6}\+)?/, '')
        : undefined,
      // A Type3 font's glyphs are drawing procedures inside the file, so it has
      // no font program to point at.
      embedded:
        subtype === '/Type3' ||
        ['FontFile', 'FontFile2', 'FontFile3'].some((key) => descriptor?.has(PDFName.of(key))),
    };
  });
}

function descriptorOf(font: PDFDict): PDFDict | undefined {
  const descendants = font.lookupMaybe(PDFName.of('DescendantFonts'), PDFArray);
  const owner = descendants ? font.context.lookup(descendants.get(0), PDFDict) : font;
  return owner.lookupMaybe(PDFName.of('FontDescriptor'), PDFDict);
}

function streamText(stream: PDFRawStream): string {
  return Buffer.from(decodePDFRawStream(stream).decode()).toString('latin1');
}

/** A `ToUnicode` CMap: the glyph codes a font is addressed by, to characters. */
function parseToUnicode(cmap: string): Map<number, string> {
  const map = new Map<number, string>();

  const fromHex = (hex: string): string => {
    let out = '';
    for (let i = 0; i < hex.length; i += 4)
      out += String.fromCharCode(parseInt(hex.slice(i, i + 4), 16));
    return out;
  };

  for (const section of cmap.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const [, code, value] of section[1]!.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      map.set(parseInt(code!, 16), fromHex(value!));
    }
  }

  for (const section of cmap.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    const range = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
    for (const [, low, high, start] of section[1]!.matchAll(range)) {
      const first = parseInt(low!, 16);
      const last = parseInt(high!, 16);
      const base = parseInt(start!, 16);
      for (let code = first; code <= last; code++) {
        map.set(code, String.fromCharCode(base + (code - first)));
      }
    }
  }

  return map;
}

interface DecodedFont {
  /** Composite fonts address glyphs with two-byte codes, simple fonts with one. */
  codeBytes: 1 | 2;
  toUnicode: Map<number, string>;
}

function decodersOf(page: PDFPage): Map<string, DecodedFont> {
  const decoders = new Map<string, DecodedFont>();

  for (const [key, font] of fontResources(page)) {
    const cmap = font.lookup(PDFName.of('ToUnicode'));
    decoders.set(key, {
      codeBytes: String(font.get(PDFName.of('Subtype'))) === '/Type0' ? 2 : 1,
      toUnicode: cmap instanceof PDFRawStream ? parseToUnicode(streamText(cmap)) : new Map(),
    });
  }

  return decoders;
}

function contentOf(page: PDFPage): string {
  const contents = page.node.lookup(PDFName.of('Contents'));
  if (contents instanceof PDFArray) {
    return contents
      .asArray()
      .map((ref) => {
        const part = page.node.context.lookup(ref);
        return part instanceof PDFRawStream ? streamText(part) : '';
      })
      .join('\n');
  }
  return contents instanceof PDFRawStream ? streamText(contents) : '';
}

const unescapeLiteral = (literal: string): string =>
  literal.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (_, escaped: string) => {
    const named: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' };
    if (named[escaped]) return named[escaped];
    return /^[0-7]/.test(escaped) ? String.fromCharCode(parseInt(escaped, 8)) : escaped;
  });

const hexToBytes = (hex: string): string => {
  const clean = hex.replace(/\s+/g, '');
  let out = '';
  for (let i = 0; i < clean.length; i += 2) {
    out += String.fromCharCode(parseInt(clean.slice(i, i + 2).padEnd(2, '0'), 16));
  }
  return out;
};

/** Walks the text-showing operators, tracking which font each run is set in. */
function textOf(page: PDFPage): string {
  const decoders = decodersOf(page);
  let font: DecodedFont | undefined;
  let out = '';

  const show = (codes: string): void => {
    const width = font?.codeBytes ?? 1;
    for (let i = 0; i + width <= codes.length; i += width) {
      let code = 0;
      for (let byte = 0; byte < width; byte++) code = (code << 8) | codes.charCodeAt(i + byte);
      out += font?.toUnicode.get(code) ?? '';
    }
  };

  const operators =
    /\/(\w+)\s+[-\d.]+\s+Tf|\(((?:\\.|[^\\()])*)\)\s*Tj|<([0-9A-Fa-f\s]*)>\s*Tj|\[((?:[^\][]|\[[^\]]*\])*)\]\s*TJ/g;

  for (const match of contentOf(page).matchAll(operators)) {
    const [whole, resource, literal, hex, array] = match;

    if (whole.endsWith('Tf')) {
      font = decoders.get(`/${resource!}`);
    } else if (literal !== undefined) {
      show(unescapeLiteral(literal));
    } else if (hex !== undefined) {
      show(hexToBytes(hex));
    } else if (array !== undefined) {
      for (const part of array.matchAll(/\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]*)>/g)) {
        show(part[1] !== undefined ? unescapeLiteral(part[1]) : hexToBytes(part[2]!));
      }
    }
  }

  return out;
}

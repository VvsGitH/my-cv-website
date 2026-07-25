const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

/**
 * Render a `RichText` string (see `src/content/types.ts`) as HTML: plain
 * text, except that `**…**` becomes `<strong>`.
 *
 * Escaping runs first so content can never inject markup; the `*` markers
 * are untouched by escaping, so matching them afterwards is safe.
 */
export function renderRichText(text: string): string {
  return text
    .replace(/[&<>"]/g, (c) => ESCAPES[c]!)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

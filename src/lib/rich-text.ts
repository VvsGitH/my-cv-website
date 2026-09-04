const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

/** `**…**` becomes `<strong>` (ADR-0002). Escaping runs first, so content cannot inject markup. */
export function renderRichText(text: string): string {
  return text
    .replace(/[&<>"]/g, (c) => ESCAPES[c])
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

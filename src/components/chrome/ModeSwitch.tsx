const MODE_STORAGE_KEY = 'cv-mode';

type Mode = 'paper' | 'reading';

interface Props {
  reading: string;
  paper: string;
}

/**
 * `<html data-mode>` is the Mode's only source of truth — no signal mirrors it,
 * and the control is switched by CSS rather than re-rendered (ADR-0003, ADR-0017).
 */
function toggleMode(): void {
  const next: Mode = document.documentElement.dataset['mode'] === 'reading' ? 'paper' : 'reading';

  document.documentElement.dataset['mode'] = next;

  try {
    localStorage.setItem(MODE_STORAGE_KEY, next);
  } catch {
    // Private modes throw on write; the Mode still applies for this visit.
  }
}

export default function ModeSwitch({ reading, paper }: Props) {
  return (
    <button type="button" class="toolbar-mode" onClick={toggleMode}>
      <span class="icon-list" aria-hidden="true"></span>
      <span class="icon-file-text" aria-hidden="true"></span>
      <span class="toolbar-mode-to-reading">{reading}</span>
      <span class="toolbar-mode-to-paper">{paper}</span>
    </button>
  );
}

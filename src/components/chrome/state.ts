import { signal } from '@preact/signals';

/** Every initialiser here must be a constant — they run during prerender too (coding-standards). */

/** Mirrors BaseLayout's inline script — change the key in both. */
const THEME_STORAGE_KEY = 'cv-theme';

const COPIED_FEEDBACK_MS = 2000;

export type Theme = 'light' | 'dark';

/** The one piece of state crossing the two islands (ADR-0007, ADR-0008). */
export const drawerOpen = signal(false);

/** Module-level despite the single instance — a sanctioned exception (coding-standards). */
export const linkCopied = signal(false);

/** `<html data-theme>` is the theme's only source of truth — no signal mirrors it (ADR-0003). */
export function toggleTheme(): void {
  const next: Theme = document.documentElement.dataset['theme'] === 'dark' ? 'light' : 'dark';

  document.documentElement.dataset['theme'] = next;
  document.documentElement.style.colorScheme = next;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Private modes throw on write; the theme still applies for this visit.
  }
}

let copiedTimer: ReturnType<typeof setTimeout> | undefined;

export async function copyLink(): Promise<void> {
  try {
    await navigator.clipboard.writeText(window.location.href);
  } catch {
    // Denied, or an insecure origin — confirming nothing is the honest outcome.
    return;
  }

  linkCopied.value = true;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => {
    linkCopied.value = false;
  }, COPIED_FEEDBACK_MS);
}

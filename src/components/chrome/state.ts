import { signal } from '@preact/signals';

/**
 * The Chrome's state, and the two actions that reach outside the render
 * (coding-standards: derive during render, act in event handlers).
 *
 * Both first values are constants: these initialisers also run during
 * prerender, and a signal that read `localStorage` or `matchMedia` would
 * desynchronise the first client render from the prerendered HTML, in silence.
 */

/** Mirrors BaseLayout's inline script — change the key in both. */
const THEME_STORAGE_KEY = 'cv-theme';

const COPIED_FEEDBACK_MS = 2000;

export type Theme = 'light' | 'dark';

/**
 * The one piece of state that crosses the boundary between the Chrome's two
 * islands (ADR-0007): the Toolbar's first control writes it, the Drawer reads
 * it, and neither imports the other. There is one signal object at runtime
 * because both island entries import *this module* and Vite emits it once, as
 * a chunk they share — ticket 20 records how that is verified against a build.
 */
export const drawerOpen = signal(false);

/** The Toolbar's own, and read nowhere else. */
export const linkCopied = signal(false);

/**
 * `<html data-theme>` is the theme's single source of truth: BaseLayout's
 * inline script writes it before the first paint, and the Toolbar's icon and
 * label are keyed off it in CSS. Holding a copy in a signal would only be a
 * second answer to the same question, wrong between prerender and hydration.
 */
export function toggleTheme(): void {
  const next: Theme = document.documentElement.dataset['theme'] === 'dark' ? 'light' : 'dark';

  document.documentElement.dataset['theme'] = next;
  document.documentElement.style.colorScheme = next;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Private modes throw on write. The theme still applies for this visit.
  }
}

let copiedTimer: ReturnType<typeof setTimeout> | undefined;

export async function copyLink(): Promise<void> {
  try {
    await navigator.clipboard.writeText(window.location.href);
  } catch {
    // Denied permission, or an insecure origin. Confirming nothing is the
    // honest outcome — the button has copied nothing.
    return;
  }

  linkCopied.value = true;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => {
    linkCopied.value = false;
  }, COPIED_FEEDBACK_MS);
}

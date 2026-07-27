import { signal } from '@preact/signals';

/**
 * The Chrome's state, and the two actions that reach outside the render
 * (coding-standards: derive during render, act in event handlers).
 *
 * Module scope, because the Toolbar is rendered twice — once against the page
 * and once riding the Drawer's panel (see ChromeIsland) — and the two copies
 * are one control each, not two. Both first values are constants: these
 * initialisers also run during prerender, and a signal that read
 * `localStorage` or `matchMedia` would desynchronise the first client render
 * from the prerendered HTML, in silence.
 */

/** Mirrors BaseLayout's inline script — change the key in both. */
const THEME_STORAGE_KEY = 'cv-theme';

const COPIED_FEEDBACK_MS = 2000;

export type Theme = 'light' | 'dark';

export const drawerOpen = signal(false);

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

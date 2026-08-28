import { signal } from '@preact/signals';
import type { TargetedMouseEvent } from 'preact';

/** Every initialiser here must be a constant — they run during prerender too (coding-standards). */

/** Both mirror BaseLayout's inline script — change a key in both places. */
const THEME_STORAGE_KEY = 'cv-theme';
const MODE_STORAGE_KEY = 'cv-mode';

const COPIED_FEEDBACK_MS = 2000;

const THEME_REVEAL_MS = 620;
const THEME_REVEAL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export type Theme = 'light' | 'dark';
export type Mode = 'paper' | 'reading';

/** Module-level despite the single instance — a sanctioned exception (coding-standards). */
export const linkCopied = signal(false);

/** `<html data-theme>` is the theme's only source of truth — no signal mirrors it (ADR-0003). */
function applyTheme(): void {
  const next: Theme = document.documentElement.dataset['theme'] === 'dark' ? 'light' : 'dark';

  document.documentElement.dataset['theme'] = next;
  document.documentElement.style.colorScheme = next;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Private modes throw on write; the theme still applies for this visit.
  }
}

/** The new theme is revealed by a circle growing out of the control (ADR-0016). */
function revealFrom(origin: DOMRect): void {
  const x = origin.x + origin.width / 2;
  const y = origin.y + origin.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  document.documentElement.animate(
    { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
    {
      duration: THEME_REVEAL_MS,
      easing: THEME_REVEAL_EASING,
      pseudoElement: '::view-transition-new(root)',
    },
  );
}

/**
 * The rect, not the pointer: a keyboard activation carries no coordinates but does
 * carry the control it fired on. Reduced motion is gated here rather than in CSS —
 * `reset.css` reaches neither the snapshot pseudo-elements nor `animate()` (ADR-0016).
 */
export function toggleTheme(event: TargetedMouseEvent<HTMLButtonElement>): void {
  const origin = event.currentTarget.getBoundingClientRect();

  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme();
    return;
  }

  document
    .startViewTransition(applyTheme)
    // A second toggle skipping the first one rejects `ready`, and is not a failure.
    .ready.then(() => revealFrom(origin))
    .catch(() => {});
}

/**
 * `<html data-mode>` is the Mode's only source of truth, exactly as the theme's is
 * — no signal mirrors it, and the Toolbar's control is switched by CSS rather than
 * re-rendered (ADR-0003, ADR-0017). Paper is the default at every width, so the
 * flip needs no width to consult.
 */
export function toggleMode(): void {
  const next: Mode = document.documentElement.dataset['mode'] === 'reading' ? 'paper' : 'reading';

  document.documentElement.dataset['mode'] = next;

  try {
    localStorage.setItem(MODE_STORAGE_KEY, next);
  } catch {
    // Private modes throw on write; the Mode still applies for this visit.
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

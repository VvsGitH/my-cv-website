import type { TargetedKeyboardEvent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

type Theme = 'light' | 'dark';

const THEMES: readonly Theme[] = ['light', 'dark'];
const GLYPHS: Record<Theme, string> = { light: 'icon-sun', dark: 'icon-moon' };

/** `<html data-theme>` is the theme's only source of truth; the state below only mirrors it (ADR-0003). */
function applyTheme(next: Theme): void {
  document.documentElement.dataset['theme'] = next;
  document.documentElement.style.colorScheme = next;

  try {
    /** Mirrors BaseLayout's inline script — change the key in both places. */
    localStorage.setItem('cv-theme', next);
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
      duration: 500,
      easing: 'ease-in', //'cubic-bezier(0.22, 1, 0.36, 1)',
      pseudoElement: '::view-transition-new(root)',
    },
  );
}

/**
 * The rect, not the pointer: a keyboard activation carries no coordinates but does
 * carry the control it fired on. Reduced motion is gated here rather than in CSS —
 * `reset.css` reaches neither the snapshot pseudo-elements nor `animate()` (ADR-0016).
 */
function swapTheme(next: Theme, origin: DOMRect): void {
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme(next);
    return;
  }

  document
    .startViewTransition(() => applyTheme(next))
    // A second swap skipping the first one rejects `ready`, and is not a failure.
    .ready.then(() => revealFrom(origin))
    .catch(() => {});
}

interface Props {
  group: string;
  light: string;
  dark: string;
}

export default function ThemeSwitch({ group, light, dark }: Props) {
  const names: Record<Theme, string> = { light, dark };
  const [theme, setTheme] = useState<Theme>('light');
  const radiogroup = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light');
  }, []);

  const select = (next: Theme, origin: HTMLElement): void => {
    if (document.documentElement.dataset['theme'] === next) return;

    setTheme(next);
    swapTheme(next, origin.getBoundingClientRect());
  };

  const roam = (event: TargetedKeyboardEvent<HTMLButtonElement>, index: number): void => {
    const last = THEMES.length - 1;
    let wanted: number;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        wanted = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        wanted = index === 0 ? last : index - 1;
        break;
      case 'Home':
        wanted = 0;
        break;
      case 'End':
        wanted = last;
        break;
      default:
        return;
    }

    event.preventDefault();

    const target = radiogroup.current?.children[wanted];
    if (!(target instanceof HTMLElement)) return;

    target.focus();
    select(THEMES[wanted], target);
  };

  return (
    <div class="toolbar-switch toolbar-theme" role="radiogroup" aria-label={group} ref={radiogroup}>
      {THEMES.map((option, index) => (
        // biome-ignore lint/a11y/useSemanticElements: an <input> cannot be this pill (spec decision 1).
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={option === theme}
          aria-label={names[option]}
          tabindex={option === theme ? 0 : -1}
          data-theme-option={option}
          onClick={(event) => select(option, event.currentTarget)}
          onKeyDown={(event) => roam(event, index)}
        >
          <span class={GLYPHS[option]} aria-hidden="true"></span>
        </button>
      ))}
    </div>
  );
}

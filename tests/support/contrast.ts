import type { Page } from '@playwright/test';

/**
 * WCAG contrast, measured off the rendered page rather than off the tokens.
 *
 * The palette is authored in `oklch()` and `getComputedStyle` hands that back
 * untouched, so every colour here is rasterised through a canvas rather than
 * parsed — which is also the only way to be sure the browser resolved the same
 * value it painted (ADR-0015 put a second ramp behind every ink, and this is
 * what keeps both of them honest).
 */
type Srgb = [number, number, number];

/** WCAG 2.x relative luminance. */
function luminance([red, green, blue]: Srgb): number {
  const channel = (value: number): number => {
    const ratio = value / 255;
    return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

export const contrastRatio = (foreground: Srgb, background: Srgb): number => {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light! + 0.05) / (dark! + 0.05);
};

/** The `color` of one element against the `background-color` of another. */
export async function inkOn(
  page: Page,
  ink: string,
  surface: string,
): Promise<{ ratio: number; fontSize: number }> {
  const measured = await page.evaluate(
    ([inkSelector, surfaceSelector]) => {
      const context = document.createElement('canvas').getContext('2d')!;
      const srgb = (value: string): [number, number, number] => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
        return [red!, green!, blue!];
      };

      const find = (selector: string): Element => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`nothing matched ${selector}`);
        return element;
      };

      const style = getComputedStyle(find(inkSelector!));
      return {
        color: srgb(style.color),
        background: srgb(getComputedStyle(find(surfaceSelector!)).backgroundColor),
        fontSize: parseFloat(style.fontSize),
      };
    },
    [ink, surface] as const,
  );

  return {
    ratio: contrastRatio(measured.color, measured.background),
    fontSize: measured.fontSize,
  };
}

# 14 — Profile photo

Status: done

## Goal

Render the owner's real profile photo in the Aside's photo disc, replacing the flat-color placeholder ticket 05 built against (spec US30).

## Tasks

- Copy `docs/assets/images/CV_Image.png` into `src/images/` (the owner already composited the cut-out over the disc's yellow, matching `--color-photo-circle`) and import it with `astro:assets`' `<Image>`.
- `PhotoBlock.astro`: render the `<Image>` inside the existing 176.4px circular container, `object-fit: cover`; keep the disc's `background-color` behind it as a safety layer.
- Keep `alt` sourced from content, as before.

## Acceptance

- Photo renders circular, same size/position as the placeholder disc, in both Locales and across Paper Mode / Reading Mode.
- No layout shift: explicit `width`/`height` on the `<Image>`.

## Depends on

- 05 (photo disc/container already built)

## Comments

### Implementation

Owner dropped `docs/assets/images/CV_Image.png` (1486×1754, RGBA, already composited over a flat yellow background matching the reference's disc — not a transparent cut-out, just pre-flattened art). Copied as-is to `src/images/profile.png` (`docs/assets/` is git-ignored, same split as the fonts: raw drop folder vs. the committed, build-usable copy under `src/`).

`PhotoBlock.astro` now imports it and renders `astro:assets`' `<Image>` at `width={353} height={353}` (2× the 176.4px CSS disc, for retina/print sharpness) inside the existing `.photo` div, with `overflow: hidden` + `object-fit: cover` doing the circular crop — the div's `background-color: var(--color-photo-circle)` stays as a fallback layer rather than being removed, in case a future photo drop isn't fully opaque to its edges. `astro build` optimizes it to a 7KB webp automatically (from a 1.5MB source), no manual resizing needed.

Verified visually (Chrome DevTools, both Sheets, IT locale, 1600px viewport) against `CV_page1.png`: circular, centered, correctly cropped — no `object-position` tuning needed since the source photo already has generous headroom above the subject.

Not changed: `PhotoBlock`'s `Props`/content-model contract (`alt` only) — the image file staying a layout-only concern, not a content-model field, was ticket 04/05's explicit decision and still holds.

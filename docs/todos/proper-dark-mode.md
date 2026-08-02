# Proper Dark Theme

## New color palette

- Light:
  - color-main-bg: #E4E4E4
  - color-sheet-bg: #ffffff
  - color-aside-bg: #fef9e0
  - color-photo-circle: #efdf9e
  - color-text: #262828
  - color-heading: #303642
  - color-bar-track: same as color-photo-circle
- Dark:
  - color-main-bg: #1b2432
  - color-sheet-bg: #212c40
  - color-aside-bg: #4b4f2c
  - color-photo-circle: #636b2f
  - color-text: #d8d8d8
  - color-heading: #66728c
  - color-bar-track: same as color-photo-circle
- Drop useless text colors
  - default text color is color-text
  - color-muted is replaced by color-text
  - color-ink is replaced by color-heading
  - color-signature is replaced by color-heading

## The focus ring is ~1.4:1 on the dark background

`--color-heading` as a focus-ring colour measures ~1.4:1 against `--color-dark-bg`. Aggravated in Reading Mode, where the Toolbar's bottom row meets that background more often than the Paper Mode rail does. ADR-0008 lists it as open.

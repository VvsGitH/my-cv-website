# Modern CSS best practices & conventions (2026) for an A4 CV site with PDF capture

Research date: 2026-07-24. All claims cite PRIMARY sources: MDN (`developer.mozilla.org`) as the reference, and the W3C/CSSWG specifications (CSS Paged Media, CSS Fragmentation, etc.) for normative wording. **Baseline availability status** is taken from MDN's Baseline badges (MDN surfaces the `web-platform-dx` Baseline data), which is the authoritative availability source per the brief. No blogs or tutorials are cited. Where a fact could not be pinned to a primary source, it is called out explicitly in the last section.

Scope is tuned to THIS project: one static CV rendered as fixed-geometry A4 sheets ("Paper Mode") on desktop/tablet, reflowing to a single column on mobile ("Reading Mode"), with the exact same DOM captured by headless Chromium to produce a print-perfect PDF.

## Recommendation (TL;DR)

For an A4-paper-plus-reflow site that is also captured to PDF by headless Chromium, the load-bearing decisions are:

- **Own the page geometry in CSS Paged Media.** Declare `@page { size: A4; margin: 0 }` and drive breaks with the modern **`break-before` / `break-after` / `break-inside`** properties (not the legacy `page-break-*`, which are now defined as legacy aliases). Put `break-inside: avoid` on any block you never want split across the A4 boundary (entries, the aside), and `break-before: page` at the deliberate 2-page seam ([MDN `break-inside`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside); [MDN `break-before`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-before); [CSS Fragmentation L3 §3](https://www.w3.org/TR/css-break-3/)).
- **Force color fidelity for print/PDF.** Chromium's print path strips backgrounds and "optimizes" colors by default; set `print-color-adjust: exact` (plus the `-webkit-print-color-adjust` alias for older engines) on colored surfaces so the PDF matches the screen ([MDN `print-color-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust)).
- **Use physical units (`mm`) ONLY for the paper box; use relative units (`rem`/`ch`) for type and reflow.** `mm` is correct where the physical medium is known (the A4 sheet and `@page`), but MDN explicitly warns that fixed absolute lengths hurt accessibility for `font-size` — use `rem`/`em` there ([MDN length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length)).
- **Prefer container queries + `:has()` for the Paper↔Reading switch where the trigger is the element's own context, and keep media queries for the true viewport/`print` switch.** All three are Baseline "widely available" now ([MDN `@container`](https://developer.mozilla.org/en-US/docs/Web/CSS/@container); [MDN `:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)).
- **Theme with `color-scheme` + `light-dark()` + custom properties, in `oklch()`.** `color-scheme: light dark` on `:root` unlocks `light-dark()` for a one-line-per-property theme, and `oklch()` gives perceptually uniform light/dark pairs. `light-dark()` and `@property` are only Baseline "newly available" (2024), so gate anything critical behind `@supports` if you must support older engines ([MDN `light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark); [MDN `oklch()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)).
- **Fonts: self-host, and NEVER use `font-display: optional` for PDF-captured fonts.** `optional` gives no swap period, so a font that misses the tiny block window is dropped for that render — a determinism hazard for PDF capture. Prefer `block` and gate the PDF capture on `document.fonts.ready` ([MDN `font-display`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)).
- **Architecture: cascade layers (`@layer`), native nesting, logical properties, and `:where()`/`:is()`** keep the single scoped stylesheet flat in specificity and i18n-ready for the bilingual (it/en) content.

A per-feature Baseline table is at the end of this document.

---

## 1. Paged media & print (the core of this project)

### 1.1 `@page` and `size`

Declare the sheet geometry in the CSS Paged Media at-rule. The `size` descriptor "defines the size and orientation of the box which is used to represent a page," accepts the `A4` keyword (**210 mm × 297 mm**), and equally accepts two explicit lengths, e.g. `size: 210mm 297mm`; its initial value is `auto` and relative lengths are computed to absolute ([MDN `@page`/`size`](https://developer.mozilla.org/en-US/docs/Web/CSS/@page/size)). Pair it with `margin: 0` so the two A4 page components own all layout. In the headless-Chromium capture, combine this with `preferCSSPageSize: true` so the CSS `@page` size wins over any `format` option (cross-referenced in `docs/research/pdf-web-stack.md` Q1/Q4; spec: [CSS Paged Media L3](https://www.w3.org/TR/css-page-3/)).

**Baseline:** the `size` descriptor is **Baseline "newly available" (since December 2024)** ([MDN `@page`/`size`](https://developer.mozilla.org/en-US/docs/Web/CSS/@page/size)). It works in the Chromium print engine this project captures with; just be aware it is not yet "widely available" for arbitrary browser print dialogs.

### 1.2 Fragmentation: `break-before` / `break-after` / `break-inside`

Modern break control is the CSS Fragmentation module. Prefer these over the CSS2 `page-break-*` properties.

- **`break-inside`** "sets how page, column, or region breaks should behave inside a generated box." Values: `auto`, `avoid`, `avoid-page`, `avoid-column`, `avoid-region`. `avoid` means "avoid breaks within the box" ([MDN `break-inside`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside); [CSS Fragmentation L3 §3.2](https://www.w3.org/TR/css-break-3/)). Use `break-inside: avoid` on each job/education entry and on the aside so an item is never split across the A4 seam.
- **`break-before` / `break-after`** take page-context values `page`, `avoid-page`, `left`, `right`, `recto`, `verso`. `page` "forces a page break right before the principal box"; `left`/`right`/`recto`/`verso` force one or two breaks to land the next content on a specific page side ([MDN `break-before`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-before)). Use `break-before: page` at the deliberate boundary between sheet 1 and sheet 2 rather than relying on content height to overflow.

**Legacy aliasing (important):** the spec requires UAs to treat `page-break-before/after/inside` as **legacy shorthands** for `break-*` ([CSS Fragmentation L3 §3.4](https://www.w3.org/TR/css-break-3/); [MDN `break-inside`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside)). One subtlety: `page-break-*: always` maps to `break-*: page` (NOT `always`), because browsers implemented `always` as a page break, not a column break ([MDN `break-before`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-before)). So the modern spelling is the safe one; you generally do not need to also write `page-break-*` since the modern properties are Baseline "widely available since January 2019" ([MDN `break-inside`](https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside)). (MDN flags "some parts of this feature may have varying levels of support" — the widely-supported part is the page-context values; `-region` values are not needed here.)

**Forced-break semantics.** The spec: "A forced break value effectively overrides any avoid break value that also applies at that break point," and a forced break "forces ensuing content into the next fragmentainer of the type associated with the break… If the forced break is not contained within a matching type of fragmentation context, then the forced break has no effect" ([CSS Fragmentation L3 §4.3](https://www.w3.org/TR/css-break-3/)). Practically: `break-before: page` only does something in a paged context (print/PDF), which is exactly this project. Break opportunities exist between sibling boxes (Class A), between line boxes (Class B), and at content/edge gaps (Class C) ([CSS Fragmentation L3 §4.1](https://www.w3.org/TR/css-break-3/)) — knowing this helps predict where Chromium may split a long list.

### 1.3 `print-color-adjust` (color fidelity in the PDF)

Chromium's print/PDF pipeline is allowed to drop background images and shift colors for paper legibility by default. `print-color-adjust` "sets what, if anything, the user agent may do to optimize the appearance of an element on the output device." Its `economy` value (the default) lets the browser adjust — "when printing, a browser might opt to leave out all background images and to adjust text colors." Its `exact` value says "the appearance of the content should not be changed except by the user's request" ([MDN `print-color-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust)). For a colored CV where the PDF must match the screen, set `print-color-adjust: exact` on the colored surfaces (aside background, accent bars).

**Baseline caveat:** the unprefixed `print-color-adjust` is only **Baseline "newly available" (since May 2025)** ([MDN `print-color-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust)). Because the PDF is produced by Chromium (which historically shipped the `-webkit-print-color-adjust` alias, and which the PDF-tooling research already relies on — see `pdf-web-stack.md` Q1), author BOTH: `-webkit-print-color-adjust: exact; print-color-adjust: exact;`. Also set `printBackground: true` in the capture options (that is a Puppeteer/Playwright flag, not CSS — see `pdf-web-stack.md`).

### 1.4 `@media print` parity

`page.pdf()` renders with the `print` media type by default, so `@media print` rules apply during capture (documented in `pdf-web-stack.md` Q1). For this project the goal is **parity**: keep the paper look identical across `screen` and `print` (or emulate `screen` at capture) so the desktop rendering and the PDF cannot diverge. Reserve `@media print` for genuinely print-only concerns (hiding the mobile drawer/nav, forcing the seam with `break-before: page`).

---

## 2. Physical vs relative units

MDN: "Absolute length units represent a physical measurement when the physical properties of the output medium are known, such as for print layout." On high-dpi/print devices, `mm`/`cm`/`in` match their physical counterparts and `px` is defined relative to them (`1in = 2.54cm = 96px`, `1mm = 1cm/10`) ([MDN length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length)).

- **Use `mm` for the paper box and `@page`.** The A4 sheet is a known physical medium, so `width: 210mm; height: 297mm` on the on-screen "paper" element makes the screen box match the print box 1:1 (see `pdf-web-stack.md` Q4 for the responsive `transform: scale()` technique that keeps the mm box constant).
- **Do NOT use absolute units for `font-size` or reflow.** MDN explicitly warns: "Absolute lengths can cause accessibility problems because they are fixed and do not scale according to user settings. For this reason, prefer relative lengths (such as `em` or `rem`) when setting `font-size`" ([MDN length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length)). Use `rem` for type scale, `ch` for measure/line-length, and viewport/`%` units for the Reading-Mode column.
- **Pitfall of mixing:** setting the paper in `mm` but text in `px` re-introduces DPI drift MDN warns about; setting text in `mm` breaks user font-scaling. The clean split is: physical geometry in `mm`, everything typographic in `rem`/`em`/`ch`.

---

## 3. Layout: Flexbox, Grid, `grid-template-areas`, subgrid, `gap`

- **Grid for the Aside/Main two-column paper; Flexbox for 1-D runs.** For the fixed two-column A4 layout, CSS Grid with **named areas** is the most maintainable option. `grid-template-areas` "specifies named grid areas, establishing the cells in the grid and assigning them names," referenced by grid items via `grid-area`; each row is a string, repeated names form a rectangular named area (non-rectangles are invalid), and a `.` null-cell token marks empty space ([MDN `grid-template-areas`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)). This makes the Paper→Reading reflow a matter of redefining the areas at a breakpoint rather than re-ordering DOM. **Baseline "widely available since October 2017."**
- **`subgrid` to align Aside and Main to shared rows.** "If you set the value `subgrid` on `grid-template-columns`, `grid-template-rows` or both, instead of creating a new track listing, the nested grid uses the tracks defined on the parent"; parent `gap` and line names pass into the subgrid ([MDN Subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid)). Useful if you want section headings in the aside to line up with rows in main. **Baseline "widely available since September 2023."**
- **`gap` for spacing** (works in both Grid and Flexbox) instead of margins on children — avoids the margin-collapse and last-child edge cases that complicate fragmentation.

Guidance: reach for Flexbox when content dictates size along one axis (a header row, a tag list), and Grid when you are placing content into a known 2-D structure (the sheet itself). The two named-area definitions (Paper vs Reading) are the cleanest expression of this project's dual layout.

---

## 4. Responsive strategy: media queries vs container queries vs `:has()`

- **Media queries** remain correct for the true global switches: the **viewport** breakpoint that flips Paper Mode → Reading Mode, and the `print` media type used during PDF capture. (`@media print` / `@media (min-width: …)`.)
- **Container queries (`@container`)** apply styles "based on the size, style properties, or scroll state of a parent container element, rather than the viewport." You opt an element into being a query container with `container-type: inline-size` (optionally `container-name`), then `@container (width > 400px) { … }` ([MDN `@container`](https://developer.mozilla.org/en-US/docs/Web/CSS/@container)). Use these when a component (e.g. the aside, or a repeated entry card) should restyle based on the width it is actually given, not the screen — this is what keeps a component correct in both the wide A4 aside and the narrow Reading column. **Baseline "widely available since February 2023."**
- **`:has()` for state-/content-driven layout.** `:has()` "represents an element if any of the relative selectors passed as an argument match at least one element," enabling parent/previous-sibling selection (e.g. `h1:has(+ p)`), and it takes the specificity of its most specific argument, "the same way as `:is()` and `:not()`" ([MDN `:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)). Use it to style a container based on what it contains (e.g. an entry `:has(> img)` gets a two-column internal layout) without JS. **Baseline "widely available since December 2023."**

When to use which: **viewport/print → media query; the element's own available space → container query; presence/state of descendants or siblings → `:has()`.** All three are now widely available, so the choice is about the trigger, not support.

---

## 5. Theming & custom properties

- **Custom properties (`--*`)** are the base theming primitive; define palette/spacing tokens once on `:root` and consume with `var()`. (Astro scoped `<style>` still lets custom properties cascade normally; `define:vars` can inject build-time values — see `astro-coding-standards.md` §7.)
- **`color-scheme`** lets an element declare which schemes it renders in. UAs then adapt "the color of the canvas surface… default colors of scrollbars… default colors of form controls… other browser-provided UI." Values: `normal`, `light`, `dark`, `light dark`, and `only light`/`only dark` to forbid UA overrides ([MDN `color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)). Set `color-scheme: light dark` on `:root`. **Baseline "widely available since January 2022."**
- **`prefers-color-scheme`** media feature "detect[s] if a user has requested light or dark color themes… through an operating system setting… or a user agent setting," with values `light` and `dark` ([MDN `prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)). **Baseline "widely available since January 2020."** For a manual light/dark toggle, drive it by setting `color-scheme` / a `data-theme` attribute and let `prefers-color-scheme` be the default.
- **`light-dark()`** "accepts two colors… and returns a color… based on the active color scheme, without needing a `prefers-color-scheme` media feature." It REQUIRES `color-scheme: light dark` (typically on `:root`) and returns the first color for light, the second for dark ([MDN `light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)). This collapses each themed property to one line: `color: light-dark(#333, #eee)`. **Baseline "newly available since May 2024"** — newer than the rest, so if you need older-browser support, keep a `@media (prefers-color-scheme: dark)` fallback or gate with `@supports`.
- **Modern color — `oklch()`.** `oklch()` "expresses a given color in the Oklab color space," the cylindrical (Lightness/Chroma/Hue) form; its `L` is "the perceived lightness… different from the `L` in `hsl()`," giving perceptually uniform adjustments and access to a wider gamut than sRGB ([MDN `oklch()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)). Authoring the palette in `oklch()` makes generating matched light/dark pairs and accessible contrast steps predictable. **Baseline "widely available since May 2023."**
- **`color-mix()`** "takes one or more `<color>` values and returns the result of mixing them in a given colorspace by a given amount," accepting interpolation spaces including `oklch`, `oklab`, `srgb`, `lab`, `hsl` (polar spaces allow a hue-interpolation method) ([MDN `color-mix()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)). Use `color-mix(in oklab, var(--accent) 20%, white)` to derive tints/shades from one token. **Baseline "widely available since May 2023."**
- **`@property` (typed custom properties)** "is used to explicitly define CSS custom properties, allowing for property type checking and constraining, setting default values, and defining whether a custom property can inherit." Required descriptors are `syntax` (e.g. `"<color>"`, `"<length>"`) and `inherits`; `initial-value` is required unless `syntax` is `"*"` ([MDN `@property`](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)). The payoff is type safety and — because the browser then knows the type — the ability to **animate/interpolate** a custom property (e.g. a `<percentage>` progress value) that a plain `--var` cannot. **Baseline "newly available since July 2024"** — the newest theming primitive here; only needed if you animate custom properties, otherwise plain `--*` suffices.

---

## 6. Architecture & maintainability

- **Cascade layers (`@layer`).** `@layer` "declare[s] a cascade layer and can also be used to define the order of precedence." Within layers, "styles that are not defined in a layer always override styles declared in… layers," and "the first declared layer gets the lowest priority and the last declared layer gets the highest priority" (reversed for `!important`). The stated benefit: "you do not have to ensure that a selector will have high enough specificity to override competing rules; all you need to ensure is that it appears in a later layer" ([MDN `@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)). For a single scoped stylesheet, a small layer order (e.g. `@layer reset, base, components, print`) keeps specificity fights out of the codebase. **Baseline "widely available since March 2022."**
- **Native CSS nesting.** "CSS nesting is different from CSS preprocessors such as Sass in that it is parsed by the browser." The `&` nesting selector represents the parent and is **mandatory for compound selectors** (`&.b` = `.a.b`, whereas `.b` = `.a .b` because the browser inserts a descendant combinator); its specificity is "calculated using the highest specificity in the associated selector list," like `:is()`. A nested selector without a combinator is treated as a type selector ([MDN Using CSS nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting/Using_CSS_nesting)). Native nesting keeps Astro scoped `<style>` blocks readable without a preprocessor. (See §"Could not verify" for the Baseline date — the MDN guide page did not render a Baseline badge in the fetch.)
- **Logical properties & values (i18n — this site is it/en).** They "control layout through logical rather than physical direction and dimension mappings," using `block`/`inline` axes so "content translated into languages with different writing modes will be rendered as intended" ([MDN Logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values)). Prefer `margin-inline`, `padding-block`, `inset-inline-start`, `border-inline-end`, etc., over `margin-left`/`padding-top`. Both project languages are LTR, so the visual result is identical today — but logical properties are the correct default and cost nothing. (Spec: [CSS Logical Properties L1](https://drafts.csswg.org/css-logical/); MDN did not render a single-page Baseline badge — individual properties like `margin-inline` are widely available.)
- **`:where()` / `:is()` for specificity discipline.** `:where()` "takes a selector list… and selects any element that can be selected by one of the selectors"; crucially "`:where()` always has 0 specificity, whereas `:is()` takes on the specificity of the most specific selector in its arguments" ([MDN `:where()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:where)). Use `:where(...)` for resets and base defaults so any later rule overrides them without specificity escalation; use `:is(...)` to compact selector lists where you DO want normal specificity. **`:where()` Baseline "widely available since January 2021."**

---

## 7. Fonts (must be fully loaded before PDF capture)

- **`@font-face` + self-host.** Self-hosting removes the network race from the deterministic PDF build (see `pdf-web-stack.md` Q2).
- **`font-display` and the timeline.** The descriptor governs three periods — **block** (invisible fallback shown; if the font loads here it is used), **swap** (visible fallback shown; font swapped in when it loads), and **failure** (fallback becomes permanent). Values ([MDN `font-display`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)):
  - `block` — "short block period and an infinite swap period."
  - `swap` — "extremely small block period and an infinite swap period."
  - `fallback` — "extremely small block period and a short swap period."
  - `optional` — "extremely small block period and **no swap period**."
  - `auto` — UA decides.
  - **`optional` is a determinism hazard for PDF capture:** with no swap period, "if the custom font hasn't loaded by the end of the small block period, the fallback font will be used permanently for that page view, even if the custom font loads later." For a build that must render the branded fonts every time, avoid `optional`; prefer `block` (or `swap`) AND gate the capture on `document.fonts.ready` (see `pdf-web-stack.md` Q2, which already flags the `optional` pitfall via `FontFaceSet`). **`font-display` is Baseline "widely available since January 2020."**
- **Variable fonts.** A variable font lets you "access all the variations contained in a given font file via CSS and a single `@font-face` reference," typically at "smaller or about the same size as the 4 [static files] you might load for body copy." Declare ranges in `@font-face` (`font-weight: 125 950; font-stretch: 75% 125%;` with `format("woff2-variations")`) and select via standard properties or `font-variation-settings`. Registered axes: `wght`, `wdth`, `slnt`, `ital`, `opsz` (lowercase); custom axes use uppercase 4-letter tags ([MDN Variable fonts guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide)). One variable file can cut the number of font requests the PDF build must await.
- **`size-adjust` to reduce layout shift / match fallbacks.** The descriptor "defines a multiplier for glyph outlines and metrics… [to] harmonize the designs of various fonts when rendered at the same font size"; setting it on the fallback `@font-face` matches its metrics to the web font so swap-in does not reflow ([MDN `size-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust)). Even with `font-display: block`, a metrics-matched fallback keeps line breaks stable if capture ever races the font. **Baseline "widely available since September 2023."**

---

## 8. Accessibility

- **`prefers-reduced-motion`.** Detects a user setting "to minimize the amount of non-essential motion"; `reduce` evaluates true (`@media (prefers-reduced-motion)` ≡ `: reduce`), `no-preference` false ([MDN `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)). Wrap any transitions (theme toggle, drawer slide) so they collapse under `reduce`. **Baseline "widely available since January 2020."**
- **`:focus-visible` for keyboard focus rings.** It "applies while an element matches `:focus` and the UA determines via heuristics that the focus should be made evident" — i.e. it shows the ring for keyboard navigation but not for mouse clicks, unlike `:focus` which "always targets the currently focused element" ([MDN `:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)). Style focus with `:focus-visible` (never remove focus outlines without a replacement). **Baseline "widely available since March 2022."**
- **Respect user font-size** — reiterating §2: set type in `rem`/`em`, never `px`/`mm`, so OS/browser font scaling works ([MDN length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length)).
- **Sufficient contrast** — authoring the palette in `oklch()` (§5), whose `L` is perceived lightness, makes it straightforward to keep predictable lightness deltas between text and background in both themes ([MDN `oklch()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)). (WCAG contrast ratios themselves are a WCAG/APCA topic, outside these CSS primary sources.)

---

## 9. Baseline availability summary

Per MDN's Baseline badges (source: `web-platform-dx`). "Widely available" = safe with no gating; "Newly available" = shipped across current engines but gate with `@supports`/fallbacks if you support older versions.

| Feature | Baseline | Since | Note for this project |
|---|---|---|---|
| `break-before/after/inside` (page context) | Widely available | Jan 2019 | Core break control; use over `page-break-*` |
| `grid-template-areas` | Widely available | Oct 2017 | Paper vs Reading layouts |
| `font-display` | Widely available | Jan 2020 | Avoid `optional` for PDF |
| `prefers-color-scheme` | Widely available | Jan 2020 | Default theme signal |
| `prefers-reduced-motion` | Widely available | Jan 2020 | Gate transitions |
| `:where()` | Widely available | Jan 2021 | Zero-specificity resets |
| `color-scheme` | Widely available | Jan 2022 | Enables `light-dark()` |
| `@layer` (cascade layers) | Widely available | Mar 2022 | Specificity discipline |
| `:focus-visible` | Widely available | Mar 2022 | Keyboard focus rings |
| `oklch()` | Widely available | May 2023 | Perceptual palette |
| `color-mix()` | Widely available | May 2023 | Derive tints/shades |
| `@container` (container queries) | Widely available | Feb 2023 | Component-context restyle |
| subgrid | Widely available | Sep 2023 | Align aside/main rows |
| `size-adjust` (`@font-face`) | Widely available | Sep 2023 | Metrics-matched fallback |
| `:has()` | Widely available | Dec 2023 | Content/state-driven layout |
| `light-dark()` | Newly available | May 2024 | One-line theming; keep fallback |
| `@property` | Newly available | Jul 2024 | Only if animating custom props |
| `@page { size }` | Newly available | Dec 2024 | Works in Chromium capture |
| `print-color-adjust` (unprefixed) | Newly available | May 2025 | Also author `-webkit-` alias |

---

## Things I could NOT verify from a primary source

- **A rendered Baseline badge for the "Using CSS nesting" guide page and the "CSS logical properties and values" module landing page.** The MDN fetches for those two pages did not surface a Baseline status line (guide/module landing pages often don't carry the per-feature badge). Native CSS nesting and logical properties are broadly shipped in current engines, but I am not asserting a specific Baseline date for them from these pages. If an exact date is load-bearing, check the individual property pages (e.g. `margin-inline`) or the `CSSNestedDeclarations` interface page, which MDN notes affects nested-rule ordering in older engines.
- **`-webkit-print-color-adjust` on the MDN `print-color-adjust` page.** The fetched content did not include the alias section in its visible excerpt; the alias recommendation here rests on the unprefixed page's "newly available since May 2025" status plus the existing `pdf-web-stack.md` Q1 finding (Playwright/Puppeteer docs telling you to use `-webkit-print-color-adjust`). Treat authoring both spellings as belt-and-suspenders, not a single-source claim.
- **Exact `@page`/`size` spec section numbers.** The A4 = 210×297mm and length semantics are cited to MDN `@page/size` and the CSS Paged Media L3 spec landing page; I did not pin a sub-section anchor for the `size` descriptor within css-page-3.
- **WCAG/APCA contrast thresholds.** Out of scope for MDN/CSS-spec primary sources; contrast *ratios* live in the WCAG spec, which was not fetched here. Only the CSS color primitives (`oklch`, `color-mix`, `light-dark`) are asserted.

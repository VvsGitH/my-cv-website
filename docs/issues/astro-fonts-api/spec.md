# Spec: The text faces move to Astro's fonts API

Status: shipped — ADR-0024

The four text faces (JetBrains Mono, Atkinson Hyperlegible, Primera Signature) are declared by hand in `src/styles/fonts.css` and given metric-matched fallbacks by `fontaine`, which this repo has to run as a PostCSS plugin (`scripts/fontaine-after-imports.mjs`) because its own Vite plugin runs at a stage where it sees nothing. Astro 7.3.1 ships a stable `fonts` config option and a `<Font>` component that does the same job in-pipeline, and adds the one thing the current arrangement has never had: `<link rel="preload">`.

This spec is the migration. It does **not** touch the subsetting pipeline, which Astro cannot do and will not replace.

## Problem Statement

Three things are wrong with the way the faces are wired today, and none of them is visible on the page.

1. **The fallbacks come from a plugin run out of position.** ADR-0020 records the failure this already caused once: fontaine as a Vite plugin at `enforce: 'pre'` runs before Vite inlines CSS `@import`s, so for the whole life of ADR-0012 it saw five import lines, found no `@font-face`, and generated nothing — while the tokens in `fonts.css` named `'X fallback'` faces that did not exist. `scripts/fontaine-after-imports.mjs` is 70 lines of repair for that, and the repair is itself positional: PostCSS is the one stage where the imports are inlined *and* the `url()`s are still as authored. Any change to how Vite handles CSS puts it back in the failure mode, silently.
2. **The fallback names are written by hand.** `src/styles/fonts.css:66-86` spells out `'JetBrains Mono fallback'`, `'Atkinson Hyperlegible fallback'`, `'Primera Signature fallback'` because fontaine appends itself only to a literal `font-family` and every one of ours is a `var()`. A face added without its hand-written name gets no fallback and nothing says so.
3. **Nothing is preloaded.** The text faces are `font-display: swap` with metric-matched fallbacks (ADR-0020), which is the right half of the arrangement; the other half — telling the browser to fetch the face before the CSS that references it has been parsed — was never built. There is not one `rel="preload"` in `src/layouts/BaseLayout.astro`.

## What this does not change

**The subsetting pipeline stays exactly as it is.** Astro ships no subsetter: `node_modules/astro/dist/assets/fonts/providers/local.js` normalizes the paths in `variants[].src` and reads metrics off the file, nothing more — the subsets in the remote providers come pre-cut from Google/Fontsource. So `scripts/subset-fonts.mjs`, `src/assets/raw-fonts/`, the committed `.woff2` under `src/assets/fonts/`, the charset, and ADR-0020's rule that CI never runs the subsetter all survive untouched. Astro's `local()` provider consumes the subsets this pipeline produces.

Subsetting *can* be moved into the build — it was prototyped and it works. That is a separate decision, deliberately not taken here; see **Appendix: build-time subsetting** for what was verified and what it costs.

Nor does it change which face plays which role. `--font-name`, `--font-heading`, `--font-display`, `--font-body`, `--font-signature` keep their names and their meanings; only the right-hand side changes, from a literal family list to `var(--font-jetbrains-mono)`.

## Solution

Declare all four families in `astro.config.mjs` under `fonts`, with `fontProviders.local()` pointed at the already-subset `.woff2` files. Render `<Font>` once per family in both heads that exist — `BaseLayout.astro` and `src/pages/[locale]/og.astro` — with `preload` on the faces that paint first. Delete `fontaine`, `scripts/fontaine-after-imports.mjs`, the `vite.css.postcss` block, and the seven `@font-face` rules in `fonts.css`; keep the file for the role tokens, now pointing at Astro's CSS variables.

The icon face goes the same way: `src/styles/icons.css` gives up its `@font-face` and reads the family off a CSS variable. Everything else in that file — the glyph rules, the codepoints, the `!important` — stays where it is.

## Implementation Decisions

### The config

One entry per family, `provider: fontProviders.local()`, one `variants` entry per shipped cut — the same eight faces `fonts.css` and `icons.css` declare between them today, at the same weights and styles, with `display` carried over per family.

- `JetBrains Mono` → `cssVariable: '--font-jetbrains-mono'`, variants 400/700/800 normal, `fallbacks: ['monospace']`.
- `Atkinson Hyperlegible` → `cssVariable: '--font-atkinson'`, variants 400 normal, 700 normal, 400 italic, `fallbacks: ['sans-serif']`.
- `Primera Signature` → `cssVariable: '--font-primera-signature'`, variant 400 normal, `fallbacks: ['sans-serif']` — see the trap below about `cursive`.
- `icomoon` → `cssVariable: '--font-icomoon'`, one variant 400 normal, `display: 'block'`, `fallbacks: []`, `optimizedFallbacks: false`.
- `display: 'swap'` on the three text families. **`optional` remains forbidden** (ADR-0012, upheld by ADR-0020): it is a determinism hazard for the capture.

Weights and styles are declared explicitly rather than inferred. The local provider will read them off the file when omitted (`local.js:38`), but ADR-0020 records a pass that shipped ExtraBold declared at 900 and left `font-weight: 800` falling back to Bold — the weights are load-bearing and belong where a reader can see them.

### The fallbacks

Astro generates them itself, in-pipeline, from `core/optimize-fallbacks.js`. Two properties make it strictly better than what fontaine gives us today:

- **Per family, from the generic.** `infra/system-fallbacks-provider.js` maps `monospace → Courier New` and `sans-serif → Arial`, which is exactly the per-family pairing ADR-0020 had to configure by hand after `['Arial']` for everything put a proportional face behind a monospace one (`size-adjust: 134.59%` on the name).
- **Per weight.** `deriveFallbackVariant` splits at 700 and picks `Arial Bold` for the bold cuts, which carries its own `xWidthAvg` (983 against Arial's 913). The current fontaine config has no equivalent: every Atkinson cut gets the same Arial metrics. **This turned out not to be a win** — CSS matches family before weight, so the plain `Arial` fallback earlier in the chain takes the bold text and synthesises the weight, and `Arial Bold` is never reached. Measured after the fact in ADR-0022; the shipped behaviour equals fontaine's, it is not better.

The generated names are appended to the CSS variable by Astro, so **nothing is written by hand** and problem 2 above stops being possible. Verified on a prototype build of this project: JetBrains Mono came out at `size-adjust: 99.9837%` against Courier New — ADR-0020's measured 99.98%, to the digit, with the metrics read off the subset file.

### Preload

`<Font>` takes `preload` as `true` or a filter (`core/filter-preloads.js`). Preload the faces the first paint actually needs and no more:

- JetBrains Mono 800 (the name and every section heading)
- Atkinson Hyperlegible 400 (all body prose)
- icomoon (the Toolbar, and `block` means the icons are *invisible*, not fallback-shaped, until the face lands — and the subset is **1728 bytes**)

The other five faces stay unpreloaded — Bold, italic and the signature are below the fold or rare, and a preload for each would compete with the three that matter. `og.astro` gets no preload at all: a headless screenshot waits on `document.fonts` and gains nothing from a hint.

### The icon face goes through Astro too

One mechanism, not two: `icomoon` is declared in the config beside the text families, and `src/styles/icons.css` keeps everything except its `@font-face`.

- **`display: 'block'` is not given up.** `DisplaySchema` accepts `block`, and `collect-component-data.js` passes it straight through. Verified on a built page: `@font-face{font-family:icomoon-6ffeb13257cb0997;src:url("/my-cv-website/_astro/fonts/90f02f36e7093083.woff2") format("woff2");font-display:block;…}`. ADR-0020's rule — the text faces `swap`, the icons `block`, because the fallback for a private-use codepoint is tofu and briefly-nothing beats briefly-tofu — survives intact.
- **`fallbacks: []` gives a variable with no generic in it.** Verified: `:root{--font-icomoon:icomoon-6ffeb13257cb0997;}`, one family and nothing behind it. `optimizedFallbacks: false` is belt-and-braces — with an empty `fallbacks`, `optimizeFallbacks` bails on the first line and `collect-font-assets-from-faces` does not even collect the face for metrics — but it is worth writing anyway, because it states the intent at the one place a reader will look.
- **The `!important` stays in `icons.css`**, on `font-family: var(--font-icomoon) !important`. Verified in the built CSS as `font-family:var(--font-icomoon)!important`. Its reason is unchanged: an extension that rewrites page fonts would otherwise turn every icon into a missing-glyph box.
- **What leaves `icons.css` is the `@font-face` block and nothing else.** The header comment, the glyph rules, the codepoints, and the note about the dropped `speak` descriptor all stay — including the line that says adding an icon means a codepoint in `scripts/subset-fonts.mjs` and a rule here, which is still true.

Verified end to end rather than argued: with the icon family wired this way, `npm run build` is clean (0 errors, `Copying fonts (1 file)`) and **the whole suite passes, 90/90** — `tests/pdf.spec.ts` included, which asserts `icomoon-feather` is embedded by name in both PDFs.

### Where the CSS lands

`<Font>` emits `<style set:html={data.css}>` plus the preload links, inline in the head, per page — a `@font-face` block and a `:root { --font-x: ... }` (`infra/minifiable-css-renderer.js`). That declaration is **outside `global.css`'s `@import ... layer(base)` chain and unlayered**. Variable resolution does not care about layers, so `fonts.css`'s tokens read it normally; but it is an exception to the project's layer discipline and belongs in the ADR, not in a comment nobody reads.

It also means the faces exist only where `<Font>` is rendered — and **one page does not go through `BaseLayout.astro`**. `src/pages/[locale]/og.astro` writes its own `<html>` and `<head>` and reaches the faces purely by importing `global.css` (ADR-0009: the link-preview image is a route, not a composed screenshot). It needs its own `<Font>` calls, or the OG card is screenshotted in Courier New and Arial and nothing in the suite says so.

**All four families go in both heads, the icon face included.** The card renders `Sheet content sheet={1}`, and the only icon inside a Sheet is the certification link (`CertificationsBlock.astro:22`), which sits on Sheet 2 (`paperSheet: 2` in the content files) — so today the card draws no icon. But which Sheet a Block sits on is content, not layout (Explicit Paging, ADR-0002): a content edit that moves the certifications to Sheet 1 would otherwise silently produce a card with a blank where the icon should be, since `font-display: block` paints nothing when the family resolves to no face at all.

## The traps, ranked by how quietly they fail

1. **`fallbacks` defaults to `['sans-serif']`** (`dist/assets/fonts/constants.js:6`). Leave it off JetBrains Mono and Astro puts Arial behind a monospace face — the exact 134.59% stretch ADR-0020 measured and fixed. It fails as slightly-wrong metrics on the one line where they are most visible, the name.
2. **`cursive` has no system metrics.** `DEFAULT_FALLBACKS` covers serif, sans-serif, monospace, system-ui, ui-serif, ui-sans-serif, ui-monospace — and nothing else. With `fallbacks: ['cursive']`, `optimizeFallbacks` finds no local fonts and returns `null`: the signature gets **no** metric-matched fallback at all, where fontaine gives it an Arial-derived one today. Hence `['sans-serif']` above, which keeps today's behaviour at the cost of ending the chain in `sans-serif` rather than `cursive`. ADR-0020 already records that the two faces do not share metrics anyway (`.signature` is set at 1.6rem for that reason), so this is small — but it is a deliberate downgrade of the declared chain and must be written down.
3. **Optimization needs the generic last.** `optimizeFallbacks` reads the *last* entry of `fallbacks` and bails if it is not a generic family. `['Courier New']` alone generates nothing.
4. **The CSS family name carries a hash.** `core/resolve-family.js` sets `uniqueName` to `${name}-${hashObject(family)}`, and that is what lands in the stylesheet: the built page declares `font-family:"JetBrains Mono-2e5a6da14beb6ee1"`, not `"JetBrains Mono"`. Two consequences. Any literal `font-family: 'JetBrains Mono'` left anywhere in CSS silently stops matching — every one of ours is a `var()`, so this is a check, not a change. And the hash moves whenever *anything* in that family's config changes, so nothing may be written that depends on the name being stable. The PDF is unaffected: it embeds the font program, which carries its own PostScript name.
5. **`document.fonts` changes shape.** Measured on a built page, the generated fallback face is named `"JetBrains Mono-2e5a6da14beb6ee1 fallback: Courier New"` — the hash of trap 4, plus the system face it stands in for — where today it is `"JetBrains Mono fallback"`. `tests/support/page.ts:16` iterates `document.fonts` and loads each face; its `catch` for absent `local()` faces stays necessary and its comment, which says Fontaine, needs updating.

6. **A biome suppression stops suppressing.** `icons.css:14` carries `biome-ignore lint/a11y/useGenericFontNames`, and behind a `var()` biome can no longer see a font name at all — the rule stops firing and the suppression becomes `suppressions/unused`, which is a warning on `npm run lint` (exit code still 0; CI does not run lint). Delete that suppression and move its sentence — *a fallback would render the missing-glyph box instead of the icon* — to the `fallbacks: []` in the config, which is where the decision now lives. The `noImportantStyles` suppression stays: that rule still fires.

What is **not** a trap, checked rather than assumed:

- **`base` is handled.** `dist/assets/fonts/vite-plugin-fonts.js:51` builds the URL as `joinPaths(settings.config.base, assetsDir)`, and a prototype build confirmed it: the emitted face reads `src:url("/my-cv-website/_astro/fonts/75f56021cf8e8fcd.woff2")`. The captures run against `astro preview` over HTTP (`scripts/render-captures.mjs:51`), not `file://`, so hashed URLs resolve there as they do in production.
- **The PDF assertions survive.** `tests/pdf.spec.ts:25` asserts PostScript names read out of the PDF's font resources (`JetBrainsMono-Regular`, …). Those come from inside the font program, which this migration does not touch — the same subset files ship, only their URL and their declaration site change.

## Out of Scope

- Any change to the charset, the `variants` array in `scripts/subset-fonts.mjs`, or which cuts are shipped.
- Moving the subsetting into the build — verified as possible, deliberately deferred; see the Appendix.
- Primera Signature's licensing question (ADR-0020 records it as known and accepted).
- Switching any family to a remote provider, or to a variable font.

## Acceptance Criteria

1. `fontaine` is gone from `package.json`, `scripts/fontaine-after-imports.mjs` is deleted, and `astro.config.mjs` has no `vite.css.postcss` block.
2. `src/styles/fonts.css` declares no `@font-face`; its role tokens resolve through Astro's CSS variables, and no `'X fallback'` name is written by hand anywhere.
   `src/styles/icons.css` declares no `@font-face` either, keeps every glyph rule and its `!important`, and `npm run lint` is warning-free.
3. The built HTML carries exactly three `<link rel="preload" as="font">` (the `preload` filter was verified to produce exactly one link for `[{ weight: 800 }]`): JetBrains Mono 800, Atkinson Hyperlegible 400, icomoon.
4. The built CSS contains one metric-matched fallback face per shipped cut, with `size-adjust` and the override trio, Courier New behind JetBrains Mono and Arial / Arial Bold behind Atkinson.
5. The icon face is emitted with `font-display: block` and its CSS variable holds one family and no generic.
6. The OG card routes render in the real faces — checked on the rendered card, not only on the CV pages.
7. `npm test` is green — in particular `tests/pdf.spec.ts` still finds all of `CV_FACES` by name, embedded, with no Type3.
8. Both PDFs are unchanged against the pre-migration build. This is the real check: the capture is gated on `document.fonts` and would print in fallbacks if a face stopped arriving.
9. The measured drift between each real face and its generated fallback is recorded, so it can be compared against ADR-0020's numbers (0.01% on the name, 0.14% on body prose).

## Work Plan

Candidate tickets, in order:

1. **Declare the four families in `astro.config.mjs`** and render `<Font>` in **both** heads — `BaseLayout.astro` and `src/pages/[locale]/og.astro` — with `fonts.css`'s `@font-face` rules still in place. Nothing breaks; every page has two sets of declarations for the same families. Both heads must be wired before step 2 removes the old ones, or the OG card spends a commit in fallbacks.
2. **Move the role tokens onto the CSS variables** and delete the `@font-face` rules from `fonts.css`. Same move in `icons.css`: `font-family: var(--font-icomoon) !important`, its `@font-face` gone, its `useGenericFontNames` suppression gone with it.
3. **Remove fontaine** — the dependency, the PostCSS plugin, the `vite` block, and the hand-written fallback names.
4. **Add the preload filter** to `BaseLayout.astro` and verify the built HTML. `og.astro` gets none: a headless screenshot waits on `document.fonts` and gains nothing from a preload hint.
5. **Verify and measure** — PDF diff against the pre-migration build, fallback drift measured in the browser, `tests/support/page.ts`'s comment updated.
6. **Write the ADR**: what moved, why the icons did not, the unlayered head `<style>`, and the `cursive` downgrade. It supersedes ADR-0020 on the fallback-generation axis only; ADR-0012's self-hosting and hand-subsetting reasoning is untouched.

## Open Questions

- The font CSS moves from one cached stylesheet to an inline `<style>` in every page's head — five HTML outputs (`/`, `/it`, `/en`, and the two OG routes). Measure it before deciding it does not matter; the preload links have to be inline regardless.
- Do we want `optimizedFallbacks: false` and a hand-written chain for Primera Signature instead of accepting the `cursive` downgrade?

## Appendix: build-time subsetting

The obvious question this spec provokes — if the faces are being declared in the config anyway, can the subsetting move into the build and the generated `.woff2` leave the repo? — was answered by prototype rather than by reading. Two shapes were built and run against this project on `astro@7.3.1`; both work, and they fail very differently.

**A. A custom `FontProvider` that subsets inside `resolveFont`.** `FontProvider` is a public interface (`dist/assets/fonts/types.d.ts`): `init({ storage, root })` hands you an unstorage-backed cache, `resolveFont` may be async, and the `src` URLs it returns are read straight off disk by `CachedFontFetcher`. So a provider can read `src/assets/raw-fonts/…`, run `subset-font`, write to `node_modules/.astro/`, and return that path. Verified end to end: the build subsetted (92164 → 34380 bytes), emitted `dist/_astro/fonts/75f56021cf8e8fcd.woff2`, and **that file is byte-identical (`md5 b1ffb69b…`) to the `src/assets/fonts/jetbrains/JetBrainsMono-Regular.woff2` we ship today** — same subsetter, same charset, same bytes. Astro read the metrics off the subset and generated `size-adjust: 99.9837%` against Courier New, which is ADR-0020's measured 99.98% to the digit.

**B. An Astro integration that subsets in `astro:config:setup`, then hands the generated files to the built-in `local()` provider** via `updateConfig({ fonts })`. Also verified end to end.

### Why B and not A, if this is ever done

The provider runs inside unifont, which Astro creates with `throwOnError: false` (`infra/unifont-font-resolver.js`). Measured, not inferred:

- **A, with an unreadable source: the build succeeds.** Exit code 0, two `[WARN]` lines, `Copying fonts (0 files)`, and the page ships `--font-jetbrains-mono: "JetBrains Mono-…", monospace` with **no `@font-face` at all**. The CV renders in Courier New and the build says Complete.
- **B, with the same broken source: the build fails.** `[ERROR] [subset-fonts] An unhandled error occurred while running the "astro:config:setup" hook`, exit code 1.
- For reference, the built-in `local()` provider pointed at a missing file also fails loudly (`UnknownFilesystemError`), because the read happens outside unifont's swallow. Putting the subsetter inside a provider is what converts a hard failure into a warning.

The suite would still catch A's silent failure — `tests/pdf.spec.ts` asserts every face in `CV_FACES` by name and a PDF set in Courier New has none of them — but at `npm test`, not at `npm run build`.

Two further measurements, either way:

- **`resolveFont` runs twice per build**, once per Vite environment (observed in the log). A provider that subsets does the work twice unless it caches; an integration hook does it once.
- **Cost is not the objection.** `npm run fonts:subset` takes **~1.0s wall for all eight faces**, and it is idempotent — re-running it leaves the working tree clean, which is how the byte-identity above was confirmed.

### What it would actually buy, and what it would cost

- **Buy**: the manual out-of-band step disappears, and with it ADR-0012's named hazard — "add a face and commit without running the script". `src/assets/fonts/` (161 kB of generated binaries) could leave the repo.
- **Cost**: `subset-font` moves from a tool the owner runs to a dependency of every build, including CI — reversing ADR-0012's "CI never runs the subsetter" for real, not just on the raw-folder axis ADR-0020 already reversed. The shipped bytes stop being reviewable in a diff. And ADR-0020's masquerading-subset trap (a subset dropped into `raw-fonts/` round-trips silently) gets no better and no worse.

**Recommendation: not in this migration.** It is a second, independent decision with its own ADR, and bundling it would mean changing what ships and how the fallbacks are generated in the same commit — leaving nothing to diff against if the PDFs move. If it is taken later, take shape B.

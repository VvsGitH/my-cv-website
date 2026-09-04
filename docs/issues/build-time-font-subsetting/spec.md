# Spec: The subsetting moves into the build, and the derivatives stop being versioned

Status: shipped — ADR-0023

Two changes that only make sense together. **The subsetting runs during the build** instead of being a command the owner remembers to run. And because it does, **the generated `.woff2` stop being committed at all**: the sources move into `src/assets/fonts/`, `src/assets/raw-fonts/` disappears, and the repo versions one asset per face instead of two.

This is the step ADR-0022 deferred, and the shape it named: an integration hook, not a custom font provider.

## Problem Statement

The pipeline today is correct and reproducible, and it still has three seams.

1. **The subsetter is a step someone has to remember.** ADR-0012 named the hazard when it created it: add a face to `variants`, commit without running `npm run fonts:subset`, and nothing local reproduces the failure. ADR-0022 made the recipe five steps, four of them manual.
2. **Two coupled assets are versioned for every face.** `src/assets/raw-fonts/` (**2.0 MB**, 25 files) holds the sources; `src/assets/fonts/` (**180 kB**, 8 files) holds what the subsetter makes of them. The second is derived from the first by a deterministic function, and nothing in the repo enforces that the two agree. A source can be updated and its subset left stale — or the reverse — and the build stays green, because the build only ever reads the derivative.
3. **The manifest is written twice.** `scripts/subset-fonts.mjs` lists which cuts get subset; `fonts.config.mjs` lists which cuts get declared. Adding a weight means editing both, and forgetting one is silent in a different way each time: miss the script and the config points at a file that does not exist (red build, at least); miss the config and a subset ships that nothing references.

## What was already verified

Prototyped and measured on `astro@7.3.1` before this spec (recorded in ADR-0022 and `docs/issues/astro-fonts-api/spec.md`):

- **The output is byte-identical.** A build-time subset of `JetBrainsMono-Regular.woff2` came out at `md5 b1ffb69b…`, the same bytes as the committed `src/assets/fonts/jetbrains/JetBrainsMono-Regular.woff2`. Subsetting is a pure function of source + charset + subsetter version.
- **Cost is not the objection.** All eight faces take **~1.0s wall**, and Astro reads the metrics off whatever it is given, so the generated fallbacks are unchanged (`size-adjust: 99.9837%` against Courier New, as ADR-0020 measured).
- **The hook, not a provider.** A custom `FontProvider` that subsets inside `resolveFont` runs inside unifont, which Astro creates with `throwOnError: false`: an unreadable source **succeeds** the build with two warnings and ships the page in Courier New. The same failure in `astro:config:setup` is a red build, exit code 1. Also measured: `resolveFont` runs **twice per build** (once per Vite environment), `astro:config:setup` runs **once**.
- **When the hook runs**, measured with a probe: on every command, because `astro:config:setup` is not a build hook — it is where an integration is handed the config, so Astro calls it whenever it loads one. `astro build` (once, `command: 'build'`), `astro dev` (`'dev'`), `astro check` and `astro sync` (both `'sync'`), and **`astro preview` too** (`'preview'`). That last one matters here: `scripts/render-captures.mjs` starts a preview server programmatically, so an unguarded hook would subset on every capture run, to serve a `dist/` that already holds the fonts.

## The new decision: one asset per face

With the subsetting in the build, `src/assets/fonts/` no longer needs to hold anything a human put there. So the sources move into it and the derivatives leave the repo:

```
src/assets/fonts/<family>/…      the sources, committed (was raw-fonts/)
.astro/integrations/subset-fonts/  the generated subsets, git-ignored
```

`src/assets/raw-fonts/` is deleted. `docs/coding-standards.md` says local fonts live under `src/assets/`, and after this there is exactly one font folder to be right about.

**What it buys.** The class of bug in Problem 2 stops existing: there is no second copy to fall out of step with the first, because the copy is made fresh on every build from the only file in the repo. `git status` after a build stays clean — today `npm run fonts:subset` can produce a diff. The repo drops 180 kB of binaries it was carrying for no reason other than that CI could not make them.

**What it costs, and this is the real trade.** The shipped bytes stop being reviewable. Today a subsetter upgrade that changes the output shows up as a diff on eight tracked files; after this it shows up nowhere, and the only evidence is the byte counts in the build log. Two mitigations, both cheap:

- **Pin `subset-font` to an exact version** (it is `^2.7.0` today). The repo already does this for the tool whose output it cannot diff — `"@biomejs/biome": "2.5.12"`, no caret. Same reasoning, same treatment.
- **Keep the byte numbers in the build log**, as `scripts/subset-fonts.mjs` already prints them (`92164 -> 34380 bytes`). They are how ADR-0020's masquerading subset was diagnosed, and they are the only remaining window onto the derivative.

**What must not happen.** The generated files must never be written into `src/assets/fonts/`. Subsetting is idempotent (ADR-0020), so a subset sitting where a source belongs round-trips and reports success — and with the derivative uncommitted, that failure is no longer merely invisible, it is **unrecoverable**: there is no second copy to compare against, and every glyph outside the charset is gone from the only file left. The output directory is outside `src/` for that reason, and the guard below exists for the same one.

## Design

### The manifest is `fonts.config.mjs`, and only that

Two exports, both in that file. The families as they are today, with `src` naming the *generated* file; and the table of what gets cut from what, to which charset:

```js
// fonts.config.mjs
import { subsetOf } from './scripts/font-paths.mjs';

const TEXT = ' !"#$%…';                       // as scripts/subset-fonts.mjs holds it today
const ICONS = String.fromCodePoint(0xe900, 0xe901, /* … */);

/** Source, relative to `src/assets/fonts/`, to the charset it is cut to. */
export const FONT_SUBSETS = {
  'jetbrains/JetBrainsMono-Regular.woff2': TEXT,
  'icons/icomoon-feather.ttf': ICONS,
  // …
};

export const ASTRO_FONTS_CONFIG = [
  // …
  { weight: 800, style: 'normal', src: [subsetOf('jetbrains/JetBrainsMono-ExtraBold.woff2')] },
];
```

**The source cannot ride along inside the family or the variant, and this was measured rather than assumed.** A `charset` key on a family is rejected by Astro's own validation — `! Unrecognized key: "charset"`, because `FontFamilySchema` is a zod strict object — and a `source` key inside a variant is a TypeScript error, `TS2353: 'source' does not exist in type 'Variant'`. So the subset table has to be its own export. `options` itself is a loose record at runtime, but the `Variant` interface is not, and this repo type-checks its config.

That means a source name is written twice: once as a key of `FONT_SUBSETS`, once in the `subsetOf()` call of the variant that uses it. Both are in the same file, usually a few lines apart, and **a mismatch is a red build** — `local()` reads the file to hash it and throws `UnknownFilesystemError` when it is not there. That is the trade against the alternative, which is generating the families from a single table; it buys one mention per source and costs a config that is computed rather than read. Not worth it at eight faces.

The icon codepoints move out of `scripts/subset-fonts.mjs` and into `ICONS` above, next to the family that uses them. `scripts/subset-fonts.mjs` keeps no list of its own: it reads `FONT_SUBSETS`.

### No `updateConfig`

The integration writes files and nothing else. It does **not** hand Astro a rewritten `fonts` array, because `updateConfig` **concatenates arrays** (`core/config/merge.js:33`): a config that declares `fonts` and an integration that updates it produce eight families, two per `cssVariable`, and Astro merges them into the same bucket and emits every face twice. Declaring the generated paths up front in `fonts.config.mjs` sidesteps the whole question and keeps the config declarative.

### Where the output goes

**Decided: `createCodegenDir()`, and no cache anywhere.**

`createCodegenDir()`, which `astro:config:setup` provides, returns `.astro/integrations/<integration name>/` and creates it. For an integration named `subset-fonts` that is `.astro/integrations/subset-fonts/` — derivable, so `subsetOf()` can name it statically, already git-ignored by the `.astro/` rule, inspectable (which matters for a directory whose contents are the only copy of what ships), and it survives a `node_modules` wipe. Astro's own build-time font cache, under `config.cacheDir`, is deliberately not shared.

**The generated tree mirrors the source tree**, `<family>/<basename>.woff2`, so `subsetOf('jetbrains/JetBrainsMono-Regular.woff2')` is `.astro/integrations/subset-fonts/jetbrains/JetBrainsMono-Regular.woff2` and the mapping needs no thought. The extension is always `.woff2`, including for the two `.ttf` sources: Astro reads the font type off the extension (`NodeFontTypeExtractor`), so keeping `.ttf` would declare `format("truetype")` over woff2 bytes. `subsetOf()` lives in `scripts/font-paths.mjs` — a leaf module holding only the output directory and this rule, imported by both `fonts.config.mjs` and the subsetter, importing nothing itself, so there is no cycle between the manifest and the tool that reads it.

**Not `.astro/fonts/`**, and not `node_modules/.astro/fonts/`: those are Astro's own font cache (`assets/fonts/constants.js` — `.astro/fonts/` in dev, `cacheDir/fonts/` in build). Sharing that directory is asking for a collision that will look like a caching bug.

### No cache, and the guard

**Decided: no cache.** The subsetter runs whole, once per `astro build` and once per `astro dev` start, at roughly **1.0s for all eight faces** — so nothing has to be invalidated, keyed or explained. A cache would have to key on the source bytes *and* the charset *and* the subsetter version, and getting that wrong ships a stale font from a green build; not having one cannot.

**The hook only does the work for `dev` and `build`.** `command` is in the hook's parameters, so this is one line, and the other two commands genuinely do not need it: `preview` serves `dist/`, where the faces were copied at build time, and under `sync` — which is what `astro check` reports as — the fonts plugin returns from `buildStart` before resolving anything (`vite-plugin-fonts.js:71`, `if (sync) return`), so nothing reads a font file. This also halves what `npm run build` pays, since the `astro check` half now skips it.

**What the write costs in dev, measured.** Touching a font file that `local()` resolved — identical bytes, new mtime — makes Astro log `[assets] Font file updated` and restart the Vite server (`assets/fonts/vite-plugin-fonts.js` watches those paths). So rewriting the generated files while a dev server is up costs a restart. It does **not** loop: a Vite restart does not re-run `astro:config:setup` (probed — the hook fired once and stayed at once across the restart), so the write cannot re-trigger itself.

**Decided: the write is conditional, the subsetting is not.** Read the existing output, compare the bytes, skip the write when they are equal — `existing?.equals(output)`, one line. There is no key, no hash, no state file and nothing to invalidate, because the subsetter has already done the work by the time the comparison happens; what it saves is a pointless mtime bump and the dev-server restart that follows it. A real cache — one that skips the *work* — would have to key on the source bytes and the charset and the subsetter version, and getting that wrong ships a stale font from a green build. That is the system this deliberately is not.

**The guard ADR-0020 asked for.** *"Worth a guard in the script if it ever happens twice."* It is now load-bearing rather than nice to have: **a face whose subset is not smaller than its source did not get subset**, and that means a subset is masquerading as a source. Throw. The margin to calibrate against is ADR-0020's own numbers — icomoon gives up 99%, JetBrains Mono 63%, Primera Signature 41%, and the already-optimised Atkinson woff2 the least at **28%** — so "strictly smaller" is the safe universal rule and the ratio belongs in the log next to the byte counts. In CI this turns ADR-0020's silent, unrecoverable failure into a red build.

**`addWatchFile` on each source**, so editing a raw face during `astro dev` restarts Astro, re-runs the hook and re-cuts. Without it the dev server watches only the generated files, and a source edit would do nothing until the next restart.

### Where the code lives

`scripts/font-paths.mjs` — the leaf: the output directory and the source→output rule.
`scripts/subset-fonts.mjs` — the subsetter, the guard, the Astro integration, and the CLI entry. `astro.config.mjs` imports the integration the way it imports `fonts.config.mjs` today.

**`npm run fonts:subset` survives** as the standalone inspector, writing to the same directory the build uses, so what it produces is exactly what would ship. It is how the byte numbers and ratios get read on demand, and it is how ADR-0020's trap was diagnosed in the first place. What it stops being is a step in anyone's workflow.

## The traps, ranked by how quietly they fail

1. **A generated file written into `src/assets/fonts/`** — see above. Silent, idempotent, and now unrecoverable. The guard catches the *consequence* (a source that does not shrink); nothing catches the cause, so the output path is the thing to get right and to state in the ADR.
2. **`updateConfig` doubling the families.** Arrays concatenate. The symptom is a duplicated `@font-face` per face and Astro's "several font families have been registered for the same cssVariable" warning, which is easy to read as noise.
3. **A generated file that does not end in `.woff2`.** Astro reads the font type off the extension (`NodeFontTypeExtractor`), so a `.ttf` source whose output keeps its extension gets declared as `format("truetype")` over woff2 bytes — a mismatch the build reports nowhere and the browser resolves however it likes. Two of the eight sources are `.ttf`, so this is not hypothetical.
4. **A source edited during `astro dev` with no `addWatchFile`.** Nothing happens: the hook does not re-run, the generated file stays as it was, and the obvious conclusion is that the subsetter is broken.
5. **`subset-font` unpinned.** A minor upgrade that changes the output changes what every visitor downloads, with no diff anywhere. Pin it.
6. **CI without the guard.** `npm i` in CI installs `subset-font` (a devDependency, which is correct for a static build), so the subsetting itself is not at risk — but a bad source would ship a bad font from a green build, exactly as it does today, unless the guard throws.

## Out of Scope

- The charset itself, and which cuts ship. `AtkinsonHyperlegible-BoldItalic` stays unshipped and unreferenced, the 16 JetBrains cuts stay archived (ADR-0020: the folder is an archive, not a manifest).
- Anything about how the faces are declared or how the fallbacks are generated. ADR-0022 settled that and this step does not touch it.
- Primera Signature's licensing question (ADR-0020 records it as known and accepted). The OFL files move with their families and keep sitting beside the sources; note that after this the repo distributes only the originals, never a derivative.
- A variable font for JetBrains Mono, still not pursued.

## Acceptance Criteria

1. `src/assets/raw-fonts/` no longer exists; `src/assets/fonts/` holds the sources, the two `OFL.txt` and `icons/selection.json`; no generated `.woff2` is tracked by git.
2. `.gitignore` needs no new rule — the output lives under the already-ignored `.astro/` — and `git status` is clean immediately after a build.
3. A clean clone (`npm i && npm run build`) produces the eight faces in `dist/_astro/fonts/`, byte-identical to what the current commit ships. This is the whole point and it is checkable — the md5s as of `a614050`, which the ADR should record:

   | face | md5 |
   | --- | --- |
   | `jetbrains/JetBrainsMono-Regular.woff2` | `b1ffb69b23ba83a6b344aedb54039276` |
   | `jetbrains/JetBrainsMono-Bold.woff2` | `0d24c37c09a3a0701d478a6c12dd3345` |
   | `jetbrains/JetBrainsMono-ExtraBold.woff2` | `04943bf8fc5e49c9253ff50f06da8bae` |
   | `atkinson/AtkinsonHyperlegible-Regular.woff2` | `f23d3324cc32489e5cd2848d1e1be187` |
   | `atkinson/AtkinsonHyperlegible-Bold.woff2` | `e53e962cc46e89cac898c8c9a270897a` |
   | `atkinson/AtkinsonHyperlegible-Italic.woff2` | `2e367a5bd823f3f9bb7a6c58dc59f6c5` |
   | `primera-signature/PrimeraSignature-Regular.woff2` | `e1fb3dcc9d0d4ab9faed8c848473d785` |
   | `icons/icomoon-feather.woff2` | `3d77474c0ebe4ad731c960516ad5c77e` |
4. Which cuts get subset, and to which charset, is stated in `fonts.config.mjs` and nowhere else — `scripts/subset-fonts.mjs` keeps no list of its own, and the icon codepoints have moved out of it.
5. Every generated file mirrors its source's path under the codegen directory and ends in `.woff2`, the two `.ttf` sources included.
6. A second run with nothing changed writes no file — checked on mtimes — and an `astro dev` session does not restart itself after startup.
7. A source that does not shrink fails the build, with the ratio in the message. Verified by pointing a variant at an already-subset file on purpose.
8. A missing source fails the build with a message naming the file — not a warning and a page in Courier New.
9. The subsetter runs for `astro build` and `astro dev`, and not for `astro preview` or `astro check` / `astro sync` — checked on the log, and on `npm run captures:render` staying as fast as it is today. A charset edit in `fonts.config.mjs` changes the shipped bytes with no step in between.
10. `npm test` is green, both PDFs are unchanged structurally against the pre-change build, and the two OG cards stay byte-identical PNGs.
11. `subset-font` is pinned to an exact version.

## Work Plan

1. **Fold the subsetter's manifest into `fonts.config.mjs`** as `FONT_SUBSETS`, charsets and icon codepoints included, and add `scripts/font-paths.mjs`. `scripts/subset-fonts.mjs` drops its own lists and reads the table. Still writing where it writes today, still manual: nothing changes shape yet.
2. **Add the integration**, calling `subsetAll()` in `astro:config:setup` with the guard and `addWatchFile`, writing into `createCodegenDir()`. Point `subsetOf()` there. The committed subsets become dead weight at this point — the build no longer reads them.
3. **Move the sources and delete the derivatives**: `git mv src/assets/raw-fonts/* src/assets/fonts/` after `git rm` of the eight generated files, in that order, so no source is ever briefly overwritten by a derivative of itself.
4. **Pin `subset-font`.**
5. **Verify**: clean-clone build against the recorded md5s, the three negative tests (unshrinkable source, missing source, source edited under `astro dev`), a charset edit reaching the shipped bytes, `npm test`, PDF and OG comparison.
6. **Sweep the docs that still describe two folders**: `docs/coding-standards.md` ("Raw source faces and the generated `.woff2` both live in `src/assets/` and are both committed") and `docs/issues/cv-website/spec.md`, which names `src/assets/raw-fonts/` twice.
7. **Write the ADR.** It supersedes ADR-0012 on hand-subsetting-over-build-time-subsetting and ADR-0020 on the versioned-derivatives axis; ADR-0012's reasoning for self-hosting, for a charset over glyph-exact subsets, and for `subset-font` over `pyftsubset` all stand. Record the eight md5s, the guard's threshold, and why the output directory is outside `src/`.

## Answered

- **`src/assets/fonts/` keeps its name**, now holding sources rather than what ships.
- **The generated directory is `createCodegenDir()`**, not `config.cacheDir`.
- **No cache**: the subsetter runs on every `astro:config:setup` for `dev` and `build`, ~1.0s cold. Only the *write* is conditional on a byte comparison — the simplest thing that keeps `astro dev` from restarting itself for no reason, and not a cache in any sense that can go stale.
- **The charsets live in `fonts.config.mjs`**, beside the families, in a `FONT_SUBSETS` table — the only place they can live, since Astro's schema rejects extra keys on a family and `Variant` rejects them on a variant.
- **The generated tree mirrors the sources**, `<family>/<basename>.woff2`, always `.woff2`.
- **The integration lives in `scripts/`**, with a leaf `scripts/font-paths.mjs` for the path rule so nothing imports in a circle.
- **`npm run fonts:subset` stays**, as the inspector.

## Still open

Nothing. `astro preview` was the last one, and it is answered: it does run the hook (`command: 'preview'`), which is why the hook guards on `command`.

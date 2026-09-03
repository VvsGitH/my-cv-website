# Every Locale is prefixed, and `/` is a rewrite

Italian was served at `/` and English at `/en/`. **Both Locales now have a prefixed route of their
own — `/it/` and `/en/` — and `/` is a page whose only job is to rewrite to the default one.** The
link-preview card moves with them, from `/og/[locale]/` to `/[locale]/og/`. `src/pages/en/` is
deleted; one `[locale]/` directory generates both.

The old arrangement made the default Locale a special case in four places that had no business
knowing which Locale was default:

- **`src/pages/` held two hand-written index pages** — `index.astro` for Italian and
  `en/index.astro` for English — identical but for two literals. A third Locale meant a third file;
  a change to the page meant editing every copy.
- **Every route helper carried the conditional.** `render-captures.mjs` and `tests/support/site.ts`
  each spelled `locale === defaultLocale ? base : base + locale + '/'`, and the test helper's own
  docstring claimed it derived routes "the same way render-captures.mjs derives its routes" — a
  claim nothing checked, and which was false for a whole review cycle when only one of the two was
  updated.
- **The route shape depended on a value that is not about routing.** `defaultLocale` answers "which
  Locale does a reader who asked for neither get"; it was also silently deciding what every URL
  looked like.
- **`/it/` did not exist at all.** A reader handed that URL — the obvious guess, and the shape the
  other Locale already used — got a 404.

## `/` is a page, not a redirect

```astro
---
import { defaultLocale } from '../i18n/locale';
export const target = `${defaultLocale}/`;
return Astro.rewrite(target);
---
```

**A rewrite, not a redirect, and not a config entry.** `output: 'static'` means there is no server
to answer a 302 — GitHub Pages serves files. `Astro.rewrite` resolves at build time and writes the
target's HTML to `dist/index.html`, so `/` is a real page that returns 200 on the first request
rather than a hop through a redirect that static hosting cannot perform anyway.

**The duplication is real and accepted.** `dist/index.html` is byte-identical to
`dist/it/index.html` — measured, not assumed — so the built site carries two copies of the Italian
CV, ~32KB apiece. That is the price of `/` working without a server, and it buys the thing that
matters: **the canonical URL on both copies is `/it/`**, as is the `x-default` hreflang, so search
engines are told which one is the document and the duplicate costs nothing beyond bytes.

*Considered: making `/` render the default Locale directly, the way `src/pages/en/index.astro` used
to. Rejected, narrowly — it produces the same output (diffed: one line, a Vite chunk filename), but
it puts a second composition of the page in the tree, which is the thing this change deletes. The
rewrite keeps `[locale]/index.astro` the only place the page is assembled.*

### The dummy export, and why it is there

Frontmatter is emitted by the Astro compiler at **module top level**, not inside the component
function:

```tsx
import { defaultLocale } from '../i18n/locale';
return Astro.rewrite(target);          // ← illegal at module scope
export default function Index__AstroComponent_(_props): any {}
```

A top-level `return` is a syntax error in a module. TypeScript error-recovers past that statement,
and every reference inside it stops counting — so `defaultLocale` reads as an unused import and
`astro check` reports `ts(6133)` on a line that is doing real work. Because `npm run build` runs
`astro check` first, that is a permanent false positive sitting in front of the build.

Four shapes were measured against `astro check`:

| | |
|---|---|
| `return Astro.rewrite(\`${defaultLocale}/\`)` | ⚠️ warns on `defaultLocale` |
| `const target = …; return Astro.rewrite(target)` | ⚠️ warning simply moves to `target` |
| `export const prerender = true` alongside | ⚠️ unchanged |
| **`export const target = …; return Astro.rewrite(target)`** | ✅ clean |

Exported bindings are exempt from the unused check, so naming the target and exporting it is what
clears the diagnostic. **It is a workaround and the file says so** — an export with no consumer,
whose only purpose is to be seen by the checker. The alternatives were worse: `// @ts-ignore` would
suppress every future diagnostic on that line, and disabling the unused-variable check project-wide
would have cost a genuine hit found in the same run (`BASE`, left dangling in `pdf.spec.ts` after
the OG helper landed).

## The card is a child of its Locale

`/og/[locale]/` becomes `/[locale]/og/`, so everything a Locale publishes lives under that Locale's
prefix and `src/pages/` has exactly one dynamic segment. Both routes get their params from one
place, `localePaths()` in `src/i18n/locale.ts`, rather than each rebuilding the list from
`Object.keys(cv)`.

**The trailing slash is load-bearing.** The build format is `directory`, so the file is
`dist/it/og/index.html` and the route is `/it/og/`. A first pass wrote `${base}${locale}/og`
without it; the capture script still worked, because the preview server redirects and
`render-captures.mjs` checks `response.ok()` — which is 200 *after* the redirect. It would have kept
working right up until a host that does not redirect, or a future `trailingSlash: 'never'`. ADR-0009
governs these routes; both of its consumers now spell them with the slash.

## What the change is worth, in tests

The suite went 84 passing → 90 across this work, and only two of those six are new assertions. The
other four were existing assertions that broke on the move and had to be pointed at the new shape:
two on the language link (`toolbar.spec.ts`, `colophon.spec.ts`, both the `en → it` direction, since
`it → en` was unaffected) and two on the card route. That is the honest measure of how many places
knew which Locale was default.

`tests/support/site.ts` now has no conditional and no `DEFAULT_LOCALE`:

```ts
export const routeFor   = (locale: Locale): string => `${BASE}${locale}/`;
export const ogRouteFor = (locale: Locale): string => `${BASE}${locale}/og/`;
```

`ogRouteFor` exists because the OG path had been written out by hand in `pdf.spec.ts`, which is how
it survived the move and 404'd — the third copy that `distPathForHref`'s own docstring warns about.

## The Locale set is declared in the domain, and pinned by a test

`src/i18n/locale.ts` declares the Locales:

```ts
export type Locale = 'it' | 'en';
export const locales: readonly [Locale, Locale] = ['it', 'en'];
export const defaultLocale: Locale = locales[0];
```

**The pair is typed as a pair.** CONTEXT.md says there are exactly two Locales; `readonly [Locale,
Locale]` is where that stops being a comment. It makes `otherLocale` total by construction rather
than by assertion — an intermediate version read `locales.find(l => l !== locale)!`, which is
precisely a lookup that can miss, wearing a `!` and a docstring claiming it cannot. Adding a third
entry now fails to compile here, alongside the three `Record<Locale, …>` exhaustiveness errors in
`content/index.ts`, `i18n/meta.ts` and `i18n/ui.ts`. Before, `otherLocale` was the one place that
would have kept compiling and quietly started returning whichever non-match came first.

**`astro.config.mjs` declares them a second time, and that is deliberate.** The config is loaded by
three different runtimes — Astro's bundler, plain `node` for `render-captures.mjs`, and Playwright
for `tests/support/site.ts`. Two arrangements were tried and measured:

- *Deriving the domain from the config* (`import Config from '../../astro.config.mjs'` inside
  `locale.ts`). It works and the literal union survives, but it points the dependency backwards —
  `content/types.ts` opens with "layout reads these, never defines them" — and the literalness is
  then an accident of Astro's config typing. Switch `locales` to Astro's `{ path, codes }` form and
  `Locale` silently widens to include an object type, breaking `cv[locale]` everywhere.
- *A shared leaf file both sides import.* Also works, and keeps one declaration — but only with the
  `.ts` extension written out. Extensionless resolves fine under Astro's bundler and then dies under
  plain `node`: `ERR_MODULE_NOT_FOUND … imported from astro.config.mjs`, which took out
  `render-captures.mjs`. It also constrains that file forever to erasable syntax and no imports of
  its own, because it is loaded before Astro exists to two of its three consumers.

The duplication was chosen over both, on the grounds that two four-word lists are a smaller thing to
get wrong than a file whose correctness depends on Node's type-stripping and an easy-to-drop file
extension. **The drift it admits is silent** — Astro would keep routing the config's list while
`otherLocale`, `localePaths` and every `Record<Locale, …>` answered from the domain's, and the
failure would surface as a 404 on a route nothing generated, far from its cause. So it is pinned:

- **`tests/locales.spec.ts` asserts the two lists are equal, in order, and that both name the same
  default.** Order is asserted rather than membership, because `defaultLocale` is `locales[0]` and
  `otherLocale` reads the pair positionally: a reordered config keeps every route valid and changes
  which Locale the site defaults to. Verified by injecting each drift in turn — an extra locale, a
  reordered list, a changed default — and confirming each fails naming both sides.

### It is the one test that reads source, and ADR-0010 has to bend for it

ADR-0010 says the project has exactly one kind of test — Playwright against the built artifact,
asserting "externally observable behavior and nothing else". This spec reads two source files and
compares them. **That exception is taken knowingly, and it is the only one.**

The observable-behavior alternative is to assert that the built site serves exactly the routes
`locale.ts` declares. It stays inside ADR-0010 and it was rejected for two reasons: it catches list
drift only as a 404, far from the cause, and it **cannot see a `defaultLocale` mismatch at all** —
both spellings still produce a valid `/`, because the rewrite target is whatever the domain says it
is. The one failure the pin exists for is the one the observable test is blind to.

## Consequences

- **`prefixDefaultLocale: true`**, and the comment above it no longer claims Italian is unprefixed.
  The setting is now the whole truth about route shape: `defaultLocale` decides only what `/`
  rewrites to.
- **ADR-0009's capture routes both moved.** `cvRoute` loses its conditional and `cardRoute` gains
  the Locale prefix and the trailing slash. Nothing else in that recipe changes — same viewport,
  same order, same print emulation, same two-A4-page assertion.
- **ADR-0010 gains one documented exception**, above. If a second source-reading test is ever
  proposed, this is the bar it has to clear: no observable consequence exists, and the drift is
  silent.
- **ADR-0015 still names the card `og/[locale].astro`.** The file is now
  `src/pages/[locale]/og.astro`; what that ADR says about it — pinned `data-theme="light"`, the card
  painting its own ground — is unchanged.
- **CONTEXT.md's "Locale" entry stands as written** — "each Locale has its own content, its own
  route, and its own generated PDF" — and is now true of Italian too, which had content and a PDF
  but a route it shared with the site root.
- **A third Locale is a compile error in four files**, not a silent behaviour change in one. It is
  still a real piece of work — content, meta, ui, and a decision about what `otherLocale` means when
  "the other one" stops being singular — but the compiler now names every site.
- **Open: the root page duplicates ~32KB.** Acceptable on a two-page CV and correct for static
  hosting. If `src/pages/` ever grows a third Locale, revisit whether `/` should keep rewriting or
  simply 404 into the prefixed set with a client-side language guess.
- **Open: the dummy `target` export.** It exists to answer a compiler quirk, and it will read as
  dead code to anyone who has not read this ADR. Worth re-testing whenever the Astro compiler or the
  language server is upgraded — if the top-level `return` ever type-checks properly, the export
  should go.

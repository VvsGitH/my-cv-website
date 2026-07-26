# Preact 10 best practices, conventions & idioms (for this CV site's interactive island)

Research date: 2026-07-26. All claims cite PRIMARY sources: the official Preact docs (`preactjs.com`), the `@preact/signals` guide and the signals repo READMEs, the official Astro docs (`docs.astro.build`), and the published npm package manifests **and package source files** (`npm view`, plus versioned `unpkg.com/<pkg>@<version>/...` links that serve the exact published artifact). Where the prose docs are silent or ambiguous, the claim is cited to the shipped source of the package that owns the behaviour. No third-party tutorials, Medium/dev.to, or secondary write-ups are cited. This file replaces `react-19-best-practices.md` for the island layer.

## Confirmed latest versions

- **Latest stable Preact: `10.29.7`** (published 2026-07-08). npm `dist-tags` for `preact` are `latest: 10.29.7`, `beta: 11.0.0-beta.2`, `legacy: 8.5.3` (npm manifest). **The 11.x line is beta only — do not adopt it here** (see the peer-range constraint below).
- **`@preact/signals` latest: `2.10.0`** (published 2026-07-23), which depends on `@preact/signals-core ^1.14.4` and declares `peerDependencies: { "preact": ">= 10.25.0 || >=11.0.0-0" }` (npm manifest). **This raises the project's effective Preact floor to `>= 10.25.0`**, which is stricter than the integration's own peer range.
- **`@astrojs/preact` latest: `6.0.1`** (published 2026-07-02). From its published manifest: `peerDependencies: { "preact": "^10.6.5" }`, `engines: { "node": ">=22.12.0" }`, and `dependencies` including `@preact/preset-vite ^2.10.5`, **`@preact/signals ^2.8.2`**, `preact-render-to-string ^6.6.6`, `vite ^8.0.13`, `devalue ^5.8.1`.
- **Version-constraint conclusions (from the manifests, primary):**
  - `preact@11.0.0-beta.2` **does not satisfy** `@astrojs/preact@6.0.1`'s peer range `^10.6.5`. Preact 11 is out of range for this integration version. Stay on the 10 line.
  - The usable Preact window for this project is therefore **`>= 10.25.0 < 11`** (integration peer `^10.6.5` intersected with `@preact/signals@2` peer `>= 10.25.0`). Pinning `preact ^10.29.7` satisfies both.
  - `@preact/signals` is **already installed transitively** as a real dependency of `@astrojs/preact` at `^2.8.2`. Adding it as an explicit direct dependency is safe *provided the direct range overlaps `^2.8.2`* so the package manager dedupes to one copy — `^2.10.0` does. Two resolved copies of `@preact/signals`/`@preact/signals-core` would mean two independent reactive graphs, because the integration's client runtime imports `@preact/signals` itself to rehydrate signal props ([`@astrojs/preact@6.0.1` `dist/client.js`](https://unpkg.com/@astrojs/preact@6.0.1/dist/client.js)).

## TL;DR / Recommendation for "Preact as a single Astro island"

This project renders one client-hydrated island (a floating Toolbar: language link, PDF link, share-to-clipboard with a transient toast, theme toggle, mobile Drawer toggle) inside a static-first Astro site, with `@astrojs/preact` at **`compat: false`** and **`@preact/signals`** adopted.

- **`compat: false` is the integration's default and is safe here.** `@astrojs/preact` calls the Vite preset with `reactAliasesEnabled: compat ?? false`, so with the option omitted or `false` no `react`/`react-dom` aliasing happens at all ([`@astrojs/preact@6.0.1` `dist/index.js`](https://unpkg.com/@astrojs/preact@6.0.1/dist/index.js)). The full list of what you give up is in §3.6 — none of it is needed by this island **except `forwardRef`**, which has a real consequence (§3.3).
- **Four React-19 habits break silently under Preact 10 core.** `ref` is *not* a plain prop; `onChange` means the native `change` event; `forwardRef`/`memo`/`Children`/`createPortal` don't exist in core; and there is no StrictMode double-invocation to catch non-idempotent effects. See §3.
- **`useId` is in Preact core** (`preact/hooks`, since 10.11.0) — you do **not** need compat for accessible ID wiring, and the integration ships a new-enough `preact-render-to-string` ([Hooks — `useId`](https://preactjs.com/guide/v10/hooks/#useid); [`preact@10.29.7` `compat/src/index.js`](https://unpkg.com/preact@10.29.7/compat/src/index.js) imports it *from* `preact/hooks`).
- **The signals-vs-`useState` rule is supported in shape but not in wording.** The signals guide's own split is *module-level signal = app state shared across the tree* vs *`useSignal()` = "state that is specific to that component ... confined to the component that needs it"* — the documented local-state tool is **`useSignal`, not `useState`** ([Signals — Local state](https://preactjs.com/guide/v10/signals/#local-state-with-signals)). Nothing in the primary sources contradicts using `useState` for the toast, but nothing endorses it either. See §4.5 for the exact wording to adopt.
- **Hydration mismatches fail silently in Preact 10** — core deopts to a fresh render and only `preact/debug` logs anything. Turn on `devtools: true` so dev builds actually tell you ([`preact@10.29.7` `src/diff/index.js`](https://unpkg.com/preact@10.29.7/src/diff/index.js), [`debug/src/debug.js`](https://unpkg.com/preact@10.29.7/debug/src/debug.js)). See §7.
- **`client:media` is the wrong directive for this Toolbar** even though the Drawer is breakpoint-dependent, because the Toolbar's other controls must work at every width. See §5.3.

Prescriptive ("you must / we recommend") vs optional is flagged throughout.

---

## 1. What Preact 10 core actually contains (the authoritative export list)

The prose docs describe Preact as "not intended to be a reimplementation of React" and note that differences "can be completely removed by using preact/compat, which is a thin layer over Preact that attempts to achieve 100% compatibility with React" ([Differences to React](https://preactjs.com/guide/v10/differences-to-react/)). For a `compat: false` project the load-bearing fact is *exactly where the line falls*, so this is taken from the published package source rather than the prose.

**`preact` core exports** ([`preact@10.29.7` `src/index.js`](https://unpkg.com/preact@10.29.7/src/index.js)):
`render`, `hydrate`, `createElement`, `h`, `Fragment`, `createRef`, `isValidElement`, `Component`, `cloneElement`, `createContext`, `toChildArray`, `options`.

**`preact/hooks` core exports** ([`preact@10.29.7` `hooks/src/index.js`](https://unpkg.com/preact@10.29.7/hooks/src/index.js)):
`useState`, `useReducer`, `useEffect`, `useLayoutEffect`, `useRef`, `useImperativeHandle`, `useMemo`, `useCallback`, `useContext`, `useDebugValue`, `useErrorBoundary`, `useId`. Each is described in the [Hooks guide](https://preactjs.com/guide/v10/hooks/); the guide notes hooks can be imported "from `preact/hooks` or `preact/compat`" — with `compat: false`, always import from **`preact/hooks`**.

**Everything `preact/compat` adds on top** ([`preact@10.29.7` `compat/src/index.js`](https://unpkg.com/preact@10.29.7/compat/src/index.js)):
`Children`, `PureComponent`, `memo`, `forwardRef`, `createPortal`, `unmountComponentAtNode`, `findDOMNode`, `createFactory`, `isFragment`, `isMemo`, `isElement`, `flushSync`, `unstable_batchedUpdates`, `Suspense`, `SuspenseList`, `lazy`, `StrictMode`, `useInsertionEffect`, `startTransition`, `useDeferredValue`, `useSyncExternalStore`, `useTransition`, `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`, plus a spoofed `version = '18.3.1'` ("trick libraries to think we are react") and `Component.prototype.isReactComponent = true`. Compat additionally installs a render-time prop normalizer and an `options.event` hook that gives events React's `persist()`/`nativeEvent`/`isPropagationStopped()` shims ([`compat/src/render.js`](https://unpkg.com/preact@10.29.7/compat/src/render.js)).

> Two of those entries deserve highlighting now. **`StrictMode` in compat is literally `Fragment`** — the export list reads `Fragment as StrictMode`. And **`createPortal` is compat-only in the 10 line**, despite the [API reference](https://preactjs.com/guide/v10/api-reference/) page documenting core and compat APIs on the same page.

## 2. Which Preact 10 APIs apply to this project's island — decision table

| API / feature | Applies to this Toolbar island? | Why |
|---|---|---|
| `useState` | **Yes — adopt** | Core hook; still the plain answer for one-component boolean/string state ([Hooks](https://preactjs.com/guide/v10/hooks/)). But see §4.5 — with signals adopted, `useSignal` is the documented local-state tool. |
| `useEffect` (+ cleanup) | **Yes — adopt, sparingly** | The documented way "to trigger various side-effects. You can even return a cleanup function"; the guide's own examples are `window.addEventListener` subscriptions with matching removal ([Hooks](https://preactjs.com/guide/v10/hooks/); [TypeScript — hooks](https://preactjs.com/guide/v10/typescript/#typing-hooks)). Legitimate uses here: `matchMedia` for the drawer breakpoint, `localStorage` writes, a toast timer. |
| `useRef` | **Yes — adopt** | "stable, local values that persist across component renders but don't trigger rerenders"; also the canonical way to hold a `setTimeout` id — exactly the share-toast case ([References](https://preactjs.com/guide/v10/refs/)). |
| `useId` | **Yes — adopt** | Core since 10.11.0; "guarantees that these will be consistent when rendering both on the server and the client" — the right tool for `aria-controls`/`aria-labelledby` in a server-rendered-then-hydrated island ([Hooks — `useId`](https://preactjs.com/guide/v10/hooks/#useid)). |
| `signal` / `computed` / `effect` | **Yes — adopt** (module scope) | For state several components in the island read (theme, Drawer open) ([Signals](https://preactjs.com/guide/v10/signals/)). §4. |
| `useSignal` / `useComputed` / `useSignalEffect` | **Yes — adopt** (component scope) | "construct a signal the first time a component runs, and simply use that same signal on subsequent renders" ([Signals — Local state](https://preactjs.com/guide/v10/signals/#local-state-with-signals)). |
| Rendering a signal directly in JSX (`{count}` not `{count.value}`) | **Optional — nice win** | "Text automatically updates without re-rendering the component"; bypasses VDOM diffing ([Signals — Rendering optimizations](https://preactjs.com/guide/v10/signals/#rendering-optimizations)). Good fit for the toast message text. |
| `batch` | Optional | Only if one handler writes several signals ([Signals — `batch(fn)`](https://preactjs.com/guide/v10/signals/#batchfn)). A theme toggle writes one. |
| `untracked` / `.peek()` | **Avoid unless needed** | "The scenarios in which you don't want to subscribe to a signal are rare... Only use `.peek()` when you really need it" ([Signals](https://preactjs.com/guide/v10/signals/#reading-signals-without-subscribing-to-them)). |
| `createContext` / `useContext` | Optional / usually **no** | Core; the signals guide reaches for Context only "for larger and more complex apps" with "multiple components that require access to the same pieces of state" ([Signals — Managing global app state](https://preactjs.com/guide/v10/signals/#managing-global-app-state)). One island, a handful of components: module-level signals are simpler. |
| `useMemo` / `useCallback` | Optional | Documented as memoization tools ([Hooks](https://preactjs.com/guide/v10/hooks/)). `useCallback` has one non-perf use here: making a ref callback *stable* so it isn't called twice per rerender (§3.4). |
| `useErrorBoundary` | Optional | "Whenever a child component throws an error you can use this hook to catch it and display a custom error UI" ([Hooks](https://preactjs.com/guide/v10/hooks/)). Cheap insurance for a floating toolbar, not required. |
| `useLayoutEffect` | Optional | Runs "as soon as the component is diffed and before the browser has a chance to repaint" ([Hooks](https://preactjs.com/guide/v10/hooks/)). Only if you must measure/position before paint. |
| `useImperativeHandle` | **No** | Core, but only meaningful with a forwarded ref — which needs compat (§3.3). |
| `useReducer` | **No** (practically) | "easier to use when you have complex state logic" ([Hooks](https://preactjs.com/guide/v10/hooks/)). A toolbar has none. |
| `forwardRef`, `memo`, `PureComponent`, `Children`, `createPortal`, `Suspense`, `lazy`, `StrictMode`, `startTransition`, `useTransition`, `useDeferredValue`, `useSyncExternalStore`, `useInsertionEffect`, `flushSync` | **Not available** with `compat: false` | All are `preact/compat` exports, not core ([`compat/src/index.js`](https://unpkg.com/preact@10.29.7/compat/src/index.js)). See §3.6 for which of these you'd actually miss. |
| `@preact/signals` `createModel` / `action` / `useModel` | **No** | "As applications grow in complexity, managing state with individual signals can become unwieldy" — models exist for that case ([Signals — Models](https://preactjs.com/guide/v10/signals/#models)). A CV toolbar is the opposite case. |
| `@preact/signals/utils` (`Show`, `For`, `useLiveSignal`, `useSignalRef`) | Optional | Available "As of v2.1.0" ([Signals — Utility Components and Hooks](https://preactjs.com/guide/v10/signals/#utility-components-and-hooks)). `<Show when={drawerOpen}>` is legitimate; plain `&&` is equally fine and one less import. |
| `preact-render-to-string` APIs (`renderToString`, streams, `/jsx` modes) | **No — Astro owns this** | Astro's renderer calls them; app code never does ([Server-Side Rendering](https://preactjs.com/guide/v10/server-side-rendering/); `preact-render-to-string ^6.6.6` is a dependency of `@astrojs/preact@6.0.1`, npm manifest). |
| Class components / `Component.render(props, state)` | **No** | A Preact convenience ([Differences to React](https://preactjs.com/guide/v10/differences-to-react/)), but this island is function components + hooks. |

## 3. Where Preact 10 silently breaks code written with React 19 habits

These are the ones that compile, hydrate, and *look* fine.

### 3.1 `onChange` is the native `change` event, not React's `onChange`

> "Largely for historical reasons, the semantics of React's `onChange` event are actually the same as the `onInput` event provided by browsers... **In Preact core, `onChange` is the standard DOM change event that gets fired when an element's value is _committed_ by the user.**" ([Differences to React — Use `onInput` instead of `onChange`](https://preactjs.com/guide/v10/differences-to-react/#use-oninput-instead-of-onchange))

The listed rule is "standard `onInput` should be used instead of React's `onChange` for form inputs (**only if `preact/compat` is not used**)" — which is our case. The mechanism is verifiable: Preact core lowercases any `on*` prop and attaches it with `addEventListener`, so `onChange` becomes a literal `change` listener ([`src/diff/props.js`](https://unpkg.com/preact@10.29.7/src/diff/props.js)); the `onChange → oninput` rewrite lives only in compat, and only for `input`/`textarea` whose `type` isn't file/checkbox/radio ([`compat/src/render.js`](https://unpkg.com/preact@10.29.7/compat/src/render.js)).

**Also compat-only, same source:** `onDoubleClick → ondblclick`, `onFocus → onfocusin`, `onBlur → onfocusout`, camelCase SVG attribute normalization, `defaultValue`-as-fallback-`value`, `download={true} → download=""`, and array `value` on `<select multiple>`. The docs list the first two: "standard `onDblClick` should be used instead of React's `onDoubleClick`" and "`onSearch` should generally be used for `<input type="search">`" ([Differences to React](https://preactjs.com/guide/v10/differences-to-react/)).

**Standard to write:** in this island use `onInput` for text-ish inputs and `onChange` only where the native `change` event is what you want (a `<select>`, a checkbox). Because Preact does not synthesize `onBlur`/`onFocus`, note that **`onFocus`/`onBlur` do not bubble** in core — for focus management around the Drawer, reach for `onfocusin`/`onfocusout` semantics deliberately rather than assuming React's bubbling behaviour.

### 3.2 `class` and `className` both work — pick one and be consistent

> "Preact _detects_ whether each prop should be set as a property or HTML attribute... it also means you can use attribute names like `class` in JSX... **Most Preact developers prefer to use `class` instead of `className` as it's shorter to write but both are supported.**" ([Differences to React — Raw HTML attribute/property names](https://preactjs.com/guide/v10/differences-to-react/#raw-html-attributeproperty-names))

This is a style choice, not a correctness one. Note that Astro's `class:list` directive is an `.astro`-only template directive ([Directives reference](https://docs.astro.build/en/reference/directives-reference/)) — inside a `.tsx` Preact component you build the class string in JS.

### 3.3 `ref` is NOT a plain prop in Preact 10 — and `forwardRef` is compat-only

This is the sharpest React-19 regression. React 19's headline ergonomic win was `ref` as a regular prop. **Preact 10 does not do this.** Both element factories strip `ref` out of `props` before the vnode is built:

- `createElement`: `for (i in props) { if (i == 'key') key = props[i]; else if (i == 'ref') ref = props[i]; else normalizedProps[i] = props[i]; }` ([`src/create-element.js`](https://unpkg.com/preact@10.29.7/src/create-element.js))
- the automatic JSX runtime (what `jsx: "react-jsx"` compiles to) does the same, with the comment: *"We'll want to preserve `ref` in props to get rid of the need for forwardRef components **in the future**, but that should happen via a separate PR."* ([`jsx-runtime/src/index.js`](https://unpkg.com/preact@10.29.7/jsx-runtime/src/index.js))

So `function Drawer({ ref })` receives `undefined`, with no error and no warning. And `forwardRef` is a `preact/compat` export ([`compat/src/index.js`](https://unpkg.com/preact@10.29.7/compat/src/index.js)) — unavailable at `compat: false`.

**Standard to write (prescriptive):** with `compat: false`, **do not accept `ref` as a component prop.** Either put the `ref` directly on the DOM element inside the component that owns it, or pass a differently-named prop (`innerRef`) if a parent genuinely needs the node. The [References guide](https://preactjs.com/guide/v10/refs/) documents only `createRef`/`useRef`/callback refs and never mentions forwarding a ref through a function component — consistent with the source.

### 3.4 The Preact double-call is on ref callbacks, not on components

There is **no StrictMode-style double invocation in Preact 10, in either mode.** `StrictMode` does not exist in core at all, and `preact/compat` exports it as `Fragment as StrictMode` — a pass-through component ([`compat/src/index.js`](https://unpkg.com/preact@10.29.7/compat/src/index.js)). Components are not re-rendered an extra time; effects are not run through an extra setup+cleanup cycle.

The practical consequence cuts both ways: **you lose the React 19 safety net that surfaced non-idempotent effects.** Write effects with matching cleanup because it is correct, not because a dev-mode check will catch you.

There *is* a documented double-call, and it is a different thing:

> "If the provided ref callback is unstable (such as one that's defined inline...), and _does not_ return a cleanup function, **it will be called twice** upon all rerenders: once with `null` and then once with the actual reference... A stable function, for comparison, could be a method on the class component instance, a function defined outside of the component, or a function created with `useCallback`." ([References — Callback Refs](https://preactjs.com/guide/v10/refs/#callback-refs))

Ref-callback cleanup functions exist here too: "**As of Preact 10.23.0**, you can optionally return a cleanup function" ([References](https://preactjs.com/guide/v10/refs/)). The types back this: `RefCallback<T> = (instance: T | null) => void | (() => void)` ([`preact@10.29.7` `src/index.d.ts`](https://unpkg.com/preact@10.29.7/src/index.d.ts)). Unlike React 19's types, a *non-function* return is not rejected, so the React-19 "use a block body" TypeScript trap does not apply — but the stable-vs-inline rule above does.

### 3.5 Hydration mismatches deopt silently unless `preact/debug` is loaded

When the SSR'd DOM doesn't match, Preact 10 calls an *optional* options hook and then simply stops hydrating and renders normally:

```js
if (isHydrating) {
  if (options._hydrationMismatch)
    options._hydrationMismatch(newVNode, excessDomChildren);
  isHydrating = false;
}
```
([`src/diff/index.js`](https://unpkg.com/preact@10.29.7/src/diff/index.js))

Nothing is logged unless something installs that hook. `preact/debug` is what installs it, with the message: `Expected a DOM node of type "..." but found "..." as available DOM-node(s), this is caused by the SSR'd HTML containing different DOM-nodes compared to the hydrated one.` ([`debug/src/debug.js`](https://unpkg.com/preact@10.29.7/debug/src/debug.js)). The debug guide describes `preact/debug` as the package that adds "helpful warnings and errors" and attaches the devtools extension ([Debugging Preact Apps](https://preactjs.com/guide/v10/debugging/)).

This is materially worse than React 19, which logs a diff by default in dev. **Recommendation:** set `devtools: true` on the integration — it injects `import "preact/debug";` and only when `command === "dev"` ([`@astrojs/preact@6.0.1` `dist/index.js`](https://unpkg.com/@astrojs/preact@6.0.1/dist/index.js); the option itself is documented at [`@astrojs/preact` — `devtools`](https://docs.astro.build/en/guides/integrations-guide/preact/#devtools)).

`hydrate()` itself is documented as: "If you've already pre-rendered or server-side-rendered your application to HTML, Preact can bypass most rendering work when loading in the browser... skips most diffing while still attaching event listeners and setting up your component tree. This works only when used in conjunction with pre-rendering or Server-Side Rendering." ([API reference — `hydrate`](https://preactjs.com/guide/v10/api-reference/#hydrate)).

### 3.6 What `compat: false` actually costs you — audited against this island

Comparing the compat export list (§1) against the Toolbar's needs:

| Compat-only API | Needed by this island? |
|---|---|
| `forwardRef` | **The one real loss** — mitigated by §3.3's `innerRef` convention. |
| `createPortal` | Not needed *if* the Drawer renders in place. If the Drawer must escape a stacking/overflow context, this is the second real loss — the workaround is an `.astro`-level wrapper placed where you need it, not a portal. |
| `memo` / `PureComponent` | No. Five components; nothing to memoize. |
| `Children` / `toChildArray` | `toChildArray` is in **core** ([`src/index.js`](https://unpkg.com/preact@10.29.7/src/index.js)). React's `Children` object is not needed. |
| `Suspense` / `lazy` | No — nothing async, and Preact 10's resumed hydration has documented limits anyway ([Server-Side Rendering — note](https://preactjs.com/guide/v10/server-side-rendering/#rendertostringasync)). |
| `StrictMode` | No — it's a `Fragment` (§3.4). |
| `startTransition` / `useTransition` / `useDeferredValue` / `useSyncExternalStore` / `useInsertionEffect` / `flushSync` | No. |
| React's event shims (`e.persist()`, `e.nativeEvent`, `isPropagationStopped()`) | No — use the plain DOM event ([`compat/src/render.js`](https://unpkg.com/preact@10.29.7/compat/src/render.js)). |
| React-ecosystem library interop | No — this island has zero UI dependencies. That's the whole point of `compat: false`. |

**Verdict: `compat: false` is safe for this island**, with `forwardRef` (and possibly `createPortal`) as the only genuine gaps, both of which have documented-in-source workarounds. The escape hatch is real if you ever need it: enabling `compat` flips `reactAliasesEnabled` and adds `dedupe: ['preact/compat', 'preact']` plus SSR `noExternal` for `react`/`react-dom` ([`dist/index.js`](https://unpkg.com/@astrojs/preact@6.0.1/dist/index.js)), and the docs describe it as letting you use "`preact/compat`, Preact's compatibility layer for rendering React components without needing to install or ship React's larger libraries to your users' web browsers" ([`@astrojs/preact` — `compat`](https://docs.astro.build/en/guides/integrations-guide/preact/#compat)).

## 4. `@preact/signals` — documented rules and pitfalls

Install is a one-liner: "Signals can be installed by adding the `@preact/signals` package to your project: `npm install @preact/signals`" ([Signals — Installation](https://preactjs.com/guide/v10/signals/#installation)).

### 4.1 The core primitives

- **`signal(initialValue)`** — "a signal is an object with a `.value` property that holds a value. This has an important characteristic: **a signal's value can change, but the signal itself always stays the same**" ([Signals](https://preactjs.com/guide/v10/signals/#introduction)). Writing is `.value = x`; "Changing a signal's value **synchronously** updates every computed and effect that depends on that signal" ([signals-core README — `signal`](https://github.com/preactjs/signals/blob/main/packages/core/README.md#signalinitialvalue)).
- **`computed(fn)`** — "The returned computed signal is **read-only**, and its value is automatically updated when any signals accessed from within the callback function change" ([Signals — `computed(fn)`](https://preactjs.com/guide/v10/signals/#computedfn)).
- **`effect(fn)`** — "effects track which signals are accessed and re-run their callback when those signals change... **Unlike computed signals, `effect()` does not return a signal — it's the end of a sequence of changes.**" It returns a `dispose` function, and the callback may return a cleanup function that "gets run once, either when the effect callback is next called _or_ when the effect gets disposed, whichever happens first" ([Signals — `effect(fn)`](https://preactjs.com/guide/v10/signals/#effectfn); [signals-core README — Cleanup](https://github.com/preactjs/signals/blob/main/packages/core/README.md#effectfn)).
- **`batch(fn)`** — combines writes into one commit; "Batches can be nested and changes are only flushed once the outermost batch callback completes" ([Signals — `batch(fn)`](https://preactjs.com/guide/v10/signals/#batchfn)).
- **`untracked(fn)` / `.peek()`** — read without subscribing. Explicitly flagged as rare: "**Note that you should only use `signal.peek()` if you really need it. Reading a signal's value via `signal.value` is the preferred way in most scenarios.**" ([signals-core README — `signal.peek()`](https://github.com/preactjs/signals/blob/main/packages/core/README.md#signalpeek)) and "The scenarios in which you don't want to subscribe to a signal are rare." ([Signals](https://preactjs.com/guide/v10/signals/#reading-signals-without-subscribing-to-them))

### 4.2 Documented pitfalls

- **Equality bail-out.** "A signal will only update if you assign a new value to it. If the value you assign to a signal is equal to its current value, it won't update." ([Signals](https://preactjs.com/guide/v10/signals/#usage-example)) Consequence for the Drawer: `open.value = open.value` is a no-op; mutating an object *in place* and re-assigning the same reference will also not update. Always assign a new value/reference.
- **Laziness outside components.** "When working with signals outside of the component tree, you may have noticed that computed signals don't re-compute unless you actively read their value. This is because **signals are lazy by default**: they only compute new values when their value has been accessed." ([Signals — Reacting to signals outside of components](https://preactjs.com/guide/v10/signals/#reacting-to-signals-outside-of-components)) A module-level `computed` derived from the theme signal will *not* fire anything by itself; use `effect()` if you need a side effect such as writing `localStorage`.
- **Effects leak if you don't dispose.** "Don't forget to clean up effects if you're using them extensively. Otherwise your app will consume more memory than needed." ([Signals](https://preactjs.com/guide/v10/signals/#reacting-to-signals-outside-of-components)) A module-level `effect()` created at import time lives for the page's lifetime — acceptable for a single persistent theme subscriber, but it must be created *once* at module scope, never inside a component body.
- **`.value` in a component subscribes; the signal itself does not.** "In Preact, accessing a signal's `.value` property **from within a component** automatically re-renders the component when that signal's value changes." And: "when a signal is passed down through a tree as props or context, we're only passing around **references** to the signal. The signal can be updated without re-rendering any components, since components see the signal and not its value." ([Signals](https://preactjs.com/guide/v10/signals/#introduction))
- **Reading `.value` outside a component or outside render** is not forbidden anywhere in the primary sources — the guide's own first example does `console.log(count.value)` at module scope, and the "Usage Example" section drives the whole todo model from bare module-scope reads and writes ([Signals](https://preactjs.com/guide/v10/signals/#usage-example)). The rule is narrower than the React equivalent: a `.value` read only *subscribes* when it happens inside a component render or inside a `computed`/`effect` callback. Reads inside event handlers do not subscribe and are the normal way to write the theme toggle's `onClick`.

### 4.3 Module-level signals shared across component instances

The guide never uses the phrase "shared across all instances", but the semantics are stated directly and the split is unambiguous:

- Module scope = app state. "Up until now, we've only created signals outside the component tree. **This is fine for a small app like a todo list**, but for larger and more complex apps this can make **testing** difficult." The recommended remedy for larger apps is a `createAppState()` factory passed via props or Context ([Signals — Managing global app state](https://preactjs.com/guide/v10/signals/#managing-global-app-state)).
- Component scope = per-instance. `useSignal`/`useComputed` "are thin wrappers around `signal()` and `computed()` that construct a signal the first time a component runs, and simply use that same signal on subsequent renders", with the implementation given as `useMemo(() => signal(value), [])` ([Signals — Local state](https://preactjs.com/guide/v10/signals/#local-state-with-signals)).

Because a module-level `signal()` is evaluated once per module instance, every component that imports it reads and writes the same object — that is the point of the "app state" framing. **For this project the caveat is small:** the site is a two-page CV with one island, so the "testing difficulty" the guide warns about is not a real cost. It is worth recording the warning in the standards anyway, because it is the *only* documented downside of the module-level pattern.

### 4.4 SSR / prerender vs hydration in Astro

The Preact signals docs say nothing about SSR or hydration; the [packages/preact README](https://github.com/preactjs/signals/blob/main/packages/preact/README.md) contains no SSR guidance either. **This is genuinely undocumented in the prose.** The behaviour is, however, implemented in `@astrojs/preact` and readable in the shipped package:

- **Signals passed as props from `.astro` to an island are serialized at prerender time using `.peek()`**, and the ids are emitted onto the island element as a `data-preact-signals` attribute ([`@astrojs/preact@6.0.1` `dist/signals.js`](https://unpkg.com/@astrojs/preact@6.0.1/dist/signals.js)). So the prerendered HTML contains the signal's *value at build time*.
- **On the client, the island runtime re-creates those signals into a module-level `sharedSignalMap` keyed by id**, so two islands handed the same signal prop receive the *same* client-side signal instance ([`dist/client.js`](https://unpkg.com/@astrojs/preact@6.0.1/dist/client.js)). Same file: the island only hydrates `if (element.hasAttribute("ssr"))`, and `client:only` takes a different path — `element.innerHTML = ""` then `render()` instead of `hydrate()`.

**Practical rules that follow, for a theme signal:**
1. A module-level `signal(initialValue)` is evaluated **during prerender too**, and that initial value is what lands in the static HTML. So the island's first render must not depend on `localStorage`, `matchMedia`, `Date.now()` or `window` — otherwise server output and client's first render disagree and hydration silently deopts (§3.5). Initialize the theme signal to a deterministic default and *reconcile* to the real value in an effect after mount, or drive the pre-paint state from an `is:inline` script and read it back after hydration (§7).
2. Don't rely on prop-serialized signals for this island — there is only one island, and the mechanism is undocumented on `docs.astro.build`.

### 4.5 Verdict on the prescriptive rule ("signals for shared, `useState` for local")

**No primary source contradicts the rule.** Both halves are individually documented: module-level signals are the documented shape for state read across a tree, and `useState` remains a first-class core hook.

**But two qualifications should go into the standards verbatim:**

1. **The documented local-state tool is `useSignal`, not `useState`.** The signals guide's *own* answer to "state specific to that component ... confined to the component that needs it" is `useSignal()`/`useComputed()` ([Signals — Local state](https://preactjs.com/guide/v10/signals/#local-state-with-signals)). If the owner writes "`useState` for the share toast", that is a **house preference**, not something the sources prescribe — say so in the standard, so a future reader doesn't go looking for a citation that doesn't exist. A defensible house rationale (not from the docs): one fewer concept for a boolean that never leaves its component.
2. **You forfeit the JSX text-node optimization by choosing `useState`.** "Text automatically updates without re-rendering the component" only applies when you pass a *signal* into JSX ([Signals — Rendering optimizations](https://preactjs.com/guide/v10/signals/#rendering-optimizations)). For a toast this is negligible; it's worth one sentence so the trade-off is deliberate.

**Astro's own cross-island recommendation is different and should be acknowledged.** Astro's recipe says: "UI frameworks like React or Vue may encourage context providers for other components to consume. But when partially hydrating components within Astro or Markdown, you can't use these context wrappers. **Astro recommends a different solution for shared client-side storage: Nano Stores.**" — because "They're lightweight... (less than 1 KB) with zero dependencies" and "They're framework-agnostic" ([Share state between islands](https://docs.astro.build/en/recipes/sharing-state-islands/)). That page documents the export-signals-from-a-shared-file pattern only for **Solid** ("If you've used Solid for a while, you may have tried moving signals or stores outside of your components"), and **never mentions Preact signals at all**. Since this project has exactly one island, the cross-island question is moot — but the standards should record that the decision knowingly departs from Astro's documented default, and why (already a transitive dependency; deeper Preact integration; no extra package).

## 5. `@astrojs/preact` integration

### 5.1 Install and configuration options

`npx astro add preact`, or manually install `@astrojs/preact` and `preact` and add `integrations: [preact()]` ([`@astrojs/preact`](https://docs.astro.build/en/guides/integrations-guide/preact/)).

| Option | Type / since | Documented behaviour | Verified default |
|---|---|---|---|
| `compat` | `boolean`, v0.3.0 | "You can enable `preact/compat`, Preact's compatibility layer for rendering React components without needing to install or ship React's larger libraries to your users' web browsers." ([docs](https://docs.astro.build/en/guides/integrations-guide/preact/#compat)) | **`false`** — the source passes `reactAliasesEnabled: compat ?? false` ([`dist/index.js`](https://unpkg.com/@astrojs/preact@6.0.1/dist/index.js)). The docs page does **not** state a default. |
| `include` / `exclude` | arrays | Documented under "Combining multiple JSX frameworks": use `include` (and optionally `exclude`) to tell each integration which files it owns, e.g. `preact({ include: ['**/preact/*'] })` ([docs](https://docs.astro.build/en/guides/integrations-guide/preact/)) | unset. The integration logs a warning if more than one known JSX renderer is enabled and neither is set ([`dist/index.js`](https://unpkg.com/@astrojs/preact@6.0.1/dist/index.js)). **Not needed here** — Preact is the only JSX renderer. |
| `devtools` | `boolean`, v3.3.0 | "You can enable Preact devtools in development by passing an object with `devtools: true` to your `preact()` integration config" ([docs](https://docs.astro.build/en/guides/integrations-guide/preact/#devtools)) | `false`. Source injects `import "preact/debug";` **only when `command === "dev"`** ([`dist/index.js`](https://unpkg.com/@astrojs/preact@6.0.1/dist/index.js)). **Recommended on** — see §3.5. |
| `babel` | `BabelOptions`, v5.1.0 | "You can pass additional Babel configuration options to the Preact Vite plugin." ([docs](https://docs.astro.build/en/guides/integrations-guide/preact/)) | unset. Not needed here. |

> Note on `preact/debug` and Vite: the Preact docs say "`@preact/preset-vite` includes the `preact/debug` package automatically" ([Debugging](https://preactjs.com/guide/v10/debugging/)). `@astrojs/preact` uses `@preact/preset-vite` but nonetheless gates the debug import behind its own `devtools` flag, so **set the flag explicitly** rather than assuming.

### 5.2 TypeScript setup required by the integration

The integration docs prescribe exactly this ([`@astrojs/preact`](https://docs.astro.build/en/guides/integrations-guide/preact/)):

```json
{ "compilerOptions": { "jsx": "react-jsx", "jsxImportSource": "preact" } }
```

This matches Preact's own "Automatic Transform, available in TypeScript >= 4.1.1" recipe ([TypeScript — configuration](https://preactjs.com/guide/v10/typescript/#typescript-configuration)). **It must be set as an override**, because `astro/tsconfigs/base` (which `astro/tsconfigs/strict` extends) sets `"jsx": "preserve"` and does not set `jsxImportSource` (the installed `astro/tsconfigs/base.json`). The project's `tsconfig.json` already carries the override.

### 5.3 Which `client:*` directive for this Toolbar

Quoting the [Directives reference](https://docs.astro.build/en/reference/directives-reference/):

| Directive | Priority | Documented use case / behaviour |
|---|---|---|
| `client:load` | **High** | "Immediately-visible UI elements that need to be interactive as soon as possible." Loads and hydrates immediately on page load. |
| `client:idle` | **Medium** | "Lower-priority UI elements that don't need to be immediately interactive." Hydrates after initial load, on `requestIdleCallback` (falling back to `load`). Optional `timeout`. |
| `client:visible` | **Low** | "Low-priority UI elements that are either far down the page or resource-intensive." Hydrates via `IntersectionObserver`. Optional `rootMargin`. |
| `client:media={QUERY}` | **Low** | "Loads and hydrates the component JavaScript once a certain CSS media query is met." Use case: "Sidebar toggles, or other elements that might only be visible on certain screen sizes." |
| `client:only="preact"` | — | "Skips HTML server rendering, and renders only on the client." "You must pass the component's correct framework as a value." Supports `slot="fallback"`. |

**Recommendation, with the reasoning made explicit (this part is a judgement call, not a documented rule):**

- **`client:media` is wrong for the whole Toolbar.** The docs' example — "sidebar toggles" — describes a component that *only exists* on some screen sizes. Here only the Drawer toggle is breakpoint-dependent; the language link, PDF link, share button and theme toggle must work at every width. Under `client:media="(max-width: …)"` the island simply never hydrates on desktop, so those four controls would be dead. It would only be correct if the Drawer toggle were split into its own island.
- **`client:visible` is a poor fit for a *floating* toolbar.** The documented use case is "far down the page or resource-intensive". A fixed/floating toolbar is in the viewport at load, so `IntersectionObserver` fires essentially immediately — you pay the observer for no deferral, and you inherit a subtle failure mode if the element is ever `display: none` at some breakpoint.
- **`client:load` matches the documented use case literally** — "Immediately-visible UI elements that need to be interactive as soon as possible" — and is the safe default for the theme toggle, whose state must settle without a visible flip.
- **`client:idle` is the better trade if the theme is already applied pre-paint by an inline script (§7).** With the paint-critical part handled outside the island, none of the toolbar's actions is needed in the first frames, which is exactly "Lower-priority UI elements that don't need to be immediately interactive." Add `timeout` if you want a ceiling. This is the recommendation, conditional on §7 being in place.
- **`client:only="preact"`** — avoid. It "skips HTML server rendering", so the toolbar would be absent from the static HTML and pop in; the integration blanks the element and calls `render()` rather than `hydrate()` ([`dist/client.js`](https://unpkg.com/@astrojs/preact@6.0.1/dist/client.js)). Reserve it for a component that genuinely cannot server-render. The general Astro guidance is "Only hydrate components that genuinely need interactivity" ([Framework components](https://docs.astro.build/en/guides/framework-components/)).

Also relevant: "An island always runs in isolation from other islands on the page, and multiple islands can exist on a page"; "The two load in parallel and hydrate in isolation" ([Islands architecture](https://docs.astro.build/en/concepts/islands/)).

## 6. TypeScript with Preact and no `@types/react`

Preact ships its own types — "Preact ships TypeScript type definitions, which are used by the library itself!" ([TypeScript](https://preactjs.com/guide/v10/typescript/)). With `compat: false` there is no `react`/`react-dom` in the dependency graph at all, so `@types/react`/`@types/react-dom` should be **removed**; nothing imports them. (The `paths` aliasing block in the Preact TypeScript guide is explicitly for the *compat* case: "Your project could need support for the wider React ecosystem" — [TypeScript — preact/compat configuration](https://preactjs.com/guide/v10/typescript/#typescript-preactcompat-configuration). Don't add it.)

- **Props:** "Typing regular function components is as easy as adding type information to the function arguments" — declare an `interface`, destructure in the signature; defaults go in the signature (`function Greeting({ name = 'User' }: GreetingProps)`) ([TypeScript — Function components](https://preactjs.com/guide/v10/typescript/#function-components)).
- **Children:** `ComponentChildren` — "a type that represents all valid Preact children... For those familiar with React, it works in a very similar way to `ReactNode`" ([TypeScript — Typing children](https://preactjs.com/guide/v10/typescript/#typing-children)). `FunctionComponent<P>` also adds a `children` type if you prefer annotating the variable instead of the parameter.
- **Inheriting element props:** extend the intrinsic attribute interfaces, e.g. `interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { … }` — the guide shows the `<Input />` form of this ([TypeScript — Inheriting HTML properties](https://preactjs.com/guide/v10/typescript/#inheriting-html-properties)).
- **Events:** "Preact emits regular DOM events. As long as your TypeScript project includes the `dom` library... you have access to all event types." The documented form is `import type { TargetedMouseEvent } from "preact";` then `handleClick(event: TargetedMouseEvent<HTMLButtonElement>)` ([TypeScript — Typing events](https://preactjs.com/guide/v10/typescript/#typing-events)). The full family verified in the published types is `TargetedEvent`, `TargetedMouseEvent`, `TargetedInputEvent`, `TargetedKeyboardEvent`, `TargetedFocusEvent`, `TargetedPointerEvent`, `TargetedSubmitEvent`, `TargetedToggleEvent`, `TargetedDragEvent`, `TargetedClipboardEvent`, `TargetedTouchEvent`, `TargetedWheelEvent`, `TargetedUIEvent`, `TargetedAnimationEvent`, `TargetedTransitionEvent`, `TargetedCompositionEvent`, `TargetedCommandEvent`, `TargetedSnapEvent`, `TargetedPictureInPictureEvent` ([`src/dom.d.ts`](https://unpkg.com/preact@10.29.7/src/dom.d.ts)). They are reachable **two ways** — as top-level exports of `preact` (the index does `export * from './dom'`) and as `JSX.TargetedEvent<…>` etc., since the index does `export import JSX = JSXInternal` ([`src/index.d.ts`](https://unpkg.com/preact@10.29.7/src/index.d.ts), [`src/jsx.d.ts`](https://unpkg.com/preact@10.29.7/src/jsx.d.ts)). **Prefer the named import** — that's the form the docs show. For inline handlers: "you can forgo explicitly typing the current event target as it is inferred from the JSX element" ([TypeScript](https://preactjs.com/guide/v10/typescript/#typing-events)).
- **Refs:** `useRef<HTMLDialogElement>(null)` — "`useRef` benefits from binding a generic type variable to a subtype of `HTMLElement`... `useRef` is usually initialized with `null`, with the `strictNullChecks` flag enabled, we need to check if `inputRef` is actually available" ([TypeScript — `useRef`](https://preactjs.com/guide/v10/typescript/#useref)). Unlike React 19's types, **an argument is not required** — but pass `null` anyway for the null-check ergonomics.
- **Hooks:** "Most hooks don't need any special typing information, but can infer types from usage." `useEffect` "does extra checks so you only return cleanup functions" ([TypeScript — Typing hooks](https://preactjs.com/guide/v10/typescript/#typing-hooks)).
- **Extending JSX** (custom elements, custom global attributes) uses module augmentation of `namespace preact.JSX` inside `declare global`, with a trailing `export {}` — "This empty export is important! It tells TS to treat this as a module" ([TypeScript — Extending built-in JSX types](https://preactjs.com/guide/v10/typescript/#extending-built-in-jsx-types)). Note this differs from React 19, where augmentation moved into `declare module "react"`.

**`astro check` gotchas (verified against the installed presets and the Astro TS guide):**
- `astro/tsconfigs/base` sets `"verbatimModuleSyntax": true` and `"isolatedModules": true`, and the Astro docs confirm "`verbatimModuleSyntax` is enabled by default in all presets" and recommend `import type` for type-only imports ([TypeScript guide](https://docs.astro.build/en/guides/typescript/)). So type-only Preact imports **must** be written `import type { ComponentChildren } from 'preact';` — a plain `import` will fail the check.
- `astro check` "validates `.astro` and `.ts` files" and requires `typescript` + `@astrojs/check`; the documented build script is `"build": "astro check && astro build"` ([TypeScript guide](https://docs.astro.build/en/guides/typescript/)).
- I could **not** verify from a primary source whether `astro check` type-checks `.tsx` island files as thoroughly as `.astro`/`.ts` — the docs sentence enumerates only `.astro` and `.ts`. Treat `tsc --noEmit` as a possible complement; unverified either way.

## 7. Hydration and the no-flash theme toggle

**What the sources actually establish:**

- `is:inline` "Will be rendered into the HTML exactly as written! Not transformed: no TypeScript and no import resolution by Astro." It's documented for scripts in `public/`, external CDN scripts, and "scripts requiring no processing", with the general guidance that local `src/` scripts should *not* use it ([Scripts and event handling](https://docs.astro.build/en/guides/client-side-scripts/); [Directives reference](https://docs.astro.build/en/reference/directives-reference/)).
- **Astro's own tutorial makes exactly this exception for a theme toggle.** Its `ThemeIcon.astro` uses an `is:inline` script that reads `localStorage.getItem("theme")`, falls back to `window.matchMedia('(prefers-color-scheme: dark)')`, and then adds/removes a `dark` class on `document.documentElement` ([Build a blog tutorial — theme toggle](https://docs.astro.build/en/tutorial/6-islands/2/)). This is a first-party, in-docs precedent for the pattern.
- Hydration matching: `hydrate()` "skips most diffing while still attaching event listeners" ([API reference](https://preactjs.com/guide/v10/api-reference/#hydrate)), and a mismatch silently deopts (§3.5).
- `useId` "guarantees that these will be consistent when rendering both on the server and the client" ([Hooks — `useId`](https://preactjs.com/guide/v10/hooks/#useid)) — the correct tool for any id that must survive hydration.

**The standard that follows (prescriptive):**

1. Apply the theme **outside the island**, in an `is:inline` script that sets a class/attribute on `document.documentElement`, following Astro's tutorial pattern.
2. **Keep the island's first render deterministic and identical to what prerender produced.** Do not read `localStorage`, `matchMedia`, `window`, `Date.now()` or `Math.random()` during the first render of any island component — including in the initializer of a module-level `signal()`, which also runs during prerender (§4.4). Read the current theme *after* mount (`useEffect`/`useSignalEffect`) and write it into the signal there, or render the toggle in a state-agnostic way (e.g. icon driven by CSS from the root class rather than from island state).
3. Persist to `localStorage` in the event handler or in a single module-level `effect()`, never during render.
4. Turn on `devtools: true` so a mismatch actually surfaces in dev (§3.5).

**Explicitly unverified:** none of the allowed primary sources states *why* an inline script prevents the flash (i.e. that it must run in `<head>` and before first paint, ahead of the stylesheet's effect). The Astro tutorial demonstrates the pattern without explaining the rationale, and the client-side-scripts guide says nothing about render-blocking, FOUC, or pre-hydration state. Placement (`<head>` vs component-local, as the tutorial does it) should be confirmed empirically in this project rather than asserted from these docs.

## 8. Accessibility guidance — what the primary sources do and do not cover

**Covered:**
- **`useId` for accessibility-attribute ids.** "A common use case for consistent IDs are forms, where `<label>`-elements use the `for` attribute to associate them with a specific `<input>`-element. The `useId` hook isn't tied to just forms though and can be used whenever you need a unique ID." And: "To make the hook consistent you will need to use Preact on both the server as well as on the client." ([Hooks — `useId`](https://preactjs.com/guide/v10/hooks/#useid)) This is the right way to generate the id the Drawer's `aria-controls` points at, since the island is prerendered then hydrated. Requires Preact ≥ 10.11.0 and `preact-render-to-string` ≥ 5.2.4 — both satisfied (`preact 10.29.7`; `@astrojs/preact@6.0.1` depends on `preact-render-to-string ^6.6.6`).
- **`useRef` for imperative focus.** The documented use case for refs is "imperative DOM manipulation... calling native methods on various elements (such as `.focus()`...)" ([References](https://preactjs.com/guide/v10/refs/)). Note the guide's warning that "refs should not be used for rendering logic, instead, consumed in lifecycle methods and event handlers only."
- **Astro's Dev Toolbar Audit app** "automatically runs a series of audits on the current page, checking for the most common performance and accessibility issues" — but the docs are explicit that it "is not a replacement for dedicated tools like Pa11y or Lighthouse, or even better, humans!" ([Dev toolbar](https://docs.astro.build/en/guides/dev-toolbar/)).

**Not covered — do not fabricate a citation:**
- **`aria-expanded` semantics for a disclosure/drawer toggle**, focus-trapping inside an open drawer, returning focus to the trigger on close, and `Escape`-to-close are **not documented by preactjs.com, the signals docs, or docs.astro.build**. These are WAI-ARIA Authoring Practices concerns, and the WAI-APG was outside the primary-source scope for this research. The coding standards should either cite the APG directly (a separate decision) or state the rule as a house convention. What *is* safely derivable from the sources above is only the mechanical part: generate the drawer panel's id with `useId`, hold the trigger/panel nodes with `useRef`, and call `.focus()` from event handlers.
- **Whether `preact/debug` warns on missing/incorrect ARIA.** The debug guide only promises warnings for things "like incorrect nesting in `<table>` elements" ([Debugging](https://preactjs.com/guide/v10/debugging/)); no accessibility linting is claimed.

---

## Prescriptive vs optional — quick guide

- **Prescriptive ("must"):** never accept `ref` as a component prop under `compat: false` (§3.3); import hooks from `preact/hooks`, never `preact/compat` (§1); `jsx: "react-jsx"` + `jsxImportSource: "preact"` in `tsconfig.json` (§5.2); `import type` for type-only imports under `verbatimModuleSyntax` (§6); no `window`/`localStorage`/`matchMedia`/`Date.now()`/`Math.random()` in an island's first render *or* in a module-level `signal()` initializer (§4.4, §7); assign a *new* value to a signal — equal values are a no-op (§4.2); module-level `effect()` created once at module scope with a matching cleanup, never inside a component (§4.2).
- **Recommended:** `devtools: true` on the integration so hydration mismatches surface in dev (§3.5); `useId` for any id that crosses the SSR/hydration boundary (§8); `onInput` over `onChange` for text-ish inputs (§3.1); pin `preact ^10.29.7` and keep `@preact/signals` in a range overlapping `^2.8.2` so it dedupes with the integration's copy (Confirmed latest versions); `client:idle` for the Toolbar once the theme is applied pre-paint by an inline script, `client:load` otherwise (§5.3); `astro check` in the build script (§6).
- **Optional / situational:** rendering signals directly in JSX for the text-node optimization (§2, §4.5); `batch` (§4.1); `@preact/signals/utils` `<Show>`/`<For>` (§2); `useCallback` to stabilize a ref callback (§3.4); `useErrorBoundary` (§2).
- **Do not use here:** `client:media` for the whole Toolbar and `client:only="preact"` (§5.3); `@preact/signals` models/`action`/`useModel` (§2); anything on the `preact/compat` export list, incl. `memo`, `Suspense`, `lazy`, `StrictMode`, `startTransition` (§1, §3.6); `preact-render-to-string` APIs directly (§2); Preact 11 beta (Confirmed latest versions).

## Things I could NOT verify from a primary source

- **A documented default for the `@astrojs/preact` `compat` option.** The docs page does not state one. The `false` default in this document is cited to the published integration source (`reactAliasesEnabled: compat ?? false`), which is authoritative but is a different source than the docs page.
- **Any Astro documentation of `@preact/signals`.** `docs.astro.build` never mentions Preact signals: the `@astrojs/preact` page doesn't, and the "Share state between islands" recipe recommends Nano Stores and discusses signals only for **Solid**. The signal-prop serialization / `data-preact-signals` / shared-client-signal-map behaviour described in §4.4 is read out of the shipped `@astrojs/preact@6.0.1` package files and is **undocumented** — treat it as an implementation detail that could change without a docs-visible breaking change.
- **Any SSR/hydration guidance in the `@preact/signals` docs.** Neither the Preact signals guide nor the signals repo READMEs (core or preact package) mention server rendering, prerendering, or hydration. Everything in §4.4 about prerender-time signal evaluation is inferred from the Astro integration source plus the general statement that a module-level `signal()` is evaluated when its module is evaluated — reasonable, but not a documented contract.
- **An explicit "module-level signals are shared across all component instances" sentence.** The guide states the app-state-vs-local-state split and the "signals outside the component tree" framing, from which sharing follows, but does not use those words.
- **Any documented "Rules of Hooks" page for Preact.** Unlike react.dev, preactjs.com has no equivalent page; the Hooks guide states no top-level/no-conditional rule at all. The React discipline still applies (Preact's `getHookState(currentIndex++, …)` is index-based — [`hooks/src/index.js`](https://unpkg.com/preact@10.29.7/hooks/src/index.js)), but it is not written down by the project, so cite it as a house rule rather than a Preact rule.
- **Whether `astro check` fully type-checks `.tsx` island files.** The docs sentence enumerates `.astro` and `.ts` only.
- **The rationale for `is:inline` preventing a theme flash**, and whether the script must live in `<head>`. Astro's tutorial demonstrates the pattern; no Astro doc explains the timing (§7).
- **`aria-expanded`, focus trapping, focus return, and `Escape` handling for the Drawer.** Not addressed by any allowed primary source (§8).
- **Whether `preact/debug` is tree-shaken from the production build in this setup.** The integration only injects it when `command === "dev"` ([`dist/index.js`](https://unpkg.com/@astrojs/preact@6.0.1/dist/index.js)), which is stronger than tree-shaking, but I did not inspect a production build to confirm zero bytes ship.
- **Per-minor changelog for the Preact 10 line (10.0 → 10.29.7).** This document captures the current 10.x API surface from the published `10.29.7` package plus the versioned notes the docs state (`useId` in 10.11.0, ref-callback cleanup in 10.23.0). Release notes were not enumerated.

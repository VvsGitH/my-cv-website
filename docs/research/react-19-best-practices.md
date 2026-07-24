# React 19 best practices, conventions & idioms (for this CV site's interactive islands)

Research date: 2026-07-24. All claims cite PRIMARY sources: the official React docs (`react.dev`) — the API reference, the Learn guides, and the Rules pages — plus the published npm package manifests. Per the brief, the React blog is used **only** for authoritative release notes (the React 19 release post and the React 19 upgrade guide are cited only for "what changed" facts). No third-party tutorials, Medium/dev.to, or secondary write-ups are cited.

## Confirmed latest version

- **Latest stable React: `19.2.8`** and **`react-dom` `19.2.8`** (verified against the npm `dist-tags.latest` of the `react` and `react-dom` packages). The `19.x` line is current, so the project's `react ^19.2.8` / `react-dom ^19.2.8` pins are real and current.
- **`@types/react` latest: `19.2.17`; `@types/react-dom` latest: `19.2.3`** (npm `dist-tags.latest`). If you write TypeScript against React 19 you must be on the `@types/react`/`@types/react-dom` v19 line — the v19 types carry the breaking `useRef`/ref-callback/`JSX`-namespace changes described in §7 ([React 19 upgrade guide — TypeScript changes](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#typescript-changes)).
- Note on channels (from npm `dist-tags`): `next`/`canary` are `19.3.0-canary-*` and `experimental` exists, but `latest` is `19.2.8`. Use `latest`; the canary channel exists to support framework/RSC bundlers, which do not apply here (§4).

## TL;DR / Recommendation for "React as a small Astro island"

This project uses React only as a client-hydrated island (a Toolbar and a mobile Drawer toggle) inside a static-first Astro site. The React 19 practices that matter most here:

- **Most of React 19's marquee features are server/framework-oriented and DO NOT apply to a static client island.** Server Components, Server Actions (`"use server"`), and the static `prerender`/`prerenderToNodeStream` DOM APIs all require a full-stack/bundler framework and are explicitly framework-level ([React 19 — Server Components / Actions](https://react.dev/blog/2024/12/05/react-19#react-server-components)). Astro renders these islands as plain client components, so **do not reach for them.** See §4 for the full "don't use this here" list.
- **DO adopt the ergonomic, client-safe React 19 wins:** `ref` as a regular prop (no more `forwardRef`), ref-callback cleanup functions, `<Context>` as its own provider, and native document-metadata hoisting if useful. See §3.
- **Follow the Rules of Hooks strictly** — top level only, React functions only ([Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)). See §5.
- **Derive, don't sync.** For a Toolbar/Drawer, compute values during render and put action logic in event handlers; reach for `useEffect` only to synchronize with an external system (e.g. `matchMedia`, `localStorage`, `document` theme class) ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)). See §6.
- **`useMemo`/`useCallback` are performance optimizations, not defaults** — the docs say only add them in specific cases; for two tiny islands you almost never need them ([useMemo](https://react.dev/reference/react/useMemo), [useCallback](https://react.dev/reference/react/useCallback)). See §8.
- **Type props with an `interface`, type children as `React.ReactNode`, type events with `React.*Event<HTMLElement>`, and call `useRef(null)`** (an argument is now required) ([TypeScript with React](https://react.dev/learn/typescript); [upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#typescript-changes)). See §7.

Prescriptive ("you must / we recommend") vs optional is flagged throughout.

---

## 1. What actually changed in React 19 (the authoritative list)

Sourced from the official React 19 release post and upgrade guide (blog, used here **only** for release facts):

**New capabilities ([React 19 release notes](https://react.dev/blog/2024/12/05/react-19)):**
- **Actions** — "Functions that use async transitions are called Actions." They give a built-in pending state, error handling via Error Boundaries, optimistic updates, and `<form>` `action`/`formAction` function props.
- **`useActionState`** — wraps an Action and returns `[error, submitAction, isPending]`.
- **`useOptimistic`** — "show the final state optimistically while the async request is underway"; returns `[optimisticValue, setOptimistic]` and "automatically switch[es] back to the original value" on finish/error.
- **`useFormStatus`** (react-dom) — reads the parent `<form>` status "as if the form was a Context provider"; returns `{ pending }`. Intended "for design system components that need form information without prop drilling."
- **`use`** — read a Promise or Context during render; uniquely, it "can be called in conditionals and loops" (§3, §4).
- **`ref` as a prop** — "you can now access `ref` as a prop for function components," so "new function components will no longer need `forwardRef`."
- **Cleanup functions for `ref` callbacks** — "we now support returning a cleanup function from `ref` callbacks."
- **`<Context>` as a provider** — render `<Context value={...}>` instead of `<Context.Provider>`; "`<Context.Provider>` will be deprecated in future versions."
- **`useDeferredValue` `initialValue`** — new option; "on initial render the value is the initialValue," then a re-render is scheduled with the deferred value.
- **Document metadata** — render `<title>`, `<meta>`, `<link>` in components and React "automatically hoist[s] them to the `<head>`."
- **Stylesheet & async-script support** — `precedence` on stylesheets, deduped async `<script>`s.
- **Resource preloading** — `prefetchDNS`, `preconnect`, `preload`, `preinit` from `react-dom`.
- **Better error reporting** — de-duplicated logs, hydration-mismatch diffs, and new root options `onCaughtError` / `onUncaughtError` / `onRecoverableError`.
- **Custom Elements** — "React 19 adds full support for custom elements and passes all tests on Custom Elements Everywhere."

**Removed / deprecated (see §9 for the full list).** The **new JSX transform is now required** in React 19 ([upgrade guide — new JSX transform](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)).

## 2. Which React 19 features apply to this project's islands — decision table

| Feature | Applies to a static Astro client island? | Why |
|---|---|---|
| `ref` as a prop (drop `forwardRef`) | **Yes — adopt** | Pure client-side component ergonomics ([release notes](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)). |
| `ref` callback cleanup functions | **Yes — adopt** | Client DOM lifecycle; useful for the Drawer/Toolbar ([release notes](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs)). |
| `<Context>` as provider | **Yes — adopt** | Client rendering API; `.Provider` is being deprecated ([release notes](https://react.dev/blog/2024/12/05/react-19#context-as-a-provider)). |
| `useDeferredValue` `initialValue` | Optional | Client hook; only if you have deferred UI ([release notes](https://react.dev/blog/2024/12/05/react-19#use-deferred-value-initial-value)). |
| Document metadata hoisting (`<title>`/`<meta>`) | Optional / usually **NO here** | Works client-side, but in Astro the static `.astro` host owns `<head>`; let Astro render metadata, not the island ([release notes](https://react.dev/blog/2024/12/05/react-19#support-for-metadata-tags)). |
| Preload APIs (`preload`/`preinit`/…) | Optional | Client-callable, but resource hints for a CV are better expressed as static `<link>` in Astro ([release notes](https://react.dev/blog/2024/12/05/react-19#support-for-preloading-resources)). |
| `use(Promise)` | **Rarely — caution** | Works client-side only if the Promise is cached/stable and you have a Suspense boundary; promises created in render are not supported (§4). |
| `use(Context)` | Yes if you use Context | Conditional context reads are fine client-side (§3). |
| Actions / `useActionState` / `useFormStatus` / `<form action={fn}>` | Optional | Client-usable, but designed around form submission + async transitions; a Toolbar of buttons rarely needs them (§4). |
| `useOptimistic` | **No** (practically) | Meant for optimistic UI over async mutations; nothing to mutate in a static CV (§4). |
| Server Components (RSC) | **NO — framework-only** | Requires a full-stack/bundler framework (§4). |
| Server Actions (`"use server"`) | **NO — framework-only** | Requires a server; `"use server"` marks server functions (§4). |
| `prerender` / `prerenderToNodeStream` | **NO — build/SSR-only** | Static-generation DOM APIs for framework SSG; Astro already prerenders (§4). |

## 3. React 19 client-safe idioms to adopt (with usage)

- **`ref` as a prop — stop writing `forwardRef`.** "Starting in React 19, you can now access `ref` as a prop for function components," e.g. `function MyInput({ placeholder, ref }) { return <input placeholder={placeholder} ref={ref} /> }`; "new function components will no longer need `forwardRef`" ([release notes — ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop)). Note: refs passed to **class** components are still not props (they reference the instance).
- **Return a cleanup function from `ref` callbacks.** "When the component unmounts, React will call the cleanup function returned from the `ref` callback." Because of this, "React will now skip" calling the ref with `null` on unmount if you return a cleanup ([release notes — cleanup functions for refs](https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs)). Useful in the Drawer for wiring/removing an event listener tied to a DOM node. **TypeScript caveat:** the ref callback body must not implicitly return a value — use a block body `ref={node => { instance = node }}`, not `ref={node => (instance = node)}` ([upgrade guide — TS ref cleanup](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required)).
- **Render `<Context>` directly as the provider.** "You can render `<Context>` as a provider instead of `<Context.Provider>`," e.g. `<ThemeContext value="dark">{children}</ThemeContext>`; "`<Context.Provider>` will be deprecated in future versions" ([release notes — Context as a provider](https://react.dev/blog/2024/12/05/react-19#context-as-a-provider)). For a small island, prefer plain props over Context unless several nested pieces need the same value.
- **`use(context)` can be read conditionally.** "Unlike `useContext`, `use` can be called in conditionals and loops like `if`," and it "always looks for the closest context provider *above* the component that calls it" ([`use` reference](https://react.dev/reference/react/use)). This is the one genuinely client-useful part of `use` for an island. Still, `use` "must be called inside a Component or a Hook."

## 4. React 19 features that DO NOT apply here — "don't reach for these"

For a static Astro site whose React is a hydrated client island, these are out of scope. Being explicit prevents cargo-culting them in:

- **React Server Components (RSC).** "Server Components are a new option that allows rendering components ahead of time... in an environment separate from your client application or SSR server," and the underlying bundler APIs "do not follow semver"; React recommends frameworks pin a React version or use Canary to support them ([release notes — RSC](https://react.dev/blog/2024/12/05/react-19#react-server-components)). Astro islands are **client** components; there is no RSC runtime here. **Do not use.**
- **Server Actions (`"use server"`).** "Server Actions allow Client Components to call async functions executed on the server," marked with the `"use server"` directive ([release notes — Server Actions](https://react.dev/blog/2024/12/05/react-19#server-actions)). No server exists in a static GitHub Pages deploy. **Do not use.**
- **Static DOM APIs `prerender` / `prerenderToNodeStream`.** These "improve on `renderToString`" for static/streaming HTML generation in a framework build ([release notes — new static APIs](https://react.dev/blog/2024/12/05/react-19#new-react-dom-static-apis)). Astro already does the static prerendering; the island never calls these. **Do not use.**
- **Actions / `useActionState` / `useFormStatus` / `<form action={fn}>` and `useOptimistic`.** These are technically client-capable, but they are built around **form submission and async data mutations** — pending states, optimistic updates, error boundaries around a request ([release notes — Actions](https://react.dev/blog/2024/12/05/react-19#actions)). A Toolbar of language/download/share/theme buttons and a Drawer toggle have no async mutation to manage, so they add machinery with no payoff. Skip unless a genuinely async submission appears.
- **`use(Promise)` for data fetching.** The docs are explicit: "Promises created during render are recreated on every render, which causes React to show the Suspense fallback repeatedly and prevents content from appearing," so a Promise passed to `use` "must be cached so the same Promise instance is reused across re-renders," and you "must always be called for the Promise itself" (never bypass by reading `promise.status`) ([`use` reference](https://react.dev/reference/react/use)). A static CV has no runtime data fetching, so there is nothing to `use`. **Do not use for data.**

## 5. Rules of Hooks (prescriptive — non-negotiable)

- **Top level only.** "Don't call Hooks inside loops, conditions, nested functions, or `try`/`catch`/`finally` blocks. Instead, always use Hooks at the top level of your React function, before any early returns" ([Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)).
- The page's explicit 🔴 list: do not call Hooks inside conditions or loops; after a conditional `return`; in event handlers; in class components; inside functions passed to `useMemo`/`useReducer`/`useEffect`; or inside `try`/`catch`/`finally` ([Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)).
- **React functions only.** "Don't call Hooks from regular JavaScript functions." Call them only "from React function components" or "from custom Hooks" — this "ensure[s] that all stateful logic in a component is clearly visible from its source code" ([Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)).
- The single exception is `use`, which "can be called in conditionals and loops" — but still only inside a Component or Hook ([`use` reference](https://react.dev/reference/react/use)).

## 6. Effects: when NOT to use them (deriving state vs syncing)

The official guidance is that Effects are an escape hatch to synchronize with **external systems**, and most UI logic should not use them ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)):

- **Derive during render, don't mirror into state via an Effect.** "You don't need Effects to transform data for rendering... transform all the data at the top level of your components. That code will automatically re-run whenever your props or state change." Example: `const fullName = firstName + ' ' + lastName;` — no state, no Effect.
- **Cache expensive derivations with `useMemo`, not an Effect** ([same page](https://react.dev/learn/you-might-not-need-an-effect); see §8).
- **Reset state with a `key`, not an Effect.** Passing a changing `key` makes React "treat [components with a different key] as two different components that should not share any state" ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)).
- **Event-specific logic belongs in event handlers.** "You don't need Effects to handle user events... By the time an Effect runs, you don't know what the user did." For the Toolbar, the download/share/theme/language actions go in the button `onClick`, not an Effect ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)).
- **What Effects ARE for:** "You do need Effects to synchronize with external systems." The canonical example on the page is subscribing to browser events (`window.addEventListener('online'/'offline', …)` with a cleanup that removes them) ([You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)). For this project, legitimate Effect uses are: a `matchMedia` listener for the mobile-drawer breakpoint, reading/writing the theme in `localStorage`, or toggling a class on `document.documentElement`. Always return the matching cleanup.

## 7. TypeScript conventions (React 19 / `@types/react` v19)

- **Type props with `type` or `interface`.** Inline typing is "the simplest way," but "once you start to have a few fields... it can become unwieldy. Instead, you can use an `interface` or `type`"; props "should be an object type described with either a `type` or `interface`" ([TypeScript — typing props](https://react.dev/learn/typescript)). An `interface Props { … }` fits the Toolbar/Drawer.
- **Children:** use `React.ReactNode` — "a union of all the possible types that can be passed as children in JSX." Use the narrower `React.ReactElement` only when you must accept just JSX elements ([TypeScript — children](https://react.dev/learn/typescript)).
- **Hooks typing:** `useState` infers from its initial value; be explicit with a type argument when needed (`useState<boolean>(false)`). For `useContext`, "the type... is inferred from the value passed to the `createContext` call," and for context without a sensible default the docs recommend a "runtime check for its existence and throw an error when not present" ([TypeScript — hooks](https://react.dev/learn/typescript)).
- **Event handlers:** the event type "can often be inferred," but "when you want to extract a function to be passed to an event handler, you will need to explicitly set the type," e.g. `function handleChange(event: React.ChangeEvent<HTMLInputElement>)`; fall back to `React.SyntheticEvent` for uncommon events ([TypeScript — events](https://react.dev/learn/typescript)). For Toolbar buttons that's `React.MouseEvent<HTMLButtonElement>`.
- **Inline styles:** type with `React.CSSProperties` ([TypeScript — style](https://react.dev/learn/typescript)).
- **`useRef` now requires an argument** (React 19 / v19 types). `useRef()` errors; write `useRef(null)` (or `useRef(undefined)`) ([upgrade guide — useRef requires an argument](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#useref-requires-an-argument)).
- **Ref callbacks must not return a value implicitly** — because ref cleanup is now a feature, "returning anything else from a ref callback will now be rejected by TypeScript." Use a block body `ref={current => { instance = current }}` ([upgrade guide — ref cleanup required](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required)).
- **`JSX` global namespace moved to `React.JSX`.** If you augment JSX types, wrap augmentation in `declare module "react"` rather than the old global `JSX` namespace ([upgrade guide — JSX namespace](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#the-jsx-namespace-in-typescript)).

## 8. `useMemo` / `useCallback`: optimization, not default

Both are explicitly framed as performance optimizations to add selectively — **not** to sprinkle everywhere. For two small islands you will rarely need either.

- **`useMemo` is "only valuable in a few cases":** the calculation is "noticeably slow, and its dependencies rarely change"; you pass it to a `memo`-wrapped child; or another Hook depends on it. "There is no benefit to wrapping a calculation in `useMemo` in other cases." And: "You should only rely on `useMemo` as a performance optimization. If your code doesn't work without it, find the underlying problem and fix it first" ([useMemo — should you add it everywhere?](https://react.dev/reference/react/useMemo)).
- **`useCallback` is the same story:** valuable only when passing a function to a `memo`-wrapped child or when the function is a Hook dependency. "You should only rely on `useCallback` as a performance optimization" ([useCallback — how it relates to memo](https://react.dev/reference/react/useCallback)).
- **React Compiler can make manual memoization unnecessary:** "React Compiler automatically memoizes values and functions, reducing the need for manual `useMemo` calls" ([useMemo](https://react.dev/reference/react/useMemo)). (The Compiler is optional and not required to adopt for this project.)

## 9. Removed & deprecated APIs — do not use these in new code

From the React 19 upgrade guide ([upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)):

**Removed:**
- **`propTypes` and `defaultProps` for function components** — `propTypes` are "silently ignored"; "migrating to TypeScript" is recommended, and use ES6 default parameters instead of `defaultProps` ([removed propTypes/defaultProps](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops)).
- **Legacy Context** (`contextTypes` / `getChildContext`) — removed ([legacy context removed](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-removing-legacy-context)).
- **String refs** (`ref="input"`) — removed; use callback refs ([string refs removed](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-string-refs)).
- **Module pattern factories** and **`React.createFactory`** — migrate to regular functions / JSX ([upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)).
- **`react-test-renderer/shallow`** removed; `react-test-renderer` deprecated — migrate to `@testing-library/react` ([upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)).
- **`ReactDOM.render` → `createRoot`; `ReactDOM.hydrate` → `hydrateRoot`; `unmountComponentAtNode` → `root.unmount()`; `ReactDOM.findDOMNode`** removed (use a `useRef` DOM ref) ([react-dom removals](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-react-dom-apis)). (Astro's `@astrojs/react` handles island mounting, so app code shouldn't call these anyway.)
- **UMD builds** — no longer produced; use an ESM CDN like `esm.sh` if you need script-tag usage ([UMD removed](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#umd-builds-removed)).

**Deprecated:** `element.ref` (use `element.props.ref`) ([upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)).

**Required:** the **new JSX transform** ("classic" transform no longer supported) ([upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)).

## 10. Rendering lists & keys (prescriptive)

- **Keys must be unique among siblings** (the same key may repeat across *different* arrays) and **must be stable** — "Keys must not change or that defeats their purpose! Don't generate them while rendering" ([Rules of keys](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)).
- **Don't use array index as key when order can change** — "Index as a key often leads to subtle and confusing bugs" ([rendering lists — pitfall](https://react.dev/learn/rendering-lists)).
- **Never generate keys on the fly** — "do not generate keys on the fly, e.g. with `key={Math.random()}`... Instead, use a stable ID based on the data" ([rendering lists — pitfall](https://react.dev/learn/rendering-lists)).

## 11. Controlled vs uncontrolled inputs

Relevant if the Toolbar has a language `<select>` or a controlled toggle:

- **Controlled** = pass `value` (or `checked`) **plus** an `onChange` that "synchronously updates its backing value"; **uncontrolled** = use `defaultValue`/`defaultChecked` for the initial value only ([`<input>` — controlling an input with a state variable](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)).
- **Don't mix or switch:** "An input can't be both controlled and uncontrolled at the same time," and "An input cannot switch between being controlled or uncontrolled over its lifetime" ([`<input>` caveats](https://react.dev/reference/react-dom/components/input)).
- **`value` without `onChange` is a bug:** it renders a read-only field ("it will be impossible to type into the input... React will revert the input after every keystroke") ([`<input>`](https://react.dev/reference/react-dom/components/input)).

## 12. Accessibility & the `useId` idiom

- **Use `useId` for accessibility-attribute IDs**, not hand-rolled counters. "`useId` is a React Hook for generating unique IDs that can be passed to accessibility attributes" such as `aria-describedby` linking an input to its hint ([useId](https://react.dev/reference/react/useId)). It generates IDs from the component's parent path so server and client match (avoids hydration mismatches) — relevant because Astro server-renders the island's HTML and then hydrates it.
- **Do not use `useId` for list keys:** "Do not call `useId` to generate keys in a list. Keys should be generated from your data" ([useId caveats](https://react.dev/reference/react/useId)).

## 13. StrictMode & hydration expectations

- **StrictMode is a development-only correctness aid.** It makes components "re-render an extra time," runs "an extra setup+cleanup cycle" for every Effect, "double-invoke[s] ref callback functions," and checks for deprecated APIs — and "All of these checks are development-only and do not impact the production build" ([StrictMode](https://react.dev/reference/react/StrictMode)). The practical consequence for this project: **write Effects and ref callbacks that are safe to run twice** (idempotent setup with matching cleanup) — exactly the discipline §6 already requires.
- React's official recommendation is "wrapping your entire app in Strict Mode" ([StrictMode](https://react.dev/reference/react/StrictMode)). In this project the React root is created by Astro's `@astrojs/react`, not by app code, so whether StrictMode wraps the island is an integration concern (see the Astro research doc / integration options) rather than something app code sets via `createRoot` — but authoring islands to StrictMode's double-invocation expectations is still the correct discipline.
- **React 19 improves hydration diagnostics** — hydration mismatches now log "a single message with a diff of the mismatch," and unexpected `<head>`/`<body>` tags from browser extensions/third-party scripts are skipped rather than throwing ([release notes — hydration error diffs / third-party compatibility](https://react.dev/blog/2024/12/05/react-19#diffs-for-hydration-errors)). Because Astro server-renders then hydrates the island, keep the island's initial render deterministic (no `Date.now()`/`Math.random()`/`window`-dependent output during the first render) so server and client HTML match.

---

## Prescriptive vs optional — quick guide

- **Prescriptive ("must" / removed):** Rules of Hooks (§5); no removed APIs (§9); `useRef(null)` and block-body ref callbacks under v19 types (§7); unique/stable keys, never index-when-reordering, never `Math.random()` keys (§10); never `value` without `onChange` and never switch controlled/uncontrolled (§11).
- **Recommended ("we recommend"):** migrate `propTypes` → TypeScript (§9); wrap app in StrictMode (§13); derive state / avoid unnecessary Effects (§6); `useId` for a11y IDs (§12).
- **Optional / situational:** `useMemo`/`useCallback` (only in the specific cases in §8); adopting `ref`-as-prop, ref cleanup, `<Context>` provider (recommended forward-looking wins, §3); document metadata / preload APIs / Actions (client-usable but not needed here, §2/§4).

## Things I could NOT (or chose not to) verify from a primary source

- **How `@astrojs/react` configures the React root / StrictMode for islands.** That is an Astro integration detail, not a react.dev fact; §13 flags it and defers to the Astro research doc. Not asserted here.
- **Whether React Compiler is production-ready for this Astro setup.** The Compiler is mentioned by react.dev as able to auto-memoize ([useMemo](https://react.dev/reference/react/useMemo)), but its release/stability status and Astro/Vite wiring were not researched here — treat adoption as a separate decision.
- **Exact React 19 minor-by-minor changelog (19.0 → 19.2.8).** This doc captures the React 19.0 feature/removal set (the substantive changes) from the official release + upgrade posts; per-patch notes across 19.1/19.2 were not enumerated. `19.2.8` is confirmed as the current `latest` via the npm manifest.
- **`propTypes`/`defaultProps` runtime behavior nuance.** Cited from the upgrade guide as removed/ignored for function components; class `defaultProps` still works per that guide but is irrelevant here (islands are function components).

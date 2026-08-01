# Toolbar & navigation patterns for the CV site's fixed chrome

Research date: **2026-07-31**. This note answered a since-deleted brief proposing a speed-dial and a full-height left rail; ADR-0008 records how both were settled.

**Source policy.** Every claim below is pinned to a source that owns it, and the sources are ranked:

- **Normative** — W3C/WAI: the [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/) patterns, [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), the [WCAG 2.2 Understanding](https://www.w3.org/WAI/WCAG22/Understanding/) documents, and the [WHATWG HTML Standard](https://html.spec.whatwg.org/multipage/dom.html#attr-title). APG is non-normative guidance *about* a normative spec; where that matters it is said.
- **Platform reference** — [MDN](https://developer.mozilla.org/), including its Baseline badges, for anything the browser has to implement.
- **First-party design systems**, cited as evidence of "what the industry actually does", not as law: Apple [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) and Google [Material Design 3](https://m3.material.io/). These two **disagree with each other** in at least two places relevant here, and that disagreement is reported rather than averaged.
- **Empirical research** — Nielsen Norman Group. NN/g owns its own study data; it is labelled *empirical* every time, never *normative*.

Anything that could not be pinned — including two arithmetic estimates and one implementation hazard I inferred from this repo's own code rather than from a source — is listed in the final section, "Things I could NOT pin to a primary source".

Scope: the Toolbar of `src/components/chrome/Toolbar.tsx` / `toolbar.css` — a fixed vertical strip of five icon-only controls (drawer toggle below 51rem, language, PDF download, share, theme) that floats on the leading edge in Paper Mode and drops to the bottom-left in Reading Mode. Background: `CONTEXT.md`, [ADR-0006](../adr/0006-post-ticket-06-responsive-adjustments.md), [ADR-0007](../adr/0007-custom-modal-drawer-and-two-chrome-islands.md).

---

## Recommendation (TL;DR)

**Pattern A should be adopted in part and rejected in part. Two of its four ideas are well supported by first-party sources; two are contradicted by them — and one is contradicted by the source the user is implicitly borrowing it from.**

- **ADOPT — move the drawer toggle to the top of the leading edge.** This is the conventional home for a sidebar/drawer toggle in both major design systems: HIG puts show/hide-sidebar at "the far leading edge" of the toolbar ([HIG Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars)), and M3 says of the navigation rail "The menu icon and FAB should always be top-aligned" ([M3 Navigation rail](https://m3.material.io/components/navigation-rail/guidelines)). It also fixes pain point 1 directly.
- **ADOPT — take the chrome off the container and put it on the buttons.** Both systems endorse this, with a named condition. M3: "The container fill can be turned off so the nav rail appears directly on the surface. When doing this, make sure all items have a minimum of 3:1 color contrast" ([M3 Navigation rail](https://m3.material.io/components/navigation-rail/guidelines)); "If the content beneath the toolbar is visually distinct, elevation can be removed" ([M3 Toolbars](https://m3.material.io/components/toolbars/guidelines)). HIG: "Reduce the use of toolbar backgrounds and tinted controls" ([HIG Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars)). The condition — 3:1 against whatever is behind — is the whole cost.
- **REJECT — the full-height left rail in Reading Mode.** M3 is unambiguous: "Vertical toolbars aren't recommended for compact windows. They take up a significant area of the screen and may feel visually overwhelming", with a Caution card reading "Vertical toolbars can cover important content in compact windows"; and for rails, "Compact windows should always use a navigation bar" ([M3 Toolbars](https://m3.material.io/components/toolbars/guidelines), [M3 Navigation rail](https://m3.material.io/components/navigation-rail/guidelines)). Worse for this repo specifically: **Reading Mode has no horizontal slack left to give.** `.sheets` already has `min-width: 23rem` (§0), so a rail that "must not cover the text" would push the site's minimum viable viewport from ~368 px to ~425 px and drive the measure below M3's own 40-character floor.
- **REJECT — the "tools" speed-dial as specified.** M3's own FAB-menu page carries three separate contraindications that Pattern A trips: "Don't use a FAB menu with a toolbar or navigation rail"; "These should be closely related under a single action, like Share. Avoid grouping unrelated actions in the same FAB menu"; "FAB menu items should always have label text… Don't remove the label" ([M3 FAB menu](https://m3.material.io/components/fab-menu/guidelines)). HIG agrees on the principle: "Try to include all actions in the toolbar if possible, and only add this menu if you really need it" ([HIG Toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars)). Four actions fit; there is no overflow to solve. Empirically, hiding them costs a measured >20% drop in discoverability ([NN/g, *Hamburger Menus and Hidden Navigation*](https://www.nngroup.com/articles/hamburger-menus/)).
- **BUILD Pattern B instead (§6): split navigation from tools.** Drawer toggle pinned **top-leading**; the four tools kept **all visible** in a **horizontal** cluster at the **bottom edge**, inside thumb reach ("it tends to be easier and more comfortable for people to reach a control when it's located in the middle or bottom area of the display" — [HIG Designing for iOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-ios)). This turns a **246 px-tall** strip into a **~44 px-tall** one and reclaims ~200 px of the Colophon's reserved padding (§0) — which *is* pain point 2, measured.
- **If the sub-menu ships anyway, use a disclosure, not a menu.** The revealed set is two links plus one button. APG's own navigation example says of exactly this case: "Although this example uses the word 'menu' in the colloquial sense to refer to a set of navigation links, it does not use the WAI-ARIA menu role" ([APG Disclosure Navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)). A `menu` would force `role="menuitem"` children and a roving tabindex ([APG Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menu/)); a disclosure needs only `aria-expanded` ([APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)). Add Escape-to-close-and-return-focus anyway — APG's disclosure-navigation example does it "to satisfy WCAG 1.4.13".
- **Desktop: keep the vertical strip, but earn it.** M3 explicitly sanctions a vertical floating toolbar "in larger breakpoints… placed on either side of the screen. Vertical toolbars should have a minimum 24dp margin" ([M3 Toolbars](https://m3.material.io/components/toolbars/guidelines)). Add hover/focus-revealed text labels, and **stop relying on `title` for the label** — the HTML Standard: "Relying on the `title` attribute is currently discouraged as many user agents do not expose the attribute in an accessible manner as required by this specification (e.g., requiring a pointing device such as a mouse to cause a tooltip to appear, which excludes keyboard-only users and touch-only users…)" ([WHATWG HTML §3.2.6.1](https://html.spec.whatwg.org/multipage/dom.html#attr-title)).
- **Animation, if built:** `popover` + `@starting-style` + `transition-behavior: allow-discrete`, all Baseline *newly available*; **do not depend on `overlay`**, which MDN reports as "Limited availability… not Baseline" ([MDN `overlay`](https://developer.mozilla.org/en-US/docs/Web/CSS/overlay)). Gate everything on `prefers-reduced-motion` — a sufficient technique for [WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

Baseline table: §10.

---

## 0. What the current Toolbar actually costs, measured

Before judging the redesign, here are the numbers, computed from this repo's own tokens (`src/styles/tokens.css`). They are arithmetic on declared values, not measured in a browser — see the closing section.

**Reading Mode (`width < 51rem`), at a 16 px root:**

| Token | Value | Px |
|---|---|---|
| `--toolbar-button-size` | `2.75rem` | 44 |
| `--space-xs` (inner gap + padding) | `0.25rem` | 4 |
| `--toolbar-border-size` | `1px` | 1 |
| `--space-m` (offset from viewport edges) | `0.875rem` | 14 |
| `--space-xl` (Colophon's own gap) | `2.5rem` | 40 |
| `--reading-column-min` | `23rem` | 368 |
| `--reading-column-max` | `34rem` | 544 |
| `--font-size-body` | `0.875rem` | 14 |
| `--drawer-width` | `min(19rem, 76vw)` | ≤304 |

- `--toolbar-block-size` = `5 × 44 + 6 × 4 + 2 × 1` = **246 px tall**. Strip width = `44 + 2×4 + 2×1` = **54 px**.
- It floats `14 px` from the bottom and leading edges, so it occupies the bottom **260 px** of the leading edge.
- `Colophon.astro` reserves that berth in normal flow: `padding-block-end: calc(--toolbar-block-size + --space-m + --space-xl)` = `246 + 14 + 40` = **300 px of blank page** at the foot of every Reading Mode render.

**That 300 px is pain point 2, quantified.** It is not "the strip covers text" — `position: fixed` means it covers already-read lines, which `toolbar.css` argues for deliberately — it is that the *only* way to keep the strip from landing on the Colophon was to push 300 px of emptiness under it.

**And Reading Mode has no horizontal slack.** `Document.astro` sets `.sheets { min-width: var(--reading-column-min); padding: … var(--space-l) }` with `box-sizing: border-box` (`src/styles/reset.css`). So the column box is **≥368 px wide including its 24 px side padding**, i.e. the site already introduces horizontal scrolling below a ~368 px viewport — under the 320 CSS px that [WCAG 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) asks for ("Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels"). That is a pre-existing finding, not a consequence of the redesign — but it means **there is no width left to donate to a left rail**.

---

## 1. Is Pattern A a recognised pattern? Part by part

Pattern A is a *composite*. Each part has a name in a first-party system; the composite does not, and two of the joins are things those same systems explicitly warn against.

### 1.1 "The toolbar takes the whole left vertical band" → M3 **navigation rail** / **vertical floating toolbar**

Two different M3 components match, and they carry different rules.

- If it carries **navigation**, it is a [navigation rail](https://m3.material.io/components/navigation-rail/guidelines): "The collapsed nav rail runs along the leading edge of the window, and should contain 3–7 navigation items"; "The navigation rail should be placed on the leading edge of the window. This is the left side for left-to-right languages"; "In adaptive layouts, the navigation rail should be placed outside any panes, always along the leading edge of the window. Don't place it within body content." That last line is precisely the user's "without covering the text content" — M3 agrees, and it is why the rail costs *horizontal* space (§3).
- If it carries **actions**, it is a **vertical floating toolbar**: "Floating toolbars can be horizontal or vertical… In larger breakpoints, floating toolbars can be vertical and placed on either side of the screen. Vertical toolbars should have a minimum 24dp margin" ([M3 Toolbars](https://m3.material.io/components/toolbars/guidelines)). This site's Toolbar is four *actions* plus one *navigation* toggle, so this is the closer match.

**Where the sources caution.** M3, same page: "Vertical toolbars aren't recommended for compact windows. They take up a significant area of the screen and may feel visually overwhelming, especially on screens with complex layouts. **Only use them when the screen is simple or when the toolbar has a few controls.**" That last clause is a genuine partial escape hatch — Reading Mode *is* a simple single-column document with five controls. It is not a blanket no; it is a "only if". M3's rail page has no such escape hatch: "Compact: Don't use a standard navigation rail for compact layouts due to space constraints. Use a navigation bar instead."

**HIG disagrees with the vertical form outright**, though with platform-specific reasoning. Its toolbar is horizontal by definition: "A toolbar consists of one or more sets of controls arranged horizontally along the top or bottom edge of the view, grouped into logical sections." Its one explicit "Avoid creating a vertical toolbar" is scoped to visionOS and justified there ("In visionOS, tab bars are vertical, so presenting a vertical toolbar could confuse people") — so it is **not** a general prohibition, and I am not citing it as one.

### 1.2 "The drawer toggle at the top of the band" → HIG leading-edge sidebar control / M3 rail menu icon

Strongly supported. See §2.

### 1.3 "A 'tools' button at the bottom that expands upward" → M3 **FAB menu** (speed dial)

The named pattern is the [FAB menu](https://m3.material.io/components/fab-menu/guidelines): "A FAB menu opens from a FAB to show multiple related actions… This makes actions immediately accessible, and keeps the UI clean by concealing actions when they're not needed." The upward-from-the-anchor motion is even prescribed: "Originate the transition from one of the FAB's trailing corners, preferably the top-aligned corner."

**But M3 contradicts Pattern A on four counts on that one page:**

1. **Placement.** "The FAB menu should be aligned to the trailing edge of the window." Pattern A puts it on the **leading** edge.
2. **Composition.** "FAB menus can contain 2–6 items. These should be closely related under a single action, like Share. **Avoid grouping unrelated actions in the same FAB menu.**" Switch language / download a PDF / copy the URL are three unrelated actions under a generic noun.
3. **Coexistence — the direct hit.** "When a FAB is paired with other components, like the floating toolbar or navigation rail, don't use the FAB menu. This prevents cognitive overload and interface clutter", with a Don't card: "Don't use a FAB menu with a toolbar or navigation rail." Pattern A is a FAB menu *inside* a navigation rail.
4. **Labels.** "FAB menu items should always have label text. The icons shouldn't be removed since they make each item easy to identify", with a Don't card: "Don't remove the label." Pattern A reveals three icon-only buttons.

HIG's equivalent is the **More menu**, and it is grudging: "Add a More menu to contain additional actions. Prioritize less important actions for inclusion in the More menu. **Try to include all actions in the toolbar if possible, and only add this menu if you really need it.**" And on iOS specifically: "Prioritize only the most important items for inclusion in the main toolbar area. Because space is so limited, carefully consider which actions are essential… Create a More menu to include additional items." The trigger for both is **overflow**. M3 says the same: "When actions don't fit in a toolbar, add a menu"; "If more actions are needed, use an overflow menu."

**Four actions in a 44 px cluster do not overflow anything.** The redesign would be creating an overflow menu with nothing to overflow.

### 1.4 "The buttons carry the background, not the container" → supported, with a contrast condition

Both systems endorse it, and M3 attaches the exact condition:

- M3 rail: "The container fill can be turned off so the nav rail appears directly on the surface. **When doing this, make sure all items have a minimum of 3:1 color contrast.**"
- M3 toolbars: "Floating toolbars have elevation by default. If the content beneath the toolbar is visually distinct, elevation can be removed."
- HIG: "Reduce the use of toolbar backgrounds and tinted controls. Any custom backgrounds and appearances you use might overlay or interfere with background effects that the system provides."

For this repo the condition bites: today the container's `--color-aside-bg` fill is what guarantees the icon's contrast. Remove it and the buttons float over `--color-main-bg` (the white paper surface, in both themes per `Document.astro`) *and*, when the Drawer is open, over `--color-aside-bg`. Each button pill must therefore hit 3:1 against **both**.

### 1.5 Verdict on the composite

Pattern A is best described as **an M3 navigation rail with an M3 FAB menu docked at its foot, deployed at a compact breakpoint.** Every individual piece exists in M3; M3 tells you not to combine them ("Don't use a FAB menu with a toolbar or navigation rail"), not to use the vertical form at compact ("Vertical toolbars aren't recommended for compact windows"), and to put the expanding menu on the opposite edge from where Pattern A puts it. Where M3 does allow a vertical toolbar and a rail together, it insists they be on **opposite** edges: "Vertical toolbars should be positioned opposite the navigation rail to balance out the screen and keep actions easy to access." Pattern A merges them onto one.

---

## 2. Does it solve pain point 1 — "opening the Drawer from the bottom of the page isn't intuitive"?

**Yes, and this is the strongest part of the proposal.** But the evidence genuinely cuts both ways, so here is both sides.

### For "top-leading is the convention"

- **HIG, Toolbars → Item groupings:** "**Leading edge.** Elements that let people return to the previous document and **show or hide a sidebar appear at the far leading edge**, followed by the view title… To ensure that these items are always available, items on the toolbar's leading edge aren't customizable." That is the drawer toggle, by name, pinned top-leading and made non-removable.
- **M3, Navigation rail:** "**The menu icon and FAB should always be top-aligned.**" And, for mobile: "Expanded navigation rails can open from menu buttons on mobile"; for >5 destinations, "hide the navigation behind a menu icon using a modal expanded navigation rail" ([M3 Navigation bar](https://m3.material.io/components/navigation-bar/guidelines)). The menu icon that reveals a drawer is top-of-the-leading-edge in M3 too.
- **M3, Navigation rail, Don't card:** "Avoid placing the FAB below navigation items." The rail's *action* affordance belongs at the top too, not the foot — which is the mirror image of Pattern A's layout.
- Empirically, NN/g's *Mobile Navigation Patterns* records that a hidden navigation menu "makes the navigation options least discoverable" and that "**Even users who tried the navigation menu at some point during a session may not remember to do so later on**" — i.e. an unconventionally-placed toggle is not just slower once, it fails to build a habit. (*Empirical research, not a spec.*)

### Against — "bottom is where the thumb is"

- **HIG, Designing for iOS:** "Support interactions that accommodate the way people usually hold their device. For example, **it tends to be easier and more comfortable for people to reach a control when it's located in the middle or bottom area of the display**." Apple's own tab bars and toolbars sit at the bottom edge on iPhone for this reason.
- **M3, Breakpoints → What should be repositioned:** "Repositioning is also a way to match the ergonomic and input needs that change across device sizes, such as **shifting actions from the bottom of a compact window to the leading edge of medium and expanded windows**", and among the things to consider: "Ensuring reachability for navigation and interactive elements."
- **M3, Navigation rail:** "On tablets, use center alignment to make it easier to reach items" — reachability beats top-alignment when the screen is big enough to matter.

### Resolution

The two sides are not actually in conflict once you separate **navigation** from **actions** — which is exactly what both systems already do:

- **Navigation** (the drawer toggle): conventional, learn-once, used at most twice per visit. Both systems put it top-leading. Convention wins; reach is nearly irrelevant for a control tapped once.
- **Actions** (language, download, share, theme): repeated, and the ones a thumb wants. Both systems put actions at the bottom on compact windows.

So Pattern A gets pain point 1 right and then, by dragging the actions up onto the same vertical band, gives back the ergonomic advantage the current bottom placement already has. **The correct move is to split them, not to move both** — which is Pattern B (§6). M3 says as much for the two-toolbar case: "Vertical toolbars should be positioned opposite the navigation rail"; "Keep navigation distinct, and use a toolbar to display local navigation on a specific page" ([M3 Toolbars](https://m3.material.io/components/toolbars/guidelines)).

---

## 3. Does it solve pain point 2 — vertical space in Reading Mode?

**It converts a vertical cost into a horizontal cost, and on this site the horizontal budget is already spent. Net: it makes things worse.**

### 3.1 What is actually reclaimed

Pattern A removes the 246 px strip from the bottom-left, so `Colophon.astro`'s 300 px reserved berth (§0) can go. That is a real gain — the largest single win available.

But **Pattern B gets the same gain more cheaply.** A horizontal cluster of four 44 px buttons with 4 px gaps is 44 px tall; the Colophon's reservation drops from 300 px to `44 + 14 + 40` = **98 px**. Same ~200 px reclaimed, zero horizontal cost.

### 3.2 What the rail costs horizontally

A rail sized to this repo's touch tier is `44 + 2×4 + 2×1` = **54 px**, and M3 requires a margin: "Vertical toolbars should have a minimum 24dp margin." So call it **~78 px of reserved horizontal band** to do it by M3's book, or ~68 px at the repo's existing `--space-m` × 2.

Against a Reading Mode whose column box is already `min-width: 23rem` (368 px) *including* 24 px of side padding:

| Viewport | Column box today | With a ~68 px rail beside it | Verdict |
|---|---|---|---|
| 320 px ([1.4.10 target](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)) | 368 px → **already overflows by 48 px** | 368 px → overflows by 116 px | worse |
| 360 px (common Android) | 368 px → overflows by 8 px | overflows by 76 px | worse |
| 375 px | fits, 7 px spare | overflows by 61 px | fits → breaks |
| 430 px | fits | fits with ~0 spare | marginal |

**The rail raises the site's minimum viable viewport from ~368 px to ~436 px.** WCAG 1.4.10's Understanding document names this failure mode: fixed and sticky content "can significantly obstruct reflowed content… When such elements remain statically positioned during zooming, they diminish the space available for reading."

### 3.3 What it costs the measure

M3 gives a number for line length: "**Across all breakpoints, adjust margins and type styles to keep text between 40–60 characters per line**" ([M3 Breakpoints](https://m3.material.io/foundations/layout/breakpoints/overview)).

Reading Mode's `--font-size-body` is `0.875rem` = 14 px. At a 375 px viewport the text box is 375 − 48 = 327 px ≈ **23 em ≈ ~46 characters** (using the common ~0.5 em average advance — flagged as unsourced in the closing section). That is already at M3's low end. Take 68 px away and you get 259 px ≈ 18.5 em ≈ **~37 characters — below M3's stated floor**.

So: a left rail on a phone trades ~200 px of vertical padding (which the reader scrolls past once) for a permanent ~20% reduction in line length (which the reader pays for on every line). That is the wrong trade for a document-reading site.

### 3.4 Target size — what the redesign must not regress

- [WCAG 2.5.8 Target Size (Minimum), AA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): "The size of the target for pointer inputs is at least **24 by 24 CSS pixels**", with a *Spacing* exception — "Undersized targets… are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target."
- [WCAG 2.5.5 Target Size (Enhanced), AAA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html): "at least **44 by 44 CSS pixels**."
- [M3 Toolbars](https://m3.material.io/components/toolbars/guidelines): "All elements need a minimum **48x48dp** target area to be accessible."
- [NN/g, *Touch Targets on Touchscreens*](https://www.nngroup.com/articles/touch-target-size/) (*empirical*): "Interactive elements must be at least **1cm × 1cm** (0.4in × 0.4in) to support adequate selection time and prevent fat-finger errors"; the MIT Touch Lab figures are "fingertips are 1.6–2cm wide… the impact area of the typical thumb… an average of 2.5cm (1 inch) wide."

**The current code passes all four in Reading Mode** (44 px ≥ 24, = 44, and 1 cm ≈ 37.8 px at 96 dpi; it is 4 px short of M3's 48 dp). In Paper Mode 36 px clears 2.5.8 and 1 cm but not 2.5.5/M3. **Any narrowing of the buttons to fit a rail into a 320–375 px viewport is the fastest way to lose the AAA target size the site currently holds for free.** Do not shrink them.

### 3.5 Focus obscuring

- [WCAG 2.4.11 Focus Not Obscured (Minimum), AA](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html): "When a user interface component receives keyboard focus, the component is **not entirely hidden** due to author-created content." Its Understanding doc names sticky footers, sticky headers and non-modal dialogs as "typical types of content that can overlap focused items", and offers `scroll-padding` as a remedy.
- [WCAG 2.4.12 Focus Not Obscured (Enhanced), AAA](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html): "**no part** of the component is hidden by author-created content."
- M3 says the same thing for the specific component Pattern A wants: "To ensure accessibility for keyboard users on the web, avoid positioning the FAB menu to completely obscure the focus indicator of an actionable element. Partially covering the desired element is fine, as long as the focus indicator is visible" ([M3 FAB menu](https://m3.material.io/components/fab-menu/guidelines)).

A **fixed left rail is safer than a bottom strip** on 2.4.11, because focus rings scroll into view vertically and a left rail never sits in that path. A bottom strip *can* obscure a focused control that a Tab has just scrolled to the bottom edge. **This is the one accessibility argument in Pattern A's favour**, and Pattern B has to answer it — see §6.3.

---

## 4. The "tools" speed-dial: menu button, disclosure, or popover?

### 4.1 What is being revealed

Language (an `<a href>`), PDF download (an `<a download>`), share (a `<button>` that writes the clipboard). **Two links and one button** — a mixed bag, which is the deciding fact.

### 4.2 Menu button — what it obliges

[APG Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/): "A menu button is a button that opens a menu as described in the Menu and Menubar Pattern." It requires `aria-haspopup` "set to either `menu` or `true`", `aria-expanded` `true`/`false`, optional `aria-controls`; and on the trigger, "Enter: opens the menu and places focus on the first menu item", same for Space.

That pulls in the whole [APG Menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/), whose container may only hold items with role `menuitem`, `menuitemcheckbox` or `menuitemradio`, and which mandates a **roving tabindex** (items at `tabindex="-1"`) or `aria-activedescendant`. Concretely, for this case, you would owe:

- `role="menu"` on the container, `role="menuitem"` on each of the three;
- arrow-key navigation with Home/End, focus wrap, typeahead;
- roving tabindex bookkeeping in the Preact island;
- Escape closing and returning focus to the trigger;
- **and you would be overriding the native semantics of two `<a>` elements** — a `role="menuitem"` on an anchor removes it from the link list that screen-reader users navigate by.

This is the same class of machinery `Toolbar.tsx` already refuses for `role="toolbar"` ("that role obliges arrow-key navigation with a roving tabindex, and five controls in the tab order need no such thing"). Adopting it here would be inconsistent with the repo's own stated reasoning.

### 4.3 Disclosure — what it obliges

[APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): "A disclosure is a widget that enables content to be either collapsed (hidden) or expanded (visible). It has two elements: a disclosure button and a section of content whose visibility is controlled by the button." Requirements, in full:

- "The element that shows and hides the content has role `button`" — a native `<button>` satisfies it;
- "When the content is visible, the element with role `button` has `aria-expanded` set to `true`. When the content area is hidden, it is set to `false`";
- "Optionally… `aria-controls` that refers to the element that contains all the content";
- Keyboard: Enter and Space toggle. **That is the entire keyboard contract.** No arrow keys, no roving tabindex, no focus management specified.

The revealed links and button keep their native roles and stay in the normal tab order — which [WCAG 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) is satisfied by as long as they are adjacent to the trigger in the DOM ("For non-modal dialogs, focus moves through dialog elements immediately after the trigger button").

### 4.4 APG itself answers the question

APG ships a worked example for precisely this shape and states the reasoning in the first paragraph: "**Although this example uses the word 'menu' in the colloquial sense to refer to a set of navigation links, it does not use the WAI-ARIA `menu` role**" ([APG Disclosure Navigation Menu](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)). Its keyboard table is Tab / Space-or-Enter / Escape, with arrow and Home/End keys marked **optional** — and it adds Escape deliberately: closing the dropdown and returning focus to the controlling button "is necessary to satisfy WCAG 2.1's [Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) criterion (1.4.13)."

**Disclosure wins on every axis for this case: less machinery, correct semantics for links, no override of native roles, and an APG example that matches the content type exactly.** Add Escape-to-close-and-return-focus even though the disclosure pattern does not demand it.

M3 does note the other convention for desktop — "On web, the FAB menu uses a menu component for an experience that's consistent with other desktop apps" ([M3 FAB menu](https://m3.material.io/components/fab-menu/guidelines)) — which is a real disagreement with APG's disclosure-for-links advice. APG is the accessibility authority and its example is content-type-specific; I side with APG here and flag the disagreement.

### 4.5 The `popover` attribute as the implementation

If the sub-menu ships, the HTML [`popover`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover) attribute does most of the work for free. MDN: an `auto` popover "can be 'light dismissed' — you can hide the popover by clicking outside it or pressing the Esc key"; and via `popovertarget`, "An implicit `aria-details` and `aria-expanded` relationship is set up between the invoker and the popover… When closing the popover via keyboard (usually Esc), focus shifts back to the invoker" ([MDN Using the Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using)). That is `aria-expanded`, Escape and focus return, all native. **Baseline 2024, newly available since April 2024.**

Two repo-specific hazards, both inferred from this codebase rather than from a source (flagged in the closing section):

1. **Escape collides with the Drawer.** `Drawer.tsx` registers a *document-level* `keydown` listener that closes the Drawer on Escape (deliberately, per ADR-0007, "because focus may legitimately be in the Toolbar while the panel is open"). A popover's Escape close-request does not stop that keydown reaching the document, so one Escape would close both the popover and the Drawer. Guard it — e.g. bail out of the Drawer handler when `document.querySelector(':popover-open')` is non-null.
2. **The top layer outranks `z-index: 4`.** A shown popover renders in the top layer, above the Drawer's panel (`z-index: 3`) and backdrop (`z-index: 2`) regardless of stacking context. That is desirable here, but it means the popover is *not* subject to the panel-edge translate that `toolbar.css` applies via `[data-drawer-open] { translate: var(--drawer-width) 0 }` — the popover would have to be repositioned independently. [CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name) would solve it (`anchor-name` / `position-anchor`), but it is only **Baseline 2026, newly available since January 2026**, so it needs a fallback.

### 4.6 The discoverability cost of hiding three visible actions

This is the part of Pattern A most exposed, and there is hard data.

[NN/g, *Hamburger Menus and Hidden Navigation Hurt UX Findings*](https://www.nngroup.com/articles/hamburger-menus/) (*empirical research* — 179 participants across 6 sites, mobile and desktop):

- "content discoverability was significantly lower when the navigation was hidden" — "**a more than 20% drop in discoverability** on sites with hidden navigation, compared with sites with visible or combo navigation";
- task time: users were "at least **39% slower** when the navigation was hidden" on desktop, "**15% slower**" on mobile;
- perceived difficulty rose 21% (2.6 vs 2.1 on a 1–7 scale);
- on desktop, "people used the hidden menus in only **27%** of the cases, while they used visible or combo navigation almost twice as much: in 48% and 50%."

The design systems say the same in prose:

- HIG: "Try to include all actions in the toolbar if possible, and only add this menu if you really need it"; and (visionOS-scoped but for a general reason) "A pull-down menu lets you offer additional actions related to a toolbar item, but **can be difficult for people to discover** and may clutter your interface."
- HIG, Designing for iOS: "Help people concentrate on primary tasks and content by limiting the number of onscreen controls **while making secondary details and actions discoverable with minimal interaction**."

**And the label makes it worse.** "Tools" is a generic noun that names no action. HIG: "Make sure the meaning of each control is clear. **Don't make people guess or experiment to figure out what a toolbar item does.**" [NN/g, *Icon Usability*](https://www.nngroup.com/articles/icon-usability/) (*empirical*): "Due to the absence of a standard usage for most icons, text labels are necessary to communicate the meaning and reduce ambiguity"; only "home, print, and the magnifying glass for search" enjoy "mostly universal recognition"; "always include a visible text label."

Multiply through for this site: language switch and PDF download are, for a CV, arguably the **two most valuable actions on the page** — the recruiter who wants the English version or the PDF. Putting them one tap deeper behind an icon labelled "tools" is a 20%+ discoverability tax on the site's primary conversion actions, paid to reclaim vertical padding that a horizontal cluster reclaims for free.

---

## 5. Animation: what makes the upward expansion acceptable

### 5.1 The accessibility floor

- [WCAG 2.3.3 Animation from Interactions (AAA)](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html): "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed." Its Understanding doc names `prefers-reduced-motion` as a sufficient technique. Note the level: **AAA**, so it is a quality bar, not a conformance obligation at AA — but the repo already commits to it (`docs/coding-standards.md`: "Collapse transitions under `@media (prefers-reduced-motion: reduce)`").
- [MDN `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): detects "a setting on their device to minimize the amount of non-essential motion… Such animations can trigger discomfort for those with vestibular motion disorders." **Baseline widely available since January 2020.**
- The repo's existing `reset.css` collapses transition *durations* under `reduce` but `drawer.css` has to zero `transition-delay` separately — a precedent worth copying if the expansion uses staggered delays. **A staggered speed-dial is exactly the kind of animation that needs the `reduce` branch to be a straight `display` swap, not a faster stagger.**
- If the revealed panel is hover-triggered at any point, [WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) applies in full — Dismissible, Hoverable, Persistent. Keep it click/press-triggered and 1.4.13's tooltip clauses stay out of scope for the panel itself.

### 5.2 The CSS mechanics of animating a `display`/popover change

- [MDN `@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style): needed because "CSS transitions are by default not triggered on an element's initial style update, or when its `display` type changes from `none` to another value. To enable first-style transitions, `@starting-style` rules are needed." **Baseline 2024, newly available since August 2024.**
- [MDN `transition-behavior`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior): `allow-discrete` starts "transitions… on the element for discrete animated properties" — required on `display` "so that the animated element is visible… throughout both the entry and exit animation", and on `overlay` "to make sure that the removal of the element from the top layer is deferred until the animation has been completed." **Baseline 2024, newly available since August 2024.**
- [MDN `overlay`](https://developer.mozilla.org/en-US/docs/Web/CSS/overlay): "can *only* be set by the browser", and transitioning it with `allow-discrete` "causes its removal from the top layer to be deferred so it can be animated instead of disappearing immediately." **⚠ Not Baseline — "Limited availability… does not work in some of the most widely-used browsers", and marked Experimental.**

**Consequence for this project:** the *entry* animation (`@starting-style` + `transition-behavior: allow-discrete` on `display`) is on solid, cross-engine ground. The *exit* animation of a top-layer popover depends on `overlay`, which is not. If the exit animation must be reliable in every engine, either (a) accept an instant close where `overlay` is unsupported, or (b) skip `popover` and animate a plain absolutely-positioned panel with `visibility` + `transition-delay` — which is precisely the technique `drawer.css` already uses and documents ("`visibility` waits out the slide, so the panel is still painted while it leaves"). **Option (b) is more consistent with this codebase and needs no new Baseline bets**, at the price of hand-writing Escape and focus return that `popover` would have given free.

### 5.3 Bottom-edge specifics

If anything is pinned to the bottom edge of a phone viewport:

- [MDN `env()`](https://developer.mozilla.org/en-US/docs/Web/CSS/env) — `safe-area-inset-bottom` is "the safe distance from the… bottom… inset edge of the viewport, defining where it is safe to place content into without risking it being cut off by the shape of a non-rectangular display." **Baseline widely available since January 2020.** Add it to the bottom offset so the cluster clears the home indicator.
- [MDN viewport units](https://developer.mozilla.org/en-US/docs/Web/CSS/length) — prefer `svh` ("the smallest possible viewport… 'safer' to use in general") over `dvh` for anything that must not move, since MDN warns that `dvh` "can cause the content to resize while a user is scrolling a page. This can lead to degradation of the user interface and cause a performance hit."

---

## 6. Pattern B (recommended) — split navigation from tools

**Shape.** Two pieces of chrome instead of one strip.

1. **Drawer toggle** — one 44 px control, fixed at the **top of the leading edge**, `--space-m` from both edges. Present only below 51rem, as today. Sources: HIG "show or hide a sidebar appear at the far leading edge"; M3 "The menu icon and FAB should always be top-aligned"; M3 "Expanded navigation rails can open from menu buttons on mobile."
2. **Tools cluster** — the four actions in a **horizontal** row, fixed at the **bottom**, all four visible, no disclosure. `4 × 44 + 3 × 4` = **188 px wide × 44 px tall**. Sources: M3 "Vertical toolbars aren't recommended for compact windows"; the docked toolbar is M3's compact answer ("Only place docked toolbars at the bottom of the window"); HIG's toolbar is horizontal "along the top or bottom edge of the view" and its reachability guidance favours the bottom.
3. **Container chrome moves onto the buttons** (Pattern A's own idea, kept), subject to M3's 3:1 rule.

**Alignment choice.** Bottom-**centre** or bottom-**leading**? M3 for compact docked toolbars: "In compact breakpoints, elements in the toolbar should be evenly spaced"; and for reach, "Align controls to the edge of the screen to make them easier to reach on tablets." Bottom-leading keeps the strip out of the way of the home-indicator gesture area's centre and preserves the existing "rides the Drawer's edge" behaviour (`.toolbar[data-drawer-open] { translate: var(--drawer-width) 0 }`) with no change — **at 320 px, `--drawer-width` is `76vw` = 243 px, leaving 77 px of screen, which is not enough for a 188 px horizontal cluster.** So the cluster must either shrink to two visible controls while the panel is open, or be centred/reflowed then. This is Pattern B's one genuine complication and it needs a decision.

**What it fixes:**
- Pain point 1 — yes, by the same mechanism as Pattern A, and on the same sources.
- Pain point 2 — yes, and by nearly the same amount: Colophon reservation drops 300 px → 98 px.
- Discoverability — all four actions stay visible; no 20% tax.
- Horizontal measure — untouched. No new minimum viewport.
- Target size — 44 px preserved; 2.5.5 AAA held.

**What it costs:**
- Two pieces of fixed chrome instead of one. HIG cautions "Minimize the number of groups… In general, aim for a maximum of three" — two is fine. M3 cautions "Don't use multiple toolbars in compact windows. There typically isn't enough room on screen. Instead, use one toolbar for all actions" — **this is a real objection**, but M3's own framing separates *navigation* from *toolbars* ("Keep navigation distinct, and use a toolbar to display local navigation on a specific page"; "Show the navigation bar on primary pages, and toolbars on subsequent pages"), and a single top-left toggle is navigation, not a second toolbar.
- The Drawer-open reflow above.

**§6.3 — the 2.4.11 answer.** A bottom-fixed cluster can obscure a focused control. Two mitigations, both first-party: WCAG 2.4.11's Understanding doc names `scroll-padding` ("'scroll padding' ensuring 'the item with keyboard focus' remains visible as content shifts"), so set `scroll-padding-block-end` on the scroller to at least the cluster's height plus its offset (`44 + 14` = 58 px, plus `safe-area-inset-bottom`). Second: the cluster is 188 px wide and leading-aligned, so it only overlaps the leftmost half of the bottom line — and 2.4.11 requires only that the focused component is not *entirely* hidden. Combining both gets you 2.4.12 (AAA) as well.

---

## 7. Pattern C — the scroll-aware toolbar

**Shape.** Keep today's placement, but let the chrome yield while the reader is reading: collapse or slide off on scroll-down, return on scroll-up.

**First-party support is explicit.** [M3 Toolbars → Behavior → Scrolling](https://m3.material.io/components/toolbars/guidelines): "Docked toolbars can either remain on the screen during scroll, or animate offscreen"; "**Floating toolbars can remain on the screen, animate offscreen, or collapse into a single, high-emphasis action on scroll**"; and a Don't: "**Don't collapse actions and scroll at the same time**" — pick one behaviour, not both. HIG: "Consider temporarily hiding toolbars for a distraction-free experience. Sometimes people appreciate a minimal interface to reduce distractions or reveal more content. If you support this, do so contextually when it makes the most sense, and **offer ways to reliably restore hidden interface elements**."

**What it fixes:** pain point 2 at its sharpest — the chrome is gone precisely while reading. It composes with Pattern B (a 44 px cluster that slides away is even cheaper).

**What it does not fix:** pain point 1, at all. And it adds real costs:

- A scroll listener in the `Toolbar` island — new machinery in a repo whose first principle is KISS (`docs/coding-standards.md`).
- **2.4.11 risk on return.** Chrome that reappears on scroll-up is exactly the "sticky footer/header" case WCAG 2.4.11's Understanding doc calls out; it can re-cover a control that has just received focus. Needs the same `scroll-padding` remedy, plus a rule that the chrome always returns when focus enters it.
- NN/g, *Sticky Headers* (*empirical*): "Sticky headers inherently take up space on the screen that could be used for content" and "when implemented poorly, sticky headers are annoying, distracting, and obstruct page content"; the recommendation is to "maximize the content-to-chrome ratio by keeping it small" — i.e. **shrinking the chrome is the first-line fix, hiding it is second-line.** That ordering argues for doing Pattern B first and Pattern C only if 98 px still feels like too much.

**Verdict: a good phase-2, a bad phase-1.**

---

## 8. Pattern D (considered, not recommended) — a full-width docked bottom bar

M3's canonical compact answer. "Only place docked toolbars at the bottom of the window"; "The docked toolbar should always span 100% of the screen width"; "As long as there's a minimum of 16dp padding on the leading and trailing edge, arrange controls inside however you see fit."

**Rejected for this site**, for two sourced reasons and one repo reason:

1. It is a *bar*, opaque and full-bleed, which reintroduces exactly the container chrome the user wants to remove — and M3 notes "The baseline bottom app bar is no longer recommended, but is still supported."
2. M3's **navigation bar** (the other full-width bottom component) is for **destinations**: "Navigation bars provide access to three to five destinations"; "Navigation bars shouldn't be used for accessing single tasks." This site has **one page and zero destinations**. The navigation-bar pattern does not apply; the *toolbar* pattern does.
3. A full-bleed bar at the foot of a document that is "paper" fights `CONTEXT.md`'s premise that the Chrome is a light frame around a sheet, and it costs the full 44 px + safe-area across the whole width rather than 188 px of it.

Pattern B is a *floating* toolbar, which M3 distinguishes precisely on this axis: "Floating toolbar — floats above the body content… The container should only be as big as needed to hold the items inside."

---

## 9. Desktop (Paper Mode, ≥51rem)

"Leave it as is" is defensible — M3 sanctions the exact thing that already ships: "In larger breakpoints, floating toolbars can be vertical and placed on either side of the screen." But four things are worth doing.

### 9.1 Reveal the labels on hover **and** focus

M3's expanded rail is the named pattern: "There are two variants of navigation rails, collapsed and expanded, which can easily transform into each other when the menu button is selected"; "The label text should be a short, meaningful description of each navigation destination and another way for users to understand an icon's meaning"; "All navigation items require a one word label text." Apple does the same in visionOS: "When people look at a toolbar item that contains a symbol, visionOS reveals the text label, providing additional information."

Empirically this is the strongest single improvement available: [NN/g, *Icon Usability*](https://www.nngroup.com/articles/icon-usability/) — "text labels are necessary to communicate the meaning and reduce ambiguity", and labels "should be visible at all times, without any interaction from the user." (*Empirical.* Always-visible labels are the ideal; hover/focus-revealed is the compromise this layout can afford.)

If the reveal is hover-triggered, [WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) applies: Dismissible, Hoverable, Persistent. A width-expanding rail whose labels are *inside* the control (not floating over content) sidesteps most of 1.4.13, because nothing is obscured and nothing needs dismissing — that is the cheaper design. **But an expanding rail changes the geometry the Toolbar floats over**, and at the medium tier `toolbar.css` already notes "an unscaled A4 Sheet already fills the viewport (ADR-0006) and there is no margin left to float over." So: expand toward the viewport edge, or gate the expansion on `width >= 102rem` where there is margin to spare.

### 9.2 Stop relying on `title` for the tooltip

`Toolbar.tsx` currently ships `aria-label` **and** `title` on every control, with a comment that `title` "rides alongside because it is what draws the tooltip, not because it names anything." The accessible name is correct. The **tooltip** is the problem:

- [WHATWG HTML §3.2.6.1](https://html.spec.whatwg.org/multipage/dom.html#attr-title), verbatim: "Relying on the `title` attribute is currently discouraged as many user agents do not expose the attribute in an accessible manner as required by this specification (e.g., requiring a pointing device such as a mouse to cause a tooltip to appear, which excludes keyboard-only users and touch-only users, such as anyone with a modern phone or tablet)."
- [WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) exempts it — "Examples of additional content controlled by the user agent include browser tooltips created through use of the HTML `title` attribute" — which is exactly the point: `title` is exempt *because it is not yours to control*, and it appears for no one who is not using a mouse.

**So a keyboard user on desktop, and every touch user, gets no visible label at all today.** The §9.1 hover/focus label fixes this properly; once it exists, `title` should be dropped rather than duplicated (a custom tooltip *plus* a native one produces two overlapping tooltips, and the custom one then owes 1.4.13's three clauses).

### 9.3 Keep the container-off treatment honest against the paper

Pattern A's transparent container is *more* attractive on desktop than on mobile: the strip floats over the page margin, so removing the fill lets the paper read as continuous. M3's condition still applies verbatim — "make sure all items have a minimum of 3:1 color contrast" — and on Paper Mode the backdrop behind the strip is the page/margin colour, which differs between themes. At the medium tier, where the Sheet fills the viewport, the strip sits over the Sheet itself, so the contrast check has to be done against `--color-main-bg` **and** `--color-aside-bg` **and** the page background, in both themes.

### 9.4 The `role="toolbar"` question — sources disagree

`Toolbar.tsx` deliberately omits `role="toolbar"`. The sources split:

- **M3 says add it:** "On web, the toolbar container should have the `toolbar` role. On mobile, it can be a generic container" ([M3 Toolbars — Accessibility](https://m3.material.io/components/toolbars/accessibility)). Its keyboard table, though, reads "Tab **or** Arrows: Navigate between interactive elements."
- **APG says the role costs more than that.** [APG Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/): "A toolbar is a container for grouping a set of controls"; use it "as a grouping element only if the group contains 3 or more controls"; and the keyboard contract is that **Tab moves into and out of the toolbar as a single stop**, while Left/Right (Up/Down when vertical) move between controls — a roving tabindex. A vertical toolbar additionally needs `aria-orientation="vertical"` and an `aria-label`.

M3's "Tab or Arrows" is not APG's contract; APG's is the one that matches how assistive technology users will expect `role="toolbar"` to behave. **The repo's existing decision stands**: with five controls and no crowded tab order to relieve, the role buys a grouping announcement at the price of hand-written roving tabindex. Keep it off, and keep the comment in `Toolbar.tsx` that explains why. If it is ever added, it must come with arrow-key navigation, `aria-orientation="vertical"`, and an `aria-label` — not just the attribute.

---

## 10. Baseline / support summary

Per MDN's Baseline badges. "Widely available" = safe unconditionally; "Newly available" = shipped across current engines, gate with `@supports` or a fallback if older versions matter; "Limited availability" = do not depend on it.

| Feature | Baseline | Since | Note for this project |
|---|---|---|---|
| [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) | Widely available | Jan 2020 | Mandatory gate on any expansion animation |
| [`env()` / `safe-area-inset-*`](https://developer.mozilla.org/en-US/docs/Web/CSS/env) | Widely available | Jan 2020 | Bottom-edge clearance on notched phones |
| [`popover` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover) | Newly available (2024) | Apr 2024 | Free Escape, light dismiss, `aria-expanded`, focus return |
| [`@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style) | Newly available (2024) | Aug 2024 | Required for the *entry* transition from `display: none` |
| [`transition-behavior: allow-discrete`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior) | Newly available (2024) | Aug 2024 | Required to transition `display` (and `overlay`) |
| [`overlay`](https://developer.mozilla.org/en-US/docs/Web/CSS/overlay) | **Limited availability** (experimental) | — | **Do not depend on it.** Exit animation of a top-layer popover degrades to instant |
| [`anchor-name` / anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name) | Newly available (2026) | Jan 2026 | Would tether the popover to its trigger; needs a fallback |
| `svh` / `dvh` ([MDN length](https://developer.mozilla.org/en-US/docs/Web/CSS/length)) | see note | — | Prefer `svh`; MDN warns `dvh` "can cause the content to resize while a user is scrolling" |

Existing project features already cleared in [`modern-css-best-practices.md` §9](modern-css-best-practices.md#9-baseline-availability-summary) — `@layer`, logical properties, `:focus-visible`, `color-mix()`, `light-dark()` — are unchanged by anything here.

---

## 11. Recommendation, stated plainly

**Do not adopt Pattern A as-is.** Adopt two of its four ideas, drop the other two, and take the shape of Pattern B.

**Ship (phase 1):**

1. **Drawer toggle → top of the leading edge**, below 51rem. This is the fix for pain point 1 and it is the best-sourced change in the whole note (HIG's "far leading edge" for the sidebar control; M3's "The menu icon and FAB should always be top-aligned").
2. **Tools → a horizontal 4-button cluster at the bottom edge**, all four visible, `+ env(safe-area-inset-bottom)`. Colophon reservation `300 px → 98 px`. This is the fix for pain point 2, and it costs nothing horizontally.
3. **Container chrome onto the buttons.** Verify 3:1 for each button against every surface it can float over, per M3's stated condition.
4. **`scroll-padding-block-end` ≥ 58 px + safe area**, for WCAG 2.4.11.
5. **Desktop: hover/focus-revealed labels on the vertical strip, and retire the `title` tooltip** once a real label exists.

**Do not ship:**

- **The full-height left rail on mobile.** M3: "Vertical toolbars aren't recommended for compact windows"; "Compact windows should always use a navigation bar." And this repo has no horizontal budget: `min-width: 23rem` on `.sheets` means the rail raises the minimum viable viewport from ~368 px to ~436 px and cuts the measure to ~37 characters, under M3's own 40-character floor.
- **The "tools" speed-dial.** This is the weakest part of the proposal and the one to cut first. M3's FAB-menu page contradicts it four times over (trailing edge, related actions only, "Don't use a FAB menu with a toolbar or navigation rail", "Don't remove the label"); HIG's overflow menu is triggered by overflow that does not exist here; and NN/g measures the cost of hiding at >20% discoverability and 15% slower on mobile — levied on the language switch and the PDF download, which for a CV are the point of the page.

**Consider later (phase 2):** the scroll-aware behaviour of §7, which M3 explicitly sanctions ("Floating toolbars can remain on the screen, animate offscreen, or collapse into a single, high-emphasis action on scroll") and which composes cleanly with a 44 px cluster. NN/g's ordering — shrink first, hide second — says do it after phase 1, not instead of it.

**If the sub-menu ships despite the above:** build it as a **disclosure**, not a menu ([APG Disclosure Navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/): "it does not use the WAI-ARIA `menu` role"), give it Escape-to-close-with-focus-return, label it with a verb rather than "tools", **give the revealed items visible text labels** (M3: "Don't remove the label"), and keep the language and download links out of it.

---

## Things I could NOT pin to a primary source

- **The `~0.5 em` average character advance** used to convert px widths to characters in §3.3. This is a typographic rule of thumb, not a figure from any source cited here. The M3 40–60 characters-per-line target *is* sourced; my mapping of this site's px widths onto it is an estimate. If the measure matters, count characters in the rendered page rather than trusting the arithmetic.
- **All px arithmetic in §0 and §3** is computed from the declared token values in `src/styles/tokens.css` at a 16 px root, not measured in a browser. `--drawer-width` is `min(19rem, 76vw)`, so its px value is viewport-dependent; the 320 px case (243 px) is the one I worked through. Nothing here was verified against a running build.
- **The Escape collision between a `popover` and `Drawer.tsx`'s document-level `keydown` listener** (§4.5) is my inference from reading this repo's code plus MDN's description of popover light dismissal. I did not find a source stating that a popover's Escape close-request leaves the `keydown` event propagating to document listeners, and I did not test it. **Verify before building on it.**
- **A note in the APG Menu pattern cautioning against using `menu`/`menubar` for site navigation.** I looked for one on [the Menu and Menubar pattern page](https://www.w3.org/WAI/ARIA/apg/patterns/menu/) and could not find it; the page ships a "Navigation Menubar Example" without such a caution. The disclosure-over-menu argument in §4 therefore rests on the [Disclosure Navigation Menu example's](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) own statement, which is explicit, rather than on a general prohibition — which, as far as I can establish, APG does not make.
- **Baseline dates for individual viewport units (`svh`/`lvh`/`dvh`).** MDN's `<length>` page carries a Baseline badge for the whole type ("widely available… since July 2015") with the caveat "some parts of this feature may have varying levels of support". I could not extract a per-unit date; check the individual unit's compatibility table if that is load-bearing.
- **A Baseline badge for the CSS anchor positioning *module landing page*.** MDN's module page did not render one; the January 2026 "newly available" date in §10 is taken from the [`anchor-name` property page](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name), which does.
- **A GOV.UK Design System or USWDS position on any of this.** I searched both. GOV.UK has no toolbar, tooltip or floating-action pattern and no published guidance on the `title` attribute that I could locate; USWDS's [Button](https://designsystem.digital.gov/components/button/) page contributed exactly one relevant fact — "Pressing the Space key triggers a button, but pressing the Enter key triggers a link", which is a good reason to keep native `<a>` semantics for the language and PDF controls rather than giving them `role="menuitem"`. Neither system is cited elsewhere in this note, because neither has relevant guidance, not because it was not sought.
- **Numeric figures from HIG or M3 for how much of a viewport chrome may occupy.** Neither gives one. NN/g's *Sticky Headers* article does not give a percentage either — its guidance is qualitative ("maximize the content-to-chrome ratio by keeping it small"). The 300 px / 98 px figures in this note are this repo's own, not anyone's published threshold.

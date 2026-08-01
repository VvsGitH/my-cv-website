# Spec: CV Website

Status: ready-for-agent

The reference design is the existing CV (`docs/assets/CV_page1.png`, `CV_page2.png`, and the source `docs/assets/CV_Vito_Paparella_Santorsola_2026_06.pdf`) and must be reproduced pixel-perfect — **except for spacing and body leading, which ticket 17 will deliberately regularise**. The reference was hand-set in Canva and its gaps are irregular; from ticket 17 onward they are to follow a 42/28/14/7px scale with one documented exception, so on those two axes the scale becomes authoritative and the reference does not. That ticket has not landed yet. Everything else — geometry, colour, faces, display type sizes — still matches the reference exactly. See `CONTEXT.md` for the ubiquitous language (Sheet, Aside, Main, Block, Group, Continuation, Explicit Paging, Paper Mode, Reading Mode, Drawer, Toolbar, Chrome, Locale) and `docs/adr/` for the load-bearing decisions. Background research: `docs/research/pdf-web-stack.md`.

## Problem Statement

Vito's CV exists only as a static PDF made in Canva. He can't share it as a live, browsable web page, visitors on different devices can't read it comfortably, and he can't offer both an Italian and an English version without maintaining two separate documents. He wants a single, elegant place that both *shows* the CV as paper and *hands over* a faithful PDF, in the reader's language.

## Solution

A minimal website whose only job is to present the CV as sheets of paper and to download it as a PDF. It shows the CV as two A4 **Sheets** — two side by side on wide screens, stacked on medium screens, and reflowed into a comfortable single-column **Reading Mode** with a slide-in **Drawer** on phones. A floating **Toolbar** offers four actions: switch language (Italian default / English), download the PDF, share (copy URL), and toggle a light/dark background. The downloadable PDF is pre-rendered at build time from the exact same page, one file per **Locale**, so it is byte-stable and pixel-identical to the desktop rendering. Below the paper sits the **Colophon**, the one piece of Chrome in normal flow: five small statements the *site* makes about itself — copyright, the data regime the page falls under, the other Locale, the owner's channels, and the accessibility standard it is composed to. Nothing else frames the paper, and nothing the Colophon says reaches the PDF (ticket 19).

## User Stories

1. As a recruiter, I want to open the site and immediately see the CV as recognizable paper sheets, so that it feels as polished as the original document.
2. As a visitor on a large screen, I want to see both Sheets side by side, so that I can take in the whole CV at a glance.
3. As a visitor on a tablet, I want the Sheets stacked one per row at readable size, so that I don't have to pinch-zoom.
4. As a visitor on a phone, I want the CV reflowed into a single readable column at normal text size, so that I can read it without zooming.
5. As a phone visitor, I want the Aside content (skills, languages, certifications) tucked into a slide-in Drawer, so that the main experience stays the focus but the details are one tap away.
6. As a phone visitor, I want a compact header (photo, name, title, contacts) at the top of the reading flow, so that I know whose CV this is straight away.
7. As an Italian-speaking visitor, I want the site to load in Italian by default, so that I read it in my language without any action.
8. As an English-speaking visitor, I want a one-tap switch to English, so that I can read the CV in English.
9. As a visitor, I want the language switch to keep me on the CV (just in the other language), so that I don't lose my place.
10. As a visitor, I want to download the CV as a PDF, so that I can keep or forward it offline.
11. As a visitor, I want the downloaded PDF to be in the language I'm currently viewing, so that I get the version I expect.
12. As a visitor, I want the downloaded PDF to look exactly like the desktop Sheets, so that the offline copy is as polished as the site.
13. As any visitor, I want everyone to get the identical PDF, so that the document is authoritative and consistent.
14. As a visitor, I want to copy the page URL with one tap and see a brief confirmation, so that I can share the CV easily.
15. As a visitor sharing the link on LinkedIn/WhatsApp, I want it to unfurl with the CV's title, description, and a preview of the first Sheet, so that the shared link looks credible.
16. As a visitor who prefers a darker screen, I want a theme toggle that dims the background behind the Sheets to dark blue, so that it's easier on the eyes.
17. As a visitor toggling the theme, I want the Sheets themselves to stay white paper, so that the CV still reads like a printed document.
18. As a returning visitor, I want my theme choice remembered, so that I don't reset it every visit.
19. As a keyboard or screen-reader user, I want the Toolbar and Drawer to be operable and labeled, so that I can use the site without a mouse.
20. As Vito (the owner), I want the CV content in files separate from the layout, so that I can edit wording without touching components.
21. As the owner, I want each content Block to declare which Sheet and column it belongs to, so that the layout is predictable and I stay in control of paging.
22. As the owner, I want the build to reject an invalid Sheet/column assignment, so that I catch layout mistakes before they ship.
23. As the owner, I want to maintain Italian and English content as parallel sets, so that both Locales stay in sync structurally.
24. As the owner, I want to add a new job or project by editing a content file and rebalancing Blocks across the two Sheets, so that updating the CV is straightforward.
25. As the owner, I want the fonts, colors, and type scale to match the original CV exactly, so that the web version is indistinguishable from the Canva original.
26. As the owner, I want the site hosted for free with no server, so that there's nothing to run or pay for.
27. As the owner, I want a push to the repo to rebuild the site and regenerate both PDFs automatically, so that publishing an edit is a single action.
28. As the owner, I want the PDFs generated in CI and not committed, so that the repository stays clean of binaries.
29. As the owner, I want the signature approximated with a script font rather than a real signature image, so that my actual signature isn't published on a public site.
30. As the owner, I want the profile photo swappable via a file drop, so that I can update it without code changes.
31. As the owner, I want the site to state that the personal data on the page is mine, why it is published, and that nothing is collected about visitors, so that the page carries its own data notice without a separate privacy page.
32. As a visitor who has read to the end, I want the language switch written out in the language it leads to, so that I can change language without decoding an icon in a language I may not read.
33. As a recruiter who has read to the end, I want the owner's email and LinkedIn there too, so that I can act without scrolling back to the header.
34. As a visitor using assistive technology, I want the site to state the accessibility standard it aims at and how to report a barrier, so that I know what to expect and whom to tell.

## Implementation Decisions

### Stack
- **Astro** (static output) + exactly one **Preact island** for the Toolbar and Drawer — see ADR-0003. One component tree is the single source of truth for both the live page and the PDF-captured page.
- **Playwright** headless Chromium for the build-time PDF — see ADR-0001.
- Deployed static to **GitHub Pages** via **GitHub Actions**, at the default `github.io` URL under base `/my-cv-website/`.

### The CV as paper
- A **Sheet** is exactly A4 (210×297mm), sized in real `mm`, scaled responsively with `transform: scale()` — never by rewriting the mm box. The CV is **two Sheets**.
- Per-Sheet **two columns**: **Aside** (cream panel, left) and **Main** (white, right).
- **Explicit Paging** (ADR-0002): every Block declares its `sheet` (1|2) and `column` (`aside`|`main`).
- Geometry: `@page { size: A4; margin: 0 }` + Playwright `preferCSSPageSize: true`; on-screen Sheet is `width: 210mm; height: 297mm`. `break-before: page` at the Sheet boundary; `break-inside: avoid` on Blocks.

### Content map (from the reference CV)
- **Sheet 1 — Aside:** profile photo (circular), About Me, Tech Skills (Programming Languages, Frontend, Backend, Mobile, Development Tools).
- **Sheet 1 — Main:** header (name, "Professional software developer", Location/Phone/Email/LinkedIn), Experience (Senior Software Developer @ RCS; Software Developer, Trainee @ CyberSecurity), start of Selected Projects (B2B Environment).
- **Sheet 2 — Aside:** Soft Skills, Languages (with proficiency bars), Certifications, Other Info, Privacy statement + "Bari, `<date>`" + signature.
- **Sheet 2 — Main:** Selected Projects continued (RUOP, Beyond Knowledge, VEDO/ABC, Dam Dossier), Education.

### Design tokens
| Token | Value | Use |
|---|---|---|
| `--color-heading` | `#303642` | Name, section headings |
| `--color-text` | `#48474a` | Body copy |
| `--color-muted` | `#737373` | Dates, meta |
| `--color-ink` | `#262828` | Near-black accents |
| `--color-aside-bg` | `#fef9e0` | Aside cream panel |
| `--color-photo-circle` | `#efdf9e` | Pale-yellow disc behind photo |
| `--color-main-bg` | `#ffffff` | Main column / Sheet base |
| `--color-dark-bg` | `#1b2432` | Background behind Sheets in dark theme only |

- Type scale (from the PDF): name ~28pt · section headings ~17pt · sub-headings ~10pt · body ~8pt. Ticket 17 will re-set the body sizes and leading as a designed scale rather than a transcription; once it lands, the display sizes above still come from the PDF and the body sizes no longer do. Until then this line describes the shipped state.
- Fonts: **Garet** (Heavy → name/headings, Book → lighter display), **Now**, **Lato** (body), **Primera Signature** (script, signature only). Source files in `docs/assets/fonts/` (`Garet-*` has woff2; `Lato-*`/`PrimeraSignature-*` are ttf-only, `Now*` is otf-only → generate woff2). Match exact weight usage against the screenshots.
- Colored backgrounds (Aside cream, photo disc, proficiency bars) must survive into the PDF: `printBackground: true` + `-webkit-print-color-adjust: exact` / `print-color-adjust: exact`.

### Responsive — three tiers
- **Wide (≥1632px): Paper Mode** — two Sheets side by side, with page padding/gap (the "grid of pages").
- **Medium (816–1632px): Paper Mode** — Sheets stacked one per row, rigid A4 at 1:1. The Sheet is a literal 210×297mm box at every width in this tier: ADR-0006 dropped the scale-to-width in favour of fidelity, which is also why the tier starts at 816px — a boundary below the paper's own 793.7px puts a horizontal scrollbar on screen. Never enlarged past 1:1 either: A4 at 1:1 is the reference rendering, and enlarging is the browser's zoom to offer. The owner confirmed this reading during ticket 06.
- **Narrow (<816px): Reading Mode** — the same component reflows to single-column, normal-size reading view; Aside content moves into a left slide-in Drawer (hamburger toggle); Main is the primary scroll; a compact header sits at the top. A4 is dropped here.
- Paper styles must be identical under `screen` and `print` media (or capture with `emulateMedia({ media: 'screen' })`) so the PDF equals the desktop rendering. Reading Mode styles must not affect Paper Mode/print output.

### Toolbar
Floating cluster, four actions. Ticket 07 placed it as a vertical strip against the **left edge, centred on the viewport** — the owner asked for that placement in the ticket, over this line's original "bottom-right" — and gave it a fifth control, the Drawer's toggle, in Reading Mode only. In Reading Mode the strip rides the Drawer's outer edge while the panel is open. The four actions:
1. **Language** — toggle EN/IT (navigates to the equivalent route in the other Locale).
2. **Download** — serves the current Locale's pre-rendered PDF.
3. **Share** — copies the current page URL to the clipboard, with a brief confirmation.
4. **Theme** — light/dark toggle; dark mode changes **only** the background behind the Sheets to dark blue. Sheets stay white paper in both themes; the PDF is unaffected. Persist choice in `localStorage`, applied pre-hydration to avoid flash.

### Content model
- **TypeScript data modules**, one set per Locale, against a shared typed schema. Each Block carries `sheet`, `column`, and its ordering; the compiler rejects invalid `sheet`/`column` values.
- Content fully separate from layout components.
- Italian content is net-new (source CV is English) — a faithful translation is drafted for the owner to refine; the owner owns the final professional wording. Italian text runs ~10–15% longer, so per-Locale paging may differ.

### PDF pipeline
- Post-build Node script launches Playwright and, for **each Locale**: `goto` the built page → `await document.fonts.ready` → `page.pdf({ preferCSSPageSize: true, printBackground: true, margin: 0 })`.
- Outputs `Vito_Paparella_Santorsola_CV_IT.pdf` and `_EN.pdf` into the built site's assets. Generated fresh in CI, **not committed**. Download button links each Locale to its file.

### Deployment
- GitHub Actions: `npm ci` → `npx playwright install --with-deps` → `astro build` → PDF render step → deploy site + PDFs to GitHub Pages.
- Astro `base: '/my-cv-website/'`; i18n with `it` as default (unprefixed) and `en` prefixed. Custom-domain switch left as a future one-line change.

### SEO / sharing
- Per-Locale `<title>`, meta description, favicon, and an OpenGraph preview image (a render of Sheet 1). `lang` attribute + `hreflang` alternates between `it` and `en`.

## Testing Decisions

A good test here asserts **externally observable behavior of the built artifact** — what a visitor sees and downloads — never component internals, CSS class names, or file structure. Tests should survive a refactor of the components as long as the rendered CV and PDFs are unchanged.

**Single seam: Playwright end-to-end against the built output** (`astro build` result + generated PDFs). This is the highest available seam and reuses Playwright, already in the stack for PDF generation — no new test tooling. Coverage:

- **Content & structure:** load `/` (IT) and `/en/`; assert the expected Blocks render in the correct Sheet and column, and that Italian vs English text differs where expected.
- **Toolbar behavior:** language toggle navigates to the equivalent route in the other Locale; theme toggle changes the background behind the Sheets while the Sheet surface stays white; share writes the current URL to the clipboard; download links to the correct per-Locale PDF filename.
- **Responsive tiers:** with viewport emulation, assert two-Sheets-side-by-side at ≥1632px, stacked at 816–1632px, and Reading Mode + operable Drawer below 816px. Assert too that no supported width scrolls sideways, 375px (the narrowest supported viewport) upward.
- **PDF validity:** each generated PDF is exactly 2 A4 pages, has the CV fonts embedded, and contains expected key strings (name, section headings, a sample bullet) for its Locale.
- **Accessibility smoke:** Toolbar and Drawer are keyboard-operable and labeled.

Prior art: none yet (greenfield repo); this suite establishes the pattern. Pixel-perfect fidelity is **not** asserted automatically — it is verified manually against `CV_page1.png` / `CV_page2.png` during the layout ticket (see Out of Scope).

## Out of Scope

- Runtime/on-demand or client-side PDF generation.
- Automated **visual-regression** / pixel-diff testing — pixel-perfect fidelity is checked manually against the reference PNGs during the layout ticket.
- Byte-level PDF reproducibility (qpdf / `SOURCE_DATE_EPOCH`).
- Auto-flow pagination (Paged.js).
- Analytics (easy to add later).
- Custom domain (deferred; one-line switch).
- A third language.

## Further Notes

### Owner-provided assets / dependencies
- **Profile photo** → landed at `docs/assets/images/CV_Image.png`, self-hosted at `src/assets/images/profile.png`, rendered circular over the photo disc (ticket 14).
- Fonts — provided in `docs/assets/fonts/`, including the signature script face at `docs/assets/fonts/primera-signature/` (ticket 13).
- **GitHub username** for the final Pages URL (`<username>.github.io/my-cv-website/`).
- Signature: rendered with the self-hosted **Primera Signature** script web-font (no image), "Bari, `<date>`" line kept.

### Implementation tickets
1. `01-scaffold.md` — Astro + TS scaffold, i18n routing (it default, en), Pages base, React island wiring.
2. `02-fonts.md` — generate woff2, `@font-face`, font tokens + weight mapping.
3. `03-design-system.md` — design tokens, global styles, the A4 Sheet primitive.
4. `04-content-model.md` — shared schema + TypeScript content modules (IT + EN) with `sheet`/`column` tags.
5. `05-cv-layout.md` — Sheet layout components (Aside/Main, header, all sections) in Paper Mode.
6. `06-responsive.md` — three-tier responsive + Reading Mode + Drawer.
7. `07-toolbar.md` — Preact island Toolbar (language, download, share, theme + persistence).
8. `08-pdf-render.md` — Playwright build-time PDF script, per-Locale.
9. `09-ci-deploy.md` — GitHub Actions build + PDF + Pages deploy.
10. `10-seo-meta.md` — per-Locale meta, favicon, OG image.
11. `11-italian-content.md` — draft Italian translation for owner review.
12. `12-e2e-tests.md` — Playwright E2E suite (the single test seam).
13. `13-signature-font.md` — self-host the owner's script font, wire it into the Privacy block's signature.
14. `14-profile-photo.md` — self-host and render the owner's real profile photo, replacing the placeholder disc.
15. `15-folder-structure.md` — `src/assets/` for fonts and images; component tiers `primitives`/`blocks`/`structure` (+ `chrome`), per ADR-0004.
16. `16-main-section-blocks.md` — one `MainSectionBlock` for Experience/Projects/Education, with explicit Continuations (ADR-0005).
17. `17-spacing-scale.md` — the 42/28/14/7px spacing scale, unified body size and leading.
18. `18-preact-island.md` — Preact instead of React for the island (ADR-0003).
19. `19-colophon.md` — the Colophon, plus the Toolbar's accessible names and WCAG 2.2 · 2.4.11.
20. `20-chrome-two-islands.md` — Toolbar and Drawer as two islands, the Drawer a custom modal rather than a `<dialog>` (ADR-0007).
21. `21-dialog-drawer-and-horizontal-toolbar.md` — the Drawer back to a native `<dialog>` with its own close control, and a horizontal Toolbar at every tier (ADR-0008).

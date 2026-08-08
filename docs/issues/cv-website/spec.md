# Spec: CV Website

Status: shipped

This is the product spec — what the site is for, and what it deliberately does not do. It is the only surviving document from the implementation phase; the tickets that carried it out have been deleted, and every decision worth keeping now lives in `docs/adr/`.

The reference design is the existing CV (`docs/assets/CV_page1.png`, `CV_page2.png`, and the source `docs/assets/CV_Vito_Paparella_Santorsola_2026_06.pdf`) and is reproduced pixel-perfect — **except for spacing and body leading, where the scale is authoritative and the reference is not (ADR-0011)**. Everything else — geometry, colour, faces, display type sizes — matches the reference exactly; ADR-0014 records how it was measured and which of its flaws are preserved on purpose. See `CONTEXT.md` for the ubiquitous language (Sheet, Aside, Main, Block, Group, Continuation, Explicit Paging, Paper Mode, Reading Mode, Drawer, Toolbar, Colophon, Chrome, Locale) and `docs/adr/` for the load-bearing decisions. Background research: `docs/research/pdf-web-stack.md`.

## Problem Statement

Vito's CV exists only as a static PDF made in Canva. He can't share it as a live, browsable web page, visitors on different devices can't read it comfortably, and he can't offer both an Italian and an English version without maintaining two separate documents. He wants a single, elegant place that both *shows* the CV as paper and *hands over* a faithful PDF, in the reader's language.

## Solution

A minimal website whose only job is to present the CV as sheets of paper and to download it as a PDF. It shows the CV as two A4 **Sheets** — two side by side on wide screens, stacked on medium screens, and reflowed into a comfortable single-column **Reading Mode** with a slide-in **Drawer** on phones. A floating **Toolbar** offers four actions: switch language (Italian default / English), download the PDF, share (copy URL), and toggle a light/dark background. The downloadable PDF is pre-rendered at build time from the exact same page, one file per **Locale**, so it is byte-stable and pixel-identical to the desktop rendering. Below the paper sits the **Colophon**, the one piece of Chrome in normal flow: five small statements the *site* makes about itself — copyright, the data regime the page falls under, the other Locale, the owner's channels, and the accessibility standard it is composed to. Nothing else frames the paper, and nothing the Colophon says reaches the PDF (ADR-0013).

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
17. As a visitor toggling the theme, I want the paper to darken with the page but the cream Aside to stay exactly as it is, so that the CV still reads like the same document in either light.
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
- **Astro** (static output) + **two Preact islands**, the Toolbar and the Drawer — see ADR-0003, as amended by ADR-0007 and ADR-0008. One component tree is the single source of truth for both the live page and the PDF-captured page.
- **Playwright** headless Chromium for the build-time PDF — see ADR-0001.
- Deployed static to **GitHub Pages** via **GitHub Actions**, at the default `github.io` URL under base `/my-cv-website/`.

### The CV as paper
- A **Sheet** is exactly A4 in proportion — an 840px box in the 210/297 ratio, never rewritten by viewport. The CV is **two Sheets**. (As written, this asked for real `mm` scaled by `transform`; ADR-0006 removed the responsive scaling, and the mm moved to the print layer, where `zoom` restores them for the capture — a transform there costs the PDF its fonts, ADR-0009.)
- Per-Sheet **two columns**: **Aside** (cream panel, left) and **Main** (white, right).
- **Explicit Paging** (ADR-0002): every Block declares its `sheet` (1|2) and `column` (`aside`|`main`).
- Geometry: `@page { size: A4; margin: 0 }` + Playwright `preferCSSPageSize: true`; the on-screen Sheet is `--sheet-width` in `--sheet-ar`, zoomed back to 210mm for print. `break-before: page` at the Sheet boundary; `break-inside: avoid` on Blocks.

### Content map (from the reference CV)
- **Sheet 1 — Aside:** profile photo (circular), About Me, Tech Skills (Programming Languages, Frontend, Backend, Mobile, Development Tools).
- **Sheet 1 — Main:** header (name, "Professional software developer", Location/Phone/Email/LinkedIn), Experience (Senior Software Developer @ RCS; Software Developer, Trainee @ CyberSecurity), start of Selected Projects (B2B Environment).
- **Sheet 2 — Aside:** Soft Skills, Languages (with proficiency bars), Certifications, Other Info, Privacy statement + "Bari, `<date>`" + signature.
- **Sheet 2 — Main:** Selected Projects continued (RUOP, Beyond Knowledge, VEDO/ABC, Dam Dossier), Education.

### Design tokens
| Token | Value | Use |
|---|---|---|
| `--color-heading` | Name, section headings |
| `--color-text` | Body copy |
| `--color-muted` | proficiency-bar fill, focus ring |
| `--color-signature` | Signature script on the privacy statement |
| `--color-aside-bg` | Aside cream panel |
| `--color-accent` | Disc behind the photo, Toolbar border and button hover, OG card subtitle |
| `--color-main-bg` | Main column / Sheet base |
| `--color-page-bg` | The page behind the Sheets — a surface of its own, never the paper's colour |

- Five of those tokens are themed and carry a `-light` / `-dark` pair behind them (`--color-page-bg`, `--color-main-bg`, `--color-heading`, `--color-text`, `--color-muted`); the pairs are raw material and no component names one. Three are not themed at all — `--color-signature`, `--color-accent` and `--color-aside-bg` all live on the cream Aside, which is the same surface in both themes and takes the light inks back locally (ADR-0015).
- The inks all sit on hue 264 and differ only in lightness and chroma; the paper surfaces sit on hue ~97 in light and on hue 259 in dark. Cool ink on warm paper is the palette's one idea, and new colours should pick a side rather than a third hue.
- The dark theme inverts the stack: light puts white paper on a grey page (`#ffffff` on `#eaebef`), dark puts navy paper on a lighter blue page (`#1b2432` on `#2b3747`). Either way the step is ~1.13:1 — enough to draw the Sheet's edge, which is why the Sheets carry no border and no shadow.
- The proficiency bars have no track colour of their own: the track is `--color-muted` at 20% over the Aside's cream, so a bar's two halves cannot drift apart. 20% is the ratio, not a taste — it holds the fill at 3.51:1 against the track, where 30% left only 3.08:1 and the sampled `#b1c0e1` it replaced failed 1.4.11 outright at 2.60:1.
- Type scale (from the PDF): name ~28pt · section headings ~17pt · sub-headings ~10pt · body ~8pt. Ticket 17 will re-set the body sizes and leading as a designed scale rather than a transcription; once it lands, the display sizes above still come from the PDF and the body sizes no longer do. Until then this line describes the shipped state.
- Fonts: **Garet** (Heavy → name/headings, Book → lighter display), **Now**, **Lato** (body), **Primera Signature** (script, signature only). Source files in `docs/assets/fonts/` (`Garet-*` has woff2; `Lato-*`/`PrimeraSignature-*` are ttf-only, `Now*` is otf-only → generate woff2). Match exact weight usage against the screenshots.
- Colored backgrounds (Aside cream, photo disc, proficiency bars) must survive into the PDF: `printBackground: true` + `-webkit-print-color-adjust: exact` / `print-color-adjust: exact`.

### Responsive — three tiers
- **Wide (≥1720px): Paper Mode** — two Sheets side by side, with page padding/gap (the "grid of pages").
- **Medium (856px–1720px): Paper Mode** — Sheets stacked one per row, rigid A4 proportions and never resized to fit. The Sheet is the same 840px box in A4's 210/297 ratio at every width in this tier: ADR-0006 dropped the scale-to-width in favour of fidelity, which is also why the tier starts at 856px — a boundary below the paper's own 840px puts a horizontal scrollbar on screen. Never rescaled by viewport either: one rendering is the reference rendering, and resizing is the browser's zoom to offer. Physical millimetres apply to the PDF, not the screen. The owner confirmed this reading.
- **Narrow (<856px): Reading Mode** — the same component reflows to single-column, normal-size reading view; Aside content moves into a left slide-in Drawer (hamburger toggle); Main is the primary scroll; a compact header sits at the top. A4 is dropped here.
- Paper styles must be identical under `screen` and `print` media (or capture with `emulateMedia({ media: 'screen' })`) so the PDF equals the desktop rendering. Reading Mode styles must not affect Paper Mode/print output.

### Toolbar
Floating cluster, four actions, plus a fifth control — the Drawer's toggle — in Reading Mode only. It takes one shape per tier: a vertical rail against the inline start in Paper Mode, a horizontal row against the bottom edge in Reading Mode (ADR-0008). The four actions:
1. **Language** — toggle EN/IT (navigates to the equivalent route in the other Locale).
2. **Download** — serves the current Locale's pre-rendered PDF.
3. **Share** — copies the current page URL to the clipboard, with a brief confirmation.
4. **Theme** — light/dark toggle. Dark repaints the page behind the Sheets *and* the paper itself, in that order of depth: the page goes to a mid blue, the Sheet to the darker navy under it, and the inks go from near-black to near-white with them (ADR-0015). What the theme never touches is the cream — the Aside, the Drawer that carries it into Reading Mode, and the Toolbar keep their panel and their dark ink in both themes. The PDF and the OG card are unaffected, because the whole ladder lives inside `@media screen`. Persist choice in `localStorage`, applied pre-hydration to avoid flash.

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

**ADR-0010 owns this.** A good test here asserts externally observable behavior of the built artifact — never component internals. Coverage:

- **Content & structure:** load `/` (IT) and `/en/`; assert the expected Blocks render in the correct Sheet and column, and that Italian vs English text differs where expected.
- **Toolbar behavior:** language toggle navigates to the equivalent route in the other Locale; theme toggle changes the background behind the Sheets while the Sheet surface stays white; share writes the current URL to the clipboard; download links to the correct per-Locale PDF filename.
- **Responsive tiers:** with viewport emulation, assert two-Sheets-side-by-side at ≥1720px, stacked at 856px–1720px, and Reading Mode + operable Drawer below 856px. Assert too that no supported width scrolls sideways, 375px (the narrowest supported viewport) upward.
- **PDF validity:** each generated PDF is exactly 2 A4 pages, has the CV fonts embedded, and contains expected key strings (name, section headings, a sample bullet) for its Locale.
- **Accessibility smoke:** Toolbar and Drawer are keyboard-operable and labeled.

Pixel-perfect fidelity is **not** asserted automatically — it is verified manually against `CV_page1.png` / `CV_page2.png` (see Out of Scope).

## Out of Scope

- Runtime/on-demand or client-side PDF generation.
- Automated **visual-regression** / pixel-diff testing — pixel-perfect fidelity is checked manually against the reference PNGs.
- Byte-level PDF reproducibility (qpdf / `SOURCE_DATE_EPOCH`).
- Auto-flow pagination (Paged.js).
- Analytics (easy to add later).
- Custom domain (deferred; one-line switch).
- A third language.

## Further Notes

### Owner-provided assets / dependencies
- **Profile photo** → landed at `docs/assets/images/CV_Image.png`, self-hosted at `src/assets/images/profile.png`, rendered circular over the photo disc.
- Fonts — provided in `docs/assets/fonts/`, including the signature script face at `docs/assets/fonts/primera-signature/` (ADR-0012).
- **GitHub username** for the final Pages URL (`<username>.github.io/my-cv-website/`).
- Signature: rendered with the self-hosted **Primera Signature** script web-font (no image), "Bari, `<date>`" line kept.

### Implementation history

The 21 implementation tickets that built this site were deleted once their
load-bearing content had been salvaged into `docs/adr/`. The git history holds
them if they are ever needed; the ADRs hold everything that still matters.

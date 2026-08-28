# Spec: CV Website

Status: shipped

This is the product spec — what the site is for, and what it deliberately does not do. It is the only surviving document from the implementation phase; the tickets that carried it out have been deleted, and every decision worth keeping now lives in `docs/adr/`.

The reference design is the existing CV (`docs/assets/CV_page1.png`, `CV_page2.png`, and the source `docs/assets/CV_Vito_Paparella_Santorsola_2026_06.pdf`) and is reproduced pixel-perfect — **except for spacing and body leading, where the scale is authoritative and the reference is not (ADR-0011)**. Everything else — geometry, colour, faces, display type sizes — matches the reference exactly; ADR-0014 records how it was measured and which of its flaws are preserved on purpose. See `CONTEXT.md` for the ubiquitous language (Sheet, Aside, Main, Block, Group, Continuation, Explicit Paging, Mode, Paper Mode, Reading Mode, Toolbar, Colophon, Chrome, Locale) and `docs/adr/` for the load-bearing decisions. Background research: `docs/research/pdf-web-stack.md`.

## Problem Statement

Vito's CV exists only as a static PDF made in Canva. He can't share it as a live, browsable web page, visitors on different devices can't read it comfortably, and he can't offer both an Italian and an English version without maintaining two separate documents. He wants a single, elegant place that both *shows* the CV as paper and *hands over* a faithful PDF, in the reader's language.

## Solution

A minimal website whose only job is to present the CV as sheets of paper and to download it as a PDF. It shows the CV as two A4 **Sheets** — two side by side on wide screens, stacked on medium screens, and one Sheet scaled to fit the device on a phone. That is **Paper Mode**, and it is what a first visit gets at every width. A reader who would rather read than look switches to **Reading Mode**, where the same content reflows into one column at reading type; the choice is theirs and it is remembered (ADR-0017). A floating **Toolbar** offers five actions: switch Mode, switch language (Italian default / English), download the PDF, share (copy URL), and toggle a light/dark background. The downloadable PDF is pre-rendered at build time from the exact same page, one file per **Locale**, so it is byte-stable and pixel-identical to the desktop rendering. Below the paper sits the **Colophon**, the one piece of Chrome in normal flow: five small statements the *site* makes about itself — copyright, the data regime the page falls under, the other Locale, the owner's channels, and the accessibility standard it is composed to. Nothing else frames the paper, and nothing the Colophon says reaches the PDF (ADR-0013).

## User Stories

1. As a recruiter, I want to open the site and immediately see the CV as recognizable paper sheets, so that it feels as polished as the original document.
2. As a visitor on a large screen, I want to see both Sheets side by side, so that I can take in the whole CV at a glance.
3. As a visitor on a tablet, I want the Sheets stacked one per row at readable size, so that I don't have to pinch-zoom.
4. As a visitor on a phone, I want the whole A4 sheet fitted to my screen by default, so that I see the document I was sent rather than a web page about it.
5. As any visitor, I want a control that reflows the CV into a single readable column at normal text size, so that I can read it without zooming — on a phone, and on a large screen if I prefer it that way.
6. As a visitor, I want my choice of Mode remembered, so that I do not reset it on every visit or when I switch language.
7. As a reader in the single column, I want the profile, skills, languages and certifications in the flow with everything else, so that nothing is hidden behind a control and nothing needs JavaScript to reach.
8. As the owner, I want to declare the reading order separately from the paper's paging, so that the column reads as a CV rather than as two sheets read column by column.
9. As a phone visitor, I want a compact header (photo, name, title, contacts) at the top of the reading flow, so that I know whose CV this is straight away.
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
19. As a keyboard or screen-reader user, I want every Toolbar control to be operable and labeled, so that I can use the site without a mouse.
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
- **Astro** (static output) + **one Preact island**, the Toolbar — see ADR-0003, as amended by ADR-0007, ADR-0008 and ADR-0017, which deleted the second. One component tree is the single source of truth for both the live page and the PDF-captured page.
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
- **Sheet 2 — Aside:** Soft Skills, Languages (with proficiency bars), Certifications, Other Info, Privacy statement + "Bari, `<date>`" + signature. The date is not editorial: `PrivacyBlock.astro` writes the build date, `YYYY.MM.DD`, the same in both Locales.
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

### Two Modes, and what is left of the tiers
The Mode is the reader's choice and is never inferred from the viewport (ADR-0017). What the viewport still decides is how much paper fits, and what shape the Toolbar takes.

**Paper Mode** — the default at every width. Neither of its two thresholds is declared: the Sheets sit on a wrapping flex line and each Sheet fits itself, so both fall out of the paper's own 840px and the 1.5rem gutters.
- **From 1752px** — two Sheets side by side, with page padding/gap (the "grid of pages"). That is 2 × 840px plus the gap and both gutters, and it is where the line stops wrapping.
- **888px–1752px** — Sheets stacked one per row at the full 840px box in A4's 210/297 ratio. One rendering is the reference rendering; resizing is the browser's zoom to offer.
- **Below 888px** — one Sheet, `zoom`ed to the width left inside the gutter. ADR-0006 dropped scale-to-fit in favour of fidelity; ADR-0017 puts back the half of it a phone needs, capped at `min(1, …)` so the paper is never scaled *up*. Physical millimetres still apply to the PDF, not the screen.

**Reading Mode** — chosen from the Toolbar, at any width: the same components reflow to a single column at reading type, bounded to a 34rem measure and centred. Aside and Main Blocks interleave by `readOrder`; nothing is hidden and nothing is rendered twice. A4 is dropped here. On a phone this is also the site's answer to WCAG 2.2 · 1.4.4.

- Paper styles must be identical under `screen` and `print` media so the PDF equals the desktop rendering. Reading Mode styles must not reach print: the print layer takes the paper back explicitly, because the Mode is remembered and a reader may print from it.

### Toolbar
Floating cluster, five actions at every tier. It takes one shape per tier — a vertical rail against the inline start where there is room beside the paper, a horizontal row against the bottom edge on the narrow tier (ADR-0008); the shape is a width, the Mode it offers is not. The five actions:
0. **Mode** — Paper/Reading toggle. Persisted in `localStorage` and applied pre-paint, like the theme.
1. **Language** — toggle EN/IT (navigates to the equivalent route in the other Locale).
2. **Download** — serves the current Locale's pre-rendered PDF.
3. **Share** — copies the current page URL to the clipboard, with a brief confirmation.
4. **Theme** — light/dark toggle. Dark repaints the page behind the Sheets *and* the paper itself, in that order of depth: the page goes to a mid blue, the Sheet to the darker navy under it, and the inks go from near-black to near-white with them (ADR-0015). What the theme never touches is the cream — the Aside's panel in Paper Mode, and the Toolbar at every tier, keep their surface and their dark ink in both themes. In Reading Mode there is no panel, so the Aside's ink rejoins the theme with everything else (ADR-0017). The PDF and the OG card are unaffected, because the whole ladder lives inside `@media screen`. Persist choice in `localStorage`, applied pre-hydration to avoid flash.

### Content model
- **TypeScript data modules**, one set per Locale, against a shared typed schema. Each Block carries `paperSheet`, `paperColumn` and `readOrder` — one position per Mode. The compiler rejects invalid Sheet/column values, and the build rejects a `readOrder` that is not a permutation of `1..n`, or a Continuation that does not read immediately after the Block it resumes.
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
- **Responsive tiers:** with viewport emulation, assert two Sheets side by side from 1752px, stacked and unscaled from 888px, and whole-but-fitted paper below it. Both thresholds are computed from the paper and the gutters in the test rather than written down, because no stylesheet holds them either. Assert too that no supported width scrolls sideways, 375px upward — which is the sharpest guard on the fit.
- **The Mode:** the Toolbar control flips `data-mode`; the choice survives a reload and a language switch; the reading column runs the Blocks in `readOrder` with the Aside among them; a print from Reading Mode is still paper.
- **PDF validity:** each generated PDF is exactly 2 A4 pages, has the CV fonts embedded, and contains expected key strings (name, section headings, a sample bullet) for its Locale.
- **Accessibility smoke:** every Toolbar control is keyboard-operable and labeled.

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
- Signature: rendered with the self-hosted **Primera Signature** script web-font (no image), "Bari, `<date>`" line kept — the date filled in by the build, not by hand.

### Implementation history

The 21 implementation tickets that built this site were deleted once their
load-bearing content had been salvaged into `docs/adr/`. The git history holds
them if they are ever needed; the ADRs hold everything that still matters.

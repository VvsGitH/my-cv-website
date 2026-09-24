# 01 — Il download diventa un menù, e il PDF esce anche senza foto

Status: ready-for-agent

Spec: `docs/issues/cv-content-refresh/spec.md` §5 (decisioni D1, D12, D17)

## Cosa costruire

Il pulsante download della Toolbar apre un popover con due link: **CV completo** e **CV senza foto**. Lo script di capture produce, per ogni Locale, un secondo PDF in cui il disco del `photo` Block resta ma il ritratto non c'è.

Il ticket non tocca il contenuto dei CV e non dipende da nessun altro ticket.

### Capture

- `scripts/render-captures.mjs`: dopo il PDF completo di ogni Locale, `document.documentElement.dataset.photo = 'off'`, poi un secondo `page.pdf()` verso `Vito_Paparella_Santorsola_CV_<IT|EN>_no-photo.pdf` e `assertTwoA4Pages()`. Prima di passare alla Locale successiva si rimette lo stato com'era, o si ricarica la pagina: la card OG non deve ereditare `data-photo`.
- I nomi dei PDF completi **non cambiano**.
- CSS nel layer di `PhotoBlock.astro`: `:root[data-photo="off"] .photo picture { display: none; }`. Il `.photo` mantiene dimensione e `background-color`.

### Link

- `src/i18n/locale.ts` → `chromeLinks`: `pdfHref` diventa `pdfHrefs: { full, noPhoto }`. Il nome del file è scritto in due punti (ADR-0009), `pdfPath` nello script e `chromeLinks`, e vanno aggiornati **tutti e due insieme**.
- `src/i18n/ui.ts`: `download` (etichetta del pulsante: *"Scarica il CV"* / *"Download the CV"*), `downloadFull` (*"Scarica CV completo"* / *"Download full CV"*), `downloadNoPhoto` (*"Scarica CV senza foto"* / *"Download CV without photo"*).

### Menù

- `Toolbar.astro`: `<button popovertarget="download-menu">` + `<div id="download-menu" popover="auto">` con due `<a download>`. **Niente isola Preact**: resta markup, come l'`<a download>` di oggi.
- **Semantica**: un pulsante che rivela un gruppo di link. Niente `role="menu"`, `menuitem` o `aria-haspopup`.
- **Posizione**: `position-area: block-end span-inline-start` + `position-try-fallbacks: flip-block, flip-inline`, con un fallback senza anchor positioning e senza JS (ad esempio `position: fixed` sotto la Toolbar). Va verificato con uno screenshot in Firefox.
- **Stile**: token esistenti, contrasto ADR-0025 in entrambi i temi, spazi dalla scala di ADR-0011. La forma della Toolbar (ADR-0025) non cambia: stessa posizione, stesso gruppo con Share.
- **Icone**: le icone nuove (per esempio `chevron-down` sul pulsante, `file-text` / `eye-off` sulle voci) vanno aggiunte al font icomoon e a `ICONS` in `fonts.config.mjs`, perché il subset oggi contiene 8 glyph. Il chevron è facoltativo: se cambia la larghezza del pulsante, si discute prima di aggiungerlo.
- **Fallback**: se il popover non è supportato, il PDF completo deve restare scaricabile.

## Criteri di accettazione

- [ ] `npm run captures:render` scrive 4 PDF, tutti di 2 pagine A4.
- [ ] Il PDF `_no-photo` **non contiene il ritratto**: il numero di XObject immagine è inferiore al PDF completo. Si verifica con `pdf-lib` in `tests/support/pdf.ts`, non con la dimensione del file.
- [ ] Nel PDF `_no-photo` il disco del `photo` Block è visibile e ogni Block è nella stessa posizione del PDF completo (confronto visivo).
- [ ] Il pulsante apre il popover. Esc e click fuori lo chiudono, e il focus torna al pulsante.
- [ ] Ogni link ha `download` e un `href` che punta a un file generato davvero, per ogni Locale.
- [ ] Contrasto del pannello ≥ 4.5:1 in tema chiaro e scuro.
- [ ] Il pannello non esce dal viewport a 320px di larghezza, in Paper e in Reading Mode.
- [ ] Test aggiornati, non rimossi: `tests/toolbar.spec.ts` (il locator `.toolbar-button[download]` e i controlli su `href`), `tests/pdf.spec.ts:51` e `tests/colophon.spec.ts:103`, che oggi cercano un solo `a[download]`.
- [ ] Il README elenca i due nuovi PDF nella sezione *The captured files*.
- [ ] `npm test` verde.

## Comments

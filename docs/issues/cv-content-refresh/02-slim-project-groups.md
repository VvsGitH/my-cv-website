# 02 — Progetti slim, riga dello stack e sezione Progetti personali

Status: ready-for-agent

Spec: `docs/issues/cv-content-refresh/spec.md` §4 (decisioni D8, D20, D21, D22)

## Cosa costruire

### Modello (`src/content/types.ts`)

Due campi opzionali sul Group non-Continuation di `MainSectionGroup`. Diventano opzionali anche `meta` e `period` (D23):

```ts
/** Technologies, rendered as one inline line. A Group with `stack` and no `bullets` is a slim Group. */
stack?: string[];
/** A public link — repository or demo. Rendered in full, not hidden behind the title: a printed PDF cannot be clicked. */
url?: string;
```

I commenti su `meta` e `period` vanno aggiornati: ora sono opzionali, e un Group con `url` di solito non li ha. Il periodo lo rende `GroupMeta` (`src/components/primitives/GroupMeta.astro`), allineato a destra accanto al meta: senza `period` non deve restare un `<p class="period">` vuoto né spazio riservato, e senza `meta` né `period` `GroupMeta` non si rende affatto.

### Rendering (`MainSectionBlock.astro` e primitive)

- `stack` diventa una riga inline con separatore `·` **come testo nel DOM**, non come pseudo-elemento. Si rende sotto i bullet nei Group completi e sotto il meta negli slim.
- `url` diventa un `<a href>` con il testo visibile senza `https://`, nella posizione del meta.
- Si aggiunge `·` (U+00B7) a `PUNCTUATION` in `fonts.config.mjs`.
- Lo stile segue la gerarchia esistente di `GroupMeta`/`Bullets`, con spazi dalla scala di ADR-0011.

### Contenuto (`it.ts` + `en.ts`)

- **Slim** (solo titolo, meta, periodo e `stack`, niente summary né bullet): Dam Dossier, Beyond Knowledge, VEDO Tool & ABC Monitoring. Lo stack si ricava dai bullet attuali, per esempio Dam Dossier: `Angular 14 · SCSS · Enel Design System · WCAG 2.1 · Jasmine/Karma`.
- **Completi**: RUOP e B2B Environment ricevono `stack`. I loro bullet si riscrivono nel ticket 05, non qui.
- **Nuova sezione** `mainSection` *"Progetti personali"* / *"Personal Projects"*, in Sheet 2 Main dopo *Progetti selezionati (continua)* e prima di *Formazione*, con `readOrder: 7`. I Block che oggi hanno `readOrder` da 7 a 13 scalano di uno. Due Group slim con `url`:
  - **CV Management & Display**: `github.com/VvsGitH/my-cv-website`, `Astro · Preact · TypeScript · Playwright · CSS moderno · WCAG 2.2`.
  - **Expense Dashboard**: `github.com/VvsGitH/expense-dashboard`, `Python · Streamlit · SQLite · pytest`.
  - I nomi sono in inglese in entrambe le Locale. Nessun periodo (D23).

## Criteri di accettazione

- [ ] `tsc` / `astro check` verdi. Il controllo della permutazione di `readOrder` in `Document.astro` passa.
- [ ] I tre progetti slim non hanno summary né bullet. Tutti e cinque i progetti hanno lo `stack`.
- [ ] I progetti personali non mostrano un periodo, e al suo posto non resta spazio vuoto.
- [ ] Nel PDF i link dei progetti personali sono cliccabili e il testo del link si legge per esteso.
- [ ] Il separatore `·` è reso con il font del testo, non con quello di fallback (si verifica sui font incorporati nel PDF).
- [ ] L'estrazione del testo dal PDF riporta lo stack con i separatori.
- [ ] 2 pagine A4 per ogni PDF. Controllo visivo di Paper e Reading Mode in IT ed EN.
- [ ] `npm test` verde.

## Fuori da questo ticket

Il README di `expense-dashboard` va sistemato (spec §4.4) prima di pubblicare, ma è lavoro fuori da questo repository. Il README di questo repository è già aggiornato.

## Comments

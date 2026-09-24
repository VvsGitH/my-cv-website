# Spec: Il contenuto del CV viene riscritto per i recruiter, e il PDF esce anche senza foto

Status: approved — i ticket di contenuto aspettano i numeri (§1)

Deriva da `docs/research/tech-cv-writing-best-practices.md`. Nella research c'è il *perché* di ogni punto, qui c'è il *cosa*. La spec cambia due cose:

1. **Il contenuto** di `src/content/it.ts` e `src/content/en.ts`: bullet orientati all'impatto, numeri, profilo, skill, progetti, Sheet 2 Aside.
2. **Una sola funzione nuova**: il pulsante download diventa un menù con due voci, *CV completo* e *CV senza foto*, per le selezioni photo-blind. È l'unica parte che tocca codice di layout, capture e Chrome.

## Decisioni già prese dall'owner

| # | Decisione | Effetto sulla spec |
|---|---|---|
| D1 | **La foto resta** in entrambi i CV, sul sito e nel PDF completo | Il `photo` Block non si tocca. I processi photo-blind sono coperti dal PDF senza foto (§5) |
| D2 | **Il diploma resta** in entrambi i CV | Nessuna modifica a Formazione, a parte date e EQF (§3.8) |
| D3 | **Niente telefono**, lo condivide in privato | Nessun contatto telefonico |
| D4 | **Si aggiunge GitHub** ai contatti; non c'è un sito personale oltre a questo | Nuovo `Contact` (§3.1) |
| D5 | **La patente resta** (utile per l'ibrido in Italia) | Resta in *Altre info* |
| D6 | **Nuova preferenza di lavoro**: remoto, oppure ibrido in Italia senza cambio di residenza | Cambia *Altre info* e l'ultima frase del profilo (§3.2, §3.9) |
| D7 | **Il profilo non si accorcia**, perché in colonna c'è spazio. Va bene "5+ anni" | §3.2: si lavora sul contenuto, non sulla lunghezza |
| D8 | **I progetti restano tutti**: mostrano tecnologie e clienti. Quelli meno importanti diventano "slim" (titolo, cliente, tecnologie) | Nuova variante di Group (§4) |
| D9 | **`header.title` resta com'è** ("Senior Software Developer") | Nessuna modifica |
| D10 | **Le soft skills si tolgono**, ma lo spazio non deve restare vuoto | §6, con una proposta e un'alternativa |
| D11 | **Il resto della checklist della research è approvato** | §3 |
| D12 | **Nel PDF senza foto il `photo` Block resta**, con il suo disco di sfondo: sparisce solo l'immagine | Nessun problema di allineamento (§5.3) |
| D13 | **Trainee e Software Developer in CyberSecurity si uniscono** in un'unica progressione | §3.4 |
| D14 | **Il profilo chiude con cosa si cerca** (remoto / ibrido in Italia) | §3.2 |
| D15 | **"Disponibile al trasferimento" si toglie** | §3.9 |
| D16 | **Inglese: "B2 certificato, C1 d'uso"** / *"B2 certified, C1 in daily use"* | §3.6 |
| D17 | **Il PDF senza foto ha `_no-photo` nel nome**, in entrambe le Locale | §5.2 |
| D18 | **Java e Python restano in *Linguaggi*** | §3.5 |
| D19 | **Al posto delle soft skills va il blocco "Come lavoro"** | §6 |
| D20 | **Una sezione "Progetti personali"** con questo sito e `expense-dashboard`, in Sheet 2 Main. *Rivista: prima era "nessun progetto personale"* | §4.4 |
| D21 | **I Group slim non hanno la frase descrittiva**: solo titolo, meta, periodo e stack | §4.2 |
| D22 | **`stack` anche sui progetti completi** | §4.2 |
| D23 | **I progetti personali non hanno un periodo** | `period` diventa opzionale (§4.4) |

## Problem Statement

Il CV attuale è corretto e ben impaginato, ma rende meno di quanto potrebbe per tre motivi:

1. **Descrive attività, non risultati.** Tolto "40k utenti concorrenti", non c'è nessun numero. Metà dei bullet comincia con un sostantivo ("Sviluppo di…", "Coordinamento del…") che descrive un compito. Chi scorre il CV per 6–11 secondi non trova un segnale di impatto oltre al nome delle testate.
2. **Alcune parti occupano spazio senza portare informazione verificabile**: la lista di soft skills, "e altri…" nelle skill, bullet generici come "Gestione del repository GitHub" o "Lavoro in team… con la suite Atlassian".
3. **Il PDF è uno solo.** Le multinazionali e le aziende con selezione photo-blind scartano o anonimizzano un CV con la foto, e oggi non esiste un'alternativa da scaricare.

## 1. I numeri: quali cercare, in ordine di impatto

L'owner ha pochi numeri e può recuperarne qualcuno. Qui sotto sono **ordinati per rapporto tra impatto e sforzo**: i primi valgono di più e si trovano più facilmente. Bastano **3–4 numeri** per cambiare il tono di Sheet 1 Main. Non serve averli tutti.

**Regola:** solo numeri veri e difendibili in colloquio. Se un valore è approssimato si scrive "~", "oltre" o "fino a". Se un numero non si trova, il bullet si scrive senza e si usa la scala o il nome (vedi la colonna *Se manca*).

| # | Numero | Perché conta | Dove trovarlo | Sforzo | Se manca |
|---|---|---|---|---|---|
| **N1** | **Core Web Vitals della homepage Gazzetta prima/dopo** (LCP, INP, CLS al p75, oppure la % di URL "Good" su mobile) | È la metrica più cercata per un senior frontend nel 2026 e chi la legge la capisce subito. Il ruolo di *Lead frontend developer* sulla nuova homepage è l'occasione migliore per usarla | **Pubblico**: CrUX History (PageSpeed Insights → "Origin", oppure CrUX Dashboard / API) per `gazzetta.it` con date prima/dopo il rilascio. Interno: RUM o Lighthouse CI se esistono | Basso: il dato è pubblico | "…con obiettivi di performance sui Core Web Vitals" |
| **N2** | **Scala delle piattaforme**: utenti unici o pagine viste al mese di Corriere e Gazzetta | Rende "piattaforme news di punta" misurabile. Insieme a "40k concorrenti" dà due dimensioni della scala | **Pubblico**: dati Audiweb/Comscore spesso citati nei comunicati RCS. Interno: analytics | Basso | Il "40k utenti concorrenti" già presente basta |
| **N3** | **Modernizzazione: numero di repository** portati su TypeScript/JSDoc e **numero di test o copertura** introdotti | Trasforma "più repository" in un fatto, e dimostra la leadership tecnica senza dichiararla | `git log`, config CI, report di copertura Jest | Basso | "su **N** repository" (almeno il conteggio dei repository c'è sempre) |
| **N4** | **Video-manager: portata** (numero di pagine o siti che lo usano, player al giorno, testate servite) e/o **riduzione dei bug** dopo i refactoring | Dà peso al ruolo di *Subject matter expert*, che oggi non ha scala | Analytics, Jira (bug per trimestre prima/dopo) | Medio | "usato da tutte le testate del gruppo" (se vero) |
| **N5** | **Persone**: junior seguiti in onboarding e **colloqui tecnici fatti** in CyberSecurity | La leadership si dimostra con i numeri. Serve anche a sostituire la voce "Leadership" delle soft skills (§6) | Memoria / HR, anche solo come stima ("oltre 10 colloqui") | Basso | "Tutoraggio dei nuovi ingressi…" senza numero |
| **N6** | **Tempi di delivery** di un progetto (es. B2B Environment: da zero alla produzione in ~3 mesi; RUOP: 8 mesi con 4 persone) | Mostra affidabilità. Le date ci sono già, basta renderle esplicite nel bullet | Date già presenti nel CV + memoria | Nullo | Il periodo nel Group basta |
| **N7** | **Utenti o scala del RUOP** (imprese iscritte, tipologie di utenti già note: 4) | Un portale ministeriale nazionale è un segnale forte | Fonti pubbliche MASAF, se ci sono | Medio | "portale nazionale del Ministero" |

**Se si fa una cosa sola: N1.** È pubblica, si recupera in 15 minuti ed è la metrica che distingue un senior frontend.

## 2. Principi di scrittura (per tutti i bullet, IT ed EN)

- **Formula XYZ**: risultato → misura → metodo. Un bullet senza numero deve avere almeno una scala o un nome.
- **Forma verbale unica in IT: participio passato** ("Guidato", "Introdotto", "Sviluppato"). Si toglie la prima persona ("Ho guidato") e si tolgono i sostantivi deverbali in apertura ("Sviluppo di…", "Coordinamento del…"). Per il ruolo attuale va bene anche il presente, ma una sola forma per ruolo. **EN:** verbo d'azione al passato per i ruoli conclusi (*Led, Built, Introduced*) e al presente per quello attuale (*Lead, Build, Own*).
- **Grafie canoniche delle tecnologie**, uguali in IT ed EN: `JavaScript`, `TypeScript`, `React`, `Next.js`, `Angular`, `RxJS`, `jQuery`, `Tailwind CSS`, `SVN`, `Node.js`, `Express`, `MongoDB`, `Vite`, `webpack`. Si corregge anche `tailwind.css` nel progetto Beyond Knowledge.
- **Stessi fatti e stessi numeri** nelle due Locale.
- **Explicit Paging:** ogni modifica si verifica sul PDF (`npm run build` + i test). **Sheet 1 Main è al limite** (in IT il bullet Gazzetta è già accorciato per stare in 2 righe): un bullet XYZ più lungo si compensa accorciandone un altro o togliendo un bullet debole. Mai spostando contenuto a un'altra posizione senza aggiornare `paperSheet`/`readOrder`.

## 3. Modifiche al contenuto, sezione per sezione

### 3.1 Header: contatti

Si aggiunge GitHub dopo LinkedIn (D4), in entrambe le Locale:

```ts
{ label: 'GitHub', value: 'VvsGitH', url: 'https://github.com/VvsGitH' },
```

Il profilo GitHub deve essere presentabile: bio, i due progetti personali (§4.4) fissati in alto con pin, README curati. Chi legge il CV lo apre di sicuro (research §1.3). Da verificare: i quattro contatti devono stare nell'header senza andare a capo male, in Paper e in Reading Mode.

### 3.2 Profilo (About)

La lunghezza resta (D7). Cambia il contenuto:

- "5 anni" diventa **"5+ anni"** (IT) / **"5+ years"** (EN).
- La prima frase deve dire **specializzazione + stack**. "Senior software developer" è coerente con `header.title` (D9), ma subito dopo va detto *dove* si è forti: frontend, React/TypeScript, piattaforme ad alto traffico.
- Se N1 o N2 esistono, un numero va nel profilo, accanto ai 40k concorrenti.
- La frase finale ("Tengo a un codice manutenibile… sinceramente curioso del perché…") si trasforma in un fatto concreto: introdurre TypeScript e test in codebase legacy, attenzione a performance e accessibilità.
- Si aggiunge in chiusura una frase su **cosa si cerca** (D6): IT *"Cerco posizioni da remoto; valuto anche ruoli ibridi in Italia, senza cambio di residenza."* EN *"Looking for remote roles; open to hybrid positions in Italy without relocation."*

Bozza IT, da adattare con i numeri reali:

> Senior software developer con **5+ anni** di esperienza, specializzato in **frontend React e TypeScript** su applicazioni di larga scala: da strumenti enterprise per A2A, Leonardo, ENI ed Enel alle piattaforme news di **Corriere della Sera** e **Gazzetta dello Sport** (fino a **40k utenti concorrenti**). Ho guidato piccoli team, seguito la crescita di sviluppatori junior e lavorato a stretto contatto con product manager, designer e stakeholder non tecnici. Porto **TypeScript, testing e attenzione a performance e accessibilità** anche nelle codebase legacy. Cerco posizioni da remoto; valuto anche ruoli ibridi in Italia, senza cambio di residenza.

La versione EN non va tradotta alla lettera: stesse informazioni, scritte per il mercato internazionale.

### 3.3 Esperienza: RCS Innovation (Senior Software Developer)

Obiettivo: il primo bullet deve contenere il risultato più forte. Bozze IT con segnaposto (`[N1]` ecc. rimandano alla §1). Se il numero manca, si usa la variante tra parentesi.

1. **Piattaforme**: *"Sviluppo e manutenzione delle piattaforme news di punta di RCS, **Corriere della Sera** e **Gazzetta dello Sport** ([N2] utenti al mese, fino a **40k concorrenti**), con focus su **stabilità**, **performance** ed esperienza utente."*
2. **Homepage Gazzetta (N1)**: *"**Lead frontend developer** per la nuova homepage e il restyling di Gazzetta: [LCP da X a Y s / URL 'Good' su mobile da X% a Y%] (senza N1: bilanciando stabilità e performance sui Core Web Vitals)."*
3. **Video-manager (N4)**: *"**Subject matter expert** del video-manager ([N4]): coordinamento del team di manutenzione e refactoring continui."*
4. **Architettura**: resta com'è (è già buono), con le grafie sistemate: "vanilla JS/TS e React".
5. **Modernizzazione (N3)**: *"Guidata la **modernizzazione di [N] repository legacy**: **TypeScript/JSDoc**, **unit testing con Jest** ([copertura / numero di test]) e linee guida di testing per il team, incluse le best practice per il **coding assistito da AI**."*

I bullet sono cinque come oggi, con lo stesso budget di righe. **Il bullet 2 in IT è già accorciato per stare in 2 righe**: se N1 lo allunga, si recupera spazio nel bullet 4.

### 3.4 Esperienza: CyberSecurity

- **Si uniscono Trainee e Software Developer** in un'unica progressione: `Software Developer` · `CyberSecurity S.r.l.` · `04/2021 – 05/2024`, con la frase sulla formazione iniziale ridotta a un bullet o a una riga di summary (*"Entrato come trainee (Clean Code, SOLID, design pattern), promosso developer dopo 3 mesi"*). Si libera un Group intero su Sheet 1 Main, e quello spazio assorbe i bullet XYZ più lunghi della §3.3.
- Bullet: si passa al participio e si aggiungono N5/N6.
  - *"**Sviluppo full-stack** come consulente per **5+ clienti** enterprise in domini diversi (utility, energia, finanza, pubblica amministrazione, piattaforme AI)."* I clienti si contano dai progetti già elencati.
  - *"**Technical leader** di team fino a 4 sviluppatori: scelte architetturali, code review, stime e supporto tecnico."*
  - *"**Onboarding e mentoring** di [N5] nuovi ingressi su JavaScript, TypeScript e React, con percorsi strutturati e pair programming."*
  - *"Condotti [N5] **colloqui tecnici** per candidati frontend, con contributo alle decisioni di assunzione."*

### 3.5 Competenze tecniche (Tecnologie / Tech Skills)

- Grafie canoniche (§2).
- Si tolgono "e altri…" / "and more…" da *State management* e *Librerie UI*.
- **Si tolgono o si spostano le voci "di base"**: `Java Spring (basi)` e `React Native (conoscenza di base)`. Proposta: si elimina il gruppo *Sviluppo mobile* e si aggiunge una riga *"Familiarità con: Java Spring, React Native, Python"* in fondo, oppure si tolgono del tutto. Java e Python restano in *Linguaggi* (D18).
- Voci datate da valutare: `Gulp`, `Bootstrap 4`. Si tengono se il candidato vuole mostrare l'esperienza con il legacy, altrimenti si liberano righe.
- **Nuove voci** (se vere), meglio in un gruppo *Qualità e pratiche* oppure nel blocco della §6: **Web performance / Core Web Vitals**, **Accessibilità (WCAG 2.1)**, **Micro-frontend / islands architecture**, **Astro**, **Playwright**, **CI/CD (Jenkins, GitHub Actions)**, **Design system**.
- Il grassetto va solo sulle 4–5 tecnologie principali, come oggi.
- **Sheet 1 Aside ha un budget**: se le nuove voci non ci stanno, vanno nel blocco della §6 su Sheet 2 Aside, e il riferimento si capisce anche a distanza.

### 3.6 Lingue

- `B2 - C1` diventa **"B2 certificato, C1 d'uso"** (IT) / **"B2 certified, C1 in daily use"** (EN) (D16). Il testo è più lungo dell'attuale: va verificato che stia sulla riga accanto alla barra in `LanguagesBlock`. Se non ci sta, va a capo sotto il nome della lingua, e il commento `level` in `types.ts` va aggiornato di conseguenza.
- La barra resta (è una scelta di design). Il livello CEFR resta scritto per esteso, ed è la parte che leggono ATS e recruiter.

### 3.7 Certificazioni

Nessuna modifica obbligatoria. `WC3x.org` va controllato: l'emittente è probabilmente **W3C** (via edX), `W3Cx`.

### 3.8 Formazione

- Il diploma resta (D2).
- EN: `EQF Level: 6` diventa *"Bachelor's degree (EQF 6)"* oppure si toglie l'EQF. La tesi resta in IT; in EN si può ridurre al titolo.

### 3.9 Altre info

Patente e automunito restano (D5). Cambia la riga sulla disponibilità (D6):

- IT: *"Preferenza per il lavoro da remoto; disponibile per posizioni ibride in Italia, senza cambio di residenza."*
- EN: *"Preference for remote work; open to hybrid roles in Italy, without relocation."* Per l'EN si può aggiungere *"Based in Bari, Italy (CET). EU citizen."*: fuso orario e diritto al lavoro in UE sono i primi filtri knock-out degli ATS internazionali.

La riga **"Disponibile al trasferimento" si toglie**, perché contraddice D6.

### 3.10 Privacy

Si aggiorna la formula con il riferimento completo (research §3.9):

> Autorizzo il trattamento dei miei dati personali presenti nel curriculum vitae ai sensi del D.Lgs. 196/2003, come modificato dal D.Lgs. 101/2018, e dell'art. 13 del Regolamento (UE) 2016/679 (GDPR), ai fini della ricerca e selezione del personale.

EN: resta, come traduzione della stessa clausola. Toglierla dal CV EN richiederebbe di cambiare il paging di Sheet 2 Aside, e non serve.

### 3.11 Date (tutte le sezioni)

`2024.05` diventa `05/2024`, e `2024.05 - oggi` diventa `05/2024 – oggi` (EN `05/2024 – present`), con il trattino semplice `-` come separatore (l'owner ha preferito il trattino all'en dash, 2026-09-24). Le date delle certificazioni (`2022.12.20`) diventano `12/2022`.

## 4. Progetti: formato completo e formato slim

### 4.1 Quali progetti in quale formato

| Progetto | Formato | Motivo |
|---|---|---|
| **RUOP** (Leonardo / MASAF) | **Completo** | Leadership (4 persone), architettura React, OAuth2, portale nazionale |
| **B2B Environment** (A2A) | **Slim** | Rivisto dall'owner (2026-09-24). RUOP copre già leadership e setup React |
| **Dam Dossier** (Enel) | **Slim** | Tecnologie diverse (Angular, WCAG) che lo slim mostra comunque |
| **Beyond Knowledge** | **Completo** | Rivisto dall'owner (2026-09-24). Il bullet generico "Lavoro in team… suite Atlassian" è tolto |
| **VEDO Tool & ABC Monitoring** (ENI) | **Slim** | Cliente noto, tecnologie Microsoft (Power Apps, SharePoint, OData) |

I bullet dei progetti completi si riscrivono con gli stessi principi (§2). Si tolgono i bullet generici ("Gestione del repository GitHub", "Documentazione tecnica e testing", "Lavoro in team… suite Atlassian") o si fondono in un bullet che dica qualcosa di specifico.

### 4.2 Il formato slim

Un Group slim è **una riga di titolo + meta + periodo** (come oggi) **più una riga di tecnologie**, senza summary, senza bullet e senza frase descrittiva (D21).

```
Dam Dossier                                       04/2022 – 10/2022
Frontend Developer · Enel Green Power
Angular 14 · SCSS · Enel Design System · WCAG 2.1 · Jasmine/Karma
```

**Modello dei contenuti** (`src/content/types.ts`). Proposta: un campo opzionale sul Group esistente, non una nuova variante dell'unione:

```ts
/** Technologies, rendered as one inline line. A Group with `stack` and no `bullets` is a slim Group. */
stack?: string[];
```

- Il campo si usa anche sui Group completi (una riga di stack sotto i bullet), così ogni progetto mostra lo stack nello stesso punto (D22).
- `MainSectionBlock.astro` rende `stack` come una riga inline con separatore `·` (lo stesso pattern di `display: 'inline'` di `SkillGroup`). **Il separatore nel DOM è testo**, non un pseudo-elemento, così l'estrazione del PDF lo legge. **`·` (U+00B7) oggi non è nel subset** (`fonts.config.mjs` → `TEXT`): va aggiunto a `PUNCTUATION`, altrimenti viene reso con il font di fallback.
- Un Group slim diviso tra due Sheet non ha senso. La `Continuation` resta possibile a livello di Block, come oggi.

### 4.3 Il paging di Sheet 2 Main

Con tre progetti slim, Sheet 2 Main si accorcia di parecchio. Quello spazio serve a:
1. i bullet riscritti dei progetti completi, se sono più lunghi;
2. la riga `stack` aggiunta ai progetti completi;
3. la sezione *Progetti personali* (§4.4);
4. spazio bianco, se avanza. Non è un problema in fondo al secondo foglio.

### 4.4 Progetti personali

Una **sezione a sé**, non un Group dentro *Progetti selezionati*. Un "progetto" chiamato "Progetti personali in evidenza" mescolato ai lavori per i clienti è ambiguo, e i campi `meta` (ruolo, cliente) non hanno senso per un progetto personale.

- **Block:** un `mainSection` con heading **"Progetti personali"** / **"Personal Projects"**, cioè il titolo standard che gli ATS riconoscono. Si mette in Sheet 2 Main, dopo *Progetti selezionati (continua)* e prima di *Formazione*.
- **`readOrder`:** si mette subito dopo la Continuation dei progetti (oggi `6`), quindi prende il `7`. Tutti i Block da `7` in su scalano di uno, e il controllo della permutazione in `Document.astro` lo verifica.
- **Due Group slim** (§4.2), senza frase descrittiva (D21), con `stack` e **`url`**:

```
CV Management & Display
github.com/VvsGitH/my-cv-website
Astro · Preact · TypeScript · Playwright · CSS moderno · WCAG 2.2

Expense Dashboard
github.com/VvsGitH/expense-dashboard
Python · Streamlit · SQLite · pytest
```

**Nomi** (sempre in inglese, in entrambe le Locale): **CV Management & Display** e **Expense Dashboard**. **Nessun periodo** (D23).

**Modello dei contenuti:** un secondo campo opzionale sul Group, accanto a `stack`, e `period` diventa opzionale (D23):

```ts
/** A public link — repository or demo. Rendered in full, not hidden behind the title: a printed PDF cannot be clicked. */
url?: string;
```

- **Il link si vede per esteso**, senza `https://`, al posto di `meta`. Il `meta` di un Group resta obbligatorio per i Group non-Continuation, quindi o `meta` diventa opzionale quando c'è `url`, oppure `meta: ['Progetto personale']` con il link su una riga a parte. **Proposta: `meta` opzionale**, perché ripetere "Progetto personale" sotto un heading che lo dice già è rumore.
- Il link è un `<a href>` vero, così è cliccabile anche nel PDF: Chromium conserva i link in `page.pdf()`.

**Cosa sistemare nei repository prima di linkarli** (il recruiter li apre, research §1.3). È lavoro fuori da questo repository e non blocca il ticket, ma va fatto prima di pubblicare:
- `expense-dashboard`: il README è **solo in italiano**. Chi arriva dal CV inglese lo aprirà, quindi serve almeno una sezione in inglese. Gli screenshot ci sono già, e una demo online non è necessaria.
- `my-cv-website`: ~~README non aggiornato~~ **fatto** (2026-09-24): titolo *CV Management & Display*, link al sito in cima, funzionalità, stack completo, documentazione.

## 5. Download: menù con CV completo e CV senza foto

### 5.1 Comportamento

Il pulsante download nella Toolbar **apre un menù con due voci**:
- IT: **"Scarica CV completo"** / **"Scarica CV senza foto"**
- EN: **"Download full CV"** / **"Download CV without photo"**

Ogni voce è un `<a download>` verso il PDF corrispondente della Locale corrente. **La forma della Toolbar non cambia** (ADR-0025): stessa posizione, stessa icona, stesso gruppo con Share. Cambia solo cosa succede al click.

### 5.2 I PDF

| File | Contenuto |
|---|---|
| `Vito_Paparella_Santorsola_CV_IT.pdf` / `_EN.pdf` | Come oggi: il nome resta invariato, così i link già condivisi continuano a funzionare |
| `Vito_Paparella_Santorsola_CV_IT_no-photo.pdf` / `_EN_no-photo.pdf` | Uguale, ma il disco del `photo` Block è vuoto: niente ritratto (D12) |

Il nome del file senza foto contiene `_no-photo` in entrambe le Locale, anche nel PDF italiano (D17).

### 5.3 Come si produce il PDF senza foto

**Proposta: un attributo impostato al momento della capture, nessuna route nuova.**

- `scripts/render-captures.mjs`, per ogni Locale, dopo il PDF completo: `page.evaluate(() => document.documentElement.dataset.photo = 'off')`, poi un secondo `page.pdf()` e un secondo `assertTwoA4Pages()`.
- CSS: `:root[data-photo="off"] .photo picture { display: none; }` nel layer del `PhotoBlock`. **Si nasconde solo l'immagine, non il Block** (D12): il `.photo` mantiene dimensione (`--photo-size`) e `background-color`, quindi il disco resta e l'impaginazione dell'Aside è identica al PDF completo.
- È lo stesso meccanismo di `data-mode` e `data-theme` (attributo su `<html>` come unica fonte di verità). Non crea una terza route da tenere in sincronia, e il sito non ha bisogno di mostrare la variante senza foto a schermo.

**Alternativa scartata:** una route `/[locale]/no-photo/` renderizzata a build-time. È più "pura" (la capture non muta il DOM), ma crea due pagine pubbliche indicizzabili con lo stesso contenuto, da escludere da sitemap e canonical, per un file che nessuno deve vedere nel browser.

**Il layout non cambia.** Il disco resta, quindi `--photo-size` continua a governare l'allineamento con l'header di Main, e ogni Block resta dov'è. L'assert delle 2 pagine A4 rimane comunque, come per il PDF completo.
- **Il ritratto non deve arrivare nel file.** Con `display: none` Chromium non disegna l'immagine e non la incorpora nel PDF, ma va verificato con il test della §5.5. Non basta che non si veda: un'immagine presente nel PDF ma coperta dal disco renderebbe inutile la variante.
- **Metadati del PDF:** il titolo del documento resta identico. Non serve distinguerli.

### 5.4 Il menù: pattern e accessibilità

Seguendo la guida *resilient-context-menus-and-nested-dropdowns* (modern-web-guidance):

- **Popover API**: `<button popovertarget="download-menu">` + `<div id="download-menu" popover="auto">` con due `<a download>` dentro. È Baseline dal 2025-01. Top layer, light-dismiss ed Esc sono gratis, **senza isola Preact**: il componente resta markup, come l'attuale `<a download>` (ADR-0025).
- **Semantica: un pulsante che rivela un gruppo di link, non un ARIA menu.** Niente `role="menu"`/`menuitem` e niente `aria-haspopup`, a meno di implementare tutto il contratto da tastiera con le frecce. Tab tra i due link, Esc chiude, il focus torna al pulsante: tutto questo è già nativo.
- **Posizionamento:** `position-area: block-end span-inline-start` (il pulsante è a metà della Toolbar, il pannello si apre verso il basso) + `position-try-fallbacks: flip-block, flip-inline`. Secondo la guida l'anchor positioning ha supporto limitato, quindi **serve un fallback** senza polyfill: su browser senza anchor positioning il pannello si posiziona in modo ragionevole (per esempio `position: fixed` sotto la Toolbar, allineato alla colonna), senza JS per calcolare coordinate. Quale fallback usare si decide nel ticket, con uno screenshot in Firefox.
- **Stile:** il pannello è l'unica superficie con sfondo nella Chrome. Usa i token esistenti (`--color-main-bg`, `--color-heading`) e rispetta il contrasto di ADR-0025 in entrambi i temi, con il bordo o l'ombra da ADR-0011 (scala degli spazi).
- **Icone:** le voci possono avere un'icona (`file-text` per il CV completo, `user-x` o `eye-off` per quello senza foto). **Le icone vanno aggiunte al font icomoon** e ai codepoint `ICONS` in `fonts.config.mjs`: il subset oggi contiene solo 8 glyph. Per il pulsante si può aggiungere un `chevron-down` accanto all'icona download, per indicare che apre un menù. Da valutare: il pulsante oggi è solo un'icona, e un chevron ne cambia la larghezza.
- **Stringhe i18n** in `src/i18n/ui.ts`: `download` (etichetta del pulsante, ora *"Scarica il CV"* / *"Download the CV"*), `downloadFull`, `downloadNoPhoto`.
- **`chromeLinks`** in `src/i18n/locale.ts`: `pdfHref` diventa `pdfHrefs: { full, noPhoto }`. Il nome del file resta scritto in due punti (ADR-0009): `pdfPath` in `render-captures.mjs` e `chromeLinks`. **Tutti e due i punti si aggiornano insieme.**
- **Senza JS e con popover non supportato:** il `<button>` non fa nulla. Fallback minimo: il `<a download>` del PDF completo resta raggiungibile, per esempio come primo link dentro il popover, che senza supporto al popover viene mostrato inline, oppure con `<noscript>`. Si decide nel ticket, e il criterio è che **il PDF completo sia sempre scaricabile**.

### 5.5 Test (ADR-0010: Playwright contro l'artifact costruito)

- `pdf.spec.ts`: esistono **4 PDF**, tutti di 2 pagine A4. Il PDF senza foto **non contiene il ritratto**: si verifica contando le XObject immagine con `pdf-lib` (una in meno del PDF completo, oppure zero). Il confronto sulla dimensione del file non basta come prova.
- `toolbar.spec.ts`: il pulsante apre il menù, Esc lo chiude e il focus torna al pulsante, i due link hanno `download` e `href` corretti per ogni Locale, il contrasto del pannello è rispettato in entrambi i temi.
- Il test esistente che controlla `pdfHref` va aggiornato, senza essere rimosso.

## 6. Sheet 2 Aside: cosa mettere al posto delle soft skills

Le soft skills occupano ~8 righe in cima a Sheet 2 Aside. Lo spazio non deve restare vuoto (D10). Il criterio è che ci vada **qualcosa di verificabile che oggi il CV non dice**.

### Deciso: un blocco "Come lavoro" / "How I work" (D19)

Un `BulletsBlock` (tipo già esistente, **nessuna modifica al modello**), nella stessa posizione e con lo stesso `readOrder`. Trasforma le soft skills in **pratiche concrete**, e ognuna rimanda a qualcosa che si trova altrove nel CV:

IT (bozza):
- **Performance first**: Core Web Vitals come requisito, non come rifinitura.
- **Accessibilità**: WCAG 2.1 (certificazione W3C, Dam Dossier).
- **Codice testato**: unit test con Jest, e2e con Playwright.
- **Code review e mentoring** come parte del lavoro quotidiano.
- **Modernizzazione incrementale** del legacy, senza big-bang rewrite.
- **AI-assisted development**: Claude Code e Copilot, con linee guida condivise nel team.
- **Agile/Scrum** con team di prodotto e stakeholder non tecnici.

EN: stesse voci (*Performance first · Accessibility · Tested code · Code review & mentoring · Incremental modernisation · AI-assisted development · Agile/Scrum*).

**Perché questa:**
- Occupa lo stesso spazio e ha lo stesso formato: il paging di Sheet 2 Aside non cambia.
- Porta keyword di valore (Core Web Vitals, WCAG, Playwright, AI-assisted) che sono **leggibili dagli ATS** e che non stanno in Sheet 1 Aside (§3.5).
- Mostra *come* lavori in modo verificabile. Le soft skills dicevano *chi sei* in modo non verificabile.
- Assorbe "Leadership", "Tutoraggio" e "Lavoro in team" in voci concrete. Le altre soft skills sono già dimostrate dai bullet.

### Alternativa scartata: il progetto personale in Aside

Un blocco *"Side project"* con questo sito in Sheet 2 Aside. Scartato perché richiede un nuovo `kind` di Block e toglie spazio a "Come lavoro". I progetti personali vanno invece in Main, come Group slim (§4.4).

## 7. Decisioni aperte

Mancano solo i numeri della §1. Per `meta` opzionale c'è un default proposto (sì).

## 8. Ticket proposti

In ordine di esecuzione, uno per file in `docs/issues/cv-content-refresh/`:

1. **`01-download-menu-no-photo-pdf`**: capture del PDF senza foto, `data-photo`, menù popover, stringhe i18n, `chromeLinks`, test. È indipendente dal contenuto, si può fare subito.
2. **`02-slim-project-groups`**: campi `stack` e `url` in `types.ts` (con `meta` opzionale), rendering in `MainSectionBlock.astro`, conversione dei tre progetti slim, stack sui progetti completi, sezione *Progetti personali*.
3. **`03-dates-and-spelling`**: formato `MM/YYYY` e grafie canoniche in tutto il CV. È meccanico, e farlo prima dei ticket di contenuto evita di riscrivere due volte le stesse righe.
4. **`04-content-sheet-1`**: header (GitHub), profilo, esperienza RCS e CyberSecurity (unione dei ruoli), skill. **Aspetta i numeri** della §1, ma si può partire con i segnaposto di scala.
5. **`05-content-sheet-2`**: "Come lavoro" al posto delle soft skills, progetti completi riscritti, lingue, altre info, privacy, formazione EN.

Ogni ticket di contenuto termina con build verde, test verdi (2 pagine A4 per tutti i PDF) e un controllo visivo di Paper Mode e Reading Mode in entrambe le Locale.

## Comments

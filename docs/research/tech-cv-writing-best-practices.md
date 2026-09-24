# Best practice per scrivere un CV tech (IT + EN)

Data della ricerca: 2026-09-24. Scopo: capire come riscrivere il contenuto di `src/content/it.ts` e `src/content/en.ts` perché renda di più con i recruiter, sia umani sia software (ATS/LLM). Questo documento non tocca il layout (Sheet, Explicit Paging, Mode): riguarda solo **cosa** c'è scritto.

Nota sulle fonti: su questo tema le fonti primarie sono poche (qualche studio con eye-tracking, i testi di legge, pochi autori con esperienza diretta di hiring). Il resto viene da blog di career coaching e da produttori di strumenti per CV, che hanno un interesse commerciale. Ogni affermazione indica da dove viene. Le statistiche dei vendor vanno lette come indicazioni di massima, non come dati certi.

---

## TL;DR — le 10 regole che contano

1. **La prima occhiata dura circa 6–11 secondi e si concentra nel terzo superiore del primo foglio.** In quello spazio devono esserci titolo, anni di esperienza, stack principale e un risultato forte.
2. **I bullet raccontano l'impatto, non i compiti.** Si usa la formula XYZ di Google: *"Ho ottenuto [X], misurato da [Y], facendo [Z]"*.
3. **Numeri reali ovunque sia possibile**: utenti, traffico, performance (Core Web Vitals), dimensione del team, numero di repository, copertura dei test, tempi. Un numero onesto e approssimato ("~", "oltre") batte un aggettivo.
4. **Si comincia con un verbo d'azione**, al passato per i ruoli conclusi e al presente per quello attuale. Da evitare "Responsabile di…", "Lavoro su…", "Utilizzo di…".
5. **Le soft skill si dimostrano, non si elencano.** Una lista di soft skill non porta niente: la leadership si vede nei bullet ("guidato un team di 4…").
6. **Niente barre o valutazioni di livello** sulle competenze: i recruiter non le apprezzano e gli ATS non le leggono. Per le lingue si usa il livello CEFR scritto per esteso.
7. **La sezione skills è un indice per le keyword, non un curriculum a sé.** Si raggruppa per area, si mettono prima le tecnologie su cui ci si vuole candidare e si toglie ciò che è datato o marginale.
8. **Il profilo in cima conta 3–4 righe (meno di 50 parole in EN).** Deve dire chi sei, cosa sai fare meglio e un risultato che ti distingue. Niente frasi vaghe.
9. **Scrivere per due lettori.** Gli ATS e gli LLM leggono tutto il documento e cercano corrispondenza semantica con l'annuncio. Le persone scorrono. Servono testo reale e selezionabile, titoli di sezione standard e le tecnologie scritte come nell'annuncio.
10. **Autenticità.** Nel 2026 recruiter e ingegneri riconoscono al volo un CV generato da un'AI e pieno di metriche generiche. Dettagli specifici del dominio e numeri veri sono il miglior segnale di credibilità.

---

## 1. Come viene letto un CV nel 2026

### 1.1 Il lettore umano: una prima scrematura, poi la lettura vera

- Lo studio con eye-tracking di Ladders (2012, ripreso nel 2018) ha misurato una media di **~6–7 secondi** per decidere se un CV meritasse una lettura vera ([HR Dive](https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/)).
- Un'analisi del 2025 su 4.289 revisioni riporta **11,2 secondi** in media quando il recruiter ha l'annuncio affiancato al CV, e circa 6 secondi senza. Chi scarta impiega in media 5,2 secondi ([Simplify](https://simplify.jobs/blog/6-second-resume-rule); [ResumeHeatMap](https://resumeheatmap.com/how-long-recruiters-look-at-resumes)). *Fonti vendor.*
- **Circa l'80% del giudizio iniziale si forma sul terzo superiore** del documento ([A4CV](https://a4cv.app/blog/six-second-resume-scan-eye-tracking-reveals-what-recruiters-see/)). *Fonte vendor, coerente con lo studio Ladders.*
- In Italia si parla di 7–15 secondi per la prima valutazione ([Zety IT](https://zety.it/blog/curriculum-sviluppatore-software); [LiveCareer IT](https://www.livecareer.it/esempi-curriculum-vitae/curriculum-sviluppatore-software)).

**Cosa guarda il recruiter in quei secondi:** titolo e ruolo attuale, azienda, date (quanta esperienza e se ci sono buchi), tecnologie principali, e se c'è un numero o un nome che attira l'occhio.

**Conseguenza per questo CV:** su Sheet 1 il terzo superiore è formato da `header` (Main) e `photo` + `about` (Aside). Titolo, anni e il dato "40k utenti concorrenti" sono già lì. Il primo bullet di RCS è l'altro punto che viene letto sicuramente.

### 1.2 Il lettore software: ATS e, sempre più spesso, LLM

- Il flusso tipico è questo: **estrazione del testo dal PDF**, poi filtri knock-out (località, autorizzazione al lavoro, anni minimi), poi **punteggio rispetto a skill e titoli dell'annuncio**, infine una classifica dei candidati ([Jobscan](https://www.jobscan.co/blog/blog-ai-resume-screening/)).
- Gli strumenti più recenti usano **LLM ed embedding**: capiscono i sinonimi, quanto è recente un'esperienza e la coerenza del percorso, e producono un riassunto in linguaggio naturale che il recruiter legge al posto del CV ([Jobscan](https://www.jobscan.co/blog/blog-ai-resume-screening/); [arXiv 2602.18550 — validity of LLM-based resume screening](https://arxiv.org/pdf/2602.18550); [arXiv 2603.18390 — AutoScreen-FW](https://arxiv.org/pdf/2603.18390)).
- Il software **legge tutto e dà lo stesso peso a ogni riga**: un bullet in fondo alla pagina 2 conta quanto il profilo ([A4CV](https://a4cv.app/blog/six-second-resume-scan-eye-tracking-reveals-what-recruiters-see/)). Riempire la parte alta di keyword quindi non serve. Serve invece che **ogni tecnologia rilevante compaia almeno una volta, in contesto**, cioè dentro un bullet che mostri come è stata usata.
- La maggior parte dello "screening AI" è ancora basata su keyword e regole, ma gli LLM si stanno diffondendo in fretta ([Jobscan](https://www.jobscan.co/blog/blog-ai-resume-screening/)).

**Conseguenze pratiche:**
- Il PDF generato da questo sito ha già testo reale e selezionabile, non un'immagine (ADR-0001, ADR-0009). È un vantaggio da non perdere. Va verificato che l'ordine di estrazione del testo sia sensato, per esempio con `pdftotext` sul PDF generato: con due colonne il parser può mescolare Aside e Main.
- Titoli di sezione standard: *Experience/Esperienza*, *Skills/Competenze*, *Education/Formazione*, *Projects/Progetti*. Quelli attuali vanno già bene.
- Si scrivono le tecnologie **nel modo in cui compaiono negli annunci**: "JavaScript", "TypeScript" (con la S maiuscola), "React", "Next.js", "Tailwind CSS", "jQuery", "RxJS", "Node.js". Le grafie attuali "Javascript", "Typescript", "JQuery", "RxJs", "Svn" e "tailwind.css" sono imprecise. Un parser semantico le capisce comunque, ma a un lettore tecnico sembrano sciatte.

### 1.3 Il recruiter controlla i link

Secondo dati vendor del 2026, circa l'**82% dei recruiter apre almeno un link esterno** prima di fissare un colloquio ([TailorForge](https://tailorforge.com/blog/what-recruiters-look-for-2026)). Nelle ricerche su LinkedIn il **titolo** compare nel 98% delle query e le **skill** nel 95%: prima si filtra per titolo e località, poi si ordina per skill ([Pin](https://www.pin.com/blog/recruiter-search-behavior-study/)).

**Conseguenze:** il titolo del CV deve coincidere con quello di LinkedIn e con il ruolo cercato. Se esiste un GitHub o un portfolio curato, va messo tra i contatti ([Tech Interview Handbook](https://www.techinterviewhandbook.org/resume/); [Develhope](https://blog.develhope.co/curriculum-per-sviluppatori-come-mostrare-le-tue-competenze-al-meglio/)). **Il sito stesso è un pezzo di portfolio**: una build-time PDF pipeline con Astro, attenzione a WCAG 2.2 e i18n. Vale la pena citarlo.

---

## 2. Scrivere i bullet

### 2.1 La formula XYZ (Laszlo Bock, Google)

> *"Accomplished [X] as measured by [Y], by doing [Z]."*

L'ha proposta Laszlo Bock, ex SVP People Operations di Google ([Resume.io](https://resume.io/blog/xyz-resume-format); [Wikipedia — Laszlo Bock](https://en.wikipedia.org/wiki/Laszlo_Bock)):
- **X**: il risultato ottenuto, non il compito assegnato.
- **Y**: la misura che lo prova (percentuale, volume, tempo, numero di persone o di repository).
- **Z**: il metodo, la tecnologia o la decisione che hanno portato al risultato.

Il Tech Interview Handbook propone una variante molto simile: `[Sintesi del risultato]: [Azione] che ha portato a [risultato quantificabile]` ([Tech Interview Handbook](https://www.techinterviewhandbook.org/resume/)).

### 2.2 Cosa si può misurare per un frontend/full-stack senior

Metriche suggerite per i ruoli di software engineering: performance, utenti, impatto sul business, latenza, copertura dei test, frequenza di deploy ([Resume Worded](https://resumeworded.com/software-engineer-resume-examples); [BeamJobs](https://www.beamjobs.com/resumes/software-engineer-resume-examples)). Nei bullet frontend senior più forti del 2026 compare **una tecnica abbinata a un delta sui Core Web Vitals**, meglio se al p75 ([Resume Optimizer Pro](https://resumeoptimizerpro.com/blog/frontend-developer-resume-examples); [ResumeStore](https://www.resumestore.ai/articles/resume-examples/senior-frontend-engineer/)).

Numeri che probabilmente esistono già nel lavoro di Vito e che vale la pena recuperare:

| Area | Metrica possibile | Dove recuperarla |
|---|---|---|
| Corriere / Gazzetta | utenti concorrenti (40k c'è già), pagine viste o utenti unici al mese | analytics interni |
| Performance | LCP / INP / CLS prima e dopo, pass rate CWV mobile | CrUX, PageSpeed, RUM interno |
| Stabilità | incidenti o bug in produzione prima e dopo, uptime | Jira, monitoring |
| Modernizzazione | numero di repository migrati a TS/JSDoc, test scritti, copertura % | git, CI |
| Video-manager | quante pagine o player serve, riduzione dei bug, peso del bundle | git, analytics |
| Leadership | numero di persone coordinate, junior seguiti, colloqui fatti | memoria / HR |
| Delivery | tempo di consegna (es. "in 3 mesi"), rispetto delle scadenze | Jira |

Se un numero non è disponibile, si usa **la scala** ("su 6 repository", "per un team di 8") oppure **il nome** ("Corriere della Sera"). Non si inventa niente: in colloquio i numeri vengono verificati.

### 2.3 Verbi e forma

- In EN si comincia sempre con un **verbo d'azione al passato** per i ruoli conclusi e al presente per quello attuale: *Led, Built, Shipped, Migrated, Reduced, Introduced, Designed, Mentored, Owned*.
- In IT si può usare il **participio passato** ("Guidato", "Introdotto", "Ridotto") oppure la **prima persona al passato** ("Ho guidato"). Conviene scegliere una forma e usarla in tutto il CV. Oggi è mista: "Sviluppo attivo…" (sostantivo), "Ho guidato…" (prima persona), "Coordinamento…" (sostantivo). I sostantivi deverbali ("Sviluppo di…", "Coordinamento del…") descrivono attività, non risultati.
- Parole da evitare: *responsible for / responsabile di*, *worked on / lavoro su*, *helped / supporto a*, *various / vari*, *and more… / e altri…*.

### 2.4 Nel dettaglio: un esempio sul CV attuale

Attuale (IT):
> Ho guidato la **modernizzazione incrementale di codebase legacy**: adozione progressiva di **TypeScript e JSDoc** su più repository, introduzione dello **unit testing con Jest**…

Riscrittura XYZ, con i numeri da riempire:
> Guidato la modernizzazione di **N repository legacy**: introdotti **TypeScript/JSDoc** e **unit testing con Jest** (da 0 a **X% di copertura**) e scritte le linee guida di testing del team, incluse le best practice per il **coding assistito da AI**.

Il contenuto è lo stesso, ma ora ha una scala (N repository), un risultato misurabile (copertura) e un verbo d'azione in apertura.

---

## 3. Le sezioni, una per una

### 3.1 Header / titolo

- Il titolo deve **coincidere con il ruolo cercato** e con il titolo su LinkedIn, perché le ricerche partono dal titolo ([Pin](https://www.pin.com/blog/recruiter-search-behavior-study/)). Se l'obiettivo sono posizioni frontend senior, *"Senior Frontend Engineer"* o *"Senior Software Engineer (Frontend)"* è più preciso di *"Senior Software Developer"*, visto che l'esperienza recente e i progetti sono quasi tutti frontend. In EN, "Engineer" è il termine più cercato su LinkedIn e nelle aziende di prodotto.
- Contatti essenziali: nome, email, telefono, città, LinkedIn. Facoltativi ma utili: GitHub e sito personale ([Tech Interview Handbook](https://www.techinterviewhandbook.org/resume/)). **Nel CV attuale manca il telefono** e manca un link al sito stesso. Il link alla versione web è la dimostrazione più diretta delle competenze frontend.

### 3.2 Profilo / About

- In Italia si consiglia un blocco di **3–4 righe** ([Zety IT](https://zety.it/blog/curriculum-sviluppatore-software)); il Tech Interview Handbook indica **meno di 50 parole** e dice che deve rispondere a *"why you are a good fit"* ([Tech Interview Handbook](https://www.techinterviewhandbook.org/resume/)).
- Il paragrafo attuale ha circa 75 parole in EN. Contiene elementi forti (5 anni, 40k utenti concorrenti, leadership) e chiude con una frase meno incisiva ("I care about maintainable, well-tested code and I'm genuinely curious…").
- Struttura suggerita:
  1. **Chi**: titolo, anni e specializzazione ("Senior frontend engineer, 5+ anni, React/TypeScript").
  2. **Dove, e il risultato che ti distingue** ("piattaforme news di Corriere della Sera e Gazzetta, fino a 40k utenti concorrenti").
  3. **Come lavori, con un fatto concreto** ("guido team piccoli, porto testing e TypeScript in codebase legacy").
  4. (facoltativo) **Cosa cerchi**: ruolo, remoto/ibrido.
- Anni: dal 2021.04 a oggi (2026.09) sono circa **5,5 anni**. "5+ anni" o "oltre 5 anni" è preciso e più forte.

### 3.3 Esperienza

- Nel ruolo attuale i primi 1–2 bullet sono quelli che vengono letti di sicuro (§1.1): lì va il risultato più forte, idealmente un numero su performance o stabilità di Corriere/Gazzetta.
- **3–5 bullet per il ruolo attuale, 2–4 per i precedenti.** Il ruolo da Trainee (3 mesi, 2021) può ridursi a una sola riga, oppure essere assorbito nel ruolo in CyberSecurity ("2021.04 – 2024.05, Trainee → Software Developer"). Una progressione interna è un segnale positivo e si può mostrare in modo compatto.
- Per le società di consulenza, **nominare i clienti finali** (A2A, Leonardo, ENI, Enel) è un segnale forte e va mantenuto.

### 3.4 Progetti selezionati

- I progetti devono **aggiungere** informazione, non ripetere l'esperienza. Oggi i 5 progetti occupano gran parte di Sheet 2 Main, sono di un periodo concluso (2022–2024) e hanno bullet in forma di compito ("Gestione del repository GitHub", "Documentazione tecnica e testing").
- Opzioni, dalla più forte alla più leggera:
  1. **Ridurre a 2–3 progetti**, quelli più rilevanti per il ruolo cercato: RUOP (leadership + architettura React + OAuth2), B2B Environment (setup Next.js da zero), Dam Dossier (Angular + WCAG). Ognuno con 2–3 bullet orientati al risultato.
  2. Aggiungere **un progetto personale o open source**, per esempio questo sito: *"CV bilingue in Astro + Preact con PDF pre-renderizzato a build-time via Playwright, conforme a WCAG 2.2, tema chiaro/scuro"*. È il progetto più recente e più rappresentativo del livello attuale.
  3. Togliere i bullet che non differenziano ("Lavoro in team su progetto in metodologia scrum, con la suite Atlassian", "Gestione del repository GitHub"): li fanno tutti i developer.
- Il "summary" di ogni progetto (cos'è l'applicazione) è utile ma lungo. Una riga basta.

### 3.5 Competenze tecniche (Skills)

- Si raggruppano per area e si mettono prima le tecnologie su cui ci si candida ([Tech Interview Handbook](https://www.techinterviewhandbook.org/resume/)). Il raggruppamento attuale va bene.
- Da togliere o ridimensionare:
  - voci "di base" (Java Spring, React Native): se si dichiarano "base" meglio toglierle, o spostarle in una riga "Familiarità con";
  - "e altri…" / "and more…": non dà informazione e sembra riempitivo;
  - tecnologie datate ma senza valore distintivo (Gulp, Svn, JQuery, Bootstrap 4): meglio togliere se lo spazio serve;
  - Jira/Confluence: sono generici. Si tengono solo se l'annuncio li cita.
- Da aggiungere se veri: **Core Web Vitals / web performance**, **accessibilità (WCAG 2.1/2.2)**, **micro-frontend / islands architecture**, **Astro**, **Playwright**, **CI/CD (Jenkins/GitHub Actions)**, **design system**. Sono keyword di valore per un senior frontend e oggi compaiono solo nei bullet o non compaiono affatto.
- Il grassetto su 4–5 skill principali aiuta la lettura veloce. Va tenuto, ma solo sulle skill su cui ci si candida.

### 3.6 Soft skills

- Il consenso tra le fonti è netto: le soft skill **si dimostrano nei bullet, non si elencano**. Una lista come "Creatività, Growth mindset, Leadership…" non porta informazione verificabile ([Hiration](https://www.hiration.com/blog/skill-bars-resume/); [The Muse](https://www.themuse.com/advice/the-nonboring-way-to-show-off-your-soft-skills-in-your-job-search); [IBM Careers](https://www.ibm.com/careers/blog/eight-common-resume-writing-mistakes-that-keep-you-from-getting-your-dream-job)).
- Il CV dimostra già leadership (team fino a 4 persone), mentoring (onboarding, pairing), comunicazione (colloqui tecnici, stakeholder) e lavoro sotto pressione (piattaforme ad alto traffico).
- **Raccomandazione:** togliere il blocco Soft skills e usare lo spazio in Sheet 2 Aside per qualcosa di verificabile: link a GitHub o al sito, progetti personali, talk, contributi open source, interessi tecnici. In alternativa si riduce a 3–4 voci che rimandano a fatti ("Mentoring: onboarding di N junior").

### 3.7 Lingue

- Le barre di livello (`proficiency: 0.7`) sono dello stesso tipo delle skill bar: in un esperimento di ResumeGo del 2022 non hanno aumentato i callback in modo statisticamente significativo, e gli ATS non le leggono ([Hiration](https://www.hiration.com/blog/skill-bars-resume/); [DEV Community](https://dev.to/tim012432/do-not-put-skill-bars-on-your-resume-lh6)). Il testo "B2 – C1" accanto alla barra è la parte che conta, ed è già presente. La barra è una scelta di design del sito: si può tenere, purché il livello CEFR resti sempre scritto per esteso.
- "B2 – C1" è un intervallo, e un intervallo si legge come incertezza. Meglio un livello unico e difendibile (per esempio "C1 — lavorativo, uso quotidiano"), oppure "B2 certificato (Cambridge), C1 d'uso".
- Il certificato Cambridge del 2013 è valido ma datato. Per ruoli internazionali un certificato recente (IELTS, TOEFL, EF SET gratuito) rafforza il livello dichiarato.

### 3.8 Certificazioni e formazione

- Formazione: la laurea con **110/110** e la tesi sono giuste in un CV italiano. In EN "EQF Level 6" dice poco fuori dall'UE: basta "Bachelor's degree (EQF 6)" o solo "BSc". La tesi su Reti di Petri non riguarda il web; in EN si può ridurre al titolo o togliere.
- Il diploma di scuola superiore con 5+ anni di esperienza è facoltativo. Si toglie spesso nei CV EN; in IT si può tenere.

### 3.9 Altre info / Privacy / Foto (differenze tra Locale)

| Elemento | CV italiano | CV inglese (internazionale) |
|---|---|---|
| **Foto** | Abituale in Italia ([TailorCV](https://thetailorcv.com/blog/photo-on-resume)) | **Sconsigliata** per UK/US/multinazionali, per via delle norme antidiscriminazione e dei processi "photo-blind" ([Novorésumé](https://novoresume.com/career-blog/including-photo-on-resume); [Resumemate](https://www.resumemate.io/blog/resume-photos-by-country-dos-donts-legal-norms/)). Il recruiter vede comunque la foto su LinkedIn. |
| **Clausola privacy** | Per legge **non serve**: l'art. 111-bis del Codice Privacy esclude il consenso per i CV inviati spontaneamente, con base giuridica art. 6.1.b GDPR ([Brocardi — art. 111-bis](https://www.brocardi.it/codice-della-privacy/parte-ii/titolo-viii/capo-i/art111bis.html)). Molti recruiter italiani però se la aspettano ancora ([Randstad](https://www.randstad.it/come-trovare-lavoro/autorizzamento-trattamento-dati-personali-cv/); [Adecco](https://www.adecco.com/it-it/candidati/come-trovare-lavoro/trattamento-dati-personali-cv)). Tenerla non costa niente. Formula aggiornata: *"…ai sensi del D.Lgs. 196/2003, come modificato dal D.Lgs. 101/2018, e dell'art. 13 del Regolamento (UE) 2016/679 (GDPR)…"* ([Zety IT](https://zety.it/blog/autorizzazione-al-trattamento-dei-dati-personali)). | Non usata fuori dall'Italia: si può togliere o ridurre a una riga. |
| **Patente / automunito** | Comune, ma per un ruolo da sviluppatore è rumore, a meno che l'annuncio non lo chieda | Da togliere |
| **Data di nascita** | Alcune guide IT la suggeriscono ([Zety IT](https://zety.it/blog/curriculum-sviluppatore-software)); è facoltativa | Da non mettere |
| **Disponibilità / remoto** | Utile, meglio se precisa: "Remoto o ibrido (Bari); disponibile al trasferimento" | Uguale, e si aggiunge il fuso orario (CET) e l'autorizzazione al lavoro in UE |

**Nota di implementazione:** `photo` e `privacy` sono Block con posizione esplicita in entrambe le Locale. Rendere la foto e la clausola specifiche per Locale richiede una modifica al modello dei contenuti (`types.ts`) e all'Explicit Paging di `en.ts`, non solo al testo. Questa è una decisione dell'owner.

### 3.10 Lunghezza

- Le fonti US/Big Tech consigliano **una pagina** ([Tech Interview Handbook](https://www.techinterviewhandbook.org/resume/)). In Europa e in Italia **due pagine sono accettate** per un profilo senior con più di 5 anni. Il formato a due Sheet va bene.
- La regola vera è la **densità**: ogni riga di Sheet 2 deve meritare il suo posto. Se Soft skills e parte dei progetti vengono tolti, Sheet 2 si alleggerisce e c'è spazio per aggiungere un progetto personale o per respirare.

---

## 4. CV italiano e CV inglese

- **Non è una traduzione.** In EN si scrive per un mercato più internazionale (aziende di prodotto, remote-first), che dà più peso a impatto, scala e proprietà del lavoro ("owned") e meno peso a titoli e voti.
- **Anglicismi in IT:** "Senior", "Frontend", "Subject matter expert", "Tech lead" sono la norma nei CV tech italiani, come nota il commento `OWNER` in `it.ts`. Si possono tenere, purché la struttura della frase resti italiana.
- **Coerenza IT ↔ EN:** gli stessi numeri e gli stessi fatti in entrambe le versioni. Un recruiter bilingue può confrontarle.
- **Date:** il formato `2024.05` è poco comune in entrambi i mercati. `05/2024` (IT) e `May 2024` o `05/2024` (EN) si leggono più in fretta e vengono estratti meglio dagli ATS ([Tech Interview Handbook](https://www.techinterviewhandbook.org/resume/) usa `MM/YYYY`).

---

## 5. Da evitare

- Bullet che descrivono attività ("Sviluppo di una web application…") senza scala né risultato.
- Metriche generiche o gonfiate stile AI ("+300% efficienza"): in colloquio si capisce subito ([KraftCV](https://www.kraftcv.com/blog/software-engineer-resume-guide-2026)).
- Keyword stuffing: gli LLM valutano il contesto, non la frequenza ([Jobscan](https://www.jobscan.co/blog/blog-ai-resume-screening/)).
- Liste di soft skill, barre di livello, "e altri…".
- Grafie errate delle tecnologie ("Javascript", "tailwind.css", "JQuery").
- Un CV uguale per ogni candidatura. Almeno profilo e ordine delle skill andrebbero adattati all'annuncio ([Coursera](https://www.coursera.org/articles/software-engineer-resume); [Resume Worded](https://resumeworded.com/software-engineer-resume-examples)). Con un sito statico non è pratico, ma il sito resta la versione "canonica" e si può adattare il PDF quando serve.

---

## 6. Checklist per la revisione di `it.ts` / `en.ts`

Priorità alta (impatto maggiore):
- [ ] Recuperare 3–5 numeri reali (CWV, repository, copertura, utenti, team) e metterli nei bullet di RCS.
- [ ] Riscrivere i bullet di RCS e CyberSecurity con la formula XYZ e un verbo d'azione iniziale; in IT scegliere una sola forma verbale.
- [ ] Allineare il titolo (`header.title`) al ruolo cercato e a LinkedIn.
- [ ] Accorciare il profilo a 3–4 righe (meno di 50–60 parole), con "5+ anni".
- [ ] Aggiungere telefono e link al sito (e GitHub se curato) nei contatti.

Priorità media:
- [ ] Togliere o sostituire il blocco Soft skills.
- [ ] Ridurre i progetti a 2–3 e aggiungere questo sito come progetto personale.
- [ ] Ripulire la sezione skills: grafie corrette, togliere "base" ed "e altri…", aggiungere web performance / accessibilità / micro-frontend / Playwright / CI.
- [ ] Unire Trainee e Software Developer in CyberSecurity in un'unica progressione.
- [ ] Lingue: un livello CEFR unico al posto dell'intervallo.

Priorità bassa / decisioni dell'owner:
- [ ] Foto e clausola privacy per Locale (serve una modifica al modello dei contenuti, vedi §3.9).
- [ ] Formato delle date (`MM/YYYY`).
- [ ] Formula privacy aggiornata con il riferimento al D.Lgs. 196/2003.
- [ ] Togliere patente/automunito e, in EN, il diploma di scuola superiore.
- [ ] Verificare con `pdftotext` l'ordine di estrazione del PDF a due colonne.
- [ ] Dopo ogni modifica, controllare che l'Explicit Paging regga ancora: i bullet `KEEP TIGHT` in `it.ts` mostrano che Sheet 1 Main è al limite.

---

## Fonti

**Studi e testi primari**
- [HR Dive — Ladders eye-tracking study (7 secondi)](https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/)
- [Brocardi — Codice Privacy, art. 111-bis](https://www.brocardi.it/codice-della-privacy/parte-ii/titolo-viii/capo-i/art111bis.html)
- [arXiv 2602.18550 — Measuring Validity in LLM-based Resume Screening](https://arxiv.org/pdf/2602.18550)
- [arXiv 2603.18390 — AutoScreen-FW: LLM-based Resume Screening](https://arxiv.org/pdf/2603.18390)
- [LinkedIn — Skills-Based Hiring Report 2025](https://economicgraph.linkedin.com/content/dam/me/economicgraph/en-us/PDF/skills-based-hiring-march-2025.pdf)
- [Wikipedia — Laszlo Bock](https://en.wikipedia.org/wiki/Laszlo_Bock)

**Guide di practitioner / community**
- [Tech Interview Handbook — Resume](https://www.techinterviewhandbook.org/resume/)
- [The Pragmatic Engineer — Resume template](https://blog.pragmaticengineer.com/the-pragmatic-engineers-resume-template/) · [The Tech Resume Inside Out](https://thetechresume.com/)
- [DEV Community — Do not put skill bars on your resume](https://dev.to/tim012432/do-not-put-skill-bars-on-your-resume-lh6)
- [IBM Careers — 8 common resume-writing mistakes](https://www.ibm.com/careers/blog/eight-common-resume-writing-mistakes-that-keep-you-from-getting-your-dream-job)
- [The Muse — Showing soft skills](https://www.themuse.com/advice/the-nonboring-way-to-show-off-your-soft-skills-in-your-job-search)

**Vendor / career blog (usare con cautela)**
- [Jobscan — How AI resume screening works in 2026](https://www.jobscan.co/blog/blog-ai-resume-screening/)
- [Simplify — The 6-second rule](https://simplify.jobs/blog/6-second-resume-rule) · [ResumeHeatMap](https://resumeheatmap.com/how-long-recruiters-look-at-resumes) · [A4CV](https://a4cv.app/blog/six-second-resume-scan-eye-tracking-reveals-what-recruiters-see/)
- [Pin — 100K recruiter searches](https://www.pin.com/blog/recruiter-search-behavior-study/) · [TailorForge](https://tailorforge.com/blog/what-recruiters-look-for-2026)
- [Resume.io — XYZ format](https://resume.io/blog/xyz-resume-format)
- [Hiration — Skill bars](https://www.hiration.com/blog/skill-bars-resume/)
- [Resume Worded](https://resumeworded.com/software-engineer-resume-examples) · [BeamJobs](https://www.beamjobs.com/resumes/software-engineer-resume-examples) · [Coursera](https://www.coursera.org/articles/software-engineer-resume) · [KraftCV](https://www.kraftcv.com/blog/software-engineer-resume-guide-2026)
- [Resume Optimizer Pro — Frontend examples](https://resumeoptimizerpro.com/blog/frontend-developer-resume-examples) · [ResumeStore — Senior Frontend](https://www.resumestore.ai/articles/resume-examples/senior-frontend-engineer/)
- [Novorésumé — Photo on resume](https://novoresume.com/career-blog/including-photo-on-resume) · [TailorCV — Photo by country](https://thetailorcv.com/blog/photo-on-resume) · [Resumemate](https://www.resumemate.io/blog/resume-photos-by-country-dos-donts-legal-norms/)
- [Zety IT — CV sviluppatore](https://zety.it/blog/curriculum-sviluppatore-software) · [Zety IT — Privacy](https://zety.it/blog/autorizzazione-al-trattamento-dei-dati-personali) · [LiveCareer IT](https://www.livecareer.it/esempi-curriculum-vitae/curriculum-sviluppatore-software) · [Develhope](https://blog.develhope.co/curriculum-per-sviluppatori-come-mostrare-le-tue-competenze-al-meglio/)
- [Randstad IT — Privacy CV](https://www.randstad.it/come-trovare-lavoro/autorizzamento-trattamento-dati-personali-cv/) · [Adecco IT — Privacy CV](https://www.adecco.com/it-it/candidati/come-trovare-lavoro/trattamento-dati-personali-cv)

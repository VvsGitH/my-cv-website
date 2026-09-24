# 04 — Contenuto di Sheet 1: header, profilo, esperienza, skill

Status: blocked — aspetta i numeri N1–N6 dall'owner (spec §1). Si può preparare con i segnaposto di scala.

Spec: `docs/issues/cv-content-refresh/spec.md` §1, §2, §3.1–§3.5 (decisioni D3, D4, D6, D7, D9, D13, D14, D18)

Bloccato anche da: 03 (date e grafie), perché le righe toccate sono le stesse.

## Cosa costruire

In `it.ts` e `en.ts`. In EN gli stessi fatti e gli stessi numeri, scritti per il mercato internazionale e non tradotti alla lettera.

- **Header**: contatto GitHub dopo LinkedIn: `{ label: 'GitHub', value: 'VvsGitH', url: 'https://github.com/VvsGitH' }`. Niente telefono (D3). `title` invariato (D9).
- **Profilo**: stessa lunghezza (D7). "5+ anni", specializzazione frontend React/TypeScript e clienti in apertura, un numero N1/N2 se c'è, una frase finale concreta al posto di "sinceramente curioso…" e, in chiusura, cosa si cerca (D14). La bozza è in spec §3.2.
- **RCS**: cinque bullet con la formula XYZ (spec §3.3), il più forte per primo. Il bullet Gazzetta è `KEEP TIGHT`: se N1 lo allunga, si compensa altrove.
- **CyberSecurity**: Trainee e Software Developer si uniscono in `Software Developer`, `04/2021 – 05/2024`, con una riga sulla promozione (D13). Bullet al participio con N5 (spec §3.4).
- **Skill**: niente "e altri…", le voci "di base" (Java Spring, React Native) si tolgono o vanno in una riga *"Familiarità con"*, Java e Python restano in *Linguaggi* (D18). Nuove voci, se c'è spazio in Sheet 1 Aside: Web performance / Core Web Vitals, Accessibilità (WCAG 2.1), Micro-frontend, Astro, Playwright, CI/CD, Design system. Quelle che non ci stanno le copre il blocco "Come lavoro" (ticket 05).
- **Forma verbale in IT**: participio passato, una sola forma per ruolo (spec §2).
- **Commenti in `it.ts`**: il commento di testa (le quattro decisioni `OWNER`, i tre bullet `KEEP TIGHT`) si aggiorna in base a quello che resta vero.

## Numeri da ricevere (spec §1)

| # | Numero | Ricevuto |
|---|---|---|
| N1 | Core Web Vitals della homepage Gazzetta prima/dopo | |
| N2 | Utenti unici o pagine viste al mese di Corriere e Gazzetta | |
| N3 | Repository migrati a TS/JSDoc, test o copertura | |
| N4 | Portata del video-manager, oppure riduzione dei bug | |
| N5 | Junior seguiti, colloqui tecnici | |
| N6 | Tempi di delivery | |

Se un numero manca, si usa la variante *Se manca* della spec. Mai inventare un numero.

## Criteri di accettazione

- [ ] Ogni bullet di RCS e CyberSecurity apre con un verbo d'azione e contiene un numero, una scala o un nome.
- [ ] Nessun `[N…]` segnaposto rimasto nel contenuto pubblicato.
- [ ] I quattro contatti stanno nell'header senza andare a capo male, in Paper e in Reading Mode.
- [ ] Sheet 1 Main e Sheet 1 Aside restano nel foglio: 2 pagine A4 per tutti e 4 i PDF.
- [ ] Stessi fatti e stessi numeri in IT ed EN.
- [ ] `npm test` verde, e controllo visivo di Paper e Reading Mode in IT ed EN.

## Comments

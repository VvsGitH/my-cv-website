import type { CvContent } from './types';

/**
 * Italian CV content — net-new text, not a transcription, because the source CV
 * is English.
 *
 * The owner owns the final professional wording. **Four** decisions need his
 * judgement, each tagged with an `OWNER` comment beside the text it governs.
 *
 * Register: first person, professional, matching the English. Product names,
 * company names, technologies, certificate titles and the thesis title are
 * left as-is — they are proper nouns. Typographic apostrophes (’) and quotes
 * (“ ”) match `en.ts` and the reference CV; both are in the font subset.
 *
 * OWNER: **English is kept for role and technical labels throughout** —
 * every `role` field ("Senior Software Developer", "Frontend Developer", …),
 * the inline labels "Subject matter expert", "Technical leader" and "Lead
 * frontend developer", "Senior frontend engineer" opening About, and
 * "State management:" among the skills. This is the norm in Italian tech
 * CVs, but it is one global decision, not a per-line one: if you want a
 * fully Italian register, all of the above change together.
 *
 * **Three bullets are deliberately tighter than their English source**, and
 * must stay that way — see the note beside them. Restoring literal fidelity
 * puts Sheet 1 Main back over the paper edge.
 */
export const it: CvContent = {
  locale: 'it',
  blocks: [
    // ── Sheet 1 · Aside ──────────────────────────────────────────────────
    {
      kind: 'photo',
      sheet: 1,
      column: 'aside',
      // Not blanked like the prose below: an empty `alt` reads as
      // "decorative" to a screen reader, which fails silently rather than
      // visibly. The name is the same in both Locales anyway.
      alt: 'Vito Paparella Santorsola',
    },
    {
      kind: 'about',
      sheet: 1,
      column: 'aside',
      heading: 'Chi sono',
      paragraphs: [
        'Senior software developer con 5 anni di esperienza tra società di consulenza e aziende di prodotto, su applicazioni di larga scala (da strumenti enterprise interni a piattaforme news ad alto traffico con oltre 40k utenti concorrenti). Ho guidato piccoli team, seguito la crescita di sviluppatori junior e collaborato a stretto contatto con product manager, designer e stakeholder non tecnici per tradurre le esigenze di business in soluzioni tecniche pragmatiche. Tengo a un codice manutenibile e ben testato, e sono sinceramente curioso del perché di ciò che costruisco.',
      ],
    },
    {
      kind: 'skills',
      sheet: 1,
      column: 'aside',
      heading: 'Tecnologie',
      groups: [
        {
          name: 'Linguaggi',
          display: 'inline',
          items: [
            '**Javascript**',
            '**Typescript**',
            'HTML',
            'CSS',
            'SCSS',
            'Java',
            'Python',
            'SQL',
          ],
        },
        {
          name: 'Sviluppo frontend',
          display: 'list',
          items: [
            '**React.js & Next.js**',
            '**Angular & RxJs**',
            'JQuery',
            'State management: Redux, NgRx, Zustand e altri...',
            'Librerie UI: Material UI, Angular Material, Tailwind css, Bootstrap 4/5 e altre...',
            'Testing: Jest, Jasmine + Karma, RTL',
            'Strumenti: Vite.js, Webpack, Gulp',
          ],
        },
        {
          name: 'Sviluppo backend',
          display: 'list',
          items: [
            'Node.js / Express.js',
            'MongoDB',
            'Java Spring (basi)',
            'Nginx',
            'REST & GraphQL',
          ],
        },
        {
          name: 'Sviluppo mobile',
          display: 'list',
          items: ['React Native (conoscenza di base)'],
        },
        {
          name: 'Strumenti di sviluppo',
          display: 'inline',
          items: [
            'Git',
            'Svn',
            'Docker',
            'Jenkins',
            'Jira',
            'Confluence',
            'GitHub Copilot',
            '**Claude Code**',
          ],
        },
      ],
    },

    // ── Sheet 1 · Main ───────────────────────────────────────────────────
    {
      kind: 'header',
      sheet: 1,
      column: 'main',
      name: 'Vito Paparella Santorsola',
      title: 'Senior Software Developer',
      contacts: [
        { label: 'Località', value: 'Bari, Italia' },
        {
          label: 'Email',
          value: 'vs.paparella@gmail.com',
          url: 'mailto:vs.paparella@gmail.com',
        },
        {
          label: 'LinkedIn',
          value: 'Vito Paparella Santorsola',
          url: 'https://www.linkedin.com/in/vito-paparella-santorsola-aa686817b/',
        },
      ],
    },
    {
      kind: 'mainSection',
      sheet: 1,
      column: 'main',
      heading: 'Esperienza',
      groups: [
        {
          title: 'Senior Software Developer',
          meta: ['RCS Innovation S.r.l.'],
          // The one period that isn't just digits — "oggi" is prose ("now").
          period: '2024.05 - oggi',
          bullets: [
            'Sviluppo attivo e manutenzione delle piattaforme news di punta di RCS: **Corriere della Sera** (fino a **40k utenti concorrenti**) e **Gazzetta dello Sport**, con forte attenzione a **stabilità**, **performance** ed esperienza utente.',
            '**Subject matter expert** per il componente video-manager, con coordinamento del team di manutenzione e refactoring continui e puntuali.',
            // KEEP TIGHT (1 of 3): shorter than en.ts to hold 2 lines. The literal
            // reading wraps to 3 and overflows Sheet 1 Main (ADR-0002).
            '**Lead frontend developer** per la nuova homepage e il restyling in corso di Gazzetta, coordinando sviluppo e trade-off tra stabilità e performance.',
            'Lavoro su un’**architettura micro-frontend ibrida basata sull’islands pattern**, con componenti scritti sia in **vanilla JS/TS sia in React**, bilanciando integrazione del legacy e sviluppo moderno.',
            'Ho guidato la **modernizzazione incrementale di codebase legacy**: adozione progressiva di **TypeScript e JSDoc** su più repository, introduzione dello **unit testing con Jest** e di linee guida di testing per tutto il team — incluse le best practice per gli **strumenti di coding assistito da AI**.',
          ],
        },
        {
          title: 'Software Developer',
          meta: ['CyberSecurity S.r.l.'],
          period: '2021.07 - 2024.05',
          bullets: [
            '**Sviluppo full-stack** come consulente su progetti di media e larga scala in domini diversi (utility, energia, finanza, piattaforme AI).',
            '**Technical leader** di piccoli team (fino a 4 sviluppatori), con responsabilità su scelte architetturali, revisione delle PR, stima delle attività e supporto tecnico.',
            '**Mentoring e formazione** dei nuovi ingressi su JavaScript, TypeScript e React.js, con onboarding strutturato e sessioni di pairing.',
            'Colloqui tecnici per candidati frontend, con contributo alle decisioni di assunzione.',
          ],
        },
        {
          title: 'Trainee Software Developer',
          meta: ['CyberSecurity S.r.l.'],
          period: '2021.04 - 2021.07',
          summary: [
            'Consolidamento delle competenze di base di programmazione e sviluppo software attraverso **formazione pratica** e lavoro su progetto: **Clean Code**, principi **SOLID**, programmazione **OO** e **design pattern**.',
          ],
        },
      ],
    },
    {
      kind: 'mainSection',
      sheet: 1,
      column: 'main',
      heading: 'Progetti selezionati',
      groups: [
        {
          title: 'B2B Environment',
          meta: [
            'Senior Frontend Developer & Team Leader',
            'CyberSecurity S.r.l. ~ A2A S.p.a',
          ],
          period: '2024.03 - 2024.05',
          summary: [
            '“B2B Environment” è una piccola web application, strutturata come un wizard, che sarà utilizzata dai clienti di A2A per ordinare e personalizzare i servizi di raccolta rifiuti.',
          ],
          bullets: [
            // KEEP TIGHT (2 of 3): colon instead of "con", and "di struttura
            // cartelle e pattern" instead of "della struttura delle cartelle e
            // dei pattern" — holds 2 lines instead of 3.
            'Setup e configurazione iniziale dell’applicazione Next.js: app-router, state management, i18n, deploy standalone. Definizione di struttura cartelle e pattern di codice.',
            // KEEP TIGHT (3 of 3): "revisione PR" and "attività complesse"
            // without articles — holds 1 line instead of 2.
            'Coordinamento del team, revisione PR e supporto tecnico sulle attività complesse.',
            'Documentazione tecnica e testing.',
          ],
        },
      ],
    },

    // ── Sheet 2 · Aside ──────────────────────────────────────────────────
    {
      kind: 'bullets',
      sheet: 2,
      column: 'aside',
      heading: 'Soft skills',
      // OWNER: "Growth mindset", "Leadership" and "Problem solving" are
      // established loanwords in Italian professional usage — kept.
      // "Mentalità di crescita" etc. if you want them fully translated.
      items: [
        'Creatività',
        'Growth mindset',
        'Leadership',
        'Problem solving',
        'Lavoro in team e comunicazione',
        'Gestione del tempo e delle attività',
        'Tutoraggio',
        'Lavoro sotto pressione',
      ],
    },
    {
      kind: 'languages',
      sheet: 2,
      column: 'aside',
      heading: 'Lingue',
      entries: [
        { name: 'Italiano', level: 'Madrelingua', proficiency: 1 },
        { name: 'Inglese', level: 'B2 - C1', proficiency: 0.7 },
      ],
    },
    {
      kind: 'certifications',
      sheet: 2,
      column: 'aside',
      heading: 'Certificazioni',
      // Both titles are official course/certificate names — proper nouns,
      // left untranslated.
      entries: [
        {
          date: '2022.12.20',
          issuer: 'WC3x.org',
          title: 'WAI0.1x: Introduction to Web Accessibility',
          url: 'https://www.edx.org/learn/web-accessibility/the-world-wide-web-consortium-w3c-introduction-to-web-accessibility',
        },
        {
          date: '2013.06.27',
          issuer: 'University of Cambridge',
          title:
            'Cambridge ESOL Level 1 Certificate in ESOL International | CoE Level B2',
        },
      ],
    },
    {
      kind: 'bullets',
      sheet: 2,
      column: 'aside',
      heading: 'Altre info',
      items: [
        'Patente di guida: B.',
        // "Automunito" is the idiomatic Italian CV term for "I own a car".
        'Automunito.',
        'Disponibile al trasferimento, ma attribuisco grande valore al lavoro da remoto.',
      ],
    },
    {
      kind: 'privacy',
      sheet: 2,
      column: 'aside',
      heading: 'Privacy',
      // The canonical Italian formula, not a literal translation: the English
      // is itself a rendering of this standard clause.
      statement:
        'Autorizzo il trattamento dei miei dati personali ai sensi del D.lgs. 101/2018 e dell’art. 13 GDPR (Regolamento UE 2016/679) ai fini della ricerca e selezione del personale.',
      place: 'Bari',
      date: '2026.04.19',
      signature: 'Vito Paparella Santorsola',
    },

    // ── Sheet 2 · Main ───────────────────────────────────────────────────
    {
      kind: 'mainSection',
      sheet: 2,
      column: 'main',
      // A Continuation (ADR-0005): the heading is a marked copy of Sheet 1's,
      // rendered for screen readers only. Five unrelated Aside headings sit
      // between the two halves in reading order, so the marker is what tells
      // a screen reader user "this resumes" rather than "I went backwards".
      heading: 'Progetti selezionati (continua)',
      continues: true,
      groups: [
        {
          title: 'Registro Ufficiale degli Operatori Professionali',
          meta: [
            'Senior Frontend Developer & Team Leader',
            'CyberSecurity S.r.l. ~ Leonardo S.p.a.',
          ],
          period: '2023.07 - 2024.02',
          summary: [
            '“Registro Ufficiale degli Operatori Professionali”, o RUOP, è una delle applicazioni all’interno del portale MASAF del Ministero dell’Agricoltura. Le imprese devono iscriversi al registro RUOP per svolgere attività di import/export di piante.',
          ],
          bullets: [
            'Coordinamento del team frontend, composto da me e altri 3 sviluppatori.',
            'Definizione dell’architettura dell’applicazione React.js.',
            'Traduzione dei requisiti del cliente in requisiti tecnici; stima e assegnazione delle attività.',
            'Sviluppo di una web application single-page e responsive in React.js, con 4 tipologie di utenti, autenticazione OAuth2.0 e routing.',
            'Gestione del repository GitHub.',
          ],
        },
        {
          title: 'Beyond Knowledge',
          meta: ['Senior Frontend Developer', 'CyberSecurity S.r.l. ~ Beyond Knowledge'],
          period: '2023.01 - 2023.06',
          summary: [
            '“Beyond Knowledge” è una piattaforma in sviluppo, su modello ad abbonamento, per servizi di AI. Offre soluzioni per Industry4.0, Network Monitoring e Financial Planning.',
          ],
          bullets: [
            'Sviluppo di una web application single-page e responsive in React.js, con librerie allo stato dell’arte come @tanstack/react-query e @tanstack/react-table.',
            'Sviluppo di un design system con tailwind.css, a partire da mockup Figma.',
            'Lavoro in team su progetto in metodologia scrum, con la suite Atlassian.',
          ],
        },
        {
          title: 'VEDO Tool & ABC Monitoring',
          meta: ['Frontend Developer', 'CyberSecurity S.r.l. ~ ENI Italia'],
          period: '2022.10 - 2022.12',
          summary: [
            '“VEDO Tool” è un’applicazione basata su Microsoft Power Apps, utilizzata dai dipendenti ENI per l’organizzazione interna. “ABC Monitoring” (Anti Bribery Compliance) è un’applicazione SharePoint usata da ENI per monitorare alcuni aspetti legali delle joint venture.',
          ],
          bullets: [
            'Sviluppo di una web application multipagina con Typescript, JQuery e Bootstrap 4.',
            'Utilizzo di Open Data Protocol (OData) per la comunicazione con Microsoft Dataverse.',
          ],
        },
        {
          title: 'Dam Dossier',
          meta: ['Frontend Developer', 'CyberSecurity S.r.l. ~ Enel Green Power'],
          period: '2022.04 - 2022.10',
          summary: [
            '“Dam Dossier” è una web application per catalogare e gestire tutte le dighe utilizzate da ENEL in Italia. È una delle tante applicazioni all’interno della Enel Platform.',
          ],
          bullets: [
            'Sviluppo di una SPA responsive con Angular 14 e SCSS.',
            'Integrazione e miglioramento dei componenti dell’Enel Design System.',
            'Implementazione di nuovi componenti Angular a partire da mockup Adobe XD.',
            'Conformità all’accessibilità web WCAG 2.1.',
            'Unit testing con Karma e Jasmine.',
            'Lavoro in contesto agile (scrum), con il supporto della suite Atlassian.',
          ],
        },
      ],
    },
    {
      kind: 'mainSection',
      sheet: 2,
      column: 'main',
      heading: 'Formazione',
      groups: [
        {
          // OWNER: the official Italian name of the degree — please confirm.
          // "Bachelor of Information and Automation Engineering" rendered as the
          // most likely Politecnico di Bari wording.
          title: 'Laurea triennale in Ingegneria Informatica e dell’Automazione',
          meta: ['Politecnico di Bari, Bari, Italia'],
          period: '2014.08 - 2018.10',
          // Body prose, not `meta` — `meta` is plain text, so the markers would print (ADR-0005).
          summary: [
            'Voto: **110/110** | Livello EQF: **6**',
            // Thesis title is already Italian in the source — left verbatim.
            'Tesi sperimentale: **Analisi e Miglioramento delle Prestazioni di Processi Produttivi Industriali mediante Reti di Petri, il caso Dream Project**.',
          ],
        },
        {
          // OWNER: "Diploma di Maturità Scientifica" assumes the Liceo
          // Scientifico track; "Diploma di scuola secondaria superiore" is the
          // neutral form.
          title: 'Diploma di Maturità Scientifica',
          meta: ['Liceo Scientifico Amaldi, Bitetto, Italia'],
          period: '2009.09 - 2014.07',
          summary: ['Voto: **100/100** | Livello EQF: **4**'],
        },
      ],
    },
  ],
};

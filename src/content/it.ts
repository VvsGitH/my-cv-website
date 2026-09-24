import type { CvContent } from './types';

export const it: CvContent = {
  locale: 'it',
  blocks: [
    // ── Sheet 1 · Aside ──────────────────────────────────────────────────
    {
      kind: 'photo',
      paperSheet: 1,
      paperColumn: 'aside',
      readOrder: 1,
      alt: 'Vito Paparella Santorsola',
    },
    {
      kind: 'about',
      paperSheet: 1,
      paperColumn: 'aside',
      readOrder: 3,
      heading: 'Chi sono',
      paragraphs: [
        'Senior software developer con **5+ anni** di esperienza, specializzato nel **frontend React e TypeScript** su applicazioni di larga scala: dagli strumenti enterprise per A2A, Leonardo, ENI ed Enel alle piattaforme news di **Corriere della Sera** e **Gazzetta dello Sport** (fino a **40k utenti concorrenti**). Ho guidato piccoli team, seguito l’onboarding di nuovi sviluppatori e lavorato a stretto contatto con product manager, designer e stakeholder non tecnici. Sono il referente per le **performance** frontend di Corriere e Gazzetta, e porto **TypeScript, test e accessibilità** anche nelle codebase legacy. Cerco posizioni da remoto; valuto anche ruoli ibridi in Italia, senza cambio di residenza.',
      ],
    },
    {
      kind: 'skills',
      paperSheet: 1,
      paperColumn: 'aside',
      readOrder: 8,
      heading: 'Tecnologie',
      groups: [
        {
          name: 'Linguaggi',
          display: 'inline',
          items: [
            '**JavaScript**',
            '**TypeScript**',
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
            '**React & Next.js**',
            '**Angular & RxJS**',
            'React Native',
            'jQuery',
            'State management: Redux, NgRx, Zustand',
            'Librerie UI: Material UI, Angular Material, Tailwind CSS, Bootstrap 4/5',
            'Testing: Jest, Jasmine + Karma, RTL, Playwright',
            'Strumenti: Vite, webpack, Gulp',
          ],
        },
        {
          name: 'Sviluppo backend',
          display: 'list',
          items: ['Node.js / Express', 'MongoDB', 'Nginx', 'REST & GraphQL', 'Java Spring (basi)'],
        },
        {
          name: 'Strumenti di sviluppo',
          display: 'inline',
          items: [
            'Git',
            'SVN',
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
      paperSheet: 1,
      paperColumn: 'main',
      readOrder: 2,
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
        { label: 'GitHub', value: 'VvsGitH', url: 'https://github.com/VvsGitH' },
      ],
    },
    {
      kind: 'mainSection',
      paperSheet: 1,
      paperColumn: 'main',
      readOrder: 4,
      heading: 'Esperienza',
      groups: [
        {
          title: 'Senior Software Developer',
          meta: ['RCS Innovation S.r.l.'],
          period: '05/2024 - oggi',
          bullets: [
            'Sviluppo e mantengo le piattaforme news di punta di RCS: **Corriere della Sera** (**425 mln** di pagine viste al mese, **5,1 mln** di utenti unici al giorno, fino a **40k utenti concorrenti**) e **Gazzetta dello Sport** (**128 mln** di pagine viste al mese, **1,6 mln** di utenti unici al giorno).',
            'Guido lo sviluppo frontend della nuova homepage e del restyling di Gazzetta come **lead frontend developer**: nei test di laboratorio la homepage rientra nelle soglie “Good” dei **Core Web Vitals** (LCP 0,22 s, CLS 0, INP 100 ms).',
            'Seguo le **performance** frontend di Corriere e Gazzetta come referente: ho integrato **SpeedCurve** per il monitoraggio e intervengo sulla diagnosi dei problemi di performance.',
            'Coordino la manutenzione del **video-manager** come **subject matter expert**: è il player di tutte le pagine di Corriere, Gazzetta e dei verticali (es. IoDonna) e la base di video.corriere.it e video.gazzetta.it. Ho contribuito ai nuovi **video verticali**.',
            'Sviluppo su un’**architettura micro-frontend ibrida basata sull’islands pattern**, con componenti in **vanilla JS/TS e React**, bilanciando integrazione del legacy e sviluppo moderno.',
            'Guido la **modernizzazione del legacy**: il **20% dei core component** è passato a **JSDoc con unit test Jest**, i nuovi nascono con JSDoc e test di default e due nuovi progetti critici sono nati in **TypeScript, React e Vite**. Ho scritto le linee guida di testing del team, incluse quelle per il **coding assistito da AI**.',
            'Ho seguito l’**onboarding** di 2 dei 6 membri del team e sono il **referente frontend** della sede di Bari.',
          ],
        },
        {
          title: 'Software Developer',
          meta: ['CyberSecurity S.r.l.'],
          period: '04/2021 - 05/2024',
          bullets: [
            'Entrato come **trainee** (Clean Code, SOLID, programmazione OO, design pattern) e promosso developer dopo 3 mesi.',
            'Sviluppati come consulente progetti **full-stack** di media e larga scala per clienti come **A2A**, **Leonardo**, **ENI** ed **Enel** (utility, energia, finanza, pubblica amministrazione, piattaforme AI).',
            'Guidati come **technical leader** team fino a 4 sviluppatori: scelte architetturali, code review, stime e supporto tecnico.',
            'Formati i nuovi ingressi su JavaScript, TypeScript e React, con **onboarding strutturato** e pair programming.',
            'Condotti **colloqui tecnici** per candidati frontend, con contributo alle decisioni di assunzione.',
          ],
        },
      ],
    },
    {
      kind: 'mainSection',
      paperSheet: 1,
      paperColumn: 'main',
      readOrder: 5,
      heading: 'Progetti selezionati',
      groups: [
        {
          title: 'B2B Environment',
          meta: ['Senior Frontend Developer & Team Leader', 'CyberSecurity S.r.l. ~ A2A S.p.a'],
          period: '03/2024 - 05/2024',
          stack: [
            'Next.js - App Router',
            'React',
            'i18n',
            'TypeScript',
            'Tailwind CSS',
            'WCAG 2.1',
            'React Testing Library',
          ],
        },
        {
          title: 'Registro Ufficiale degli Operatori Professionali',
          meta: [
            'Senior Frontend Developer & Team Leader',
            'CyberSecurity S.r.l. ~ Leonardo S.p.a.',
          ],
          period: '07/2023 - 02/2024',
        },
      ],
    },

    // ── Sheet 2 · Aside ──────────────────────────────────────────────────
    {
      kind: 'bullets',
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 9,
      heading: 'Come lavoro',
      items: [
        '**Performance first**: Core Web Vitals come requisito, monitorati con SpeedCurve.',
        '**Accessibilità**: WCAG 2.1, con certificazione W3C.',
        '**Codice testato**: unit test con Jest, e2e con Playwright.',
        '**Code review e mentoring** nel lavoro di ogni giorno.',
        '**Modernizzazione incrementale** del legacy, senza riscritture da zero.',
        '**Sviluppo assistito da AI**: Claude Code e Copilot, con linee guida condivise nel team.',
        '**Agile/Scrum** con product, design e stakeholder non tecnici.',
      ],
    },
    {
      kind: 'languages',
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 12,
      heading: 'Lingue',
      entries: [
        { name: 'Italiano', level: 'Madrelingua', proficiency: 1 },
        { name: 'Inglese', level: 'B2 certificato, C1 d’uso', proficiency: 0.7 },
      ],
    },
    {
      kind: 'certifications',
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 11,
      heading: 'Certificazioni',
      entries: [
        {
          date: '12/2022',
          issuer: 'W3C (via edX)',
          title: 'Introduction to Web Accessibility',
          url: 'https://www.edx.org/learn/web-accessibility/the-world-wide-web-consortium-w3c-introduction-to-web-accessibility',
        },
        {
          date: '06/2013',
          issuer: 'University of Cambridge',
          title: 'Cambridge ESOL Level 1 Certificate in ESOL International | CoE Level B2',
        },
      ],
    },
    {
      kind: 'bullets',
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 13,
      heading: 'Altre info',
      items: [
        'Patente di guida: B.',
        'Automunito.',
        'Preferenza per il lavoro da remoto; disponibile per posizioni ibride in Italia, senza cambio di residenza.',
      ],
    },
    {
      kind: 'privacy',
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 14,
      heading: 'Privacy',
      statement:
        'Autorizzo il trattamento dei miei dati personali presenti nel curriculum vitae ai sensi del D.Lgs. 196/2003, come modificato dal D.Lgs. 101/2018, e dell’art. 13 del Regolamento (UE) 2016/679 (GDPR), ai fini della ricerca e selezione del personale.',
      place: 'Bari',
      signature: 'Vito Paparella Santorsola',
    },

    // ── Sheet 2 · Main ───────────────────────────────────────────────────
    {
      kind: 'mainSection',
      paperSheet: 2,
      paperColumn: 'main',
      readOrder: 6,
      heading: 'Progetti selezionati (continua)',
      continues: true,
      groups: [
        {
          continues: true,
          title: 'Registro Ufficiale degli Operatori Professionali (continua)',
          summary: [
            '“Registro Ufficiale degli Operatori Professionali”, o RUOP, è una delle applicazioni all’interno del portale MASAF del Ministero dell’Agricoltura. Le imprese devono iscriversi al registro RUOP per svolgere attività di import/export di piante.',
          ],
          bullets: [
            'Guidato un team frontend di **4 sviluppatori**.',
            'Definita l’**architettura React** dell’applicazione.',
            'Tradotti i requisiti del cliente in requisiti tecnici; stimate e assegnate le attività.',
            'Sviluppata una SPA responsive in React con **4 tipologie di utenti**, autenticazione **OAuth2.0** e routing.',
          ],
          stack: ['React', 'TanStack Query', 'Zustand', 'Tailwind CSS', 'WCAG 2.1', 'OAuth2.0'],
        },
        {
          title: 'Beyond Knowledge',
          meta: ['Senior Frontend Developer', 'CyberSecurity S.r.l. ~ Beyond Knowledge'],
          period: '01/2023 - 06/2023',
          summary: [
            '“Beyond Knowledge” è una piattaforma in sviluppo, su modello ad abbonamento, per servizi di AI. Offre soluzioni per Industry4.0, Network Monitoring e Financial Planning.',
          ],
          bullets: [
            'Sviluppata una SPA responsive in React con **TanStack Query** e **TanStack Table**.',
            'Creato un **design system** in Tailwind CSS a partire dai mockup Figma.',
          ],
          stack: [
            'React',
            'TanStack Query',
            'TanStack Table',
            'React Testing Library',
            'TypeScript',
            'Tailwind CSS',
          ],
        },
        {
          title: 'VEDO Tool & ABC Monitoring',
          meta: ['Frontend Developer', 'CyberSecurity S.r.l. ~ ENI Italia'],
          period: '10/2022 - 12/2022',
          stack: [
            'Power Apps',
            'SharePoint',
            'TypeScript',
            'jQuery',
            'Bootstrap 4',
            'OData',
            'Dataverse',
          ],
        },
        {
          title: 'Dam Dossier',
          meta: ['Frontend Developer', 'CyberSecurity S.r.l. ~ Enel Green Power'],
          period: '04/2022 - 10/2022',
          stack: [
            'Angular 14',
            'SCSS',
            'Enel Design System',
            'TypeScript',
            'WCAG 2.1',
            'Jasmine/Karma',
          ],
        },
      ],
    },
    {
      kind: 'mainSection',
      paperSheet: 2,
      paperColumn: 'main',
      readOrder: 7,
      heading: 'Progetti personali',
      groups: [
        {
          title: 'CV Management & Display',
          url: 'https://github.com/VvsGitH/my-cv-website',
          stack: ['Astro', 'Preact', 'TypeScript', 'Playwright', 'CSS moderno', 'WCAG 2.2'],
        },
        {
          title: 'Expense Dashboard',
          url: 'https://github.com/VvsGitH/expense-dashboard',
          stack: ['Python', 'Streamlit', 'SQLite', 'pytest'],
        },
      ],
    },
    {
      kind: 'mainSection',
      paperSheet: 2,
      paperColumn: 'main',
      readOrder: 10,
      heading: 'Formazione',
      groups: [
        {
          title: 'Laurea triennale in Ingegneria Informatica e dell’Automazione',
          meta: ['Politecnico di Bari, Bari, Italia'],
          period: '08/2014 - 10/2018',
          summary: [
            'Voto: **110/110** | Livello EQF: **6**',
            'Tesi sperimentale: **Analisi e Miglioramento delle Prestazioni di Processi Produttivi Industriali mediante Reti di Petri, il caso Dream Project**.',
          ],
        },
        {
          title: 'Diploma di Maturità Scientifica',
          meta: ['Liceo Scientifico Amaldi, Bitetto, Italia'],
          period: '09/2009 - 07/2014',
          summary: ['Voto: **100/100** | Livello EQF: **4**'],
        },
      ],
    },
  ],
};

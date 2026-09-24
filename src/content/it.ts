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
        'Senior software developer con 5 anni di esperienza tra società di consulenza e aziende di prodotto, su applicazioni di larga scala (da strumenti enterprise interni a piattaforme news ad alto traffico con oltre 40k utenti concorrenti). Ho guidato piccoli team, seguito la crescita di sviluppatori junior e collaborato a stretto contatto con product manager, designer e stakeholder non tecnici per tradurre le esigenze di business in soluzioni tecniche pragmatiche. Tengo a un codice manutenibile e ben testato, e sono sinceramente curioso del perché di ciò che costruisco.',
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
            'jQuery',
            'State management: Redux, NgRx, Zustand e altri...',
            'Librerie UI: Material UI, Angular Material, Tailwind CSS, Bootstrap 4/5 e altre...',
            'Testing: Jest, Jasmine + Karma, RTL',
            'Strumenti: Vite, webpack, Gulp',
          ],
        },
        {
          name: 'Sviluppo backend',
          display: 'list',
          items: ['Node.js / Express', 'MongoDB', 'Java Spring (basi)', 'Nginx', 'REST & GraphQL'],
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
            'Sviluppo attivo e manutenzione delle piattaforme news di punta di RCS: **Corriere della Sera** (fino a **40k utenti concorrenti**) e **Gazzetta dello Sport**, con forte attenzione a **stabilità**, **performance** ed esperienza utente.',
            '**Subject matter expert** per il componente video-manager, con coordinamento del team di manutenzione e refactoring continui e puntuali.',
            '**Lead frontend developer** per la nuova homepage e il restyling in corso di Gazzetta, coordinando sviluppo e trade-off tra stabilità e performance.',
            'Lavoro su un’**architettura micro-frontend ibrida basata sull’islands pattern**, con componenti scritti sia in **vanilla JS/TS sia in React**, bilanciando integrazione del legacy e sviluppo moderno.',
            'Ho guidato la **modernizzazione incrementale di codebase legacy**: adozione progressiva di **TypeScript e JSDoc** su più repository, introduzione dello **unit testing con Jest** e di linee guida di testing per tutto il team — incluse le best practice per gli **strumenti di coding assistito da AI**.',
          ],
        },
        {
          title: 'Software Developer',
          meta: ['CyberSecurity S.r.l.'],
          period: '07/2021 - 05/2024',
          bullets: [
            '**Sviluppo full-stack** come consulente su progetti di media e larga scala in domini diversi (utility, energia, finanza, piattaforme AI).',
            '**Technical leader** di piccoli team (fino a 4 sviluppatori), con responsabilità su scelte architetturali, revisione delle PR, stima delle attività e supporto tecnico.',
            '**Mentoring e formazione** dei nuovi ingressi su JavaScript, TypeScript e React, con onboarding strutturato e sessioni di pairing.',
            'Colloqui tecnici per candidati frontend, con contributo alle decisioni di assunzione.',
          ],
        },
        {
          title: 'Trainee Software Developer',
          meta: ['CyberSecurity S.r.l.'],
          period: '04/2021 - 07/2021',
          summary: [
            'Consolidamento delle competenze di base di programmazione e sviluppo software attraverso **formazione pratica** e lavoro su progetto: **Clean Code**, principi **SOLID**, programmazione **OO** e **design pattern**.',
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
      heading: 'Soft skills',
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
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 12,
      heading: 'Lingue',
      entries: [
        { name: 'Italiano', level: 'Madrelingua', proficiency: 1 },
        { name: 'Inglese', level: 'B2 - C1', proficiency: 0.7 },
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
        'Disponibile al trasferimento, ma attribuisco grande valore al lavoro da remoto.',
      ],
    },
    {
      kind: 'privacy',
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 14,
      heading: 'Privacy',
      statement:
        'Autorizzo il trattamento dei miei dati personali ai sensi del D.lgs. 101/2018 e dell’art. 13 GDPR (Regolamento UE 2016/679) ai fini della ricerca e selezione del personale.',
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
            'Coordinamento del team frontend, composto da me e altri 3 sviluppatori.',
            'Definizione dell’architettura dell’applicazione React.',
            'Traduzione dei requisiti del cliente in requisiti tecnici; stima e assegnazione delle attività.',
            'Sviluppo di una web application single-page e responsive in React, con 4 tipologie di utenti, autenticazione OAuth2.0 e routing.',
            'Gestione del repository GitHub.',
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
            'Sviluppo di una web application single-page e responsive in React, con librerie allo stato dell’arte come @tanstack/react-query e @tanstack/react-table.',
            'Sviluppo di un design system con Tailwind CSS, a partire da mockup Figma.',
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

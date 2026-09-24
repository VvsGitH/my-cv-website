import type { CvContent } from './types';

export const en: CvContent = {
  locale: 'en',
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
      heading: 'About Me',
      paragraphs: [
        'Senior Software Developer with **5+ years** of experience, specialised in **React and TypeScript frontend** for large-scale applications: from enterprise tools for A2A, Leonardo, ENI and Enel to the news platforms of **Corriere della Sera** and **Gazzetta dello Sport** (up to **40k concurrent users**). I’ve led small teams, onboarded new developers and worked closely with product managers, designers and non-technical stakeholders. I’m the frontend **performance** lead for Corriere and Gazzetta, and I bring **TypeScript, tests and accessibility** to legacy codebases too. Looking for remote roles; open to hybrid positions in Italy without relocation.',
      ],
    },
    {
      kind: 'skills',
      paperSheet: 1,
      paperColumn: 'aside',
      readOrder: 8,
      heading: 'Tech Skills',
      groups: [
        {
          name: 'Programming Languages',
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
          name: 'Frontend Development',
          display: 'list',
          items: [
            '**React & Next.js**',
            '**Angular & RxJS**',
            'React Native',
            'jQuery',
            'State management: Redux, NgRx, Zustand',
            'UI libraries: Material UI, Angular Material, Tailwind CSS, Bootstrap 4/5',
            'Testing: Jest, Jasmine + Karma, RTL, Playwright',
            'Tools: Vite, webpack, Gulp',
          ],
        },
        {
          name: 'Backend Development',
          display: 'list',
          items: [
            'Node.js / Express',
            'MongoDB',
            'Nginx',
            'REST & GraphQL',
            'Java Spring (basics)',
          ],
        },
        {
          name: 'Development Tools',
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
        { label: 'Location', value: 'Bari, Italy' },
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
      heading: 'Experience',
      groups: [
        {
          title: 'Senior Software Developer',
          meta: ['RCS Innovation S.r.l.'],
          period: '05/2024 - present',
          bullets: [
            'Build and maintain RCS’s flagship news platforms: **Corriere della Sera** (**425M** page views a month, **5.1M** daily unique users, up to **40k concurrent users**) and **Gazzetta dello Sport** (**128M** page views a month, **1.6M** daily unique users).',
            'Lead frontend development of the new Gazzetta homepage and restyle as **lead frontend developer**: in lab tests the homepage meets every **Core Web Vitals** “Good” threshold (LCP 0.22 s, CLS 0, INP 100 ms).',
            'Own frontend **performance** across Corriere and Gazzetta: integrated **SpeedCurve** for monitoring, and I’m the go-to person when a performance issue needs diagnosing.',
            'Coordinate maintenance of the **video-manager** as **subject matter expert**: the player on every Corriere, Gazzetta and vertical page (e.g. IoDonna), and the foundation of video.corriere.it and video.gazzetta.it. Contributed to the new **vertical videos**.',
            'Build on a **hybrid micro-frontend architecture based on the islands pattern**, with components in **vanilla JS/TS and React**, balancing legacy integration with modern development.',
            'Lead **legacy modernisation**: **20% of the core components** moved to **JSDoc with Jest unit tests**, new components ship with JSDoc and tests by default, and two new critical projects started in **TypeScript, React and Vite**. Wrote the team’s testing guidelines, including those for **AI-assisted coding**.',
            'Onboarded 2 of the team’s 6 members, and serve as the **frontend lead** for the Bari office.',
          ],
        },
        {
          title: 'Software Developer',
          meta: ['CyberSecurity S.r.l.'],
          period: '04/2021 - 05/2024',
          bullets: [
            'Joined as a **trainee** (Clean Code, SOLID, OOP, design patterns) and was promoted to developer after 3 months.',
            'Delivered medium and large-scale **full-stack** projects as a consultant for clients such as **A2A**, **Leonardo**, **ENI** and **Enel** (utilities, energy, finance, public sector, AI platforms).',
            'Led teams of up to 4 developers as **technical leader**: architecture decisions, code reviews, estimates and technical support.',
            'Trained new joiners in JavaScript, TypeScript and React, with **structured onboarding** and pair programming.',
            'Conducted **technical interviews** for frontend candidates, contributing to hiring decisions.',
          ],
        },
      ],
    },
    {
      kind: 'mainSection',
      paperSheet: 1,
      paperColumn: 'main',
      readOrder: 5,
      heading: 'Selected Projects',
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
      heading: 'How I Work',
      items: [
        '**Performance first**: Core Web Vitals as a requirement, monitored with SpeedCurve.',
        '**Accessibility**: WCAG 2.1, W3C certified.',
        '**Tested code**: unit tests with Jest, e2e with Playwright.',
        '**Code review and mentoring** as part of the daily work.',
        '**Incremental modernisation** of legacy code, no big-bang rewrites.',
        '**AI-assisted development**: Claude Code and Copilot, with team-wide guidelines.',
        '**Agile/Scrum** with product, design and non-technical stakeholders.',
      ],
    },
    {
      kind: 'languages',
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 12,
      heading: 'Languages',
      entries: [
        { name: 'Italian', level: 'Native', proficiency: 1 },
        { name: 'English', level: 'B2 certified, C1 in daily use', proficiency: 0.7 },
      ],
    },
    {
      kind: 'certifications',
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 11,
      heading: 'Certifications',
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
      heading: 'Other Info',
      items: [
        'Driving licence: B.',
        'I own a car.',
        'Preference for remote work; open to hybrid roles in Italy, without relocation.',
        'Based in Bari, Italy (CET). EU citizen.',
      ],
    },
    {
      kind: 'privacy',
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 14,
      heading: 'Privacy',
      statement:
        'I authorise the processing of the personal data in this CV pursuant to Legislative Decree 196/2003, as amended by Legislative Decree 101/2018, and art. 13 of Regulation (EU) 2016/679 (GDPR), for the purposes of personnel research and selection.',
      place: 'Bari',
      signature: 'Vito Paparella Santorsola',
    },

    // ── Sheet 2 · Main ───────────────────────────────────────────────────
    {
      kind: 'mainSection',
      paperSheet: 2,
      paperColumn: 'main',
      readOrder: 6,
      heading: 'Selected Projects (continued)',
      continues: true,
      groups: [
        {
          continues: true,
          title: 'Registro Ufficiale degli Operatori Professionali (continued)',
          summary: [
            '“Registro Ufficiale degli Operatori Professionali”, or RUOP, is one of the applications inside the MASAF portal of the Italian Ministry of Agriculture. Businesses have to subscribe to the RUOP registry in order to run activities related to import/export of plants.',
          ],
          bullets: [
            'Led a frontend team of **4 developers**.',
            'Defined the application’s **React architecture**.',
            'Translated the client’s requirements into technical ones; estimated and assigned tasks.',
            'Built a responsive single-page application in React with **4 user types**, **OAuth2.0** authentication and routing.',
          ],
          stack: ['React', 'TanStack Query', 'Zustand', 'Tailwind CSS', 'WCAG 2.1', 'OAuth2.0'],
        },
        {
          title: 'Beyond Knowledge',
          meta: ['Senior Frontend Developer', 'CyberSecurity S.r.l. ~ Beyond Knowledge'],
          period: '01/2023 - 06/2023',
          summary: [
            '“Beyond Knowledge” is an in-development subscription based platform for AI services. It offers solutions for Industry4.0, Network Monitoring and Financial Planning.',
          ],
          bullets: [
            'Built a responsive single-page application in React with **TanStack Query** and **TanStack Table**.',
            'Created a **design system** in Tailwind CSS from Figma mockups.',
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
      heading: 'Personal Projects',
      groups: [
        {
          title: 'CV Management & Display',
          url: 'https://github.com/VvsGitH/my-cv-website',
          stack: ['Astro', 'Preact', 'TypeScript', 'Playwright', 'modern CSS', 'WCAG 2.2'],
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
      heading: 'Education',
      groups: [
        {
          title: 'Bachelor of Information and Automation Engineering',
          meta: ['Polytechnic University of Bari, Bari, Italy'],
          period: '08/2014 - 10/2018',
          summary: [
            'Grade: **110/110** | Bachelor’s degree (EQF **6**)',
            'Experimental thesis: **Analisi e Miglioramento delle Prestazioni di Processi Produttivi Industriali mediante Reti di Petri, il caso Dream Project**.',
          ],
        },
        {
          title: 'High School Diploma',
          meta: ['Liceo Scientifico Amaldi, Bitetto, Italy'],
          period: '09/2009 - 07/2014',
          summary: ['Grade: **100/100** | EQF Level: **4**'],
        },
      ],
    },
  ],
};

import type { CvContent } from './types';

/**
 * English CV content, transcribed from the reference CV in `docs/assets/`.
 * Blocks are listed in reading order — Sheet 1 Aside, Sheet 1 Main, Sheet 2
 * Aside, Sheet 2 Main — and that array order is what the layout renders.
 */
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
        'Senior Software Developer with 5 years of experience across consulting and product companies, working on large-scale applications (from internal enterprise tools to high-traffic news platforms serving 40k+ concurrent users). I’ve led small teams, mentored junior developers, and collaborated closely with product managers, designers and non-technical stakeholders to translate business needs into pragmatic technical solutions. I care about maintainable, well-tested code and I’m genuinely curious about the why behind what I build.',
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
            'jQuery',
            'State management: Redux, NgRx, Zustand, and more...',
            'UI libraries: Material UI, Angular Material, Tailwind CSS, Bootstrap 4/5, and more...',
            'Testing: Jest, Jasmine + Karma, RTL',
            'Tools: Vite, webpack, Gulp',
          ],
        },
        {
          name: 'Backend Development',
          display: 'list',
          items: [
            'Node.js / Express',
            'MongoDB',
            'Java Spring (basics)',
            'Nginx',
            'REST & GraphQL',
          ],
        },
        {
          name: 'Mobile Development',
          display: 'list',
          items: ['React Native (familiar with)'],
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
          period: '05/2024 – present',
          bullets: [
            'Active development and maintenance of RCS’s flagship news platforms: **Corriere della Sera** (serving up to **40k concurrent users**) and **Gazzetta dello Sport**, with a strong focus on **stability**, **performance** and user experience.',
            '**Subject matter expert** for the video-manager component, coordinating the maintenance team and driving precise, continuous refactors.',
            '**Lead frontend developer** for the new Gazzetta homepage and the ongoing Gazzetta restyle, coordinating development and owning stability and performance trade-offs.',
            'Working on a **hybrid micro-frontend architecture based on the islands pattern**, with components written in both **vanilla JS/TS and React**, balancing legacy integration with modern development.',
            'Drove **incremental modernization of legacy codebases**: progressive adoption of **TypeScript and JSDoc** across multiple repositories, introduction of **Jest unit testing** and team-wide testing guidelines — including best practices for **AI-assisted coding tools**.',
          ],
        },
        {
          title: 'Software Developer',
          meta: ['CyberSecurity S.r.l.'],
          period: '07/2021 – 05/2024',
          bullets: [
            '**Full-stack development** as a consultant for both medium and large scale projects across multiple domains (utilities, energy, finance, AI platforms).',
            '**Technical leader** of small teams (up to 4 developers), responsible for architecture decisions, PR reviews, task estimation and technical support.',
            '**Mentored and trained** new joiners in JavaScript, TypeScript and React, with structured onboarding and pairing sessions.',
            'Technical interviewer for frontend candidates, contributing to hiring decisions.',
          ],
        },
        {
          title: 'Trainee Software Developer',
          meta: ['CyberSecurity S.r.l.'],
          period: '04/2021 – 07/2021',
          summary: [
            'Reinforced core programming and software development skills through **hands-on training** and project work: **Clean Code**, **SOLID** principles, **OO** programming and **design patterns**.',
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
          period: '03/2024 – 05/2024',
          summary: [
            '“B2B Environment” is a small web application, structured like a wizard, that will be used by the clients of A2A to order and customize garbage collecting services.',
          ],
          bullets: [
            'Initial setup and configuration of the Next.js application, with app-router, state-management, i18n and standalone deploy. Definition of folder structure and code patterns.',
            'Team coordination, PR review and technical support over more complex tasks.',
            'Technical documentation and testing.',
          ],
          stack: ['Next.js', 'React', 'i18n'],
        },
      ],
    },

    // ── Sheet 2 · Aside ──────────────────────────────────────────────────
    {
      kind: 'bullets',
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 9,
      heading: 'Soft Skills',
      items: [
        'Creativity',
        'Growth mindset',
        'Leadership',
        'Problem solving',
        'Teamwork & communication',
        'Time & work management',
        'Tutoring',
        'Work under pressure',
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
        { name: 'English', level: 'B2 - C1', proficiency: 0.7 },
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
          issuer: 'W3Cx',
          title: 'WAI0.1x: Introduction to Web Accessibility',
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
        'I’m open to relocate but I highly value remote work.',
      ],
    },
    {
      kind: 'privacy',
      paperSheet: 2,
      paperColumn: 'aside',
      readOrder: 14,
      heading: 'Privacy',
      statement:
        'I authorize the processing of my personal data pursuant to Legislative Decree 2018/101 and art. 13 GDPR (EU Regulation 2016/679) for the purposes of personnel research and selection.',
      place: 'Bari',
      signature: 'Vito Paparella Santorsola',
    },

    // ── Sheet 2 · Main ───────────────────────────────────────────────────
    {
      kind: 'mainSection',
      paperSheet: 2,
      paperColumn: 'main',
      readOrder: 6,
      // A Continuation (ADR-0005) — see the note in `it.ts`.
      heading: 'Selected Projects (continued)',
      continues: true,
      groups: [
        {
          title: 'Registro Ufficiale degli Operatori Professionali',
          meta: [
            'Senior Frontend Developer & Team Leader',
            'CyberSecurity S.r.l. ~ Leonardo S.p.a.',
          ],
          period: '07/2023 – 02/2024',
          summary: [
            '“Registro Ufficiale degli Operatori Professionali”, or RUOP, is one of the applications inside the MASAF portal of the Italian minister of agriculture. Businesses have to subscribe to the RUOP registry in order to run activities related to import/export of plants.',
          ],
          bullets: [
            'Coordination of the fronted team, composed by me and other 3 developers.',
            'Definition of the architecture of the React application.',
            'Translation of the client’s requirements into technical requirements; estimation and task assignment.',
            'Development of a single-page, responsive, web application in React, with 4 different types of users, OAuth2.0 authentication and routing.',
            'Management of the GitHub repository.',
          ],
          stack: ['React', 'OAuth2.0', 'GitHub'],
        },
        {
          title: 'Beyond Knowledge',
          meta: ['Senior Frontend Developer', 'CyberSecurity S.r.l. ~ Beyond Knowledge'],
          period: '01/2023 – 06/2023',
          stack: ['React', 'TanStack Query', 'TanStack Table', 'Tailwind CSS', 'Figma'],
        },
        {
          title: 'VEDO Tool & ABC Monitoring',
          meta: ['Frontend Developer', 'CyberSecurity S.r.l. ~ ENI Italia'],
          period: '10/2022 – 12/2022',
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
          period: '04/2022 – 10/2022',
          stack: ['Angular 14', 'SCSS', 'Enel Design System', 'WCAG 2.1', 'Jasmine/Karma'],
        },
      ],
    },
    {
      kind: 'mainSection',
      paperSheet: 2,
      paperColumn: 'main',
      readOrder: 7,
      heading: 'Personal Projects',
      // Names in English, as in `it.ts` (spec §4.4).
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
          period: '08/2014 – 10/2018',
          summary: [
            'Grade: **110/110** | EQF Level: **6**',
            'Experimental thesis: **Analisi e Miglioramento delle Prestazioni di Processi Produttivi Industriali mediante Reti di Petri, il caso Dream Project**.',
          ],
        },
        {
          title: 'High School Diploma',
          meta: ['Liceo Scientifico Amaldi, Bitetto, Italy'],
          period: '09/2009 – 07/2014',
          summary: ['Grade: **100/100** | EQF Level: **4**'],
        },
      ],
    },
  ],
};

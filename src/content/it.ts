import type { CvContent } from './types';

/**
 * Italian CV content — SCAFFOLD (ticket 11 fills it in).
 *
 * The source CV is English, so the Italian text is net-new. What is settled
 * here: the Block structure, the Explicit Paging tags, and every field that
 * doesn't change across Locales (names, dates, periods, URLs, product
 * names, proficiency). Section headings, group names and contact labels are
 * translated because they anchor the structure and are unambiguous — as is
 * the one period carrying a word rather than digits ("now" → "oggi").
 *
 * **Every field holding translatable prose is deliberately `''`.** An empty
 * string renders as visibly missing, which is what an untranslated CV
 * should look like — a copy of the English text would ship silently.
 *
 * Ticket 11 must also re-check the `sheet`/`column` tags below: Italian
 * runs ~10–15% longer than English, so Blocks may need rebalancing across
 * the two Sheets (ADR-0002).
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
      paragraphs: [''],
    },
    {
      // Items are product names, kept as-is; ticket 11 translates the few
      // descriptive prefixes ("State management:", "and more...", ...).
      kind: 'skills',
      sheet: 1,
      column: 'aside',
      heading: 'Competenze tecniche',
      groups: [
        {
          name: 'Linguaggi di programmazione',
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
            'State management: Redux, NgRx, Zustand, and more...',
            'UI libraries: Material UI, Angular Material, Tailwind css, Bootstrap 4/5, and more...',
            'Testing: Jest, Jasmine + Karma, RTL',
            'Tools: Vite.js, Webpack, Gulp',
          ],
        },
        {
          name: 'Sviluppo backend',
          display: 'list',
          items: [
            'Node.js / Express.js',
            'MongoDB',
            'Java Spring (basics)',
            'Nginx',
            'REST & GraphQL',
          ],
        },
        {
          name: 'Sviluppo mobile',
          display: 'list',
          items: ['React Native (familiar with)'],
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
      title: '',
      contacts: [
        { label: 'Località', value: '' },
        { label: 'Telefono', value: '+39 346 403 9932' },
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
      kind: 'experience',
      sheet: 1,
      column: 'main',
      heading: 'Esperienza',
      role: '',
      company: 'RCS Innovation S.r.l.',
      // The one period that isn't just digits — "now" is prose.
      period: '2024.05 - oggi',
      bullets: ['', '', '', '', ''],
    },
    {
      kind: 'experience',
      sheet: 1,
      column: 'main',
      role: '',
      company: 'CyberSecurity S.r.l.',
      period: '2021.07 - 2024.05',
      bullets: ['', '', '', ''],
    },
    {
      kind: 'experience',
      sheet: 1,
      column: 'main',
      role: '',
      company: 'CyberSecurity S.r.l.',
      period: '2021.04 - 2021.07',
      summary: '',
    },
    {
      kind: 'project',
      sheet: 1,
      column: 'main',
      heading: 'Progetti selezionati',
      name: 'B2B Environment',
      role: '',
      client: 'CyberSecurity S.r.l. ~ A2A S.p.a',
      period: '2024.03 - 2024.05',
      summary: '',
      bullets: ['', '', ''],
    },

    // ── Sheet 2 · Aside ──────────────────────────────────────────────────
    {
      kind: 'bullets',
      sheet: 2,
      column: 'aside',
      heading: 'Soft skills',
      items: ['', '', '', '', '', '', '', ''],
    },
    {
      kind: 'languages',
      sheet: 2,
      column: 'aside',
      heading: 'Lingue',
      entries: [
        { name: 'Italiano', level: '', proficiency: 1 },
        { name: 'Inglese', level: 'B2 - C1', proficiency: 0.7 },
      ],
    },
    {
      kind: 'certifications',
      sheet: 2,
      column: 'aside',
      heading: 'Certificazioni',
      entries: [
        {
          date: '2022.12.20',
          issuer: 'WC3x.org',
          title: '',
          url: 'https://www.edx.org/learn/web-accessibility/the-world-wide-web-consortium-w3c-introduction-to-web-accessibility',
        },
        {
          date: '2013.06.27',
          issuer: 'University of Cambridge',
          title: '',
        },
      ],
    },
    {
      kind: 'bullets',
      sheet: 2,
      column: 'aside',
      heading: 'Altre informazioni',
      items: ['', '', ''],
    },
    {
      kind: 'privacy',
      sheet: 2,
      column: 'aside',
      heading: 'Privacy',
      statement: '',
      place: 'Bari',
      date: '2026.04.19',
      signature: 'Vito Paparella Santorsola',
    },

    // ── Sheet 2 · Main ───────────────────────────────────────────────────
    // Progetti selezionati continues here; the heading stays on Sheet 1.
    {
      kind: 'project',
      sheet: 2,
      column: 'main',
      name: 'Registro Ufficiale degli Operatori Professionali',
      role: '',
      client: 'CyberSecurity S.r.l. ~ Leonardo S.p.a.',
      period: '2023.07 - 2024.02',
      summary: '',
      bullets: ['', '', '', '', ''],
    },
    {
      kind: 'project',
      sheet: 2,
      column: 'main',
      name: 'Beyond Knowledge',
      role: '',
      client: 'CyberSecurity S.r.l. ~ Beyond Knowledge',
      period: '2023.01 - 2023.06',
      summary: '',
      bullets: ['', '', ''],
    },
    {
      kind: 'project',
      sheet: 2,
      column: 'main',
      name: 'VEDO Tool & ABC Monitoring',
      role: '',
      client: 'CyberSecurity S.r.l. ~ ENI Italia',
      period: '2022.10 - 2022.12',
      summary: '',
      bullets: ['', ''],
    },
    {
      kind: 'project',
      sheet: 2,
      column: 'main',
      name: 'Dam Dossier',
      role: '',
      client: 'CyberSecurity S.r.l. ~ Enel Green Power',
      period: '2022.04 - 2022.10',
      summary: '',
      bullets: ['', '', '', '', '', ''],
    },
    {
      kind: 'education',
      sheet: 2,
      column: 'main',
      heading: 'Formazione',
      qualification: '',
      institution: '',
      period: '2014.08 - 2018.10',
      details: ['', ''],
    },
    {
      kind: 'education',
      sheet: 2,
      column: 'main',
      qualification: '',
      institution: '',
      period: '2009.09 - 2014.07',
      details: [''],
    },
  ],
};

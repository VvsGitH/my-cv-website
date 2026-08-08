/** The CV content schema. `tsc` is the validator (ADR-0002); layout reads these, never defines them. */

export type Locale = 'it' | 'en';

/** The CV is exactly two Sheets. */
export type SheetNumber = 1 | 2;

/** The two columns of a Sheet. */
export type Column = 'aside' | 'main';

/** Explicit Paging (ADR-0002): where a Block sits. */
export interface Placement {
  sheet: SheetNumber;
  column: Column;
}

/** `heading` is required on every one, deliberately (ADR-0005). */
interface SectionBlock extends Placement {
  heading: string;
}

/** Prose, in which `**…**` marks a bold run (ADR-0002). */
export type RichText = string;

/** Circular profile photo. The image file itself is a layout concern. */
export interface PhotoBlock extends Placement {
  kind: 'photo';
  alt: string;
}

export interface Contact {
  label: string;
  value: string;
  /** Set when the value should link out (email, LinkedIn). */
  url?: string;
}

export interface HeaderBlock extends Placement {
  kind: 'header';
  name: string;
  title: string;
  contacts: Contact[];
}

export interface AboutBlock extends SectionBlock {
  kind: 'about';
  paragraphs: RichText[];
}

export interface SkillGroup {
  name: string;
  /** How the reference sets this group — content, not presentation (ADR-0002). */
  display: 'inline' | 'list';
  items: RichText[];
}

export interface SkillsBlock extends SectionBlock {
  kind: 'skills';
  groups: SkillGroup[];
}

/** One Group (CONTEXT.md). The union is what makes a mis-split a type error (ADR-0005). */
export type MainSectionGroup =
  | {
      continues?: false;
      title: string;
      /** Organisations only: `[company]`, `[role, client]`, `[institution]`. */
      meta: string[];
      period: string;
      summary?: RichText[];
      bullets?: RichText[];
    }
  | {
      continues: true;
      title: string;
      summary?: RichText[];
      bullets?: RichText[];
    };

/** A Main section, or as much of one as fits a Sheet; the rest is a Continuation (ADR-0005). */
export interface MainSectionBlock extends SectionBlock {
  kind: 'mainSection';
  continues?: true;
  groups: MainSectionGroup[];
}

/** A plain bulleted section — Soft Skills, Other Info. */
export interface BulletsBlock extends SectionBlock {
  kind: 'bullets';
  items: RichText[];
}

export interface LanguageEntry {
  name: string;
  /** CEFR label shown beside the bar, e.g. "Native", "B2 - C1". */
  level: string;
  /** Bar fill, 0–1. */
  proficiency: number;
}

export interface LanguagesBlock extends SectionBlock {
  kind: 'languages';
  entries: LanguageEntry[];
}

export interface CertificationEntry {
  date: string;
  issuer: string;
  title: string;
  /** Set when the certificate is publicly verifiable. */
  url?: string;
}

export interface CertificationsBlock extends SectionBlock {
  kind: 'certifications';
  entries: CertificationEntry[];
}

export interface PrivacyBlock extends SectionBlock {
  kind: 'privacy';
  statement: RichText;
  /** No date lives here — PrivacyBlock.astro dates the statement at build time. */
  place: string;
  /** Set in a script font — never a scan of the real signature (ADR-0012). */
  signature: string;
}

export type Block =
  | PhotoBlock
  | HeaderBlock
  | AboutBlock
  | SkillsBlock
  | MainSectionBlock
  | BulletsBlock
  | LanguagesBlock
  | CertificationsBlock
  | PrivacyBlock;

/** One Locale's CV. Array position is the ordering (ADR-0002). */
export interface CvContent {
  locale: Locale;
  blocks: Block[];
}

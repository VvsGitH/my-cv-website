/**
 * The shared CV content schema (CONTEXT.md: Block, Sheet, Aside, Main,
 * Explicit Paging). Compile-time only — the TypeScript compiler is the
 * validator, so a bad `sheet` or `column` fails `astro check`/`astro build`
 * rather than shipping a broken layout (ADR-0002).
 *
 * Layout components read these types; they never define content.
 */

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

/**
 * A Block that belongs to a titled section. The heading is carried by the
 * Block that *opens* the section and omitted by the rest, which is how a
 * section spanning both Sheets (Selected Projects) prints its title once.
 */
interface SectionBlock extends Placement {
  heading?: string;
}

/**
 * A run of CV prose. Plain text, except that `**…**` marks a bold run: the
 * reference CV bolds phrases mid-sentence, and keeping that inline — rather
 * than as arrays of typed spans — is what keeps these content files
 * editable as prose. Rendered in ticket 05.
 */
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
  /**
   * `inline` for runs of short keywords the reference CV sets as one
   * separated line; `list` for the bulleted, descriptive groups.
   */
  display: 'inline' | 'list';
  items: RichText[];
}

export interface SkillsBlock extends SectionBlock {
  kind: 'skills';
  groups: SkillGroup[];
}

/** One job. `summary` and `bullets` are both optional — short roles use prose. */
export interface ExperienceBlock extends SectionBlock {
  kind: 'experience';
  role: string;
  company: string;
  period: string;
  summary?: RichText;
  bullets?: RichText[];
}

export interface ProjectBlock extends SectionBlock {
  kind: 'project';
  name: string;
  role: string;
  /** Employer and end client, e.g. "CyberSecurity S.r.l. ~ A2A S.p.a". */
  client: string;
  period: string;
  summary: RichText;
  bullets: RichText[];
}

export interface EducationBlock extends SectionBlock {
  kind: 'education';
  qualification: string;
  institution: string;
  period: string;
  details: RichText[];
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
  place: string;
  date: string;
  /** Set in a script font — never a scan of the real signature (spec). */
  signature: string;
}

export type Block =
  | PhotoBlock
  | HeaderBlock
  | AboutBlock
  | SkillsBlock
  | ExperienceBlock
  | ProjectBlock
  | EducationBlock
  | BulletsBlock
  | LanguagesBlock
  | CertificationsBlock
  | PrivacyBlock;

/**
 * One Locale's CV. Blocks are ordered by their position in the array: the
 * layout filters by `sheet`/`column` and renders what survives in place.
 * Array position *is* the ordering — there is no `order` number to keep in
 * sync, and therefore none to duplicate or leave a gap in.
 */
export interface CvContent {
  locale: Locale;
  blocks: Block[];
}

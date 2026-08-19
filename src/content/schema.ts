export type Trimester = 1 | 2 | 3;

// Pregnancy is dated from the first day of the last period, so weeks 1 and 2
// come before conception and there is no week 0. Starting at 1 rather than 4
// means someone who has just found out can still read back over the weeks
// they were pregnant without knowing it.
export const MIN_WEEK = 1;
export const MAX_WEEK = 42;
export const DUE_WEEK = 40;

export interface Source {
  id: string;
  label: string;
  organisation: string;
  tier: 'gov' | 'nhs' | 'college' | 'charity' | 'research';
  url?: string;
  /**
   * When the source itself was last reviewed or published, shown to the
   * reader. Optional and deliberately left empty rather than guessed —
   * a fabricated review date is worse than a missing one.
   */
  reviewed?: string;
  /** Conflicts of interest, funding caveats, "background only" notes. */
  caveat?: string;
}

/** A long-form, citable entry in the Healthy Pregnancy reference section. */
export interface Guide {
  id: string;
  section: GuideSection;
  title: string;
  /** One-line summary used in cards and search results. */
  summary: string;
  /** Paragraphs of plain-language body copy. */
  body: string[];
  sourceIds: string[];
  /** Renders with red-flag styling and an urgent tone. */
  emphasis?: 'calm' | 'warn';
  table?: {
    head: string[];
    rows: string[][];
  };
}

export type GuideSection =
  // During pregnancy
  | 'nutrition'
  | 'supplements'
  | 'food-safety'
  | 'exercise'
  | 'sleep'
  | 'wellbeing'
  | 'weight'
  | 'medications'
  | 'alcohol-smoking'
  | 'travel'
  | 'infections'
  | 'vaccinations'
  | 'everyday-safety'
  | 'skincare'
  | 'health-conditions'
  | 'work-rights'
  // Birth
  | 'birth-place'
  | 'labour'
  | 'pain-relief'
  | 'birth-prep'
  // After birth
  | 'first-days'
  | 'recovery'
  | 'postnatal-mind'
  | 'postnatal-support'
  // Feeding
  | 'feeding-basics'
  | 'breastfeeding'
  | 'bottle-feeding';

/**
 * Guidance now spans well past pregnancy itself, so sections are grouped by
 * life phase — this drives both the browse hierarchy and what gets surfaced
 * on the home screen as someone approaches their due date.
 */
export type GuidePhase = 'pregnancy' | 'birth' | 'after' | 'feeding';

export interface BabyWeek {
  week: number;
  /** Fruit/veg size comparison, phrased to follow "roughly the size of…". */
  size: string;
  /**
   * Replaces the "roughly the size of…" heading entirely. Used for the weeks
   * before conception, where there is no embryo to compare to anything.
   */
  sizeLabel?: string;
  development: string;
}

export interface Milestone {
  week: number;
  title: string;
  /** Shown as a celebration when the user reaches this week. */
  celebration?: string;
}

export interface Myth {
  id: string;
  claim: string;
  verdict: 'myth' | 'true';
  explanation: string;
  sourceIds: string[];
}

export interface Appointment {
  week: number;
  title: string;
  detail: string;
  /** Only offered in first pregnancies. */
  firstPregnancyOnly?: boolean;
}

export interface Symptom {
  id: string;
  icon: string;
  name: string;
  /** Plain-language explanation of the physiological driver. */
  why: string;
  help: string;
  /** When this symptom stops being routine and needs checking. */
  flag: string;
  sourceIds: string[];
}

export interface RedFlag {
  id: string;
  title: string;
  detail: string;
  level: 'maternity-unit' | 'emergency';
}

export interface FocusItem {
  /** Stable per-week key so ticked items persist correctly. */
  id: string;
  text: string;
  sourceIds: string[];
}

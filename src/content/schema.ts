export type Trimester = 1 | 2 | 3;

export const MIN_WEEK = 4;
export const MAX_WEEK = 42;
export const DUE_WEEK = 40;

export interface Source {
  id: string;
  label: string;
  organisation: string;
  tier: 'gov' | 'nhs' | 'college' | 'charity' | 'research';
  url?: string;
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

export interface Badge {
  id: string;
  title: string;
  description: string;
}

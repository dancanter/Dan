import type { ISODate } from '@/lib/dates';
import type { WeightUnit } from '@/lib/units';

// Every logged record can carry `demo: true`. Demonstration data is made up,
// labelled on every screen while present, and removed in one action without
// touching anything Dan logged himself.
interface Base {
  id: string;
  demo?: boolean;
}

// ─── Profile & goals ────────────────────────────────────────────────────────

export interface Profile {
  name: string;
  dob: ISODate | null;
  sex: 'male' | 'female';
  heightCm: number | null;
  weightUnit: WeightUnit;
  distanceUnit: 'km' | 'mi';
  startWeightKg: number | null;
  targetWeightKg: [number, number] | null;
  /** Dan's own estimate, used only when no measured body-fat figure exists. */
  estimatedBodyFatPct: number | null;
  location: { name: string; lat: number; lon: number } | null;
  /** 0 = Sunday … 6 = Saturday. */
  restDay: number;
  sleepTargetHours: [number, number];
  stepsTarget: number;
  diet: {
    coeliac: boolean;
    /** Food ids from the database. */
    tolerated: string[];
    problematic: string[];
    notes: string;
  };
  university: string;
  degree: string;
  careerAim: string;
}

export type RunEvent = '200m' | '400m' | '600m' | '800m' | '1k' | 'mile' | '3k' | '5k' | '10k';

export interface Performance extends Base {
  event: RunEvent;
  timeSec: number;
  date: ISODate | null;
  /** How the time was obtained — this changes how much weight it carries. */
  kind: 'race' | 'time-trial' | 'gps-best-effort' | 'reported-pb';
  notes?: string;
}

export interface RunGoal {
  event: RunEvent;
  targetSec: number;
  label?: string;
}

// ─── Daily check-in ────────────────────────────────────────────────────────

export type LegFeel = 'fresh' | 'normal' | 'heavy' | 'sore';
export type DayFlag =
  | 'exhausted'
  | 'brilliant'
  | 'heavy-legs'
  | 'short-time'
  | 'deadline'
  | 'sunshine'
  | 'social'
  | 'travel';
export type Illness = 'none' | 'above-neck' | 'below-neck' | 'fever';
export type Habit = 'no-phone' | 'meditation' | 'skin-am' | 'skin-pm' | 'teeth';

export interface CheckIn {
  date: ISODate;
  demo?: boolean;
  sleepHours?: number;
  sleepQuality?: number; // 1–5
  bedTime?: string; // 'HH:MM'
  wakeTime?: string;
  energy?: number; // 1–5
  soreness?: number; // 1–5, 5 = very sore
  legs?: LegFeel;
  stress?: number; // 1–5, 5 = very stressed
  motivation?: number; // 1–5
  restingHr?: number;
  hrv?: number;
  steps?: number;
  meditationMin?: number;
  /** A day's total when food isn't logged item by item. */
  kcalEaten?: number;
  habits?: Habit[];
  illness?: Illness;
  /** Something hurts: where and what, in Dan's words. */
  niggle?: string;
  flags: DayFlag[];
  timeAvailableMin?: number | null;
  notes?: string;
}

// ─── Running ───────────────────────────────────────────────────────────────

export type RunType =
  | 'easy'
  | 'long'
  | 'recovery'
  | 'threshold'
  | 'vo2'
  | 'race-pace'
  | 'speed'
  | 'hills'
  | 'tempo'
  | 'race'
  | 'time-trial';

export interface RunRep {
  distanceM: number;
  timeSec: number;
}

export interface RunLog extends Base {
  date: ISODate;
  type: RunType;
  title?: string;
  distanceKm: number;
  durationSec: number;
  reps?: RunRep[];
  recoverySec?: number;
  rpe?: number; // 1–10
  avgHr?: number;
  legs?: LegFeel;
  /** Template the session was prescribed from, if any. */
  sessionId?: string;
  /** For races and time trials: the event, so the time can update fitness. */
  event?: RunEvent;
  notes?: string;
}

export type RunFocus = 'balanced' | '5k' | 'mile' | 'short';

// ─── Gym ───────────────────────────────────────────────────────────────────

export type SplitId = 'chest-triceps' | 'back-biceps' | 'legs' | 'shoulders-forearms' | 'other';

export interface GymSet {
  reps: number;
  loadKg: number;
  rir?: number;
}

export interface GymExerciseLog {
  exerciseId: string;
  sets: GymSet[];
  notes?: string;
}

export interface GymSession extends Base {
  date: ISODate;
  split: SplitId;
  exercises: GymExerciseLog[];
  durationMin?: number;
  rpe?: number;
  notes?: string;
}

// ─── Body ──────────────────────────────────────────────────────────────────

export interface WeightEntry extends Base {
  date: ISODate;
  kg: number;
  waistCm?: number;
  neckCm?: number;
  bodyFatPct?: number;
  bodyFatMethod?: 'dexa' | 'bia-scale' | 'calipers' | 'navy-tape' | 'visual';
  conditions?: 'morning-fasted' | 'other';
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  date: ISODate;
  angle: 'front' | 'side' | 'back';
  note?: string;
}

export interface EnergyCheck extends Base {
  date: ISODate;
  /** REDs-informed self-report screen — a prompt to talk to a GP, never a diagnosis. */
  answers: Record<string, boolean>;
}

// ─── Nutrition ─────────────────────────────────────────────────────────────

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-run' | 'post-run' | 'pre-sleep';

export interface FoodEntry extends Base {
  date: ISODate;
  meal: MealSlot;
  foodId: string;
  grams: number;
}

export interface CustomFood {
  id: string;
  name: string;
  per100g: { kcal: number; protein: number; carbs: number; fat: number; fibre: number };
  glutenFree: 'yes' | 'check' | 'no';
  notes?: string;
}

// ─── University ────────────────────────────────────────────────────────────

export interface StudyModule {
  code: string;
  title: string;
  credits: number;
  weeklyTargetHours: number;
  colour: string;
  startDate?: ISODate;
  endDate?: ISODate;
}

export type AssessmentStage =
  | 'understand'
  | 'research'
  | 'plan'
  | 'draft'
  | 'critique'
  | 'references'
  | 'proofread'
  | 'submit';

export interface Assessment {
  id: string;
  demo?: boolean;
  moduleCode: string;
  name: string;
  kind: 'TMA' | 'iCMA' | 'EMA' | 'Exam' | 'Other';
  due: ISODate;
  weightPct?: number;
  wordLimit?: number;
  wordsWritten?: number;
  stages: Partial<Record<AssessmentStage, boolean>>;
  score?: number;
  question?: string;
  notes?: string;
}

export type StudyActivity = 'reading' | 'notes' | 'recall' | 'flashcards' | 'assignment' | 'revision' | 'tutorial' | 'daily';

export interface StudySession extends Base {
  date: ISODate;
  moduleCode: string;
  minutes: number;
  activity: StudyActivity;
  topic?: string;
  focus?: number; // 1–5
}

export type TopicStatus = 'not-started' | 'reading' | 'notes' | 'revised' | 'confident';

export interface Topic extends Base {
  moduleCode: string;
  name: string;
  unit?: string;
  status: TopicStatus;
  confidence: number; // 1–5
  lastReviewed?: ISODate;
  nextReview?: ISODate;
  detailedNotes: string;
  handwrittenDone: boolean;
}

export interface Flashcard extends Base {
  moduleCode: string;
  topicId?: string;
  front: string;
  back: string;
  ease: number;
  intervalDays: number;
  due: ISODate;
  reps: number;
  lapses: number;
}

export interface ParagraphDraft {
  id: string;
  moduleCode?: string;
  title: string;
  fields: Record<'point' | 'evidence' | 'explain' | 'limitations' | 'compare' | 'evaluate' | 'link', string>;
  updated: string;
}

export interface SavedReference {
  id: string;
  type: 'journal' | 'web' | 'report' | 'book';
  fields: Record<string, string>;
  created: string;
}

// ─── Style, Vinted, culture, lifestyle ─────────────────────────────────────

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type GarmentCategory =
  | 'shirt'
  | 'polo'
  | 'tshirt'
  | 'knitwear'
  | 'trousers'
  | 'shorts'
  | 'jacket'
  | 'outerwear'
  | 'shoes'
  | 'sunglasses'
  | 'watch'
  | 'belt'
  | 'swim'
  | 'accessory';

export interface WardrobeItem {
  id: string;
  demo?: boolean;
  name: string;
  category: GarmentCategory;
  brand?: string;
  colour: string;
  fabric?: string;
  seasons: Season[];
  formality: number; // 1 casual … 5 formal
  status: 'owned' | 'wishlist';
  costGBP?: number;
  wears?: number;
  notes?: string;
}

export interface VintedSearch {
  id: string;
  item: string;
  brand?: string;
  size?: string;
  maxPrice?: number;
  condition?: string;
  category?: string;
  created: string;
}

export interface PriceObservation {
  id: string;
  date: ISODate;
  brand: string;
  item: string;
  price: number;
  condition: string;
  sold: boolean;
  notes?: string;
}

export interface FilmState {
  status: 'watchlist' | 'watched' | 'skip';
  rating?: number;
  date?: ISODate;
}

export interface LifeEntry extends Base {
  date: ISODate;
  title: string;
  category: string;
  ideaId?: string;
  enjoyment?: number; // 1–5
  costGBP?: number;
  social?: boolean;
  notes?: string;
}

export interface Place {
  id: string;
  name: string;
  kind: 'cafe' | 'restaurant' | 'walk' | 'cinema' | 'culture' | 'day-trip' | 'other';
  notes?: string;
  glutenFreeConfidence?: 'accredited' | 'good' | 'unsure';
  visited: boolean;
}

// ─── Planning, phases, reviews, coach ──────────────────────────────────────

export type PlannedRun = 'easy' | 'easy-long' | 'threshold' | 'q2' | 'speed' | 'recovery';

export interface DayPlan {
  run: PlannedRun | null;
  gym: SplitId | null;
  extras: string[];
}

export type RoadmapPhase = 'baseline' | 'consistency' | 'development' | 'consolidation' | 'progression';
export type PhysiquePhase = 'assessment' | 'initial-target' | 'reassessment' | 'long-term';

export interface PhaseRecord<P extends string> {
  current: P;
  since: ISODate;
  history: { phase: P; from: ISODate; to: ISODate; reason: string }[];
}

export interface SavedReview {
  id: string;
  kind: 'weekly' | 'monthly';
  periodStart: ISODate;
  periodEnd: ISODate;
  /** Snapshot of the generated review so it stays as it was written. */
  summary: string;
  reflection: string;
  created: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created: string;
  source?: 'ai' | 'offline';
}

export interface Settings {
  theme: 'system' | 'light' | 'dark';
  onboarded: boolean;
  aiEnabled: boolean;
  runFocus: RunFocus;
  /** Starting rung on each session ladder before any sessions are logged. */
  startLevels: Partial<Record<'threshold' | 'vo2' | 'race-pace' | 'speed', number>>;
  /** Manual fitness adjustment (VDOT points) accepted from a coach proposal. */
  vdotAdjustments: { date: ISODate; delta: number; reason: string }[];
  lastBackupAt?: string;
  volumeTargets?: Partial<Record<string, [number, number]>>;
  vintedFeePct: number;
  vintedFeeFixed: number;
}

export interface AppData {
  version: number;
  profile: Profile;
  performances: Performance[];
  runGoals: RunGoal[];
  checkIns: Record<ISODate, CheckIn>;
  runs: RunLog[];
  gym: GymSession[];
  weights: WeightEntry[];
  photos: ProgressPhoto[];
  energyChecks: EnergyCheck[];
  food: FoodEntry[];
  customFoods: CustomFood[];
  foodTolerance: Record<string, 'tolerated' | 'problematic' | 'untested'>;
  modules: StudyModule[];
  assessments: Assessment[];
  study: StudySession[];
  topics: Topic[];
  flashcards: Flashcard[];
  paragraphs: ParagraphDraft[];
  references: SavedReference[];
  wardrobe: WardrobeItem[];
  vintedSearches: VintedSearch[];
  priceObservations: PriceObservation[];
  films: Record<string, FilmState>;
  life: LifeEntry[];
  places: Place[];
  planTemplate: Record<number, DayPlan>;
  planOverrides: Record<ISODate, DayPlan>;
  roadmap: PhaseRecord<RoadmapPhase>;
  physiquePhase: PhaseRecord<PhysiquePhase>;
  reviews: SavedReview[];
  chat: ChatMessage[];
  settings: Settings;
}

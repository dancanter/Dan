import { todayISO } from '@/lib/dates';
import type { AppData, DayPlan, Profile, Settings } from './types';

export const DATA_VERSION = 1;

export const defaultProfile: Profile = {
  name: '',
  dob: null,
  sex: 'male',
  heightCm: null,
  weightUnit: 'lb',
  distanceUnit: 'km',
  startWeightKg: null,
  targetWeightKg: null,
  estimatedBodyFatPct: null,
  location: null,
  restDay: 6,
  sleepTargetHours: [8, 10],
  stepsTarget: 10000,
  diet: { coeliac: false, tolerated: [], problematic: [], notes: '' },
  university: 'The Open University',
  degree: 'BSc (Hons) Public Health and Wellbeing',
  careerAim: 'NHS public health, towards specialty training and Consultant in Public Health',
};

// The default week, built around the structure Dan already likes: two
// quality sessions, one short speed session, two easy runs, Saturday off.
// Legs sit on the second quality day ("hard days hard") so the soreness
// lands on the upper-body day and the rest day, not on a quality run.
export const defaultPlanTemplate: Record<number, DayPlan> = {
  0: { run: 'threshold', gym: null, extras: ['mobility'] },
  1: { run: 'easy', gym: 'chest-triceps', extras: ['abs'] },
  2: { run: 'speed', gym: 'back-biceps', extras: ['neck'] },
  3: { run: 'easy-long', gym: null, extras: ['abs', 'mobility'] },
  4: { run: 'q2', gym: 'legs', extras: [] },
  5: { run: null, gym: 'shoulders-forearms', extras: ['abs', 'neck'] },
  6: { run: null, gym: null, extras: ['meditation'] },
};

export const defaultSettings: Settings = {
  theme: 'system',
  onboarded: false,
  aiEnabled: true,
  runFocus: 'balanced',
  startLevels: { threshold: 2, vo2: 2, 'race-pace': 2, speed: 1 },
  vdotAdjustments: [],
  vintedFeePct: 5,
  vintedFeeFixed: 0.7,
};

export function emptyData(): AppData {
  const today = todayISO();
  return {
    version: DATA_VERSION,
    profile: structuredClone(defaultProfile),
    performances: [],
    runGoals: [
      { event: '5k', targetSec: 16 * 60 + 59, label: 'Sub-17' },
      { event: 'mile', targetSec: 4 * 60 + 49, label: 'Sub-4:50' },
      { event: '1k', targetSec: 2 * 60 + 44, label: 'Sub-2:45' },
      { event: '800m', targetSec: 119, label: 'Sub-2:00' },
      { event: '400m', targetSec: 54.9, label: 'Sub-55' },
    ],
    checkIns: {},
    runs: [],
    gym: [],
    weights: [],
    photos: [],
    energyChecks: [],
    food: [],
    customFoods: [],
    foodTolerance: {},
    modules: [
      {
        code: 'SK297',
        title: 'Infection, immunity and public health',
        credits: 30,
        weeklyTargetHours: 8,
        colour: '#3b6e8f',
      },
      { code: 'SK298', title: '', credits: 30, weeklyTargetHours: 8, colour: '#8a6a3b' },
    ],
    assessments: [],
    study: [],
    topics: [],
    flashcards: [],
    paragraphs: [],
    references: [],
    wardrobe: [],
    vintedSearches: [],
    priceObservations: [],
    films: {},
    life: [],
    places: [],
    planTemplate: structuredClone(defaultPlanTemplate),
    planOverrides: {},
    roadmap: { current: 'baseline', since: today, history: [] },
    physiquePhase: { current: 'assessment', since: today, history: [] },
    reviews: [],
    chat: [],
    settings: structuredClone(defaultSettings),
  };
}

/**
 * Bring any older or partial data up to the current shape. Missing keys are
 * filled from defaults rather than failing, so an export from an older
 * version (or a hand-edited file) still imports.
 */
export function migrate(input: unknown): AppData {
  const base = emptyData();
  if (!input || typeof input !== 'object') return base;
  const d = input as Partial<AppData>;
  return {
    ...base,
    ...d,
    version: DATA_VERSION,
    profile: { ...base.profile, ...(d.profile ?? {}), diet: { ...base.profile.diet, ...(d.profile?.diet ?? {}) } },
    settings: { ...base.settings, ...(d.settings ?? {}) },
    planTemplate: { ...base.planTemplate, ...(d.planTemplate ?? {}) },
    roadmap: d.roadmap ?? base.roadmap,
    physiquePhase: d.physiquePhase ?? base.physiquePhase,
  };
}

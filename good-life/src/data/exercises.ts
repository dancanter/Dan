import type { SplitId } from '@/store/types';

export type Muscle =
  | 'chest'
  | 'upper-chest'
  | 'front-delts'
  | 'side-delts'
  | 'rear-delts'
  | 'lats'
  | 'upper-back'
  | 'traps'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'obliques'
  | 'neck';

export const MUSCLE_LABEL: Record<Muscle, string> = {
  chest: 'Chest',
  'upper-chest': 'Upper chest',
  'front-delts': 'Front delts',
  'side-delts': 'Side delts',
  'rear-delts': 'Rear delts',
  lats: 'Lats (width)',
  'upper-back': 'Upper back',
  traps: 'Traps',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  abs: 'Abs',
  obliques: 'Obliques',
  neck: 'Neck',
};

/**
 * Weekly hard-set targets (direct = 1 set, indirect = 0.5). Priority areas
 * sit higher; legs sit lower because running already loads them and heavy
 * leg volume is the part of lifting most likely to blunt run quality.
 * Ranges follow the dose–response literature (Schoenfeld et al., 2017;
 * Baz-Valle et al., 2022) — they are starting points, adjusted by response.
 */
export const DEFAULT_VOLUME_TARGETS: Record<Muscle, [number, number]> = {
  chest: [10, 16],
  'upper-chest': [6, 10],
  'front-delts': [4, 10],
  'side-delts': [10, 18],
  'rear-delts': [6, 12],
  lats: [10, 16],
  'upper-back': [8, 14],
  traps: [3, 8],
  biceps: [8, 14],
  triceps: [8, 14],
  forearms: [4, 8],
  quads: [6, 10],
  hamstrings: [6, 10],
  glutes: [4, 10],
  calves: [4, 8],
  abs: [6, 12],
  obliques: [2, 6],
  neck: [4, 8],
};

export const PRIORITY_MUSCLES: Muscle[] = ['side-delts', 'upper-chest', 'lats', 'biceps', 'triceps', 'abs'];

export interface Exercise {
  id: string;
  name: string;
  primary: Muscle[];
  secondary: Muscle[];
  /** 'bodyweight' exercises log added load (0 = bodyweight only). */
  equipment: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight';
  repRange: [number, number];
  rir: [number, number];
  restSec: number;
  cue: string;
  why?: string;
}

export const EXERCISES: Exercise[] = [
  // Chest & triceps
  { id: 'incline-db-press', name: 'Incline dumbbell press (~30°)', primary: ['chest', 'upper-chest'], secondary: ['front-delts', 'triceps'], equipment: 'dumbbell', repRange: [6, 10], rir: [1, 2], restSec: 150, cue: 'Bench at 30°, shoulder blades pinned, lower until a deep stretch across the chest.', why: 'A moderate incline biases the clavicular (upper) chest without turning it into a shoulder press.' },
  { id: 'flat-bench', name: 'Flat barbell bench press', primary: ['chest'], secondary: ['front-delts', 'triceps'], equipment: 'barbell', repRange: [6, 10], rir: [1, 3], restSec: 180, cue: 'Feet planted, slight arch, bar to lower chest, elbows ~45–60°.' },
  { id: 'low-high-fly', name: 'Low-to-high cable fly', primary: ['chest', 'upper-chest'], secondary: [], equipment: 'cable', repRange: [10, 15], rir: [0, 1], restSec: 90, cue: 'Pulleys low, sweep up to eye level; control the stretch.' },
  { id: 'weighted-pressup', name: 'Press-ups (weighted when easy)', primary: ['chest'], secondary: ['triceps', 'front-delts', 'abs'], equipment: 'bodyweight', repRange: [10, 20], rir: [1, 2], restSec: 90, cue: 'Rigid plank, chest to fist height, full lockout.' },
  { id: 'overhead-tri-ext', name: 'Overhead cable triceps extension', primary: ['triceps'], secondary: [], equipment: 'cable', repRange: [8, 12], rir: [0, 1], restSec: 90, cue: 'Elbows by the ears, let the hands travel well behind the head.', why: 'Overhead extensions produced substantially more triceps growth than pushdowns in a direct comparison (Maeo et al., 2023) — the long head is stretched overhead.' },
  { id: 'tri-pushdown', name: 'Triceps pushdown', primary: ['triceps'], secondary: [], equipment: 'cable', repRange: [10, 15], rir: [0, 1], restSec: 75, cue: 'Elbows pinned; squeeze the lockout.' },
  // Back & biceps
  { id: 'pull-up', name: 'Pull-ups (add load above 10 reps)', primary: ['lats'], secondary: ['biceps', 'upper-back', 'rear-delts'], equipment: 'bodyweight', repRange: [6, 10], rir: [1, 2], restSec: 150, cue: 'Dead hang to chest-to-bar intent; drive elbows down to the hips.' },
  { id: 'lat-pulldown', name: 'Lat pulldown (neutral or wide)', primary: ['lats'], secondary: ['biceps', 'upper-back'], equipment: 'cable', repRange: [8, 12], rir: [1, 2], restSec: 120, cue: 'Lean back slightly, full stretch at the top every rep.' },
  { id: 'chest-supported-row', name: 'Chest-supported row', primary: ['upper-back', 'lats'], secondary: ['rear-delts', 'biceps'], equipment: 'machine', repRange: [8, 12], rir: [1, 2], restSec: 120, cue: 'Chest stays on the pad — no lower-back fatigue to carry into running.' },
  { id: 'straight-arm-pulldown', name: 'Straight-arm pulldown', primary: ['lats'], secondary: [], equipment: 'cable', repRange: [10, 15], rir: [0, 1], restSec: 75, cue: 'Soft elbows, sweep the bar to the thighs, stretch overhead.' },
  { id: 'incline-db-curl', name: 'Incline dumbbell curl', primary: ['biceps'], secondary: ['forearms'], equipment: 'dumbbell', repRange: [8, 12], rir: [0, 1], restSec: 90, cue: 'Arms hang behind the torso — a stretched start position.' },
  { id: 'hammer-curl', name: 'Hammer curl', primary: ['biceps', 'forearms'], secondary: [], equipment: 'dumbbell', repRange: [10, 15], rir: [0, 1], restSec: 75, cue: 'Neutral grip, no swinging.' },
  { id: 'rear-delt-fly', name: 'Rear-delt fly (cable or machine)', primary: ['rear-delts'], secondary: ['upper-back'], equipment: 'cable', repRange: [12, 20], rir: [0, 1], restSec: 60, cue: 'Lead with the elbows, not the hands.' },
  // Legs
  { id: 'hack-squat', name: 'Hack squat or back squat', primary: ['quads', 'glutes'], secondary: [], equipment: 'machine', repRange: [5, 8], rir: [2, 3], restSec: 180, cue: 'Controlled depth; stop sets 2–3 reps short to spare the legs for running.' },
  { id: 'rdl', name: 'Romanian deadlift', primary: ['hamstrings', 'glutes'], secondary: ['upper-back'], equipment: 'barbell', repRange: [6, 10], rir: [2, 3], restSec: 150, cue: 'Hips back, bar close, stop at a deep hamstring stretch.' },
  { id: 'split-squat', name: 'Bulgarian split squat', primary: ['quads', 'glutes'], secondary: [], equipment: 'dumbbell', repRange: [8, 12], rir: [1, 2], restSec: 120, cue: 'Long stance for glutes, shorter for quads.' },
  { id: 'seated-leg-curl', name: 'Seated leg curl', primary: ['hamstrings'], secondary: [], equipment: 'machine', repRange: [8, 12], rir: [1, 2], restSec: 90, cue: 'Lean forward slightly to lengthen the hamstrings.', why: 'Seated curls (hip flexed, hamstrings lengthened) grew the hamstrings more than lying curls (Maeo et al., 2021).' },
  { id: 'standing-calf', name: 'Standing calf raise', primary: ['calves'], secondary: [], equipment: 'machine', repRange: [8, 12], rir: [1, 2], restSec: 75, cue: 'Pause in the stretch at the bottom; no bouncing.', why: 'Calf and soleus strength supports running economy and tolerance to load.' },
  { id: 'hanging-leg-raise', name: 'Hanging knee / leg raise', primary: ['abs'], secondary: ['obliques'], equipment: 'bodyweight', repRange: [8, 15], rir: [1, 2], restSec: 75, cue: 'Curl the pelvis up; avoid swinging.' },
  // Shoulders & forearms
  { id: 'seated-db-press', name: 'Seated dumbbell shoulder press', primary: ['front-delts'], secondary: ['side-delts', 'triceps'], equipment: 'dumbbell', repRange: [6, 10], rir: [1, 2], restSec: 150, cue: 'Slight incline back-rest, elbows a little forward of the body.' },
  { id: 'lateral-raise', name: 'Lateral raise (cable or dumbbell)', primary: ['side-delts'], secondary: [], equipment: 'cable', repRange: [12, 20], rir: [0, 1], restSec: 60, cue: 'Lead with the elbow, raise slightly in front of the body, slow on the way down.', why: 'Side delts drive shoulder width — the single most visible "athletic" proportion — and recover fast, so they tolerate high weekly volume.' },
  { id: 'machine-incline-press', name: 'Machine or Smith incline press', primary: ['upper-chest', 'chest'], secondary: ['front-delts', 'triceps'], equipment: 'machine', repRange: [8, 12], rir: [1, 2], restSec: 120, cue: 'Second weekly hit for the upper chest.' },
  { id: 'face-pull', name: 'Face pull', primary: ['rear-delts'], secondary: ['upper-back', 'traps'], equipment: 'cable', repRange: [12, 20], rir: [1, 2], restSec: 60, cue: 'Pull to the eyebrows, externally rotate at the end.' },
  { id: 'wrist-curl', name: 'Wrist curl', primary: ['forearms'], secondary: [], equipment: 'dumbbell', repRange: [12, 20], rir: [0, 1], restSec: 60, cue: 'Forearms on the bench, full range.' },
  { id: 'reverse-curl', name: 'Reverse (overhand) curl', primary: ['forearms'], secondary: ['biceps'], equipment: 'barbell', repRange: [10, 15], rir: [0, 1], restSec: 60, cue: 'EZ bar, overhand grip, controlled.' },
  // Core & neck
  { id: 'cable-crunch', name: 'Cable crunch', primary: ['abs'], secondary: [], equipment: 'cable', repRange: [10, 15], rir: [1, 2], restSec: 60, cue: 'Round the spine — ribs to pelvis — rather than hinging at the hips.' },
  { id: 'pallof-press', name: 'Pallof press', primary: ['obliques'], secondary: ['abs'], equipment: 'cable', repRange: [10, 15], rir: [2, 3], restSec: 45, cue: 'Resist rotation; useful for running posture.' },
  { id: 'neck-flexion', name: 'Neck flexion & extension (plate or band)', primary: ['neck'], secondary: [], equipment: 'dumbbell', repRange: [15, 25], rir: [2, 3], restSec: 45, cue: 'Light load, slow and controlled, never to failure. Progress very gradually.' },
];

export const EXERCISE_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e])) as Record<string, Exercise>;

export interface ProgrammeItem {
  exerciseId: string;
  sets: number;
  note?: string;
}

export interface SplitTemplate {
  id: SplitId;
  title: string;
  focus: string;
  items: ProgrammeItem[];
}

export const SPLITS: Record<Exclude<SplitId, 'other'>, SplitTemplate> = {
  'chest-triceps': {
    id: 'chest-triceps',
    title: 'Chest & triceps',
    focus: 'Upper chest first, while fresh; side delts as a priority add-on.',
    items: [
      { exerciseId: 'incline-db-press', sets: 3 },
      { exerciseId: 'flat-bench', sets: 3 },
      { exerciseId: 'low-high-fly', sets: 3 },
      { exerciseId: 'overhead-tri-ext', sets: 3 },
      { exerciseId: 'tri-pushdown', sets: 2 },
      { exerciseId: 'lateral-raise', sets: 3, note: 'Priority add-on' },
      { exerciseId: 'cable-crunch', sets: 3 },
    ],
  },
  'back-biceps': {
    id: 'back-biceps',
    title: 'Back & biceps',
    focus: 'Width (lats) before thickness; arms trained from a stretched position.',
    items: [
      { exerciseId: 'pull-up', sets: 3 },
      { exerciseId: 'lat-pulldown', sets: 3 },
      { exerciseId: 'chest-supported-row', sets: 3 },
      { exerciseId: 'straight-arm-pulldown', sets: 2 },
      { exerciseId: 'incline-db-curl', sets: 3 },
      { exerciseId: 'hammer-curl', sets: 2 },
      { exerciseId: 'lateral-raise', sets: 2, note: 'Priority add-on' },
      { exerciseId: 'neck-flexion', sets: 2 },
    ],
  },
  legs: {
    id: 'legs',
    title: 'Legs',
    focus: 'Enough to build and protect the legs without wrecking the next run: compounds 2–3 reps from failure.',
    items: [
      { exerciseId: 'hack-squat', sets: 3 },
      { exerciseId: 'rdl', sets: 3 },
      { exerciseId: 'split-squat', sets: 2 },
      { exerciseId: 'seated-leg-curl', sets: 3 },
      { exerciseId: 'standing-calf', sets: 3 },
      { exerciseId: 'hanging-leg-raise', sets: 3 },
    ],
  },
  'shoulders-forearms': {
    id: 'shoulders-forearms',
    title: 'Shoulders & forearms',
    focus: 'Side delts get the most volume of the week; a second hit for the upper chest.',
    items: [
      { exerciseId: 'seated-db-press', sets: 3 },
      { exerciseId: 'lateral-raise', sets: 4 },
      { exerciseId: 'machine-incline-press', sets: 2 },
      { exerciseId: 'face-pull', sets: 3 },
      { exerciseId: 'wrist-curl', sets: 2 },
      { exerciseId: 'reverse-curl', sets: 2 },
      { exerciseId: 'weighted-pressup', sets: 2 },
      { exerciseId: 'neck-flexion', sets: 2 },
      { exerciseId: 'pallof-press', sets: 2 },
    ],
  },
};

export const SPLIT_LABEL: Record<SplitId, string> = {
  'chest-triceps': 'Chest & triceps',
  'back-biceps': 'Back & biceps',
  legs: 'Legs',
  'shoulders-forearms': 'Shoulders & forearms',
  other: 'Other',
};

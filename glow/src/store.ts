import { useSyncExternalStore } from 'react';
import type { Food } from '@/data/foods';
import { FOOD_BY_ID } from '@/data/foods';
import { DEFAULT_PROFILE, type LoggedItem, type Meal, type Profile } from '@/engine/score';
import type { SleepEntry, WeightEntry } from '@/engine/body';
import type { Vitals } from '@/engine/vitals';
import type { Session } from '@/engine/training';
import type { BP } from '@/engine/health';

// Everything lives in this browser's localStorage. Nothing is sent anywhere,
// except food searches you choose to run against Open Food Facts.

export interface StoredItem {
  uid: string;
  foodId: string;
  grams: number;
  meal: Meal;
  /** How you entered it, e.g. 4 × large egg, so the log reads naturally. */
  qty?: { count: number; label: string; plural?: string };
}

export interface DayLog {
  items: StoredItem[];
  rituals: string[];
  note?: string;
  /** A planned refeed day: the next two weigh-ins are treated as water-weight noise. */
  refeed?: boolean;
}

export interface State {
  version: 1;
  profile: Profile;
  days: Record<string, DayLog>;
  weights: WeightEntry[];
  sleeps: SleepEntry[];
  /** Foods you created or imported from Open Food Facts. */
  customFoods: Food[];
  favourites: string[];
  breathMinutes: Record<string, number>;
  /** Steps, minutes outdoors and morning resting HR, by date. */
  vitals: Record<string, Vitals>;
  /** Runs, lifts and other sessions by date (synced from Strava or added by hand). */
  training: Record<string, Session[]>;
  bp: BP[];
  /** Blood test results: marker key -> dated values. */
  labs: { date: string; key: string; value: number }[];
  stravaSyncedAt?: string;
}

const KEY = 'glow-state-v1';

function initial(): State {
  return { version: 1, profile: DEFAULT_PROFILE, days: {}, weights: [], sleeps: [], customFoods: [], favourites: [], breathMinutes: {}, vitals: {}, training: {}, bp: [], labs: [] };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial();
    const s = JSON.parse(raw) as State;
    return { ...initial(), ...s, profile: { ...DEFAULT_PROFILE, ...s.profile } };
  } catch {
    return initial();
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

export function setState(fn: (s: State) => State) {
  state = fn(state);
  save();
  listeners.forEach((l) => l());
}

/** Listen for any state change (used by cloud sync). */
export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Replace everything, e.g. with data loaded from the cloud store. */
export function replaceState(next: State) {
  setState(() => ({ ...initial(), ...next, profile: { ...DEFAULT_PROFILE, ...next.profile }, vitals: next.vitals ?? {}, training: next.training ?? {}, bp: next.bp ?? [], labs: next.labs ?? [] }));
}

export function getState() {
  return state;
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => sel(state),
  );
}

export function findFood(id: string, s: State = state): Food | undefined {
  return FOOD_BY_ID.get(id) ?? s.customFoods.find((f) => f.id === id);
}

export function resolveItems(log: DayLog | undefined, s: State = state): LoggedItem[] {
  if (!log) return [];
  return log.items.flatMap((it) => {
    const food = findFood(it.foodId, s);
    return food ? [{ uid: it.uid, food, grams: it.grams, meal: it.meal, qty: it.qty }] : [];
  });
}

const uid = () => Math.random().toString(36).slice(2, 10);

function day(s: State, date: string): DayLog {
  return s.days[date] ?? { items: [], rituals: [] };
}

export const actions = {
  addItem(date: string, food: Food, grams: number, meal: Meal, qty?: StoredItem['qty']) {
    setState((s) => {
      // Only foods that don't ship with Glow need saving alongside your logs.
      const external = food.source === 'custom' || food.source === 'openfoodfacts';
      const customFoods = external && !s.customFoods.some((f) => f.id === food.id) ? [...s.customFoods, food] : s.customFoods;
      const d = day(s, date);
      return { ...s, customFoods, days: { ...s.days, [date]: { ...d, items: [...d.items, { uid: uid(), foodId: food.id, grams, meal, ...(qty ? { qty } : {}) }] } } };
    });
  },
  updateItem(date: string, itemUid: string, grams: number) {
    setState((s) => {
      const d = day(s, date);
      return { ...s, days: { ...s.days, [date]: { ...d, items: d.items.map((i) => (i.uid === itemUid ? { ...i, grams, qty: undefined } : i)) } } };
    });
  },
  removeItem(date: string, itemUid: string) {
    setState((s) => {
      const d = day(s, date);
      return { ...s, days: { ...s.days, [date]: { ...d, items: d.items.filter((i) => i.uid !== itemUid) } } };
    });
  },
  copyDay(from: string, to: string) {
    setState((s) => {
      const src = day(s, from);
      const d = day(s, to);
      return { ...s, days: { ...s.days, [to]: { ...d, items: [...d.items, ...src.items.map((i) => ({ ...i, uid: uid() }))] } } };
    });
  },
  toggleRitual(date: string, id: string) {
    setState((s) => {
      const d = day(s, date);
      const rituals = d.rituals.includes(id) ? d.rituals.filter((r) => r !== id) : [...d.rituals, id];
      return { ...s, days: { ...s.days, [date]: { ...d, rituals } } };
    });
  },
  setRitual(date: string, id: string, on: boolean) {
    setState((s) => {
      const d = day(s, date);
      const rituals = on ? [...new Set([...d.rituals, id])] : d.rituals.filter((r) => r !== id);
      return { ...s, days: { ...s.days, [date]: { ...d, rituals } } };
    });
  },
  setRefeed(date: string, on: boolean) {
    setState((s) => ({ ...s, days: { ...s.days, [date]: { ...day(s, date), refeed: on || undefined } } }));
  },
  setNote(date: string, note: string) {
    setState((s) => ({ ...s, days: { ...s.days, [date]: { ...day(s, date), note } } }));
  },
  logWeight(date: string, kg: number) {
    setState((s) => ({ ...s, weights: [...s.weights.filter((w) => w.date !== date), { date, kg }] }));
  },
  removeWeight(date: string) {
    setState((s) => ({ ...s, weights: s.weights.filter((w) => w.date !== date) }));
  },
  logSleep(entry: SleepEntry) {
    setState((s) => ({ ...s, sleeps: [...s.sleeps.filter((e) => e.date !== entry.date), entry] }));
  },
  removeSleep(date: string) {
    setState((s) => ({ ...s, sleeps: s.sleeps.filter((e) => e.date !== date) }));
  },
  setProfile(p: Partial<Profile>) {
    setState((s) => ({ ...s, profile: { ...s.profile, ...p } }));
  },
  toggleFavourite(id: string) {
    setState((s) => ({ ...s, favourites: s.favourites.includes(id) ? s.favourites.filter((f) => f !== id) : [...s.favourites, id] }));
  },
  saveCustomFood(f: Food) {
    setState((s) => ({ ...s, customFoods: [...s.customFoods.filter((x) => x.id !== f.id), f] }));
  },
  setVitals(date: string, v: Vitals) {
    setState((s) => {
      const merged = { ...s.vitals[date], ...v };
      for (const k of Object.keys(merged) as (keyof Vitals)[]) if (merged[k] === undefined || Number.isNaN(merged[k])) delete merged[k];
      return { ...s, vitals: { ...s.vitals, [date]: merged } };
    });
  },
  addSession(date: string, session: Session) {
    setState((s) => ({ ...s, training: { ...s.training, [date]: [...(s.training[date] ?? []).filter((x) => x.id !== session.id), session] } }));
  },
  setSessionSets(date: string, id: string, sets: Session['sets']) {
    setState((s) => ({ ...s, training: { ...s.training, [date]: (s.training[date] ?? []).map((x) => (x.id === id ? { ...x, sets } : x)) } }));
  },
  removeSession(date: string, id: string) {
    setState((s) => ({ ...s, training: { ...s.training, [date]: (s.training[date] ?? []).filter((x) => x.id !== id) } }));
  },
  setSessionIntensity(date: string, id: string, intensity: Session['intensity']) {
    setState((s) => ({ ...s, training: { ...s.training, [date]: (s.training[date] ?? []).map((x) => (x.id === id ? { ...x, intensity, intensitySet: true } : x)) } }));
  },
  /** Merge synced sessions, keeping any intensity you corrected by hand. */
  mergeStrava(items: { date: string; session: Session }[], at: string) {
    setState((s) => {
      const training = { ...s.training };
      for (const { date, session } of items) {
        const day = training[date] ?? [];
        const old = day.find((x) => x.id === session.id) as (Session & { intensitySet?: boolean }) | undefined;
        const merged = { ...(old?.intensitySet ? { ...session, intensity: old.intensity, intensitySet: true } : session), ...(old?.sets ? { sets: old.sets } : {}) };
        training[date] = [...day.filter((x) => x.id !== session.id), merged];
      }
      return { ...s, training, stravaSyncedAt: at };
    });
  },
  logBP(entry: BP) {
    setState((s) => ({ ...s, bp: [...s.bp.filter((b) => b.date !== entry.date), entry] }));
  },
  removeBP(date: string) {
    setState((s) => ({ ...s, bp: s.bp.filter((b) => b.date !== date) }));
  },
  logLab(date: string, key: string, value: number) {
    setState((s) => ({ ...s, labs: [...s.labs.filter((l) => !(l.date === date && l.key === key)), { date, key, value }] }));
  },
  removeLab(date: string, key: string) {
    setState((s) => ({ ...s, labs: s.labs.filter((l) => !(l.date === date && l.key === key)) }));
  },
  addBreath(date: string, minutes: number) {
    setState((s) => ({ ...s, breathMinutes: { ...s.breathMinutes, [date]: (s.breathMinutes[date] ?? 0) + minutes } }));
  },
  importState(json: string) {
    const parsed = JSON.parse(json) as State;
    if (parsed.version !== 1 || !parsed.days) throw new Error('This file is not a Glow backup.');
    setState(() => ({ ...initial(), ...parsed, profile: { ...DEFAULT_PROFILE, ...parsed.profile } }));
  },
  reset() {
    setState(() => initial());
  },
};

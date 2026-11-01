import { useSyncExternalStore } from 'react';
import type { Food } from '@/data/foods';
import { FOOD_BY_ID } from '@/data/foods';
import { DEFAULT_PROFILE, type LoggedItem, type Meal, type Profile } from '@/engine/score';
import type { SleepEntry, WeightEntry } from '@/engine/body';

// Everything lives in this browser's localStorage. Nothing is sent anywhere,
// except food searches you choose to run against Open Food Facts.

export interface StoredItem {
  uid: string;
  foodId: string;
  grams: number;
  meal: Meal;
}

export interface DayLog {
  items: StoredItem[];
  rituals: string[];
  note?: string;
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
}

const KEY = 'glow-state-v1';

function initial(): State {
  return { version: 1, profile: DEFAULT_PROFILE, days: {}, weights: [], sleeps: [], customFoods: [], favourites: [], breathMinutes: {} };
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
    return food ? [{ uid: it.uid, food, grams: it.grams, meal: it.meal }] : [];
  });
}

const uid = () => Math.random().toString(36).slice(2, 10);

function day(s: State, date: string): DayLog {
  return s.days[date] ?? { items: [], rituals: [] };
}

export const actions = {
  addItem(date: string, food: Food, grams: number, meal: Meal) {
    setState((s) => {
      const customFoods = food.source !== 'library' && !s.customFoods.some((f) => f.id === food.id) ? [...s.customFoods, food] : s.customFoods;
      const d = day(s, date);
      return { ...s, customFoods, days: { ...s.days, [date]: { ...d, items: [...d.items, { uid: uid(), foodId: food.id, grams, meal }] } } };
    });
  },
  updateItem(date: string, itemUid: string, grams: number) {
    setState((s) => {
      const d = day(s, date);
      return { ...s, days: { ...s.days, [date]: { ...d, items: d.items.map((i) => (i.uid === itemUid ? { ...i, grams } : i)) } } };
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

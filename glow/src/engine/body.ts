import type { Profile } from './score';

export interface WeightEntry { date: string; kg: number }
export interface SleepEntry {
  /** The date you woke up. */
  date: string;
  bed: string; // HH:MM
  wake: string; // HH:MM
  quality: number; // 1..5
  /** Woke up feeling rested? (1..5) */
  rested?: number;
}

export const LB_PER_KG = 2.20462;
export const toDisplay = (kg: number, unit: 'lb' | 'kg') => (unit === 'lb' ? kg * LB_PER_KG : kg);
export const fromDisplay = (v: number, unit: 'lb' | 'kg') => (unit === 'lb' ? v / LB_PER_KG : v);

export function ageOn(dob: string, on: string): number {
  const [y, m, d] = dob.split('-').map(Number);
  const [Y, M, D] = on.split('-').map(Number);
  let age = Y - y;
  if (M < m || (M === m && D < d)) age--;
  return age;
}

/** Mifflin–St Jeor resting energy (kcal/day), male. */
export function bmr(kg: number, cm: number, age: number): number {
  return 10 * kg + 6.25 * cm - 5 * age + 5;
}

export function bmi(kg: number, cm: number): number {
  return kg / (cm / 100) ** 2;
}

export function fatFreeMass(kg: number, bodyFatPct: number): number {
  return kg * (1 - bodyFatPct / 100);
}

/**
 * Energy availability: intake minus exercise energy, per kg of fat-free mass.
 * At or above 45 is the healthy target; under 30 is the low zone in which
 * hormonal and bone effects appear in lab studies (REDs consensus, 2023).
 */
export function energyAvailability(intakeKcal: number, p: Profile, kg: number): number {
  return (intakeKcal - p.exerciseKcal) / fatFreeMass(kg, p.bodyFatPct);
}

/** Rough total daily expenditure: resting energy × non-exercise activity (13k steps ≈ 1.5) + training. */
export function estimatedMaintenance(kg: number, p: Profile, age: number): number {
  return Math.round(bmr(kg, p.heightCm, age) * 1.5 + p.exerciseKcal);
}

export function sortByDate<T extends { date: string }>(xs: T[]): T[] {
  return [...xs].sort((a, b) => a.date.localeCompare(b.date));
}

/** 7-day rolling average of weight, one value per logged day. */
export function rolling(weights: WeightEntry[], days = 7): { date: string; kg: number; avg: number }[] {
  const s = sortByDate(weights);
  return s.map((w) => {
    const from = addDays(w.date, -(days - 1));
    const win = s.filter((x) => x.date >= from && x.date <= w.date);
    return { ...w, avg: win.reduce((a, b) => a + b.kg, 0) / win.length };
  });
}

/** Weekly rate of change (kg/week) from a least-squares fit over the last `days` days. */
export function weeklyRate(weights: WeightEntry[], days = 21): number | undefined {
  const s = sortByDate(weights);
  if (s.length < 4) return undefined;
  const last = s[s.length - 1].date;
  const win = s.filter((w) => w.date >= addDays(last, -days));
  if (win.length < 4) return undefined;
  const xs = win.map((w) => daysBetween(win[0].date, w.date));
  const ys = win.map((w) => w.kg);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const num = xs.reduce((s2, x, i) => s2 + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((s2, x) => s2 + (x - mx) ** 2, 0);
  if (!den) return undefined;
  return (num / den) * 7;
}

export function sleepHours(e: Pick<SleepEntry, 'bed' | 'wake'>): number {
  const [bh, bm] = e.bed.split(':').map(Number);
  const [wh, wm] = e.wake.split(':').map(Number);
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins <= 0) mins += 24 * 60;
  return mins / 60;
}

function minutesOfDay(hhmm: string, pivot = 18 * 60): number {
  const [h, m] = hhmm.split(':').map(Number);
  const v = h * 60 + m;
  // Shift so times either side of midnight sort sensibly.
  return v < pivot ? v + 24 * 60 : v;
}

function sd(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

/**
 * A sleep score from 0 to 100. Hard-training athletes need more than the
 * adult minimum of 7 hours, so 8–9.5 hours scores fully.
 */
export function sleepScore(entry: SleepEntry, recent: SleepEntry[]): { score: number; hours: number; parts: { label: string; value: number }[] } {
  const hours = sleepHours(entry);
  const dur = hours >= 8 && hours <= 9.75 ? 1 : hours < 8 ? Math.max(0, (hours - 5) / 3) : Math.max(0.7, 1 - (hours - 9.75) / 3);
  const quality = (entry.quality - 1) / 4;
  const rested = entry.rested ? (entry.rested - 1) / 4 : quality;
  const wakes = recent.slice(-7).map((e) => minutesOfDay(e.wake, 12 * 60));
  const beds = recent.slice(-7).map((e) => minutesOfDay(e.bed));
  const spread = recent.length >= 3 ? (sd(wakes) + sd(beds)) / 2 : 0;
  const consistency = recent.length >= 3 ? Math.max(0, Math.min(1, 1 - (spread - 20) / 70)) : 0.75;
  const score = Math.round(100 * (0.45 * dur + 0.2 * quality + 0.15 * rested + 0.2 * consistency));
  return {
    score,
    hours,
    parts: [
      { label: 'Duration', value: Math.round(dur * 100) },
      { label: 'Quality', value: Math.round(quality * 100) },
      { label: 'Rested', value: Math.round(rested * 100) },
      { label: 'Regularity', value: Math.round(consistency * 100) },
    ],
  };
}

// ── Dates ───────────────────────────────────────────────────────────────
export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}
export function daysBetween(a: string, b: string): number {
  const pa = a.split('-').map(Number);
  const pb = b.split('-').map(Number);
  return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
}
export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

import { addDays, daysBetween, sleepHours, sortByDate } from './body';
import { phaseOn } from './season';
import { dayResult } from './game';
import { rhrAnalysis } from './vitals';
import type { Muscle, Session } from './training';
import type { State } from '@/store';

// How long until each system is ready for hard work again. Base times come
// from typical recovery after each kind of session (quality runs ~48 h, races
// and time trials ~72 h, heavy leg sessions ~72 h, upper-body lifts ~48 h),
// then stretch with the things that slow repair: a calorie deficit, short
// sleep, a raised morning heart rate, low energy availability, soreness.
// Day-level estimates: sessions are logged by date, not time.

export type System = 'quality' | 'legs' | 'upper';
export const SYSTEM_LABEL: Record<System, string> = { quality: 'Quality running (intervals, tempo, trials)', legs: 'Legs (heavy leg lifting)', upper: 'Upper body lifting' };

const LEGS: Muscle[] = ['quads', 'hamstrings', 'glutes', 'calves'];
const UPPER: Muscle[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'neck'];
const RACE = /trial|race|parkrun|\btt\b|all.?out|5k|10k|pb/i;

function baseHours(s: Session): Partial<Record<System, number>> {
  if (s.kind === 'run') {
    if (RACE.test(s.name) && s.intensity === 'hard') return { quality: (s.km ?? 0) >= 8 ? 96 : 72, legs: 48 };
    if (s.intensity === 'hard') return { quality: 48, legs: 36 };
    if (s.minutes >= 90) return { quality: 48, legs: 48 };
    if (s.intensity === 'moderate') return { quality: 24 };
    return {};
  }
  if (s.kind === 'lift') {
    const sets = s.sets ?? {};
    const legSets = LEGS.reduce((a, m) => a + (sets[m] ?? 0), 0);
    const upperSets = UPPER.reduce((a, m) => a + (sets[m] ?? 0), 0);
    const known = legSets + upperSets > 0;
    const out: Partial<Record<System, number>> = {};
    if (!known) { out.upper = 48; if (/leg|lower|squat|deadlift/i.test(s.name)) { out.legs = 72; out.quality = 48; } return out; }
    if (upperSets >= 4) out.upper = upperSets >= 12 ? 60 : 48;
    if (legSets >= 4) { out.legs = legSets >= 8 ? 72 : 48; out.quality = legSets >= 8 ? 48 : 24; }
    return out;
  }
  if (s.kind === 'ride' && s.intensity === 'hard') return { legs: 24, quality: 24 };
  return {};
}

export interface SystemStatus { system: System; readyInDays: number; from?: string; why: string[] }

export function recoveryStatus(s: State, today: string): { systems: SystemStatus[]; extraHours: number; reasons: string[] } {
  // Things that slow repair right now (added once to every system).
  const reasons: string[] = [];
  let extra = 0;
  if (phaseOn(s.profile.season, today)?.kind === 'cut') { extra += 12; reasons.push('calorie deficit (+12 h)'); }
  const lastSleep = sortByDate(s.sleeps).filter((e) => e.date <= today).at(-1);
  if (lastSleep && lastSleep.date >= addDays(today, -1) && sleepHours(lastSleep) < 7) { extra += 12; reasons.push(`${sleepHours(lastSleep).toFixed(1)} h sleep (+12 h)`); }
  const h = rhrAnalysis(today, s.vitals ?? {});
  if (h.delta !== undefined && h.delta >= 5) { extra += 24; reasons.push(`morning HR +${h.delta} (+24 h)`); }
  const ea = dayResult(s, addDays(today, -1)).ea;
  if (ea !== undefined && ea < 30) { extra += 12; reasons.push('low energy availability yesterday (+12 h)'); }
  const feel = s.days[today]?.feelings ?? [];
  if (feel.includes('sore') || feel.includes('tired')) { extra += 12; reasons.push(`feeling ${feel.includes('sore') ? 'sore' : 'tired'} (+12 h)`); }

  const best: Record<System, { hoursLeft: number; from?: string }> = { quality: { hoursLeft: 0 }, legs: { hoursLeft: 0 }, upper: { hoursLeft: 0 } };
  for (let i = 0; i <= 5; i++) {
    const d = addDays(today, -i);
    for (const sess of s.training?.[d] ?? []) {
      const base = baseHours(sess);
      for (const [sys, hours] of Object.entries(base) as [System, number][]) {
        // Sessions are dated, not timed: treat each as done at midday.
        const left = hours + extra - daysBetween(d, today) * 24;
        if (left > best[sys].hoursLeft) best[sys] = { hoursLeft: left, from: `${sess.name} (${i === 0 ? 'today' : i === 1 ? 'yesterday' : `${i} days ago`})` };
      }
    }
  }
  const systems = (Object.keys(best) as System[]).map((sys) => ({
    system: sys,
    readyInDays: best[sys].hoursLeft <= 0 ? 0 : Math.ceil(best[sys].hoursLeft / 24),
    from: best[sys].from,
    why: reasons,
  }));
  return { systems, extraHours: extra, reasons };
}

export function readyLabel(days: number): string {
  return days <= 0 ? 'Ready now' : days === 1 ? 'Ready tomorrow' : `Ready in ${days} days`;
}

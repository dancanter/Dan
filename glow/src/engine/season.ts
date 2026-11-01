import { addDays, ageOn, daysBetween, estimatedMaintenance } from './body';
import type { Profile } from './score';

// A season: a run of phases with dates, each with its own calorie target,
// expected rate of change and rules. Glow's targets follow whichever phase
// today falls in.

export type PhaseKind = 'cut' | 'peak' | 'travel' | 'maintain';

export interface Phase {
  id: string;
  name: string;
  kind: PhaseKind;
  start: string; // inclusive
  end: string; // inclusive
  /** Expected weekly change as % of body weight (negative = loss). */
  ratePct: number;
}

export const KIND_LABEL: Record<PhaseKind, string> = { cut: 'Cut', peak: 'Peak', travel: 'Travel', maintain: 'Recover & maintain' };

/** Dan's winter: lean for France on 3 December, sharpest at Christmas, then rebuild hormones. */
export function defaultSeason(today: string): Phase[] {
  const year = Number(today.slice(0, 4)) + (today.slice(5, 7) === '12' && Number(today.slice(8, 10)) > 25 ? 1 : 0);
  return [
    { id: 'cut1', name: 'Cut to France', kind: 'cut', start: today < `${year}-12-03` ? today : `${year}-11-01`, end: `${year}-12-02`, ratePct: -0.5 },
    { id: 'france', name: 'France', kind: 'travel', start: `${year}-12-03`, end: `${year}-12-05`, ratePct: 0 },
    { id: 'cut2', name: 'Christmas finish', kind: 'cut', start: `${year}-12-06`, end: `${year}-12-24`, ratePct: -0.5 },
    { id: 'maintain', name: 'Recover & rebuild', kind: 'maintain', start: `${year}-12-25`, end: `${year + 1}-01-31`, ratePct: 0 },
  ];
}

export function phaseOn(season: Phase[] | undefined, date: string): Phase | undefined {
  return season?.find((p) => date >= p.start && date <= p.end);
}

export function nextPhase(season: Phase[] | undefined, date: string, kinds: PhaseKind[]): Phase | undefined {
  return season?.filter((p) => kinds.includes(p.kind) && p.start >= date).sort((a, b) => a.start.localeCompare(b.start))[0];
}

/**
 * Calorie target for a date. Cut phases use your own target. Travel uses
 * estimated maintenance: enjoy it, don't diet abroad. Maintenance ramps up
 * by ~150 kcal a week from your cut target to maintenance (a "reverse"), so
 * hormones recover without a rebound.
 */
export function kcalForDate(p: Profile, date: string, kg: number | undefined): { kcal: number; why: string } {
  const phase = phaseOn(p.season, date);
  const base = p.kcalTarget;
  if (!phase) return { kcal: base, why: 'Your calorie target from Me.' };
  if (phase.kind === 'cut' || phase.kind === 'peak') return { kcal: base, why: `${phase.name}: your cut target. Lose about 0.5% a week, no faster.` };
  if (!kg) return { kcal: base, why: `${phase.name}: log a weigh-in so Glow can estimate your maintenance calories.` };
  const maint = estimatedMaintenance(kg, p, ageOn(p.dob, date));
  if (phase.kind === 'travel') return { kcal: maint, why: `${phase.name}: eat at maintenance (about ${maint} kcal). Enjoy it. 3 days won’t undo a month of work.` };
  if (phase.kind === 'maintain') {
    const weeks = Math.floor(daysBetween(phase.start, date) / 7) + 1;
    const kcal = Math.min(maint, base + weeks * 150);
    return { kcal, why: kcal < maint ? `Reverse diet, week ${weeks}: +150 kcal a week until maintenance (about ${maint}).` : `At maintenance (about ${maint} kcal). Hormones, sleep and recovery come first now.` };
  }
  return { kcal: base, why: `${phase.name}.` };
}

/** Planned weight for each day, compounding each phase's weekly rate from a starting weight. */
export function plannedWeight(season: Phase[], startKg: number, date: string): number | undefined {
  const sorted = [...season].sort((a, b) => a.start.localeCompare(b.start));
  if (!sorted.length || date < sorted[0].start) return undefined;
  let kg = startKg;
  for (const p of sorted) {
    if (date < p.start) break;
    const until = date <= p.end ? date : p.end;
    const days = daysBetween(p.start, until) + (date > p.end ? 1 : 0);
    kg *= (1 + p.ratePct / 100) ** (days / 7);
  }
  return kg;
}

export interface Progress {
  planned: number;
  actual: number;
  diffKg: number;
  verdict: 'too-fast' | 'ahead' | 'on-track' | 'behind';
  advice: string;
}

/** Compares your 7-day average with the plan line. A gap of up to ±0.5 kg is noise. */
export function seasonProgress(season: Phase[], startKg: number, date: string, avgKg: number | undefined, weeklyRateKg: number | undefined): Progress | undefined {
  const planned = plannedWeight(season, startKg, date);
  if (planned === undefined || avgKg === undefined) return undefined;
  const diffKg = avgKg - planned;
  const phase = phaseOn(season, date);
  const fast = weeklyRateKg !== undefined && weeklyRateKg < -(avgKg * 0.0075);
  if (fast) return { planned, actual: avgKg, diffKg, verdict: 'too-fast', advice: 'You’re losing faster than 0.75% a week. Faster isn’t better here: it costs muscle, hormones and facial fullness. Add 150–200 kcal, mostly carbs around training.' };
  if (diffKg < -0.5) return { planned, actual: avgKg, diffKg, verdict: 'ahead', advice: 'Ahead of plan. Don’t cut harder: hold your calories, or add 100 kcal, and bank the lead.' };
  if (diffKg > 0.5 && phase?.kind === 'cut') return { planned, actual: avgKg, diffKg, verdict: 'behind', advice: 'A little behind. First check the boring things: weigh portions raw, log oils and sauces, keep steps steady. If it’s still behind after another full week, take 100–150 kcal off rest days only.' };
  return { planned, actual: avgKg, diffKg, verdict: 'on-track', advice: 'Right on the plan line. Change nothing.' };
}

export const TRAVEL_DEFAULT_DAYS = 3;

export function phaseDayInfo(p: Phase, date: string) {
  return { day: daysBetween(p.start, date) + 1, of: daysBetween(p.start, p.end) + 1, left: daysBetween(date, p.end) };
}

export { addDays };

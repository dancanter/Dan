import { addDays, todayISO, type ISODate } from '@/lib/dates';
import { clamp, mean, median } from '@/lib/stats';
import type { AppData, CheckIn, LegFeel } from '@/store/types';
import { analyseRun, currentFitness, paceZones } from './running';

// Readiness is a heuristic built from how Dan says he feels plus any
// numbers he supplies. Self-reported wellbeing tracks training load at
// least as well as most objective markers (Saw et al., 2016), but no
// single score is a physiological measurement — so the app shows a band and
// the reasons behind it, never a pseudo-precise number as a verdict.

export type ReadinessBand = 'high' | 'normal' | 'reduced' | 'low';

export interface Readiness {
  score: number | null;
  band: ReadinessBand | null;
  drivers: { label: string; effect: 'up' | 'down' }[];
  missing: string[];
  override?: string;
}

const LEGS: Record<LegFeel, number> = { fresh: 1, normal: 0.75, heavy: 0.35, sore: 0.15 };

export function baseline(d: AppData, field: 'restingHr' | 'hrv', date: ISODate): number | null {
  const vals: number[] = [];
  for (let i = 3; i <= 30; i++) {
    const v = d.checkIns[addDays(date, -i)]?.[field];
    if (typeof v === 'number') vals.push(v);
  }
  return vals.length >= 7 ? median(vals) : null;
}

export function readiness(d: AppData, date: ISODate = todayISO()): Readiness {
  const c: CheckIn | undefined = d.checkIns[date];
  const [sleepLo] = d.profile.sleepTargetHours;
  const parts: { w: number; v: number }[] = [];
  const drivers: Readiness['drivers'] = [];
  const missing: string[] = [];

  const add = (w: number, v: number, label: string, goodAbove = 0.7, badBelow = 0.45) => {
    parts.push({ w, v });
    if (v >= goodAbove) drivers.push({ label, effect: 'up' });
    else if (v < badBelow) drivers.push({ label, effect: 'down' });
  };

  if (!c) return { score: null, band: null, drivers, missing: ['check-in'] };

  if (c.sleepHours != null) {
    const v = clamp((c.sleepHours - (sleepLo - 2)) / 2, 0, 1);
    add(0.22, v, v >= 0.7 ? `Slept ${c.sleepHours} h` : `Only ${c.sleepHours} h sleep`);
  } else missing.push('sleep');
  if (c.sleepQuality != null) add(0.12, (c.sleepQuality - 1) / 4, c.sleepQuality >= 4 ? 'Good sleep quality' : 'Poor sleep quality');
  if (c.energy != null) add(0.18, (c.energy - 1) / 4, c.energy >= 4 ? 'High energy' : 'Low energy');
  else missing.push('energy');
  if (c.soreness != null) add(0.12, (5 - c.soreness) / 4, c.soreness <= 2 ? 'Little soreness' : 'Sore');
  if (c.legs) add(0.14, LEGS[c.legs], c.legs === 'fresh' ? 'Fresh legs' : `Legs ${c.legs}`);
  else missing.push('legs');
  if (c.stress != null) add(0.1, (5 - c.stress) / 4, c.stress <= 2 ? 'Low stress' : 'High stress');
  // Motivation is deliberately lightly weighted: wanting to train hard is not
  // the same as being ready to.
  if (c.motivation != null) parts.push({ w: 0.04, v: (c.motivation - 1) / 4 });

  const rhrBase = baseline(d, 'restingHr', date);
  if (c.restingHr != null && rhrBase != null) {
    const delta = c.restingHr - rhrBase;
    const v = clamp(1 - (delta - 2) / 6, 0, 1);
    add(0.08, v, delta >= 5 ? `Resting HR +${Math.round(delta)} bpm vs your baseline` : 'Resting HR at baseline', 0.9, 0.6);
  }
  const hrvBase = baseline(d, 'hrv', date);
  if (c.hrv != null && hrvBase != null) {
    const pct = ((c.hrv - hrvBase) / hrvBase) * 100;
    const v = clamp(1 + (pct + 5) / 15, 0, 1);
    add(0.06, v, pct <= -10 ? `HRV ${Math.round(pct)}% below baseline` : 'HRV near baseline', 0.9, 0.6);
  }

  if (!parts.length) return { score: null, band: null, drivers, missing };
  const totalW = parts.reduce((s, p) => s + p.w, 0);
  let score = (parts.reduce((s, p) => s + p.w * p.v, 0) / totalW) * 100;

  let override: string | undefined;
  if (c.illness === 'fever' || c.illness === 'below-neck') {
    score = Math.min(score, 30);
    override = c.illness === 'fever' ? 'Temperature: rest completely.' : 'Below-the-neck symptoms: no training today.';
  } else if (c.flags.includes('exhausted')) {
    score = Math.min(score, 50);
    drivers.push({ label: 'You said you are exhausted', effect: 'down' });
  } else if (c.flags.includes('heavy-legs')) {
    score = Math.min(score, 62);
  }
  if (c.niggle) {
    score = Math.min(score, 58);
    drivers.push({ label: `Something hurts (${c.niggle})`, effect: 'down' });
  }

  const band: ReadinessBand = score >= 75 ? 'high' : score >= 60 ? 'normal' : score >= 45 ? 'reduced' : 'low';
  return { score: Math.round(score), band, drivers, missing, override };
}

export const BAND_LABEL: Record<ReadinessBand, string> = {
  high: 'Ready',
  normal: 'Steady',
  reduced: 'Below par',
  low: 'Recover',
};

// ─── Training load & state ─────────────────────────────────────────────────

/** Session RPE × minutes (Foster et al., 2001), summed per day. */
export function dailyLoad(d: AppData, date: ISODate): number {
  const run = d.runs.filter((r) => r.date === date).reduce((s, r) => s + (r.rpe ?? 5) * (r.durationSec / 60), 0);
  const gym = d.gym.filter((g) => g.date === date).reduce((s, g) => s + (g.rpe ?? 7) * (g.durationMin ?? 60) * 0.6, 0);
  return run + gym;
}

export interface LoadSummary {
  acute: number;
  chronic: number | null;
  ratio: number | null;
  monotony: number | null;
  series: { date: ISODate; load: number }[];
}

export function loadSummary(d: AppData, date: ISODate = todayISO()): LoadSummary {
  const series: { date: ISODate; load: number }[] = [];
  for (let i = 27; i >= 0; i--) {
    const day = addDays(date, -i);
    series.push({ date: day, load: dailyLoad(d, day) });
  }
  const last7 = series.slice(-7).map((s) => s.load);
  const acute = last7.reduce((a, b) => a + b, 0);
  const firstLog = [...d.runs.map((r) => r.date), ...d.gym.map((g) => g.date)].sort()[0];
  const enoughHistory = firstLog != null && firstLog <= addDays(date, -21);
  const chronic = enoughHistory ? series.reduce((a, b) => a + b.load, 0) / 4 : null;
  const m = mean(last7)!;
  const sdv = Math.sqrt(last7.reduce((a, x) => a + (x - m) ** 2, 0) / 6);
  return {
    acute,
    chronic,
    ratio: chronic ? acute / chronic : null,
    monotony: sdv > 0 ? m / sdv : null,
    series,
  };
}

export type TrainingStateKind =
  | 'insufficient-data'
  | 'insufficient-recovery'
  | 'accumulated-fatigue'
  | 'productive-stress'
  | 'improving'
  | 'steady'
  | 'fresh';

export interface TrainingState {
  kind: TrainingStateKind;
  label: string;
  summary: string;
  evidence: string[];
}

export const STATE_LABEL: Record<TrainingStateKind, string> = {
  'insufficient-data': 'Learning your baseline',
  'insufficient-recovery': 'Recovery is lagging',
  'accumulated-fatigue': 'Accumulated fatigue',
  'productive-stress': 'Productive training stress',
  improving: 'Genuine improvement',
  steady: 'Steady',
  fresh: 'Fresh',
};

/**
 * Distinguishes the four things that feel alike from the inside:
 * a normal post-session dip, fatigue that is stacking up, recovery that is
 * not keeping pace (usually sleep or fuel), and real improvement.
 */
export function trainingState(d: AppData, date: ISODate = todayISO()): TrainingState {
  const fit = currentFitness(d, date);
  const zones = fit.vdot ? paceZones(fit.vdot) : null;
  const evidence: string[] = [];
  const since14 = addDays(date, -14);
  const recentRuns = d.runs.filter((r) => r.date > since14 && r.date <= date);
  const analysed = recentRuns.map((r) => ({ r, a: analyseRun(r, zones) }));
  const fatigueHits = analysed.filter((x) => x.a.fatigueSignal);
  const improvementHits = d.runs
    .filter((r) => r.date > addDays(date, -21) && r.date <= date)
    .map((r) => analyseRun(r, zones))
    .filter((a) => a.improvementSignal);

  const days = Array.from({ length: 5 }, (_, i) => addDays(date, -i));
  const checkIns = days.map((day) => d.checkIns[day]).filter(Boolean);
  const bands = days.map((day) => readiness(d, day).band).filter(Boolean);
  const lowDays = bands.filter((b) => b === 'reduced' || b === 'low').length;
  const sleeps = checkIns.map((c) => c!.sleepHours).filter((h): h is number => h != null);
  const avgSleep = mean(sleeps);
  const shortNights = sleeps.filter((h) => h < 7).length;
  const load = loadSummary(d, date);

  if (checkIns.length < 3 && recentRuns.length < 3) {
    return { kind: 'insufficient-data', label: STATE_LABEL['insufficient-data'], summary: 'A few more days of check-ins and logged sessions and this becomes meaningful.', evidence };
  }

  const [sleepLo] = d.profile.sleepTargetHours;
  const sleepShort = avgSleep != null && (avgSleep < sleepLo - 1 || shortNights >= 3);
  if (sleepShort) evidence.push(`Sleep averaging ${avgSleep!.toFixed(1)} h over the last ${sleeps.length} nights (${shortNights} under 7 h).`);
  if (lowDays >= 3) evidence.push(`Readiness below par on ${lowDays} of the last ${bands.length} check-ins.`);
  if (fatigueHits.length) evidence.push(`${fatigueHits.length} session${fatigueHits.length > 1 ? 's' : ''} in 14 days cost more effort than expected.`);
  if (load.ratio != null && load.ratio > 1.5) evidence.push(`This week's load is ${load.ratio.toFixed(1)}× your 4-week average (a flag, not a rule).`);
  const rhrBase = baseline(d, 'restingHr', date);
  const rhrRecent = mean(days.slice(0, 3).map((day) => d.checkIns[day]?.restingHr).filter((x): x is number => x != null));
  const rhrUp = rhrBase != null && rhrRecent != null && rhrRecent - rhrBase >= 5;
  if (rhrUp) evidence.push(`Resting HR ~${Math.round(rhrRecent! - rhrBase!)} bpm above your baseline for several days.`);

  if (sleepShort && (lowDays >= 2 || fatigueHits.length >= 1)) {
    return {
      kind: 'insufficient-recovery',
      label: STATE_LABEL['insufficient-recovery'],
      summary: 'Training is not the problem — recovery is. Short sleep is the most likely cause; adding work now would dig the hole deeper.',
      evidence,
    };
  }
  if (fatigueHits.length >= 2 || lowDays >= 3 || (rhrUp && lowDays >= 2) || (load.ratio != null && load.ratio > 1.5 && lowDays >= 2)) {
    return {
      kind: 'accumulated-fatigue',
      label: STATE_LABEL['accumulated-fatigue'],
      summary: 'Fatigue is building across days rather than clearing between sessions. A lighter few days now protects the next block.',
      evidence,
    };
  }
  if (improvementHits.length >= 2 && fatigueHits.length === 0) {
    evidence.push(`${improvementHits.length} sessions in 3 weeks ran faster than target at normal effort.`);
    return {
      kind: 'improving',
      label: STATE_LABEL.improving,
      summary: 'Faster at the same effort, repeatedly, without fatigue flags — that is real adaptation, not a good day.',
      evidence,
    };
  }
  const yesterdayHard = d.runs.some((r) => r.date === addDays(date, -1) && ['threshold', 'vo2', 'race-pace', 'race', 'time-trial'].includes(r.type));
  const today = d.checkIns[date];
  if (yesterdayHard && today && (today.legs === 'heavy' || (today.soreness ?? 0) >= 3) && lowDays <= 1) {
    evidence.push('A hard session yesterday; heavy legs today with an otherwise normal week.');
    return {
      kind: 'productive-stress',
      label: STATE_LABEL['productive-stress'],
      summary: 'This is the normal, useful dip after a hard session. It should clear in 24–48 h with easy running and good sleep.',
      evidence,
    };
  }
  if (load.ratio != null && load.ratio < 0.7 && lowDays === 0) {
    return { kind: 'fresh', label: STATE_LABEL.fresh, summary: 'Load is well below your recent average and you are recovering well — capacity is there to train.', evidence };
  }
  return { kind: 'steady', label: STATE_LABEL.steady, summary: 'No fatigue pattern and no sign of stagnation. Keep doing the plan.', evidence };
}

import { addDays, startOfWeek, todayISO, type ISODate } from '@/lib/dates';
import { mean } from '@/lib/stats';
import { DEFAULT_VOLUME_TARGETS, EXERCISE_BY_ID, type Muscle } from '@/data/exercises';
import type { AppData, GymExerciseLog, GymSession, GymSet } from '@/store/types';
import { e1rm, weightTrend } from './physique';
import { loadSummary, readiness } from './readiness';

/** Sets within ~4 reps of failure count as "hard sets" for volume. */
const HARD_SET_RIR = 4;

export function weeklyVolume(d: AppData, weekStart: ISODate): Record<Muscle, number> {
  const end = addDays(weekStart, 6);
  const vol = Object.fromEntries(Object.keys(DEFAULT_VOLUME_TARGETS).map((m) => [m, 0])) as Record<Muscle, number>;
  for (const s of d.gym.filter((g) => g.date >= weekStart && g.date <= end)) {
    for (const ex of s.exercises) {
      const def = EXERCISE_BY_ID[ex.exerciseId];
      if (!def) continue;
      const hard = ex.sets.filter((set) => set.reps > 0 && (set.rir == null || set.rir <= HARD_SET_RIR)).length;
      for (const m of def.primary) vol[m] += hard;
      for (const m of def.secondary) vol[m] += hard * 0.5;
    }
  }
  return vol;
}

export function volumeTargets(d: AppData): Record<Muscle, [number, number]> {
  return { ...DEFAULT_VOLUME_TARGETS, ...(d.settings.volumeTargets ?? {}) } as Record<Muscle, [number, number]>;
}

export function history(d: AppData, exerciseId: string): { date: ISODate; log: GymExerciseLog }[] {
  return d.gym
    .flatMap((s) => s.exercises.filter((e) => e.exerciseId === exerciseId).map((log) => ({ date: s.date, log })))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function effectiveLoad(exerciseId: string, set: GymSet, bodyweight: number): number {
  const def = EXERCISE_BY_ID[exerciseId];
  if (def?.equipment === 'bodyweight' && exerciseId === 'pull-up') return bodyweight + set.loadKg;
  return set.loadKg;
}

export function bestE1rm(exerciseId: string, log: GymExerciseLog, bodyweight: number): number | null {
  const vals = log.sets
    .filter((s) => s.reps > 0 && s.reps <= 15)
    .map((s) => effectiveLoad(exerciseId, s, bodyweight))
    .map((load, i) => (load > 0 ? e1rm(load, log.sets[i].reps, log.sets[i].rir ?? 0) : 0))
    .filter((x) => x > 0);
  return vals.length ? Math.max(...vals) : null;
}

export interface SetTarget {
  sets: number;
  loadKg: number | null;
  reps: [number, number];
  rir: [number, number];
  instruction: string;
  basis: 'first-time' | 'add-load' | 'add-reps' | 'hold' | 'reduce';
}

function loadStep(exerciseId: string, load: number): number {
  const eq = EXERCISE_BY_ID[exerciseId]?.equipment;
  if (eq === 'dumbbell') return load >= 20 ? 2 : 1;
  if (eq === 'barbell') return 2.5;
  if (eq === 'bodyweight') return 2.5;
  return load >= 40 ? 5 : 2.5;
}

/**
 * Double progression: work up the rep range at a load; once every set
 * reaches the top of the range without going closer to failure than
 * intended, add the smallest sensible load and start again at the bottom.
 */
export function nextTarget(d: AppData, exerciseId: string, plannedSets: number): SetTarget {
  const def = EXERCISE_BY_ID[exerciseId];
  const reps = def?.repRange ?? [8, 12];
  const rir = def?.rir ?? [1, 2];
  const last = history(d, exerciseId).at(-1)?.log;
  if (!last || !last.sets.length) {
    return { sets: plannedSets, loadKg: null, reps, rir, basis: 'first-time', instruction: `Pick a load you can lift for ${reps[0]}–${reps[1]} reps leaving ${rir[0]}–${rir[1]} in reserve.` };
  }
  const working = last.sets.filter((s) => s.reps > 0);
  const load = Math.max(...working.map((s) => s.loadKg));
  const atLoad = working.filter((s) => s.loadKg === load);
  const allTop = atLoad.length >= Math.min(plannedSets, working.length) && atLoad.every((s) => s.reps >= reps[1]);
  const effortOk = atLoad.every((s) => s.rir == null || s.rir >= rir[0] - 1);
  const below = atLoad.filter((s) => s.reps < reps[0]).length;
  const bw = def?.equipment === 'bodyweight';
  if (allTop && effortOk) {
    const step = loadStep(exerciseId, load);
    return {
      sets: plannedSets,
      loadKg: load + step,
      reps,
      rir,
      basis: 'add-load',
      instruction: bw && load === 0 ? `Every set hit ${reps[1]}+. Add ${step} kg (belt or vest), or slow the lowering to 3 s.` : `Every set hit ${reps[1]}. Add ${step} kg and aim for ${reps[0]}+ reps.`,
    };
  }
  if (below >= 2) {
    return { sets: plannedSets, loadKg: load, reps, rir, basis: 'hold', instruction: `Below ${reps[0]} reps on ${below} sets last time. Hold ${load} kg; if it happens again, drop ~5–10%.` };
  }
  const bestReps = Math.max(...atLoad.map((s) => s.reps));
  return { sets: plannedSets, loadKg: load, reps, rir, basis: 'add-reps', instruction: `Stay at ${load} kg. Beat last time by a rep on at least one set (best was ${bestReps}).` };
}

// ─── Stalls: diagnose before adding sets ───────────────────────────────────

export interface StallReport {
  exerciseId: string;
  sessions: number;
  bestRecent: number;
  bestBefore: number;
  checks: { area: string; finding: string; likely: boolean }[];
  recommendation: string;
}

/**
 * When a lift stops moving, more sets is the last thing to try, not the
 * first. The order here is deliberate: recovery, energy, running load,
 * effort, technique — and only then volume.
 */
export function stallAnalysis(d: AppData, exerciseId: string, today: ISODate = todayISO()): StallReport | null {
  const bw = weightTrend(d, 21, today).latestAvg ?? 0;
  const h = history(d, exerciseId);
  if (h.length < 5) return null;
  const scores = h.map((x) => ({ date: x.date, v: bestE1rm(exerciseId, x.log, bw) })).filter((x) => x.v != null) as { date: ISODate; v: number }[];
  if (scores.length < 5) return null;
  const recent = scores.slice(-3);
  const before = scores.slice(0, -3);
  const bestRecent = Math.max(...recent.map((s) => s.v));
  const bestBefore = Math.max(...before.map((s) => s.v));
  if (bestRecent > bestBefore * 1.01) return null;

  const checks: StallReport['checks'] = [];
  const sleeps = Array.from({ length: 14 }, (_, i) => d.checkIns[addDays(today, -i)]?.sleepHours).filter((x): x is number => x != null);
  const avgSleep = mean(sleeps);
  const sleepLow = avgSleep != null && avgSleep < d.profile.sleepTargetHours[0] - 0.5;
  checks.push({ area: 'Sleep', finding: avgSleep != null ? `Averaging ${avgSleep.toFixed(1)} h over ${sleeps.length} logged nights.` : 'No sleep logged.', likely: sleepLow });

  const trend = weightTrend(d, 21, today);
  const cutting = trend.pctPerWeek != null && trend.pctPerWeek < -0.3;
  checks.push({
    area: 'Energy',
    finding: trend.pctPerWeek != null ? `Weight trend ${trend.pctPerWeek.toFixed(2)}%/week.` : 'No weight trend yet.',
    likely: cutting,
  });

  const load = loadSummary(d, today);
  const runningUp = load.ratio != null && load.ratio > 1.3;
  checks.push({ area: 'Running load', finding: load.ratio != null ? `Acute:chronic load ${load.ratio.toFixed(2)}.` : 'Not enough history.', likely: runningUp });

  const recentSets = h.slice(-3).flatMap((x) => x.log.sets).filter((s) => s.rir != null);
  const avgRir = mean(recentSets.map((s) => s.rir!));
  const def = EXERCISE_BY_ID[exerciseId];
  const tooEasy = avgRir != null && def && avgRir > def.rir[1] + 1;
  checks.push({ area: 'Effort', finding: avgRir != null ? `Average ${avgRir.toFixed(1)} reps in reserve.` : 'Reps in reserve not logged.', likely: !!tooEasy });

  const lowReadiness = Array.from({ length: 7 }, (_, i) => readiness(d, addDays(today, -i)).band).filter((b) => b === 'reduced' || b === 'low').length >= 3;
  checks.push({ area: 'Readiness', finding: lowReadiness ? 'Below par on 3+ of the last 7 days.' : 'No sustained dip.', likely: lowReadiness });

  checks.push({ area: 'Execution', finding: 'Check range of motion and tempo are consistent — a filmed set is the quickest way. Slightly shorter reps can mask real progress or create fake progress.', likely: false });

  const weekVol = weeklyVolume(d, startOfWeek(today));
  const muscle = def?.primary[0];
  const target = muscle ? volumeTargets(d)[muscle] : null;
  const lowVolume = muscle && target ? weekVol[muscle] < target[0] : false;

  let recommendation: string;
  if (sleepLow) recommendation = 'Fix sleep first. Short sleep reduces muscle protein synthesis and training quality; more sets will not out-train it.';
  else if (cutting) recommendation = 'A plateau in a deficit is expected and fine — holding strength while losing weight is a success. Revisit after the cut.';
  else if (runningUp) recommendation = 'Running load jumped recently. Interference is likeliest now; let the running settle before judging the lift.';
  else if (tooEasy) recommendation = 'Sets are ending further from failure than intended. Push the last set to 0–1 reps in reserve before changing anything else.';
  else if (lowReadiness) recommendation = 'General fatigue is high — consider a lighter week (half the sets) then retest.';
  else if (lowVolume) recommendation = `Recovery, energy and effort look fine and ${muscle} volume is below target — adding 1–2 sets a week is reasonable now.`;
  else recommendation = 'Nothing obvious. Try a variation for 4–6 weeks (e.g. a different incline or grip), or a deload week then retest.';

  return { exerciseId, sessions: h.length, bestRecent, bestBefore, checks, recommendation };
}

export function sessionVolumeLoad(s: GymSession): number {
  return s.exercises.reduce((a, e) => a + e.sets.reduce((b, set) => b + set.reps * set.loadKg, 0), 0);
}

export function e1rmSeries(d: AppData, exerciseId: string): { date: ISODate; e1rm: number }[] {
  const out: { date: ISODate; e1rm: number }[] = [];
  for (const x of history(d, exerciseId)) {
    const bw = weightTrend(d, 21, x.date).latestAvg ?? 0;
    const v = bestE1rm(exerciseId, x.log, bw);
    if (v) out.push({ date: x.date, e1rm: Math.round(v * 10) / 10 });
  }
  return out;
}

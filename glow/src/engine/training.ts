import { addDays, daysBetween } from './body';
import type { Vitals } from './vitals';

// Training as it affects recovery, hormones and energy availability, not
// as a coach (that's The Good Life's job). Glow asks one question: is the
// total load right now helping you adapt, or costing more repair than
// your sleep and food can pay for?

export type SessionKind = 'run' | 'lift' | 'walk' | 'ride' | 'other';
export type Intensity = 'easy' | 'moderate' | 'hard';

export interface Session {
  id: string;
  source: 'strava' | 'manual';
  kind: SessionKind;
  name: string;
  minutes: number;
  km?: number;
  kcal?: number;
  intensity: Intensity;
  /** True once you've corrected the intensity by hand (a re-sync keeps it). */
  intensitySet?: boolean;
}

const FACTOR: Record<Intensity, number> = { easy: 3, moderate: 5, hard: 8 };

/** Session load: minutes × an intensity weight (a simplified session-RPE load). */
export function sessionLoad(s: Session): number {
  if (s.kind === 'walk') return s.minutes * 1.5;
  return s.minutes * FACTOR[s.intensity];
}

/** Energy the session cost. Strava's own number when there is one; otherwise an estimate. */
export function sessionKcal(s: Session, kg: number): number {
  if (s.kcal) return s.kcal;
  if (s.kind === 'run' && s.km) return Math.round(s.km * kg * 1.0);
  const perMin = { run: 11, lift: 5, walk: 4, ride: 8, other: 6 }[s.kind];
  return Math.round(s.minutes * perMin * (s.intensity === 'hard' ? 1.2 : s.intensity === 'easy' ? 0.85 : 1));
}

const HARD = /interval|threshold|tempo|trial|race|parkrun|reps?\b|\bx\s?\d|\d\s?x\b|sprint|vo2|fartlek|hill|800|400|1k|1km|mile\b|time trial|tt\b|track/i;
const EASY = /easy|recovery|zone ?2|z2|shake ?out|jog|steady walk/i;

interface StravaActivity {
  id: string;
  name: string;
  sport_type: string;
  start_local: string;
  summary: { distance?: number; moving_time?: number; elapsed_time?: number; total_calories?: number; avg_speed?: number; relative_effort?: number };
}

/** Turns one Strava activity into a Glow session. */
export function fromStrava(a: StravaActivity): { date: string; session: Session } {
  const t = a.sport_type;
  const kind: SessionKind = /Run/.test(t) ? 'run' : /Weight|Workout|Crossfit|HighIntensity|Strength/i.test(t) ? 'lift' : /Walk|Hike/.test(t) ? 'walk' : /Ride|Cycl/.test(t) ? 'ride' : 'other';
  const km = a.summary.distance ? a.summary.distance / 1000 : undefined;
  const minutes = Math.round((a.summary.moving_time ?? a.summary.elapsed_time ?? 0) / 60);
  let intensity: Intensity = 'moderate';
  if (EASY.test(a.name)) intensity = 'easy';
  else if (HARD.test(a.name)) intensity = 'hard';
  else if (kind === 'run' && (a.summary.avg_speed ?? 0) >= 4.3 && (km ?? 0) >= 3) intensity = 'hard';
  else if (kind === 'walk') intensity = 'easy';
  return {
    date: a.start_local.slice(0, 10),
    session: { id: `strava-${a.id}`, source: 'strava', kind, name: a.name, minutes, km: km ? Math.round(km * 100) / 100 : undefined, kcal: a.summary.total_calories || undefined, intensity },
  };
}

export type LoadLevel = 'fresh' | 'balanced' | 'pushing' | 'too-much';

export interface LoadAssessment {
  level: LoadLevel;
  headline: string;
  reasons: string[];
  actions: string[];
  week: { runs: number; runKm: number; hard: number; lifts: number; minutes: number; kcal: number; load: number };
  acwr?: number;
}

function sumLoad(training: Record<string, Session[]>, from: string, to: string): number {
  let total = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) for (const s of training[d] ?? []) total += sessionLoad(s);
  return total;
}

/**
 * Is the load right? Combines the acute:chronic load ratio (this week against
 * your 4-week average, 0.8–1.3 being the usual "sweet spot"), the number of
 * hard sessions, back-to-back hard days, and the recovery signals Glow
 * already tracks: morning heart rate, sleep and energy availability.
 * None of these is decisive on its own; together they're a good early warning.
 */
export function assessLoad(date: string, training: Record<string, Session[]>, ctx: { kg: number; vitals: Record<string, Vitals>; sleepHours: number[]; ea?: number; inDeficit: boolean }): LoadAssessment {
  const weekFrom = addDays(date, -6);
  const sessions: Session[] = [];
  const hardDays: string[] = [];
  for (let d = weekFrom; d <= date; d = addDays(d, 1)) {
    for (const s of training[d] ?? []) {
      sessions.push(s);
      if (s.intensity === 'hard' && s.kind !== 'walk') hardDays.push(d);
    }
  }
  const runs = sessions.filter((s) => s.kind === 'run');
  const week = {
    runs: runs.length,
    runKm: Math.round(runs.reduce((a, s) => a + (s.km ?? 0), 0) * 10) / 10,
    hard: sessions.filter((s) => s.intensity === 'hard' && s.kind !== 'walk' && s.kind !== 'lift').length,
    lifts: sessions.filter((s) => s.kind === 'lift').length,
    minutes: sessions.reduce((a, s) => a + s.minutes, 0),
    kcal: sessions.reduce((a, s) => a + sessionKcal(s, ctx.kg), 0),
    load: sumLoad(training, weekFrom, date),
  };
  const chronicWeekly = sumLoad(training, addDays(date, -27), date) / 4;
  const hasHistory = Object.keys(training).some((d) => d <= addDays(date, -21));
  const acwr = hasHistory && chronicWeekly > 0 ? Math.round((week.load / chronicWeekly) * 100) / 100 : undefined;

  const reasons: string[] = [];
  const actions: string[] = [];
  let strain = 0;
  if (acwr !== undefined && acwr > 1.5) { strain += 2; reasons.push(`This week’s load is ${acwr}× your 4-week average. Spikes above about 1.5× are when injuries and illness cluster.`); actions.push('Hold load flat next week rather than adding more.'); }
  else if (acwr !== undefined && acwr > 1.3) { strain += 1; reasons.push(`Load is up ${Math.round((acwr - 1) * 100)}% on your 4-week average. Fine for a week, not two in a row.`); }
  if (week.hard >= 4) { strain += 2; reasons.push(`${week.hard} hard running sessions in 7 days. Most of a runner’s week should be easy; 2–3 quality sessions is the evidence-backed ceiling.`); actions.push('Make the next run easy (conversational pace) or take a rest day.'); }
  else if (week.hard === 3 && week.lifts >= 4 && ctx.inDeficit) { strain += 1; reasons.push('3 hard runs plus 4+ lifts in a calorie deficit is a lot of repair to pay for.'); }
  const backToBack = hardDays.some((d, i) => hardDays.slice(i + 1).some((e) => daysBetween(d, e) === 1));
  if (backToBack) { strain += 1; reasons.push('Hard sessions on consecutive days. Recovery needs 48 hours between quality efforts, and you’ll get more from each one.'); actions.push('Put an easy day or a lift between hard runs.'); }
  const rhrUp = [0, 1, 2].filter((k) => {
    const v = ctx.vitals[addDays(date, -k)]?.rhr;
    if (!v) return false;
    const prev = Array.from({ length: 14 }, (_, i) => ctx.vitals[addDays(date, -k - i - 1)]?.rhr).filter((x): x is number => !!x);
    return prev.length >= 5 && v - prev.reduce((a, b) => a + b, 0) / prev.length >= 5;
  }).length;
  if (rhrUp >= 2) { strain += 2; reasons.push('Morning heart rate has been 5+ bpm above your baseline on 2 of the last 3 days. Your body is telling you recovery isn’t keeping up.'); actions.push('Swap the next quality session for easy running or rest until your heart rate settles.'); }
  const sleepAvg = ctx.sleepHours.length ? ctx.sleepHours.reduce((a, b) => a + b, 0) / ctx.sleepHours.length : undefined;
  if (sleepAvg !== undefined && sleepAvg < 7.5 && week.load > 0) { strain += 1; reasons.push(`Sleep is averaging ${sleepAvg.toFixed(1)} h. At your training load, under 8 hours means slower repair and more muscle lost on a cut.`); actions.push('Protect sleep before adding any training.'); }
  if (ctx.ea !== undefined && ctx.ea < 30 && week.load > 0) { strain += 2; reasons.push(`Energy availability is about ${Math.round(ctx.ea)} kcal/kg fat-free mass, in the low zone. Training on low energy is where hormones, bone and cellular repair get rationed.`); actions.push('Eat 200–400 kcal more on training days, mostly carbohydrate around sessions.'); }

  let level: LoadLevel;
  let headline: string;
  if (!sessions.length) { level = 'fresh'; headline = 'No training logged this week. Sync Strava or add sessions to see your load.'; }
  else if (strain >= 4) { level = 'too-much'; headline = 'Too much right now: recovery isn’t keeping up'; }
  else if (strain >= 2) { level = 'pushing'; headline = 'Pushing it. Fine short-term, but watch the signs'; }
  else { level = 'balanced'; headline = 'Balanced: stress you can adapt to'; }
  if (level === 'balanced') actions.push('Keep doing exactly this. Adaptation happens in recovery, and you’re giving it room.');
  return { level, headline, reasons, actions, week, acwr };
}

/** Energy spent in training on a date (for energy availability), when anything is logged. */
export function trainingKcalOn(training: Record<string, Session[]> | undefined, date: string, kg: number): number | undefined {
  const day = training?.[date];
  if (!day?.length) return undefined;
  return day.filter((s) => s.kind !== 'walk').reduce((a, s) => a + sessionKcal(s, kg), 0);
}

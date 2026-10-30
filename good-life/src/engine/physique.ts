import { addDays, ageOn, diffDays, startOfWeek, todayISO, type ISODate } from '@/lib/dates';
import { mean, slope } from '@/lib/stats';
import type { AppData, WeightEntry } from '@/store/types';

// Daily weight swings of 0.5–1.5 kg are mostly water, glycogen and gut
// contents. Only averages and trends are interpreted, never single days.

export function sortedWeights(d: AppData): WeightEntry[] {
  return [...d.weights].sort((a, b) => a.date.localeCompare(b.date));
}

export function rollingAverage(entries: WeightEntry[], window = 7): { date: ISODate; kg: number; avg: number | null }[] {
  return entries.map((e) => {
    const from = addDays(e.date, -(window - 1));
    const inWin = entries.filter((x) => x.date >= from && x.date <= e.date).map((x) => x.kg);
    return { date: e.date, kg: e.kg, avg: inWin.length >= 3 ? mean(inWin) : null };
  });
}

export interface WeekAverage {
  weekStart: ISODate;
  avgKg: number;
  n: number;
  waistCm: number | null;
}

export function weeklyAverages(d: AppData): WeekAverage[] {
  const map = new Map<ISODate, WeightEntry[]>();
  for (const w of d.weights) {
    const k = startOfWeek(w.date);
    map.set(k, [...(map.get(k) ?? []), w]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, list]) => ({
      weekStart,
      avgKg: mean(list.map((x) => x.kg))!,
      n: list.length,
      waistCm: mean(list.map((x) => x.waistCm).filter((x): x is number => x != null)),
    }));
}

export interface Trend {
  kgPerWeek: number | null;
  pctPerWeek: number | null;
  n: number;
  spanDays: number;
  latestAvg: number | null;
  reliable: boolean;
}

export function weightTrend(d: AppData, days = 21, today: ISODate = todayISO()): Trend {
  const from = addDays(today, -days);
  const pts = sortedWeights(d).filter((w) => w.date >= from && w.date <= today);
  const xy = pts.map((w) => ({ x: diffDays(from, w.date), y: w.kg }));
  const s = slope(xy);
  const latest = mean(pts.filter((w) => w.date >= addDays(today, -6)).map((w) => w.kg));
  const spanDays = pts.length ? diffDays(pts[0].date, pts[pts.length - 1].date) : 0;
  const kgPerWeek = s != null ? s * 7 : null;
  return {
    kgPerWeek,
    pctPerWeek: kgPerWeek != null && latest ? (kgPerWeek / latest) * 100 : null,
    n: pts.length,
    spanDays,
    latestAvg: latest,
    reliable: pts.length >= 8 && spanDays >= 12,
  };
}

export function bmi(kg: number, heightCm: number): number {
  return kg / (heightCm / 100) ** 2;
}

/** US Navy tape estimate (men). Typical error ±3–4 percentage points. */
export function navyBodyFat(waistCm: number, neckCm: number, heightCm: number): number | null {
  if (waistCm <= neckCm) return null;
  return 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
}

export interface BodyComp {
  bodyFatPct: [number, number] | null;
  ffmKg: [number, number] | null;
  basis: string;
}

export function bodyComposition(d: AppData): BodyComp {
  const w = sortedWeights(d);
  const kg = weightTrend(d).latestAvg ?? w.at(-1)?.kg ?? d.profile.startWeightKg;
  if (!kg) return { bodyFatPct: null, ffmKg: null, basis: 'No weight logged yet.' };
  const measured = [...w].reverse().find((x) => x.bodyFatPct != null);
  const errBy: Record<string, number> = { dexa: 1.5, 'bia-scale': 4, calipers: 3, 'navy-tape': 3.5, visual: 4 };
  if (measured?.bodyFatPct != null) {
    const e = errBy[measured.bodyFatMethod ?? 'visual'] ?? 4;
    const range: [number, number] = [Math.max(3, measured.bodyFatPct - e), measured.bodyFatPct + e];
    return { bodyFatPct: range, ffmKg: [kg * (1 - range[1] / 100), kg * (1 - range[0] / 100)], basis: `${measured.bodyFatMethod ?? 'estimate'} on ${measured.date} (±${e} points)` };
  }
  const tape = [...w].reverse().find((x) => x.waistCm && x.neckCm);
  if (tape && d.profile.heightCm) {
    const bf = navyBodyFat(tape.waistCm!, tape.neckCm!, d.profile.heightCm);
    if (bf != null) {
      const range: [number, number] = [Math.max(3, bf - 3.5), bf + 3.5];
      return { bodyFatPct: range, ffmKg: [kg * (1 - range[1] / 100), kg * (1 - range[0] / 100)], basis: `Navy tape estimate from ${tape.date} (±3.5 points)` };
    }
  }
  if (d.profile.estimatedBodyFatPct != null) {
    const bf = d.profile.estimatedBodyFatPct;
    const range: [number, number] = [Math.max(3, bf - 3), bf + 3];
    return { bodyFatPct: range, ffmKg: [kg * (1 - range[1] / 100), kg * (1 - range[0] / 100)], basis: 'Your own estimate (±3 points)' };
  }
  return { bodyFatPct: [9, 15], ffmKg: [kg * 0.85, kg * 0.91], basis: 'Assumed 9–15% for a lean, trained man — add a measurement to narrow this.' };
}

// ─── Energy ────────────────────────────────────────────────────────────────

/** Mifflin–St Jeor, or Cunningham when fat-free mass is known (better for lean athletes). */
export function restingEnergy(d: AppData, kg: number): number | null {
  const { heightCm, dob, sex } = d.profile;
  const comp = bodyComposition(d);
  if (comp.ffmKg && !comp.basis.startsWith('Assumed')) return 500 + 22 * ((comp.ffmKg[0] + comp.ffmKg[1]) / 2);
  if (!heightCm || !dob) return null;
  const age = ageOn(dob);
  return 10 * kg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
}

/** Net exercise energy for a day, estimated from logged sessions. */
export function exerciseEnergy(d: AppData, date: ISODate, kg: number): number {
  const run = d.runs.filter((r) => r.date === date).reduce((s, r) => s + 0.95 * kg * r.distanceKm, 0);
  const gym = d.gym.filter((g) => g.date === date).reduce((s, g) => s + 0.07 * kg * (g.durationMin ?? 60), 0);
  return run + gym;
}

export function dayIntake(d: AppData, date: ISODate, kcalOf: (foodId: string, g: number) => number): number | null {
  const entries = d.food.filter((f) => f.date === date);
  if (!entries.length) return null;
  return entries.reduce((s, f) => s + kcalOf(f.foodId, f.grams), 0);
}

export interface EnergyAvailability {
  value: [number, number] | null;
  daysWithIntake: number;
  avgIntake: number | null;
  avgExercise: number | null;
  band: 'adequate' | 'reduced' | 'low' | null;
  note: string;
}

/**
 * Energy availability = (intake − exercise energy) ÷ fat-free mass.
 * ~45 kcal/kg FFM/day supports normal physiology; sustained values under
 * ~30 are where problems with hormones, bone and performance become likely
 * (Mountjoy et al., 2023). Thresholds were derived mostly in women and are
 * less certain for men — so this is a warning light, not a diagnosis.
 */
export function energyAvailability(d: AppData, kcalOf: (foodId: string, g: number) => number, today: ISODate = todayISO()): EnergyAvailability {
  const kg = weightTrend(d, 21, today).latestAvg ?? sortedWeights(d).at(-1)?.kg ?? d.profile.startWeightKg;
  const comp = bodyComposition(d);
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, -i - 1));
  const intakes = days.map((day) => ({ day, kcal: dayIntake(d, day, kcalOf) })).filter((x) => x.kcal != null) as { day: ISODate; kcal: number }[];
  if (!kg || !comp.ffmKg || intakes.length < 4) {
    return { value: null, daysWithIntake: intakes.length, avgIntake: null, avgExercise: null, band: null, note: 'Needs food logged on at least 4 of the last 7 days.' };
  }
  const avgIntake = mean(intakes.map((x) => x.kcal))!;
  const avgExercise = mean(intakes.map((x) => exerciseEnergy(d, x.day, kg)))!;
  const value: [number, number] = [(avgIntake - avgExercise) / comp.ffmKg[1], (avgIntake - avgExercise) / comp.ffmKg[0]];
  const mid = (value[0] + value[1]) / 2;
  const band = mid >= 40 ? 'adequate' : mid >= 30 ? 'reduced' : 'low';
  const note =
    band === 'low'
      ? 'Low energy availability. Short spells happen; weeks of this are linked to hormonal, bone and performance problems. Eat more, especially carbohydrate around training — and if this persists with fatigue, low libido, frequent illness or injuries, see your GP.'
      : band === 'reduced'
        ? 'Reduced — acceptable for a short, deliberate, slow cut. Not a place to stay for months.'
        : 'Adequate for training, adaptation and health.';
  return { value, daysWithIntake: intakes.length, avgIntake, avgExercise, band, note };
}

export interface AdaptiveTdee {
  kcal: number | null;
  days: number;
  note: string;
}

/** Intake minus the energy implied by the weight trend (~7,700 kcal per kg). */
export function adaptiveTdee(d: AppData, kcalOf: (foodId: string, g: number) => number, today: ISODate = todayISO()): AdaptiveTdee {
  const days = Array.from({ length: 21 }, (_, i) => addDays(today, -i - 1));
  const intakes = days.map((day) => dayIntake(d, day, kcalOf)).filter((x): x is number => x != null);
  const trend = weightTrend(d, 21, today);
  if (intakes.length < 14 || !trend.reliable || trend.kgPerWeek == null) {
    return { kcal: null, days: intakes.length, note: 'Needs ~14 days of food logs alongside regular weigh-ins over 3 weeks.' };
  }
  const kcal = mean(intakes)! - (trend.kgPerWeek / 7) * 7700;
  return { kcal, days: intakes.length, note: 'Estimated from your own logs. Food-logging error is typically 10–20%, so treat this as a range.' };
}

// ─── Strength retention ────────────────────────────────────────────────────

export function e1rm(loadKg: number, reps: number, rir = 0): number {
  return loadKg * (1 + (reps + rir) / 30);
}

const KEY_LIFTS = ['incline-db-press', 'flat-bench', 'pull-up', 'lat-pulldown', 'seated-db-press', 'hack-squat', 'rdl'];

export function strengthChange(d: AppData, today: ISODate = todayISO()): { exerciseId: string; changePct: number }[] {
  const out: { exerciseId: string; changePct: number }[] = [];
  const bw = weightTrend(d, 21, today).latestAvg ?? 0;
  for (const id of KEY_LIFTS) {
    const best = (from: ISODate, to: ISODate) => {
      const vals: number[] = [];
      for (const s of d.gym.filter((g) => g.date >= from && g.date <= to)) {
        for (const ex of s.exercises.filter((e) => e.exerciseId === id)) {
          for (const set of ex.sets) {
            const load = id === 'pull-up' ? bw + set.loadKg : set.loadKg;
            if (load > 0 && set.reps > 0 && set.reps <= 15) vals.push(e1rm(load, set.reps, set.rir ?? 0));
          }
        }
      }
      return vals.length ? Math.max(...vals) : null;
    };
    const recent = best(addDays(today, -27), today);
    const prior = best(addDays(today, -55), addDays(today, -28));
    if (recent && prior) out.push({ exerciseId: id, changePct: ((recent - prior) / prior) * 100 });
  }
  return out;
}

// ─── Phase logic ───────────────────────────────────────────────────────────

export interface TargetAssessment {
  verdict: 'proceed-slowly' | 'reconsider' | 'already-there' | 'insufficient-data';
  headline: string;
  points: string[];
}

/**
 * Is losing more weight actually a good idea? Checked against BMI at the
 * target, how lean Dan already is, energy availability, and whether
 * performance and strength are holding.
 */
export function assessWeightTarget(d: AppData, kcalOf: (foodId: string, g: number) => number): TargetAssessment {
  const trend = weightTrend(d);
  const target = d.profile.targetWeightKg;
  const h = d.profile.heightCm;
  const points: string[] = [];
  if (!target || !h) return { verdict: 'insufficient-data', headline: 'Set height and a target range to assess it.', points };
  const current = trend.latestAvg ?? sortedWeights(d).at(-1)?.kg ?? d.profile.startWeightKg;
  if (!current) return { verdict: 'insufficient-data', headline: 'Log a few morning weigh-ins first.', points };

  const bmiNow = bmi(current, h);
  const bmiTarget = bmi(target[0], h);
  const toLose = current - target[1];
  points.push(`BMI now ≈ ${bmiNow.toFixed(1)}; at the bottom of your target ≈ ${bmiTarget.toFixed(1)}. The healthy adult range starts at 18.5 — you are already near its lower end.`);
  if (bmiTarget < 18.5) points.push('Your target sits below a BMI of 18.5. BMI misjudges muscular people, but for a lean runner this is a genuine caution sign.');

  const comp = bodyComposition(d);
  if (comp.bodyFatPct) points.push(`Body fat estimate: ${comp.bodyFatPct[0].toFixed(0)}–${comp.bodyFatPct[1].toFixed(0)}% (${comp.basis}). Below ~10%, further loss costs more muscle and performance per kilo.`);

  const ea = energyAvailability(d, kcalOf);
  if (ea.band === 'low') points.push('Your logged intake already implies low energy availability. Losing more on top of that is the wrong direction.');
  const strength = strengthChange(d);
  const dropping = strength.filter((s) => s.changePct < -3);
  if (dropping.length >= 2) points.push(`${dropping.length} key lifts are down more than 3% over four weeks — a muscle-retention warning.`);

  if (toLose <= 0) return { verdict: 'already-there', headline: 'You are within your target range. Time to reassess, not to keep cutting.', points };

  const reconsider = bmiTarget < 18.5 || ea.band === 'low' || dropping.length >= 2;
  points.push(
    `There are about ${(toLose / 0.4536).toFixed(1)} lb to the top of your range. At 0.25–0.5% of body weight a week that is ~${Math.ceil(toLose / (current * 0.005))}–${Math.ceil(toLose / (current * 0.0025))} weeks — slow enough to keep muscle and run quality.`,
  );
  points.push('The visible change you are after (definition, a sharper face) depends more on muscle, sleep and avoiding puffiness than on the last 1–2 kg.');
  return reconsider
    ? { verdict: 'reconsider', headline: 'Reconsider: the evidence here argues against further loss right now.', points }
    : { verdict: 'proceed-slowly', headline: 'Reasonable — if it is slow, well-fuelled around training, and stops at the range.', points };
}

export interface PhaseCheck {
  label: string;
  met: boolean;
  detail?: string;
}

export interface PhaseEvaluation {
  ready: boolean;
  next: AppData['physiquePhase']['current'] | null;
  checks: PhaseCheck[];
  advice: string;
}

export function evaluatePhysiquePhase(d: AppData, kcalOf: (foodId: string, g: number) => number, today: ISODate = todayISO()): PhaseEvaluation {
  const phase = d.physiquePhase.current;
  const trend = weightTrend(d, 21, today);
  const weeks = weeklyAverages(d);
  const target = d.profile.targetWeightKg;
  const ea = energyAvailability(d, kcalOf, today);
  const strength = strengthChange(d, today);

  if (phase === 'assessment') {
    const recentWeighIns = d.weights.filter((w) => w.date >= addDays(today, -20)).length;
    const checks: PhaseCheck[] = [
      { label: '8+ weigh-ins over at least 12 days', met: trend.reliable, detail: `${recentWeighIns} in the last 3 weeks` },
      { label: 'A waist measurement', met: d.weights.some((w) => w.waistCm) },
      { label: 'Height and target range set', met: !!d.profile.heightCm && !!target },
      { label: 'Two weeks of gym logs (strength baseline)', met: new Set(d.gym.map((g) => startOfWeek(g.date))).size >= 2 },
    ];
    const ready = checks.every((c) => c.met);
    const verdict = assessWeightTarget(d, kcalOf).verdict;
    return {
      ready,
      next: ready ? (verdict === 'reconsider' || verdict === 'already-there' ? 'reassessment' : 'initial-target') : null,
      checks,
      advice: ready
        ? verdict === 'reconsider'
          ? 'Baseline established — and it argues against cutting further. The app suggests going straight to reassessment.'
          : 'Baseline established. A slow approach to your target range is reasonable.'
        : 'Building a baseline. Weigh in on waking, after the toilet, before food — most days, not necessarily all.',
    };
  }
  if (phase === 'initial-target') {
    const inRange = target && weeks.length >= 2 && weeks.slice(-2).every((w) => w.avgKg <= target[1] + 0.2 && w.avgKg >= target[0] - 0.5);
    const tooFast = trend.pctPerWeek != null && trend.pctPerWeek < -0.7;
    const strengthDrop = strength.filter((s) => s.changePct < -3).length >= 2;
    const checks: PhaseCheck[] = [
      { label: 'Two consecutive weekly averages in the target range', met: !!inRange },
      { label: 'Loss rate no faster than 0.7%/week', met: !tooFast, detail: trend.pctPerWeek != null ? `${trend.pctPerWeek.toFixed(2)}%/week` : undefined },
      { label: 'Key lifts holding', met: !strengthDrop },
      { label: 'Energy availability not low', met: ea.band !== 'low', detail: ea.band ?? 'not enough food logs' },
    ];
    const stop = tooFast || strengthDrop || ea.band === 'low';
    return {
      ready: !!inRange || stop,
      next: inRange || stop ? 'reassessment' : null,
      checks,
      advice: stop
        ? 'Warning signs: the cut is costing more than it is giving. The app recommends pausing at maintenance and reassessing.'
        : inRange
          ? 'Target reached. Now reassess — do not keep cutting by default.'
          : 'Keep it slow: small deficit, carbohydrate around quality sessions, protein ~2 g/kg.',
    };
  }
  if (phase === 'reassessment') {
    const checks: PhaseCheck[] = [
      { label: 'Two weeks near maintenance (trend within ±0.25%/week)', met: trend.pctPerWeek != null && Math.abs(trend.pctPerWeek) <= 0.25 && trend.reliable },
      { label: 'Energy availability adequate', met: ea.band === 'adequate', detail: ea.band ?? 'not enough food logs' },
      { label: 'Strength stable or rising', met: strength.every((s) => s.changePct > -2) },
    ];
    return {
      ready: checks.every((c) => c.met),
      next: checks.every((c) => c.met) ? 'long-term' : null,
      checks,
      advice:
        'Eat at maintenance for 2–3 weeks and judge the result with fresh eyes: performance, strength, waist, energy, mood. For most lean runners the best next step is recomposition at maintenance or a very slow lean gain — not more loss.',
    };
  }
  return {
    ready: false,
    next: null,
    checks: [
      { label: 'Strength trending up', met: strength.some((s) => s.changePct > 1) },
      { label: 'Weight change slow (≤ +0.25%/week)', met: trend.pctPerWeek == null || trend.pctPerWeek <= 0.25 },
      { label: 'Energy availability adequate', met: ea.band !== 'low' },
    ],
    advice:
      'Long-term: build muscle at maintenance or a small surplus (+100–250 kcal), progressive overload, priority muscles first. Judge success by strength, measurements and photos — not by a lower number on the scale.',
  };
}

export const PHYSIQUE_PHASE_LABEL: Record<AppData['physiquePhase']['current'], string> = {
  assessment: 'Phase 1 · Assessment',
  'initial-target': 'Phase 2 · Approaching target',
  reassessment: 'Phase 3 · Reassessment',
  'long-term': 'Phase 4 · Long-term physique',
};

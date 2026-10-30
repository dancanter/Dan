import { addDays, diffDays, todayISO, weekday, WEEKDAYS, type ISODate } from '@/lib/dates';
import { SPLIT_LABEL } from '@/data/exercises';
import type { AppData, DayFlag, DayPlan, PlannedRun } from '@/store/types';
import { dayPlan, HARD_PLANNED, prescribe, type Prescription } from './plan';
import { readiness, trainingState, type Readiness, type TrainingState } from './readiness';
import { HARD_TYPES } from './running';
import { targets, type Targets } from './nutrition';
import { suggestStudy, type StudySuggestion } from './study';

export type OptionKey = 'optimal' | 'balanced' | 'recovery';

export interface DayOption {
  key: OptionKey;
  label: string;
  running: { title: string; detail: string[]; prescription: Prescription | null };
  gym: { title: string; detail: string };
  tradeoff: string;
}

export interface Weather {
  tempMax: number;
  precipProb: number;
  uvMax: number;
  code: number;
  sunny: boolean;
}

export interface TodayPlan {
  date: ISODate;
  planned: DayPlan;
  readiness: Readiness;
  state: TrainingState;
  level: 'green' | 'amber' | 'red' | 'unknown';
  recommended: OptionKey;
  options: DayOption[];
  reasons: string[];
  warnings: string[];
  nutrition: { targets: Targets; line: string; timing: string[] };
  recovery: string[];
  study: StudySuggestion;
  lifestyle: string[];
  broughtForward?: { from: ISODate; run: PlannedRun };
}

const hasFlag = (flags: DayFlag[], f: DayFlag) => flags.includes(f);

function lastHardRunDate(d: AppData, before: ISODate): ISODate | null {
  return d.runs.filter((r) => r.date < before && HARD_TYPES.includes(r.type)).map((r) => r.date).sort().at(-1) ?? null;
}

export function buildToday(d: AppData, date: ISODate = todayISO(), weather?: Weather | null): TodayPlan {
  const planned = dayPlan(d, date);
  const c = d.checkIns[date];
  const flags = c?.flags ?? [];
  const r = readiness(d, date);
  const s = trainingState(d, date);
  const reasons: string[] = [];
  const warnings: string[] = [];
  const timeLimited = hasFlag(flags, 'short-time') || (c?.timeAvailableMin != null && c.timeAvailableMin < 60);
  const minutes = c?.timeAvailableMin ?? (hasFlag(flags, 'short-time') ? 45 : null);
  const ill = c?.illness && c.illness !== 'none' ? c.illness : null;
  const alreadyRan = d.runs.some((x) => x.date === date);
  const alreadyLifted = d.gym.some((x) => x.date === date);

  // ── How ready? ──
  let level: TodayPlan['level'] = 'unknown';
  if (ill === 'fever' || ill === 'below-neck') level = 'red';
  else if (r.band === 'low' || hasFlag(flags, 'exhausted')) level = 'red';
  else if (r.band === 'reduced' || s.kind === 'accumulated-fatigue' || s.kind === 'insufficient-recovery' || hasFlag(flags, 'heavy-legs')) level = 'amber';
  else if (r.band === 'high' || r.band === 'normal') level = 'green';

  if (!c) reasons.push('No check-in yet — the recommendation follows your plan. A 20-second check-in makes it adapt to how you actually are.');
  if (r.band) reasons.push(`Readiness: ${r.band}${r.drivers.length ? ` (${r.drivers.slice(0, 3).map((x) => x.label.toLowerCase()).join(', ')})` : ''}.`);
  if (s.kind !== 'steady' && s.kind !== 'insufficient-data') reasons.push(`${s.label}: ${s.summary}`);
  if (r.override) warnings.push(r.override);
  if (ill === 'above-neck') warnings.push('Above-the-neck cold only: an easy run is acceptable if you feel fine once moving. Stop if you feel worse; no hard sessions until it clears.');

  // ── Should the next quality session come forward? ──
  // Only with objective support. Feeling brilliant is welcome — it is not,
  // on its own, a reason to run hard.
  let runPlan: PlannedRun | null = planned.run;
  let broughtForward: TodayPlan['broughtForward'];
  const plannedHard = runPlan != null && HARD_PLANNED.includes(runPlan);
  if (hasFlag(flags, 'brilliant') && !plannedHard) {
    const lastHard = lastHardRunDate(d, date);
    const rested = !lastHard || diffDays(lastHard, date) >= 2;
    const support = r.band === 'high' && ['steady', 'fresh', 'improving', 'insufficient-data'].includes(s.kind) && rested;
    const nextHard = [1, 2].map((i) => addDays(date, i)).find((dt) => {
      const p = dayPlan(d, dt);
      return p.run && HARD_PLANNED.includes(p.run) && p.run !== 'speed';
    });
    if (support && nextHard) {
      broughtForward = { from: nextHard, run: dayPlan(d, nextHard).run! };
      runPlan = broughtForward.run;
      reasons.push(`You feel brilliant and the evidence agrees (high readiness, ${lastHard ? `${diffDays(lastHard, date)} days since the last hard run` : 'no recent hard run'}). The optimal option brings ${WEEKDAYS[weekday(nextHard)]}'s session forward and makes ${WEEKDAYS[weekday(nextHard)]} easy.`);
    } else {
      reasons.push('You feel brilliant — good. But motivation is not readiness, and today is an easy day in the plan. Keep it easy; bank the good feeling for the next quality session.');
    }
  }
  if (hasFlag(flags, 'brilliant') && plannedHard) reasons.push('Feeling brilliant on a quality day: run the session as written, not faster. Fast reps beyond target add fatigue, not fitness.');

  // ── Options ──
  const gymTitle = planned.gym ? SPLIT_LABEL[planned.gym] : null;
  const options: DayOption[] = [];
  const hardToday = runPlan != null && HARD_PLANNED.includes(runPlan);

  const optimalRun = runPlan ? prescribe(d, runPlan) : null;
  options.push({
    key: 'optimal',
    label: 'Optimal performance',
    running: optimalRun
      ? { title: optimalRun.title, detail: [...optimalRun.detail, optimalRun.why], prescription: optimalRun }
      : { title: 'No run today', detail: ['Planned rest from running.'], prescription: null },
    gym: gymTitle
      ? { title: gymTitle, detail: timeLimited ? 'Time-limited: do the first three exercises at full quality, skip the rest.' : hardToday ? 'Run first; lift at least 3–6 h later if you can, or straight after if not.' : 'Full session as programmed.' }
      : { title: 'No gym', detail: planned.extras.length ? `Extras: ${planned.extras.join(', ')}.` : 'Rest from lifting.' },
    tradeoff: hardToday
      ? 'Biggest training stimulus, biggest recovery cost. Worth it when readiness is genuinely there.'
      : 'Follows the plan exactly — consistency is what compounds.',
  });

  const balancedRun = runPlan
    ? hardToday
      ? prescribe(d, runPlan, -1)
      : { ...prescribe(d, runPlan === 'easy-long' ? 'easy' : runPlan), title: runPlan === 'easy-long' ? 'Easy 5 km instead of 5 miles' : 'Easy 20–30 min' }
    : null;
  options.push({
    key: 'balanced',
    label: 'Balanced',
    running: balancedRun
      ? { title: balancedRun.title, detail: hardToday ? ['One rung down the ladder — same paces, less volume.', ...balancedRun.detail] : balancedRun.detail, prescription: balancedRun }
      : { title: 'No run', detail: ['Optional 30–40 min walk.'], prescription: null },
    gym: gymTitle
      ? { title: `${gymTitle} — reduced`, detail: planned.gym === 'legs' ? 'Two-thirds of the sets, stop 3 reps short of failure. Protects the next run.' : 'Two-thirds of the sets; keep the priority exercises (lateral raises, pull-ups, incline press).' }
      : { title: 'No gym', detail: 'Mobility 10 min.' },
    tradeoff: 'Keeps the habit and most of the stimulus while leaving recovery in hand. Usually the right call on an average day.',
  });

  options.push({
    key: 'recovery',
    label: 'Recovery & life',
    running: ill === 'fever' || ill === 'below-neck'
      ? { title: 'No running', detail: ['Rest completely until symptoms and any temperature have gone.'], prescription: null }
      : { title: 'Walk outside, 30–45 min', detail: ['Or an easy 20-minute jog only if it feels good once moving.'], prescription: null },
    gym: { title: 'No lifting', detail: 'Optional: 10 min mobility or a gentle swim.' },
    tradeoff: 'Lose one day of training; often gain the next three. If today is a red day, this is the performance option.',
  });

  let recommended: OptionKey = level === 'red' ? 'recovery' : level === 'amber' ? 'balanced' : 'optimal';
  if (level === 'unknown') recommended = 'optimal';
  if (ill === 'fever' || ill === 'below-neck') recommended = 'recovery';
  if (s.kind === 'accumulated-fatigue' && recommended === 'optimal') recommended = 'balanced';

  if (alreadyRan) reasons.push('A run is already logged today.');
  if (alreadyLifted) reasons.push('Gym already logged today.');
  if (timeLimited) reasons.push(`Only ${minutes ?? 45} minutes: the run takes priority if it is a quality day; the gym shrinks to its key exercises.`);
  if (hasFlag(flags, 'deadline')) reasons.push('Deadline today or close: training stays (exercise helps concentration) but shrinks, and the study blocks come first.');

  // ── Nutrition ──
  const t = targets(d, date);
  const kg = t.bodyweightKg;
  const timing: string[] = [];
  if (hardToday) {
    timing.push(`2–4 h before: a carbohydrate-led meal, ~${Math.round(kg * 1)}–${Math.round(kg * 2)} g carbs, low in fat and fibre.`);
    timing.push('30–60 min before: optional banana or rice cakes.');
    timing.push(`Within ~2 h after: ~${Math.round(kg * 0.35)} g protein plus carbohydrate.`);
  } else if (runPlan || planned.gym) {
    timing.push('Normal meals; no special fuelling needed for an easy run under an hour.');
    timing.push(`Protein ~${Math.round(kg * 0.35)} g at each of 3–4 meals.`);
  } else {
    timing.push('Rest day: lower carbohydrate is fine — keep protein and vegetables high.');
  }
  if (planned.gym) timing.push('Evening lift: a casein-rich snack before bed (cottage cheese, Greek yoghurt).');
  const line = `${Math.round(t.carbs.lo)}–${Math.round(t.carbs.hi)} g carbohydrate, ${Math.round(t.protein.lo)}–${Math.round(t.protein.hi)} g protein, ≥${Math.round(t.fat.lo)} g fat (≈${t.energy.lo}–${t.energy.hi} kcal).`;

  // ── Recovery ──
  const recovery: string[] = [];
  const [lo, hi] = d.profile.sleepTargetHours;
  const wake = c?.wakeTime;
  if (wake) {
    const [h, m] = wake.split(':').map(Number);
    const bed = ((h * 60 + m - lo * 60 - 20 + 1440) % 1440) / 60;
    recovery.push(`Lights out by ~${String(Math.floor(bed)).padStart(2, '0')}:${String(Math.round((bed % 1) * 60)).padStart(2, '0')} for ${lo}+ h asleep (allowing ~20 min to fall asleep).`);
  } else recovery.push(`Aim for ${lo}–${hi} h in bed with a consistent wake time — regularity matters as much as duration.`);
  if (c?.sleepHours != null && c.sleepHours < lo - 1) recovery.push('Short night: a 20-minute nap before 3 pm can help; avoid caffeine after midday.');
  const medDays = Array.from({ length: 7 }, (_, i) => d.checkIns[addDays(date, -i)]?.meditationMin ?? 0).filter((m) => m > 0).length;
  recovery.push(medDays >= 4 ? `Meditation on ${medDays} of the last 7 days — keep the rhythm.` : `Meditation: 10 minutes today (${medDays} of the last 7 days so far).`);

  // ── Study ──
  const study = suggestStudy(d, { fresh: level === 'green', tired: level === 'red' || hasFlag(flags, 'exhausted'), deadline: hasFlag(flags, 'deadline'), timeLimited }, date);

  // ── Life ──
  const lifestyle: string[] = [];
  const lastLife = d.life.filter((l) => l.date <= date).map((l) => l.date).sort().at(-1);
  const sinceLife = lastLife ? diffDays(lastLife, date) : null;
  const sunny = hasFlag(flags, 'sunshine') || weather?.sunny;
  if (sunny) {
    lifestyle.push('Sunshine: run outside, then get out again — a long walk, a café terrace, a park with a book.');
    if (weather && weather.uvMax >= 3) lifestyle.push(`UV ${Math.round(weather.uvMax)}: SPF 50 on face and neck before you go.`);
  }
  if (hasFlag(flags, 'social')) lifestyle.push('Plans with people: protect the evening. Training today should leave you with energy for it.');
  if (sinceLife == null || sinceLife >= 5) lifestyle.push(sinceLife == null ? 'Nothing logged in Lifestyle yet. What would make this week enjoyable, not just productive?' : `${sinceLife} days since you logged something purely for enjoyment. Schedule one.`);
  if (hasFlag(flags, 'deadline')) lifestyle.push('After the study blocks, stop properly — a film or a walk, not more half-work.');
  if (!lifestyle.length) lifestyle.push('Leave the evening relatively free.');

  return { date, planned, readiness: r, state: s, level, recommended, options, reasons, warnings, nutrition: { targets: t, line, timing }, recovery, study, lifestyle, broughtForward };
}

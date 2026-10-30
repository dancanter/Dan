import { addDays, startOfWeek, weekday, WEEKDAYS, type ISODate } from '@/lib/dates';
import { formatDuration, formatPace, repTime } from '@/lib/time';
import { SPLIT_LABEL } from '@/data/exercises';
import type { AppData, DayPlan, PlannedRun } from '@/store/types';
import { currentFitness, LADDERS, ladderLevels, nextQ2Kind, paceZones, type PaceZones, type QualityKind, type SessionTemplate, type Zone } from './running';

export function dayPlan(d: AppData, date: ISODate): DayPlan {
  return d.planOverrides[date] ?? d.planTemplate[weekday(date)] ?? { run: null, gym: null, extras: [] };
}

export function weekDates(date: ISODate): ISODate[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const PLANNED_RUN_LABEL: Record<PlannedRun, string> = {
  easy: 'Easy 5 km',
  'easy-long': 'Easy 5 miles',
  threshold: 'Threshold session',
  q2: 'Second quality session',
  speed: 'Short speed session',
  recovery: 'Recovery jog',
};

export const HARD_PLANNED: PlannedRun[] = ['threshold', 'q2', 'speed'];

export interface Prescription {
  kind: QualityKind | 'easy';
  template?: SessionTemplate;
  title: string;
  detail: string[];
  targetPace?: string;
  targetRep?: string;
  why: string;
  durationMin: number;
}

function paceRange(z: PaceZones, zone: Zone, unit: 'km' | 'mi'): string {
  const [fast, slow] = z[zone];
  return `${formatPace(fast, unit).replace(/\/(km|mi)$/, '')}–${formatPace(slow, unit)}`;
}

export function prescribe(d: AppData, planned: PlannedRun, levelOffset = 0): Prescription {
  const fit = currentFitness(d);
  const zones = fit.vdot ? paceZones(fit.vdot) : null;
  const unit = d.profile.distanceUnit;
  if (planned === 'easy' || planned === 'easy-long' || planned === 'recovery') {
    const km = planned === 'easy' ? 5 : planned === 'easy-long' ? 8 : 4;
    const easyPace = zones ? paceRange(zones, 'E', unit) : 'conversational';
    return {
      kind: 'easy',
      title: planned === 'recovery' ? 'Recovery jog, 20–25 min' : planned === 'easy' ? 'Easy 5 km + 4 strides' : 'Easy 5 miles (8 km)',
      detail: [
        `Pace: ${easyPace} — or simply conversational. If in doubt, slower.`,
        planned === 'recovery' ? 'Optional. A walk does the same job.' : 'Finish with 4 × 15–20 s relaxed strides (not sprints) to keep mechanics sharp.',
      ],
      targetPace: easyPace,
      why: 'Easy running builds the aerobic base — capillaries, mitochondria, tendon resilience — at a cost low enough to recover from by tomorrow. It only works if it is genuinely easy.',
      durationMin: zones ? Math.round((km * ((zones.E[0] + zones.E[1]) / 2)) / 60) : km * 5.5,
    };
  }
  const kind: QualityKind = planned === 'threshold' ? 'threshold' : planned === 'speed' ? 'speed' : nextQ2Kind(d);
  const levels = ladderLevels(d, zones);
  const ladder = LADDERS[kind];
  const level = Math.max(1, Math.min(ladder.length, levels[kind] + levelOffset));
  const t = ladder[level - 1];
  const detail: string[] = ['Warm-up: 12–15 min easy, drills, 3–4 strides.'];
  let targetPace: string | undefined;
  let targetRep: string | undefined;
  if (t.zone && zones) {
    targetPace = paceRange(zones, t.zone, unit);
    if (t.distanceM) {
      const [fast, slow] = zones[t.zone];
      targetRep = `${formatDuration(repTime(fast, t.distanceM))}–${formatDuration(repTime(slow, t.distanceM))} per ${t.distanceM} m`;
    }
    detail.push(`Reps: ${t.title} — ${targetRep ?? targetPace}. Recovery: ${t.recovery}.`);
  } else {
    detail.push(`Reps: ${t.title}. Recovery: ${t.recovery}.`);
    if (t.zone && !zones) detail.push('Add a recent race or time trial so the app can set exact paces.');
  }
  detail.push('Cool-down: 10 min easy.');
  if (kind === 'speed') detail.push('Stop the session if reps stop feeling fast and relaxed — fatigue turns sprinting into injury risk.');
  const repTotal = t.distanceM ? (t.count * t.distanceM) / 1000 : 0;
  return {
    kind,
    template: t,
    title: t.title,
    detail,
    targetPace,
    targetRep,
    why: `${t.purpose} You are on rung ${level} of ${ladder.length}${levelOffset < 0 ? ' (stepped down today)' : ''}.`,
    durationMin: Math.round(30 + repTotal * 4),
  };
}

export interface PlanWarning {
  date: ISODate;
  message: string;
}

/** Spots the arrangements that most often go wrong when sessions are moved. */
export function validateWeek(d: AppData, anyDate: ISODate): PlanWarning[] {
  const dates = weekDates(anyDate);
  const plans = dates.map((dt) => ({ dt, p: dayPlan(d, dt) }));
  const out: PlanWarning[] = [];
  plans.forEach(({ dt, p }, i) => {
    const prev = plans[i - 1]?.p ?? dayPlan(d, addDays(dt, -1));
    const isHard = p.run != null && HARD_PLANNED.includes(p.run);
    const prevHard = prev.run != null && HARD_PLANNED.includes(prev.run);
    if (isHard && prevHard && (p.run !== 'speed' || prev.run !== 'speed')) {
      out.push({ date: dt, message: `${WEEKDAYS[weekday(dt)]}: two hard running days in a row. Put an easy or rest day between them.` });
    }
    if (isHard && p.run !== 'speed' && prev.gym === 'legs') {
      out.push({ date: dt, message: `${WEEKDAYS[weekday(dt)]}: quality run the day after legs. Expect it to feel harder — or move legs to the evening of a hard day.` });
    }
  });
  const rest = plans.filter(({ p }) => !p.run && !p.gym).length;
  if (rest === 0) out.push({ date: dates[6], message: 'No full rest day this week. At least one is non-negotiable.' });
  const hard = plans.filter(({ p }) => p.run && HARD_PLANNED.includes(p.run)).length;
  if (hard > 3) out.push({ date: dates[0], message: `${hard} hard running sessions planned — more than three a week is rarely productive.` });
  return out;
}

export function describeDay(p: DayPlan): string {
  const parts: string[] = [];
  if (p.run) parts.push(PLANNED_RUN_LABEL[p.run]);
  if (p.gym) parts.push(SPLIT_LABEL[p.gym]);
  if (!parts.length) parts.push('Rest');
  return parts.join(' · ');
}

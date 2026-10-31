import { addDays, todayISO, weekday, type ISODate } from '@/lib/dates';
import { formatDuration } from '@/lib/time';
import type { AppData, CheckIn, RunEvent } from '@/store/types';
import { analyseRun, currentFitness, EVENT_LABEL, fitnessMarkers, HARD_TYPES, paceZones } from './running';

// Achievements reward the behaviours that move Dan's goals — turning up,
// sleeping, keeping easy runs easy, resting on rest days, studying — and
// never reward more intensity. Everything is worked out from the logs, so
// nothing can be unlocked by tapping a button, and demo data never counts.

export type AchievementGroup = 'Consistency' | 'Running' | 'Gym' | 'Recovery' | 'Study' | 'Habits' | 'Body & life' | 'Goals';

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  detail: string;
  group: AchievementGroup;
  value: number;
  target: number;
  unlocked: boolean;
  /** Shown instead of value/target where a plain count would mislead. */
  progressLabel?: string;
}

export interface DayScore {
  score: number;
  parts: { label: string; points: number; earned: boolean }[];
}

export interface Rank {
  level: number;
  name: string;
  xp: number;
  floor: number;
  next: number | null;
  nextName: string | null;
}

const RANKS: [number, string][] = [
  [0, 'Rookie'],
  [300, 'Novice'],
  [1000, 'Club athlete'],
  [2500, 'County'],
  [5000, 'Regional'],
  [9000, 'National'],
  [15000, 'International'],
  [25000, 'Olympian'],
];

const real = <T extends { demo?: boolean }>(xs: T[]) => xs.filter((x) => !x.demo);

function realCheckIns(d: AppData): Record<ISODate, CheckIn> {
  return Object.fromEntries(Object.entries(d.checkIns).filter(([, c]) => !c.demo));
}

/** Days on which anything at all was logged. */
export function loggedDays(d: AppData): Set<ISODate> {
  const days = new Set<ISODate>(Object.keys(realCheckIns(d)));
  for (const list of [d.runs, d.gym, d.weights, d.study, d.food] as { date: ISODate; demo?: boolean }[][]) {
    for (const x of list) if (!x.demo) days.add(x.date);
  }
  return days;
}

/** Consecutive days ending today — or yesterday, if today is not logged yet. */
export function currentStreak(test: (day: ISODate) => boolean, today: ISODate = todayISO()): number {
  let day = test(today) ? today : addDays(today, -1);
  let n = 0;
  while (test(day) && n < 3660) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

function longestStreak(days: ISODate[], test: (day: ISODate) => boolean): number {
  let best = 0;
  for (const day of days) {
    if (test(addDays(day, -1)) || !test(day)) continue; // only count from the start of a run
    let n = 0;
    let x = day;
    while (test(x) && n < 3660) {
      n++;
      x = addDays(x, 1);
    }
    best = Math.max(best, n);
  }
  return best;
}

export function dayScore(d: AppData, date: ISODate): DayScore {
  const c = d.checkIns[date]?.demo ? undefined : d.checkIns[date];
  const ran = real(d.runs).some((r) => r.date === date);
  const lifted = real(d.gym).some((g) => g.date === date);
  const weighed = real(d.weights).some((w) => w.date === date);
  const studied = real(d.study).some((s) => s.date === date && s.minutes > 0);
  const isRest = weekday(date) === d.profile.restDay;
  const habits = c?.habits ?? [];
  const habitCount = habits.length + ((c?.meditationMin ?? 0) > 0 ? 1 : 0);
  const parts = [
    { label: 'Morning logged', points: 20, earned: !!(weighed || c?.sleepHours != null || c?.energy != null) },
    { label: `Sleep ${d.profile.sleepTargetHours[0]} h+`, points: 20, earned: (c?.sleepHours ?? 0) >= d.profile.sleepTargetHours[0] },
    { label: `${d.profile.stepsTarget.toLocaleString('en-GB')} steps`, points: 15, earned: (c?.steps ?? 0) >= d.profile.stepsTarget },
    { label: 'Study', points: 15, earned: studied },
    isRest
      ? { label: 'Rest day kept', points: 15, earned: !!c && !ran && !lifted }
      : { label: 'Trained', points: 15, earned: ran || lifted },
    { label: `Habits (${Math.min(habitCount, 5)}/5)`, points: 15, earned: habitCount >= 5 },
  ];
  // Habits are partly earned: 3 points each.
  const score = parts.reduce((s, p) => s + (p.label.startsWith('Habits') ? Math.min(habitCount, 5) * 3 : p.earned ? p.points : 0), 0);
  return { score, parts };
}

function best(d: AppData, event: RunEvent): number | null {
  const times = fitnessMarkers({ ...d, runs: real(d.runs), performances: real(d.performances) }).filter((m) => m.event === event).map((m) => m.timeSec);
  return times.length ? Math.min(...times) : null;
}

export function achievements(d: AppData, today: ISODate = todayISO()): Achievement[] {
  const runs = real(d.runs);
  const gym = real(d.gym);
  const study = real(d.study);
  const checkIns = realCheckIns(d);
  const ci = Object.values(checkIns);
  const days = [...loggedDays(d)].sort();
  const allDays = [...new Set([...days, ...Object.keys(checkIns)])].sort();
  const fit = currentFitness(d, today);
  const zones = fit.vdot ? paceZones(fit.vdot) : null;
  const analysed = runs.map((r) => ({ r, a: analyseRun(r, zones) }));
  const km = runs.reduce((s, r) => s + r.distanceKm, 0);
  const studyHours = study.reduce((s, x) => s + x.minutes, 0) / 60;
  const logged = new Set(days);
  const scores = new Map(allDays.map((day) => [day, dayScore(d, day).score]));
  const has = (day: ISODate, h: string) => checkIns[day]?.habits?.includes(h as never) ?? false;
  const sleepOk = (day: ISODate) => (checkIns[day]?.sleepHours ?? 0) >= d.profile.sleepTargetHours[0];

  const list: Omit<Achievement, 'unlocked'>[] = [
    // Consistency
    { id: 'first-day', emoji: '📝', title: 'First page', detail: 'Log your first day.', group: 'Consistency', value: days.length, target: 1 },
    { id: 'streak-3', emoji: '🔥', title: 'Three in a row', detail: 'Log three days running.', group: 'Consistency', value: longestStreak(days, (x) => logged.has(x)), target: 3 },
    { id: 'streak-7', emoji: '🔥', title: 'Full week', detail: 'Log seven days running.', group: 'Consistency', value: longestStreak(days, (x) => logged.has(x)), target: 7 },
    { id: 'streak-30', emoji: '🏆', title: 'Thirty days', detail: 'Log thirty days running. Habits are built here.', group: 'Consistency', value: longestStreak(days, (x) => logged.has(x)), target: 30 },
    { id: 'perfect-day', emoji: '💯', title: 'Perfect day', detail: 'Score 100 in a day: morning logged, sleep, steps, study, training or rest, and all five habits.', group: 'Consistency', value: Math.max(0, ...scores.values()), target: 100 },
    { id: 'strong-week', emoji: '⭐', title: 'Strong week', detail: 'Seven days running scoring 70 or more.', group: 'Consistency', value: longestStreak(allDays, (x) => (scores.get(x) ?? 0) >= 70), target: 7 },
    // Running
    { id: 'km-100', emoji: '👟', title: 'First hundred', detail: '100 km logged.', group: 'Running', value: Math.floor(km), target: 100 },
    { id: 'km-250', emoji: '👟', title: 'Two-fifty', detail: '250 km logged.', group: 'Running', value: Math.floor(km), target: 250 },
    { id: 'km-500', emoji: '🛣️', title: 'Five hundred', detail: '500 km logged.', group: 'Running', value: Math.floor(km), target: 500 },
    { id: 'km-1000', emoji: '🌍', title: 'Thousand', detail: '1,000 km logged.', group: 'Running', value: Math.floor(km), target: 1000 },
    { id: 'easy-easy', emoji: '🐢', title: 'Easy means easy', detail: 'Ten easy runs kept in your easy zone. This is where most aerobic fitness comes from.', group: 'Running', value: analysed.filter(({ a }) => a.verdict === 'easy-ok').length, target: 10 },
    { id: 'in-control', emoji: '🎯', title: 'In control', detail: 'Three threshold sessions run on target pace, not faster.', group: 'Running', value: analysed.filter(({ r, a }) => r.type === 'threshold' && a.deviationPct === 0).length, target: 3 },
    { id: 'benchmark', emoji: '🏁', title: 'Benchmark', detail: 'Log a time trial or race, so your paces stay honest.', group: 'Running', value: runs.filter((r) => r.type === 'time-trial' || r.type === 'race').length, target: 1 },
    { id: 'runs-50', emoji: '🏃', title: 'Fifty runs', detail: 'Fifty runs logged.', group: 'Running', value: runs.length, target: 50 },
    // Gym
    { id: 'gym-1', emoji: '💪', title: 'First session', detail: 'Log a gym session.', group: 'Gym', value: gym.length, target: 1 },
    { id: 'gym-12', emoji: '💪', title: 'Twelve sessions', detail: 'About three weeks of the four-day split.', group: 'Gym', value: gym.length, target: 12 },
    { id: 'gym-48', emoji: '🦾', title: 'Forty-eight', detail: 'About three months of the split.', group: 'Gym', value: gym.length, target: 48 },
    { id: 'overload', emoji: '📈', title: 'Progressive overload', detail: 'Ten sessions with sets logged, so the programme can add weight.', group: 'Gym', value: gym.filter((g) => g.exercises.length > 0).length, target: 10 },
    // Recovery
    { id: 'sleep-week', emoji: '😴', title: 'Sleep week', detail: `Seven nights running at ${d.profile.sleepTargetHours[0]} h or more in bed.`, group: 'Recovery', value: longestStreak(allDays, sleepOk), target: 7 },
    { id: 'rest-kept', emoji: '🛋️', title: 'Rest is training', detail: 'Four rest days logged with no training on them.', group: 'Recovery', value: allDays.filter((x) => weekday(x) === d.profile.restDay && checkIns[x] && !runs.some((r) => r.date === x) && !gym.some((g) => g.date === x)).length, target: 4 },
    {
      id: 'listened', emoji: '🧠', title: 'Listened to your body', detail: 'On a day you logged pain, sore or heavy legs, or exhaustion, you didn’t run hard.', group: 'Recovery',
      value: ci.filter((c) => (c.niggle || c.legs === 'sore' || c.legs === 'heavy' || c.flags.includes('exhausted') || c.flags.includes('heavy-legs')) && !runs.some((r) => r.date === c.date && HARD_TYPES.includes(r.type))).length, target: 1,
    },
    { id: 'step-week', emoji: '🚶', title: 'Step week', detail: `Seven days running at ${d.profile.stepsTarget.toLocaleString('en-GB')} steps.`, group: 'Recovery', value: longestStreak(allDays, (x) => (checkIns[x]?.steps ?? 0) >= d.profile.stepsTarget), target: 7 },
    // Study
    { id: 'study-10', emoji: '📚', title: 'Ten hours', detail: 'Ten hours of study logged.', group: 'Study', value: Math.floor(studyHours), target: 10 },
    { id: 'study-50', emoji: '📚', title: 'Fifty hours', detail: 'Fifty hours logged — most of a module’s core reading.', group: 'Study', value: Math.floor(studyHours), target: 50 },
    { id: 'study-150', emoji: '🎓', title: 'Distinction hours', detail: '150 hours logged.', group: 'Study', value: Math.floor(studyHours), target: 150 },
    { id: 'study-streak', emoji: '🗓️', title: 'Five study days', detail: 'Study on five days running. Little and often beats cramming.', group: 'Study', value: longestStreak([...new Set(study.map((s) => s.date))].sort(), (x) => study.some((s) => s.date === x && s.minutes > 0)), target: 5 },
    // Habits
    { id: 'skin-14', emoji: '✨', title: 'Skin routine', detail: 'Morning and evening skincare on fourteen days.', group: 'Habits', value: allDays.filter((x) => has(x, 'skin-am') && has(x, 'skin-pm')).length, target: 14 },
    { id: 'no-phone-7', emoji: '📵', title: 'Phone out of bed', detail: 'Seven nights running with no phone in bed.', group: 'Habits', value: longestStreak(allDays, (x) => has(x, 'no-phone')), target: 7 },
    { id: 'teeth-30', emoji: '🦷', title: 'Thirty smiles', detail: 'Teeth and floss on thirty days.', group: 'Habits', value: allDays.filter((x) => has(x, 'teeth')).length, target: 30 },
    { id: 'meditate-10', emoji: '🧘', title: 'Ten sits', detail: 'Meditated on ten days.', group: 'Habits', value: ci.filter((c) => (c.meditationMin ?? 0) > 0).length, target: 10 },
    // Body & life
    { id: 'weigh-14', emoji: '⚖️', title: 'Trend, not a number', detail: 'Fourteen morning weigh-ins: enough for a real trend.', group: 'Body & life', value: real(d.weights).length, target: 14 },
    { id: 'life-5', emoji: '🌿', title: 'Enjoy being alive', detail: 'Five things logged in Lifestyle.', group: 'Body & life', value: real(d.life).length, target: 5 },
  ];

  // Goals: one per running goal, unlocked by an actual result at or under it.
  for (const g of d.runGoals) {
    const b = best(d, g.event);
    const done = b != null && b <= g.targetSec;
    const tenths = g.targetSec < 120;
    list.push({
      id: `goal-${g.event}-${g.targetSec}`,
      emoji: '🥇',
      title: g.label ? (/km|mile|\d ?m\b/i.test(g.label) ? g.label : `${g.label} ${EVENT_LABEL[g.event].toLowerCase()}`) : `${EVENT_LABEL[g.event]} in ${formatDuration(g.targetSec, { tenths })}`,
      detail: `Run ${EVENT_LABEL[g.event]} in ${formatDuration(g.targetSec, { tenths })} or faster in a race or time trial.`,
      group: 'Goals',
      value: done ? 100 : b ? Math.min(99, Math.round((g.targetSec / b) * 100)) : 0,
      target: 100,
      progressLabel: b ? `Best ${formatDuration(b, { tenths })} · ${done ? 'done' : `${formatDuration(b - g.targetSec, { tenths: true })} to go`}` : 'No result yet',
    });
  }

  return list.map((a) => ({ ...a, value: Math.max(0, a.value), unlocked: a.value >= a.target }));
}

export function rank(d: AppData, list: Achievement[] = achievements(d)): Rank {
  const days = [...new Set([...loggedDays(d), ...Object.keys(realCheckIns(d))])];
  const xp = days.reduce((s, day) => s + dayScore(d, day).score, 0) + list.filter((a) => a.unlocked).length * 50;
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1][0]) i++;
  return { level: i + 1, name: RANKS[i][1], xp, floor: RANKS[i][0], next: RANKS[i + 1]?.[0] ?? null, nextName: RANKS[i + 1]?.[1] ?? null };
}

/** Locked achievements closest to done, for "next up". */
export function nextUp(list: Achievement[], n = 3): Achievement[] {
  return list
    .filter((a) => !a.unlocked && a.group !== 'Goals' && a.value > 0)
    .sort((a, b) => b.value / b.target - a.value / a.target)
    .slice(0, n);
}

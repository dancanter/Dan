import { RITUALS } from '@/data/science';
import { addDays, ageOn, energyAvailability, sleepHours, sleepScore, sortByDate, todayISO } from './body';
import { analyseDay, targetsFor, type DayAnalysis } from './score';
import { resolveItems, type State } from '@/store';
import { PLANT_CATEGORIES } from '@/data/foods';
import { vitalityScore } from './vitals';
import { kcalForDate } from './season';
import { trainingKcalOn } from './training';

export interface DayResult {
  date: string;
  analysis: DayAnalysis;
  sleep?: ReturnType<typeof sleepScore>;
  ritualScore?: number;
  vitality?: number;
  glow: number;
  hasData: boolean;
  weightKg?: number;
  ea?: number;
}

export function weightOn(s: State, date: string): number | undefined {
  const w = sortByDate(s.weights).filter((x) => x.date <= date);
  return w.length ? w[w.length - 1].kg : sortByDate(s.weights)[0]?.kg;
}

export function dayResult(s: State, date: string): DayResult {
  const log = s.days[date];
  const items = resolveItems(log, s);
  const kg = weightOn(s, date);
  const t = targetsFor({ ...s.profile, kcalTarget: kcalForDate(s.profile, date, kg).kcal }, kg);
  const sleeps = sortByDate(s.sleeps).filter((e) => e.date <= date);
  const sleepEntry = sleeps.find((e) => e.date === date);
  const sleep = sleepEntry ? sleepScore(sleepEntry, sleeps.slice(-7)) : undefined;
  // Energy availability uses the day's actual training energy when sessions are logged.
  const trainKcal = kg ? trainingKcalOn(s.training, date, kg) : undefined;
  const eaProfile = trainKcal !== undefined ? { ...s.profile, exerciseKcal: trainKcal } : s.profile;
  const ea = kg && items.length ? energyAvailability(items.reduce((a, i) => a + (i.food.n.kcal * i.grams) / 100, 0), eaProfile, kg) : undefined;
  const analysis = analyseDay(items, t, {
    sleepScore: sleep?.score,
    energyAvailability: ea,
    glutenFree: s.profile.glutenFree,
    inProgress: date === todayISO(),
  });
  const totalPts = RITUALS.reduce((a, r) => a + r.points, 0);
  const done = (log?.rituals ?? []).reduce((a, id) => a + (RITUALS.find((r) => r.id === id)?.points ?? 0), 0);
  // Ten good points out of the full list counts as a perfect rituals day.
  const ritualScore = log?.rituals.length ? Math.min(100, Math.round((done / Math.min(totalPts, 10)) * 100)) : undefined;

  const vitality = vitalityScore(date, s.vitals ?? {}, kg);
  const parts: [number, number][] = [];
  if (items.length) parts.push([analysis.nutritionScore, 0.45]);
  if (sleep) parts.push([sleep.score, 0.25]);
  if (ritualScore !== undefined) parts.push([ritualScore, 0.15]);
  if (vitality !== undefined) parts.push([vitality, 0.15]);
  const w = parts.reduce((a, p) => a + p[1], 0);
  const glow = w ? Math.round(parts.reduce((a, p) => a + p[0] * p[1], 0) / w) : 0;
  return { date, analysis, sleep, ritualScore, vitality, glow, hasData: parts.length > 0, weightKg: kg, ea };
}

// ── Ranks ───────────────────────────────────────────────────────────────
export const RANKS = [
  { xp: 0, name: 'Spark', line: 'Every legend starts with a first entry.' },
  { xp: 400, name: 'Kindled', line: 'Your cells have noticed.' },
  { xp: 1200, name: 'Radiant', line: 'People are starting to ask what you’ve changed.' },
  { xp: 3000, name: 'Luminous', line: 'Mitochondria running like a Swiss watch.' },
  { xp: 6000, name: 'Golden Hour', line: 'That Riviera glow, earned rather than bought.' },
  { xp: 10000, name: 'Delon', line: 'Effortless, because the effort is invisible.' },
  { xp: 16000, name: 'Ageless', line: 'Your biological clock is running slow.' },
];

export function xpTotal(s: State): number {
  return allDates(s).reduce((a, d) => a + dayResult(s, d).glow, 0);
}

export function rankFor(xp: number) {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].xp) i++;
  const next = RANKS[i + 1];
  return { rank: RANKS[i], next, progress: next ? (xp - RANKS[i].xp) / (next.xp - RANKS[i].xp) : 1 };
}

export function allDates(s: State): string[] {
  const set = new Set<string>([...Object.keys(s.days), ...s.sleeps.map((e) => e.date), ...Object.keys(s.vitals ?? {})]);
  return [...set].sort();
}

/** Consecutive days, ending today (or yesterday if today is still empty), with something logged. */
export function streak(s: State, today = todayISO()): number {
  const has = (d: string) => dayResult(s, d).hasData;
  let d = has(today) ? today : addDays(today, -1);
  let n = 0;
  while (has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

// ── Daily quest ─────────────────────────────────────────────────────────
export interface Quest {
  id: string;
  title: string;
  hint: string;
  done: (r: DayResult, s: State) => boolean;
}

export const QUESTS: Quest[] = [
  { id: 'plants8', title: 'Eat 8 different plants', hint: 'Herbs, spices, nuts and seeds all count.', done: (r) => r.analysis.plants >= 8 },
  { id: 'oily', title: 'Hit 0.5 g of omega-3', hint: 'One portion of salmon, mackerel or sardines does it.', done: (r) => r.analysis.totals.omega3 >= 0.5 },
  { id: 'ferm2', title: 'Two fermented foods', hint: 'Kefir plus a spoon of sauerkraut or kimchi.', done: (r) => (r.analysis.tagServings.ferm ?? 0) >= 2 },
  // Dan avoids brassicas (broccoli, kale, sprouts, cabbage): the third colour is a fermented food instead.
  { id: 'rainbow', title: 'Rainbow plate: orange, purple and fermented', hint: 'Carotenoids, polyphenols and kefir or yoghurt in one day.', done: (r) => (r.analysis.tagServings.carot ?? 0) >= 1 && (r.analysis.tagServings.poly ?? 0) >= 2 && (r.analysis.tagServings.ferm ?? 0) >= 1 },
  { id: 'noupf', title: 'Zero ultra-processed food', hint: 'Everything you eat today is something you could cook from scratch.', done: (r, s) => resolveItems(s.days[r.date], s).length >= 3 && !resolveItems(s.days[r.date], s).some((i) => i.food.nova === 4) },
  { id: 'fibre30', title: '30 g of fibre', hint: 'Raspberries, potatoes in their skins, GF oats, chia.', done: (r) => r.analysis.totals.fibre >= 30 },
  { id: 'coverage90', title: '90% micronutrient coverage', hint: 'Eggs, oily fish or red meat, pumpkin seeds, kefir and berries.', done: (r) => r.analysis.coverage >= 0.9 },
  { id: 'sleep8', title: 'Sleep 8 hours', hint: 'Count back from your alarm and set a wind-down reminder.', done: (r) => (r.sleep?.hours ?? 0) >= 8 },
  { id: 'breath10', title: '10 minutes of slow breathing', hint: 'Use the pacer in Rituals.', done: (r, s) => (s.breathMinutes[r.date] ?? 0) >= 10 },
  { id: 'cvit', title: '150 mg vitamin C for collagen', hint: 'A red pepper plus two kiwis.', done: (r) => r.analysis.totals.vitC >= 150 },
  { id: 'nitrate', title: 'Nitrate hit for your mitochondria', hint: 'Beetroot, celery or radishes.', done: (r) => (r.analysis.tagServings.nitr ?? 0) >= 1 },
  { id: 'steps', title: 'Land in the step sweet spot (8–14k)', hint: 'A 10-minute walk after each meal does most of it.', done: (r, s) => { const v = s.vitals?.[r.date]?.steps ?? 0; return v >= 8000 && v <= 14000; } },
  { id: 'outside30', title: '30 minutes outside, some of it before 10am', hint: 'Morning daylight on your eyes sets tonight’s sleep.', done: (r, s) => (s.vitals?.[r.date]?.outdoorMin ?? 0) >= 30 },
  { id: 'postmeal', title: 'Rainbow + walk: 5 plants and 10k steps', hint: 'Gut and glucose in one quest.', done: (r, s) => r.analysis.plants >= 5 && (s.vitals?.[r.date]?.steps ?? 0) >= 10000 },
  { id: 'sugar10', title: 'Under 10 g free sugar', hint: 'No juice, no honey, no sweets.', done: (r, s) => resolveItems(s.days[r.date], s).length >= 2 && r.analysis.freeSugar <= 10 },
];

export function questFor(date: string): Quest {
  let h = 0;
  for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return QUESTS[h % QUESTS.length];
}

// ── Badges ──────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  emoji: string;
  title: string;
  how: string;
  earned: boolean;
}

export function badges(s: State): Badge[] {
  const dates = allDates(s);
  const results = dates.map((d) => dayResult(s, d));
  const count = (f: (r: DayResult) => boolean) => results.filter(f).length;
  const organDays = dates.filter((d) => resolveItems(s.days[d], s).some((i) => i.food.category === 'offal' && i.food.id !== 'bone-broth' && i.food.id !== 'collagen-powder')).length;
  const breathTotal = Object.values(s.breathMinutes).reduce((a, b) => a + b, 0);
  const plantWeek = (() => {
    let best = 0;
    for (const d of dates) {
      const ids = new Set<string>();
      for (let k = 0; k < 7; k++) {
        for (const i of resolveItems(s.days[addDays(d, -k)], s)) if (PLANT_CATEGORIES.includes(i.food.category)) ids.add(i.food.id);
      }
      best = Math.max(best, ids.size);
    }
    return best;
  })();
  const sleep8 = s.sleeps.filter((e) => sleepHours(e) >= 8).length;
  const st = streak(s);
  const longest = (() => {
    let best = 0;
    let run = 0;
    let prev = '';
    for (const r of results) {
      if (!r.hasData) continue;
      run = prev && addDays(prev, 1) === r.date ? run + 1 : 1;
      prev = r.date;
      best = Math.max(best, run);
    }
    return Math.max(best, st);
  })();
  return [
    { id: 'first', emoji: '🌱', title: 'First light', how: 'Log your first day', earned: results.some((r) => r.hasData) },
    { id: 'streak7', emoji: '🔥', title: 'Week of fire', how: 'A 7-day logging streak', earned: longest >= 7 },
    { id: 'streak30', emoji: '☀️', title: 'Month of sun', how: 'A 30-day logging streak', earned: longest >= 30 },
    { id: 'glow80', emoji: '✨', title: 'Glowing', how: 'A Glow score of 80+', earned: results.some((r) => r.glow >= 80) },
    { id: 'glow90', emoji: '💎', title: 'Diamond day', how: 'A Glow score of 90+', earned: results.some((r) => r.glow >= 90) },
    { id: 'omega', emoji: '🐟', title: 'Omega hunter', how: 'Hit the omega-3 target on 10 days', earned: count((r) => r.analysis.totals.omega3 >= 0.5) >= 10 },
    { id: 'offal', emoji: '🫀', title: 'Nose to tail', how: 'Organ meat on 5 different days', earned: organDays >= 5 },
    { id: 'plants30', emoji: '🌈', title: 'Thirty plants', how: '30 different plants in any 7 days', earned: plantWeek >= 30 },
    { id: 'sleep', emoji: '🌙', title: 'Sleep monk', how: '7 nights of 8+ hours', earned: sleep8 >= 7 },
    { id: 'zen', emoji: '🧘', title: 'Still water', how: '60 minutes of slow breathing in total', earned: breathTotal >= 60 },
    { id: 'clean', emoji: '🛡️', title: 'Clean week', how: '7 logged days with no ultra-processed food', earned: count((r) => r.analysis.wins.includes('Zero ultra-processed food')) >= 7 },
    { id: 'coverage', emoji: '🎯', title: 'Full spectrum', how: '100% average micronutrient coverage in a day', earned: results.some((r) => r.analysis.coverage >= 0.99) },
    { id: 'sun', emoji: '🌤️', title: 'Sun chaser', how: '30+ minutes outdoors on 7 days', earned: Object.values(s.vitals ?? {}).filter((v) => (v.outdoorMin ?? 0) >= 30).length >= 7 },
    { id: 'stepper', emoji: '👟', title: 'Sweet-spot strider', how: '8–14k steps on 10 days', earned: Object.values(s.vitals ?? {}).filter((v) => (v.steps ?? 0) >= 8000 && (v.steps ?? 0) <= 14000).length >= 10 },
    { id: 'heart', emoji: '🫀', title: 'Know your heart', how: '14 morning heart rates logged', earned: Object.values(s.vitals ?? {}).filter((v) => v.rhr).length >= 14 },
    { id: 'all4', emoji: '🌟', title: 'Full house', how: 'Food, sleep, rituals and vitals all logged in one day', earned: results.some((r) => r.analysis.totals.kcal > 0 && r.sleep && r.ritualScore !== undefined && r.vitality !== undefined) },
    { id: 'weigh', emoji: '⚖️', title: 'Data, not drama', how: '14 weigh-ins logged', earned: s.weights.length >= 14 },
  ];
}

export function ageToday(s: State): number {
  return ageOn(s.profile.dob, todayISO());
}

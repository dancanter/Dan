import { addDays, sleepHours, sortByDate } from './body';
import { cleanWeights, nextMoves, studyLoad } from './calls';
import { dayResult } from './game';
import { assessLoad, weeklySets } from './training';
import { resolveItems, type State } from '@/store';
import { PILLARS, RITUALS } from '@/data/science';
import { MICROS, NUTRIENTS, type NKey } from '@/data/nutrients';
import { FOODS, type Food, type Tag } from '@/data/foods';
import { targetsFor } from './score';
import { phaseOn } from './season';
import { weightOn } from './game';

// The weekly review: this week (7 days ending on `end`) against the week
// before, across everything Glow tracks. Improvements and slips are only
// called when there's enough data on both sides to compare.

export interface Metric { key: string; label: string; now?: number; prev?: number; unit: string; better: 'up' | 'down' | 'range'; fmt?: (v: number) => string; target?: string }
export interface Review {
  start: string; end: string;
  metrics: Metric[];
  wins: string[];
  slips: string[];
  focus: string[];
  grade: string;
  score: number;
  daysLogged: number;
  cellular: Cellular;
  sinceStart?: SinceStart;
}

/** The cellular / anti-ageing view of a week: pillars, nutrients, the foods behind them, and the stressors. */
export interface Cellular {
  pillars: { id: string; name: string; emoji: string; now?: number; prev?: number }[];
  coverage: { now?: number; prev?: number };
  strongest: { key: NKey; label: string; pct: number }[];
  weakest: { key: NKey; label: string; pct: number; foods: string[] }[];
  topFoods: { name: string; days: number }[];
  helpers: { label: string; now: number; prev: number }[];
  stressors: { label: string; now: number; prev: number }[];
  verdict: string;
}
export interface SinceStart { from: string; rows: { label: string; first: string; now: string; better: boolean | undefined }[] }

// Anti-ageing helpers and cellular stressors, counted in servings across the week.
const HELPERS: [Tag, string][] = [['poly', 'Polyphenol foods'], ['carot', 'Carotenoids (skin tone)'], ['sulf', 'Sulforaphane (brassicas)'], ['ferm', 'Fermented foods'], ['coll', 'Collagen foods'], ['evoo', 'Extra virgin olive oil'], ['astax', 'Astaxanthin (wild salmon)']];
const STRESSORS: [Tag, string][] = [['fried', 'Fried / high-AGE'], ['upf', 'Ultra-processed'], ['addsug', 'Added sugar'], ['procmeat', 'Processed meat'], ['alc', 'Alcohol'], ['sweetener', 'Sweeteners'], ['acidic', 'Acidic drinks (teeth)']];

/** The best gluten-free library foods for a nutrient, per normal portion. */
export function bestFoodsFor(key: NKey, n = 3): string[] {
  return FOODS.filter((f: Food) => f.category !== 'treats' && !f.tags.some((t) => (['gluten', 'merc', 'iodHigh', 'upf', 'alc', 'addsug'] as Tag[]).includes(t)))
    .map((f) => ({ f, v: (f.n[key] ?? 0) * f.portion.g / 100 }))
    .sort((a, b) => b.v - a.v).slice(0, n).map((x) => x.f.name);
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined);

function weekStats(s: State, end: string) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(end, -i));
  const results = days.map((d) => dayResult(s, d));
  const foodDays = days.filter((d) => resolveItems(s.days[d], s).length >= 3);
  const foodRes = foodDays.map((d) => dayResult(s, d));
  const w = cleanWeights(s).filter((x) => x.date <= end && x.date > addDays(end, -7));
  const sleeps = sortByDate(s.sleeps).filter((e) => e.date <= end && e.date > addDays(end, -7));
  const rhr = days.map((d) => s.vitals?.[d]?.rhr).filter((x): x is number => !!x);
  const steps = days.map((d) => s.vitals?.[d]?.steps).filter((x): x is number => x !== undefined);
  const outdoor = days.map((d) => s.vitals?.[d]?.outdoorMin).filter((x): x is number => x !== undefined);
  const sessions = days.flatMap((d) => s.training?.[d] ?? []);
  const sets = weeklySets(s.training ?? {}, end);
  const kgNow = weightOn(s, end) ?? 57;
  const t = targetsFor(s.profile, kgNow);
  const micro = Object.fromEntries(MICROS.map((k) => [k, avg(foodRes.map((r) => Math.min(1.5, r.analysis.effective[k] / (t[k] || 1))))])) as Record<NKey, number | undefined>;
  const pillars = Object.fromEntries(PILLARS.map((p) => [p.id, avg(foodRes.map((r) => r.analysis.pillars.find((x) => x.pillar.id === p.id)?.score ?? 0))]));
  const tags: Partial<Record<Tag, number>> = {};
  for (const r of foodRes) for (const [k, v] of Object.entries(r.analysis.tagServings)) tags[k as Tag] = (tags[k as Tag] ?? 0) + (v ?? 0);
  const foodDaysCount = new Map<string, number>();
  for (const d of foodDays) for (const name of new Set(resolveItems(s.days[d], s).map((i) => i.food.name))) foodDaysCount.set(name, (foodDaysCount.get(name) ?? 0) + 1);
  const ritualPts = days.map((d) => (s.days[d]?.rituals ?? []).reduce((a, id) => a + (RITUALS.find((r) => r.id === id)?.points ?? 0), 0));
  return {
    glow: avg(results.filter((r) => r.hasData).map((r) => r.glow)),
    nutrition: avg(foodRes.map((r) => r.analysis.nutritionScore)),
    weight: avg(w.map((x) => x.kg)),
    sleep: avg(sleeps.map(sleepHours)),
    rhr: avg(rhr),
    steps: avg(steps),
    outdoor: avg(outdoor),
    protein: avg(foodRes.map((r) => r.analysis.totals.protein)),
    plants: avg(foodRes.map((r) => r.analysis.plants)),
    omegaDays: foodRes.length ? foodRes.filter((r) => r.analysis.totals.omega3 >= 0.5).length : undefined,
    vitD: avg(foodRes.map((r) => r.analysis.totals.vitD)),
    alcoholDays: foodRes.length ? foodRes.filter((r) => (r.analysis.tagServings.alc ?? 0) > 0).length : undefined,
    runs: sessions.filter((x) => x.kind === 'run').length || undefined,
    runKm: Math.round(sessions.filter((x) => x.kind === 'run').reduce((a, x) => a + (x.km ?? 0), 0) * 10) / 10 || undefined,
    lifts: sessions.filter((x) => x.kind === 'lift').length || undefined,
    sets: Object.values(sets).reduce((a, b) => a + b, 0) || undefined,
    deep: studyLoad(s, end).weekDeep || undefined,
    rituals: avg(ritualPts.filter((p) => p > 0)),
    extras: days.reduce((a, d) => a + (s.days[d]?.extras?.length ?? 0), 0) || undefined,
    daysLogged: results.filter((r) => r.hasData).length,
    foodDays: foodDays.length,
    coverage: avg(foodRes.map((r) => r.analysis.coverage)),
    micro, pillars, tags, foodDaysCount,
    load: sessions.length ? assessLoad(end, s.training ?? {}, { kg: w.at(-1)?.kg ?? 57, vitals: s.vitals ?? {}, sleepHours: sleeps.map(sleepHours), inDeficit: true }).level : undefined,
  };
}

export function weeklyReview(s: State, end: string): Review {
  const now = weekStats(s, end);
  const prev = weekStats(s, addDays(end, -7));
  const lb = s.profile.unit === 'lb';
  const wt = (v: number) => (lb ? `${(v * 2.20462).toFixed(1)} lb` : `${v.toFixed(1)} kg`);
  const metrics: Metric[] = [
    { key: 'glow', label: 'Glow score (avg)', now: now.glow, prev: prev.glow, unit: '', better: 'up', fmt: (v) => String(Math.round(v)) },
    { key: 'nutrition', label: 'Nutrition score', now: now.nutrition, prev: prev.nutrition, unit: '', better: 'up', fmt: (v) => String(Math.round(v)) },
    { key: 'weight', label: 'Weight (7-day avg)', now: now.weight, prev: prev.weight, unit: '', better: 'down', fmt: wt, target: '−0.5% a week' },
    { key: 'sleep', label: 'Sleep', now: now.sleep, prev: prev.sleep, unit: 'h', better: 'up', fmt: (v) => v.toFixed(1), target: '8–9.5 h' },
    { key: 'rhr', label: 'Morning heart rate', now: now.rhr, prev: prev.rhr, unit: 'bpm', better: 'down', fmt: (v) => v.toFixed(0) },
    { key: 'protein', label: 'Protein (avg)', now: now.protein, prev: prev.protein, unit: 'g', better: 'up', fmt: (v) => v.toFixed(0) },
    { key: 'plants', label: 'Plants a day', now: now.plants, prev: prev.plants, unit: '', better: 'up', fmt: (v) => v.toFixed(1), target: '8+' },
    { key: 'omegaDays', label: 'Omega-3 days', now: now.omegaDays, prev: prev.omegaDays, unit: '', better: 'up', fmt: (v) => String(v), target: '3+' },
    { key: 'vitD', label: 'Vitamin D from food', now: now.vitD, prev: prev.vitD, unit: 'µg/day', better: 'up', fmt: (v) => v.toFixed(1), target: '10' },
    { key: 'alcoholDays', label: 'Alcohol days', now: now.alcoholDays, prev: prev.alcoholDays, unit: '', better: 'down', fmt: (v) => String(v), target: '0' },
    { key: 'steps', label: 'Steps (avg)', now: now.steps, prev: prev.steps, unit: '', better: 'range', fmt: (v) => Math.round(v).toLocaleString('en-GB'), target: '10–13k' },
    { key: 'outdoor', label: 'Minutes outdoors (avg)', now: now.outdoor, prev: prev.outdoor, unit: 'min', better: 'up', fmt: (v) => v.toFixed(0) },
    { key: 'runKm', label: 'Running', now: now.runKm, prev: prev.runKm, unit: 'km', better: 'range', fmt: (v) => v.toFixed(1) },
    { key: 'lifts', label: 'Weights sessions', now: now.lifts, prev: prev.lifts, unit: '', better: 'range', fmt: (v) => String(v) },
    { key: 'sets', label: 'Hard sets (all muscles)', now: now.sets, prev: prev.sets, unit: '', better: 'range', fmt: (v) => String(v) },
    { key: 'deep', label: 'Deep study', now: now.deep, prev: prev.deep, unit: 'h', better: 'range', fmt: (v) => v.toFixed(1), target: '12–20 h' },
    { key: 'rituals', label: 'Ritual points (avg)', now: now.rituals, prev: prev.rituals, unit: '', better: 'up', fmt: (v) => v.toFixed(1), target: '10' },
    { key: 'extras', label: 'Daily ideas done', now: now.extras, prev: prev.extras, unit: '', better: 'up', fmt: (v) => String(v) },
  ];

  const wins: string[] = [];
  const slips: string[] = [];
  const pct = (a: number, b: number) => (b ? (a - b) / Math.abs(b) : 0);
  for (const m of metrics) {
    if (m.now === undefined || m.prev === undefined || m.better === 'range') continue;
    const change = pct(m.now, m.prev);
    if (m.key === 'weight') {
      const kgChange = m.now - m.prev;
      const rate = kgChange / m.prev;
      if (rate <= -0.0075) slips.push(`Weight dropped ${wt(Math.abs(kgChange))}, faster than 0.75% a week. Eat a bit more to protect muscle and hormones.`);
      else if (rate <= -0.0025) wins.push(`Weight down ${wt(Math.abs(kgChange))}: right on the 0.5%-a-week pace.`);
      else if (rate > 0.004) slips.push(`Weight up ${wt(kgChange)} on last week (check for a refeed, France or salt before worrying).`);
      continue;
    }
    if (Math.abs(change) < 0.05 && Math.abs(m.now - m.prev) < 1) continue;
    const improved = m.better === 'up' ? m.now > m.prev : m.now < m.prev;
    const line = `${m.label}: ${m.fmt!(m.prev)} → ${m.fmt!(m.now)}${m.unit ? ` ${m.unit}` : ''}`;
    (improved ? wins : slips).push(line);
  }
  if (now.load === 'too-much') slips.push('Training load hit “too much” this week. Next week, hold or reduce it.');
  if (now.load === 'balanced') wins.push('Training load stayed balanced: stress you can adapt to.');
  if (now.steps !== undefined && now.steps > 16000) slips.push('Steps averaged over 16k. Bring them back to 10–13k during the cut.');

  // Score: weighted from what's logged this week.
  const parts: number[] = [];
  if (now.glow !== undefined) parts.push(now.glow);
  if (now.sleep !== undefined) parts.push(Math.max(0, Math.min(100, ((now.sleep - 6) / 2) * 100)));
  if (now.nutrition !== undefined) parts.push(now.nutrition);
  if (now.rituals !== undefined) parts.push(Math.min(100, now.rituals * 10));
  if (now.omegaDays !== undefined) parts.push(Math.min(100, (now.omegaDays / 3) * 100));
  const score = parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : 0;
  const grade = !parts.length ? '–' : score >= 85 ? 'A+' : score >= 75 ? 'A' : score >= 65 ? 'B' : score >= 55 ? 'C' : 'D';

  // Focus: the biggest slips first, then today's best moves.
  const focus = [...slips.slice(0, 2), ...nextMoves(s, end).map((m) => m.text)].slice(0, 3);
  const cellular = cellularView(now, prev);
  if (cellular.coverage.now !== undefined && cellular.coverage.prev !== undefined && Math.abs(cellular.coverage.now - cellular.coverage.prev) >= 0.03)
    (cellular.coverage.now > cellular.coverage.prev ? wins : slips).push(`Micronutrient coverage: ${Math.round(cellular.coverage.prev * 100)}% → ${Math.round(cellular.coverage.now * 100)}%`);
  return { start: addDays(end, -6), end, metrics, wins, slips, focus, grade, score, daysLogged: now.daysLogged, cellular, sinceStart: sinceStart(s, end) };
}

type Stats = ReturnType<typeof weekStats>;

function cellularView(now: Stats, prev: Stats): Cellular {
  const pillars = PILLARS.map((p) => ({ id: p.id, name: p.name, emoji: p.emoji, now: now.pillars[p.id], prev: prev.pillars[p.id] }));
  const micros = MICROS.filter((k) => now.micro[k] !== undefined).map((k) => ({ key: k, label: NUTRIENTS[k].label, pct: Math.round(Math.min(1, now.micro[k]!) * 100) }));
  const strongest = [...micros].sort((a, b) => b.pct - a.pct).slice(0, 4);
  const weakest = [...micros].sort((a, b) => a.pct - b.pct).filter((m) => m.pct < 90).slice(0, 3).map((m) => ({ ...m, foods: bestFoodsFor(m.key) }));
  const topFoods = [...now.foodDaysCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, days]) => ({ name, days }));
  const round = (v?: number) => Math.round((v ?? 0) * 10) / 10;
  const helpers = HELPERS.map(([tag, label]) => ({ label, now: round(now.tags[tag]), prev: round(prev.tags[tag]) })).filter((h) => h.now || h.prev);
  const stressors = STRESSORS.map(([tag, label]) => ({ label, now: round(now.tags[tag]), prev: round(prev.tags[tag]) })).filter((h) => h.now || h.prev);
  const pAvg = (x: Stats) => avg(PILLARS.map((p) => x.pillars[p.id]).filter((v): v is number => v !== undefined));
  const a = pAvg(now), b = pAvg(prev);
  const helpN = helpers.reduce((x, h) => x + h.now, 0), helpP = helpers.reduce((x, h) => x + h.prev, 0);
  const strN = stressors.reduce((x, h) => x + h.now, 0), strP = stressors.reduce((x, h) => x + h.prev, 0);
  let verdict: string;
  if (a === undefined) verdict = 'Log at least 3 foods on a few days and your cellular picture appears here.';
  else if (b === undefined) verdict = `Your 8 pillars averaged ${Math.round(a)}/100 this week. Next week shows whether that’s rising.`;
  else {
    const dir = a - b >= 2 ? 'improving' : a - b <= -2 ? 'slipping' : 'holding steady';
    const why = [helpN > helpP ? 'more protective foods' : helpN < helpP ? 'fewer protective foods' : '', strN < strP ? 'fewer stressors' : strN > strP ? 'more stressors' : ''].filter(Boolean).join(' and ');
    verdict = `At the cellular level you’re ${dir}: pillar average ${Math.round(b)} → ${Math.round(a)}${why ? `, driven by ${why}` : ''}.`;
  }
  return { pillars, coverage: { now: now.coverage, prev: prev.coverage }, strongest, weakest, topFoods, helpers, stressors, verdict };
}

/** Your first properly logged week against this one: the long view of how far you've come. */
export function sinceStart(s: State, end: string): SinceStart | undefined {
  const dates = Object.keys(s.days).filter((d) => resolveItems(s.days[d], s).length >= 3).sort();
  if (!dates.length) return undefined;
  let firstEnd = addDays(dates[0], 6);
  if (firstEnd > end) return undefined;
  if (addDays(firstEnd, 7) > end) return undefined; // need at least two separate weeks
  const a = weekStats(s, firstEnd), b = weekStats(s, end);
  const lb = s.profile.unit === 'lb';
  const pAvg = (x: Stats) => avg(PILLARS.map((p) => x.pillars[p.id]).filter((v): v is number => v !== undefined));
  const rows: SinceStart['rows'] = [];
  const add = (label: string, x: number | undefined, y: number | undefined, f: (v: number) => string, up: boolean) => {
    if (x === undefined || y === undefined) return;
    rows.push({ label, first: f(x), now: f(y), better: Math.abs(y - x) < 1e-9 ? undefined : up ? y > x : y < x });
  };
  add('Pillar average', pAvg(a), pAvg(b), (v) => String(Math.round(v)), true);
  add('Micronutrient coverage', a.coverage, b.coverage, (v) => `${Math.round(v * 100)}%`, true);
  add('Glow score', a.glow, b.glow, (v) => String(Math.round(v)), true);
  add('Weight', a.weight, b.weight, (v) => (lb ? `${(v * 2.20462).toFixed(1)} lb` : `${v.toFixed(1)} kg`), false);
  add('Sleep', a.sleep, b.sleep, (v) => `${v.toFixed(1)} h`, true);
  add('Morning heart rate', a.rhr, b.rhr, (v) => `${Math.round(v)} bpm`, false);
  add('Plants a day', a.plants, b.plants, (v) => v.toFixed(1), true);
  add('Vitamin D from food', a.vitD, b.vitD, (v) => `${v.toFixed(1)} µg`, true);
  return { from: addDays(firstEnd, -6), rows };
}

/** Phase by phase (cut, travel, maintenance): how your body and health numbers differ. */
export interface PhaseRow { kind: string; label: string; days: number; kcal?: number; pillars?: number; coverage?: number; sleep?: number; rhr?: number; glow?: number; ea?: number; weight?: number }
export function phaseCompare(s: State, upTo: string): PhaseRow[] {
  const groups = new Map<string, string[]>();
  const dates = new Set<string>([...Object.keys(s.days), ...s.sleeps.map((x) => x.date), ...Object.keys(s.vitals ?? {})]);
  for (const d of dates) {
    if (d > upTo) continue;
    const reversing = s.profile.reverseFrom && d >= s.profile.reverseFrom;
    const ph = phaseOn(s.profile.season, d);
    const kind = reversing && ph?.kind !== 'travel' ? 'maintain' : ph?.kind;
    if (!kind) continue;
    groups.set(kind, [...(groups.get(kind) ?? []), d]);
  }
  const LABEL: Record<string, string> = { cut: 'Cutting', peak: 'Peak week', travel: 'Travel', maintain: 'Reverse / maintenance' };
  const order = ['cut', 'peak', 'travel', 'maintain'];
  return order.filter((k) => groups.has(k)).map((kind) => {
    const ds = groups.get(kind)!.sort();
    const food = ds.filter((d) => resolveItems(s.days[d], s).length >= 3).map((d) => dayResult(s, d));
    const set = new Set(ds);
    return {
      kind, label: LABEL[kind] ?? kind, days: ds.length,
      kcal: avg(food.map((r) => r.analysis.totals.kcal)),
      pillars: avg(food.map((r) => avg(r.analysis.pillars.map((p) => p.score)) ?? 0)),
      coverage: avg(food.map((r) => r.analysis.coverage)),
      sleep: avg(s.sleeps.filter((x) => set.has(x.date)).map(sleepHours)),
      rhr: avg(ds.map((d) => s.vitals?.[d]?.rhr).filter((x): x is number => !!x)),
      glow: avg(food.map((r) => r.glow)),
      ea: avg(food.map((r) => r.ea).filter((x): x is number => x !== undefined)),
      weight: avg(cleanWeights(s).filter((w) => set.has(w.date)).map((w) => w.kg)),
    };
  });
}

import { addDays, sleepHours, sortByDate } from './body';
import { cleanWeights, nextMoves, studyLoad } from './calls';
import { dayResult } from './game';
import { assessLoad, weeklySets } from './training';
import { resolveItems, type State } from '@/store';
import { RITUALS } from '@/data/science';

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
  return { start: addDays(end, -6), end, metrics, wins, slips, focus, grade, score, daysLogged: now.daysLogged };
}

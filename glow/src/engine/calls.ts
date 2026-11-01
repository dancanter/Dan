import { addDays, daysBetween, sleepHours, sortByDate, weeklyRate, type WeightEntry } from './body';
import { dayResult } from './game';
import { phaseOn } from './season';
import { assessLoad } from './training';
import { rhrAnalysis } from './vitals';
import { resolveItems, type State } from '@/store';

// The coach's judgement calls: when to refeed, when to take a full rest
// day, which weigh-ins to ignore, and the next best things to do.

/** Mornings after a refeed carry extra water and glycogen (often 1–3 lb). Glow ignores them in trends. */
export function noisyDates(s: State): Set<string> {
  const out = new Set<string>();
  for (const [d, log] of Object.entries(s.days)) {
    if (log.refeed) { out.add(addDays(d, 1)); out.add(addDays(d, 2)); }
  }
  return out;
}

export function cleanWeights(s: State): WeightEntry[] {
  const noisy = noisyDates(s);
  return sortByDate(s.weights).filter((w) => !noisy.has(w.date));
}

export interface Call { kind: 'refeed' | 'rest' | 'none'; title: string; why: string[]; how: string[] }

function lastRefeed(s: State, date: string): string | undefined {
  return Object.keys(s.days).filter((d) => d <= date && s.days[d].refeed).sort().at(-1);
}

/**
 * Refeed: a planned day at maintenance, with the extra calories mostly from
 * carbohydrate. During a cut it refills muscle glycogen, supports training
 * quality, mood and the hormones that sense energy (leptin, thyroid). The
 * evidence is moderate: diet breaks helped preserve metabolic rate in one
 * trial, and refeeds are common practice for lean athletes. Glow suggests one
 * every 10–14 days in a cut, sooner if your body is sending signals.
 */
export function refeedCall(s: State, date: string): Call {
  const phase = phaseOn(s.profile.season, date);
  if (!phase || phase.kind !== 'cut') return { kind: 'none', title: '', why: [], how: [] };
  const last = lastRefeed(s, date) ?? phase.start;
  const since = daysBetween(last, date);
  const why: string[] = [];
  const recent = Array.from({ length: 5 }, (_, i) => addDays(date, -i - 1)).filter((d) => resolveItems(s.days[d], s).length >= 3);
  const lowEa = recent.filter((d) => (dayResult(s, d).ea ?? 99) < 30).length;
  if (lowEa >= 3) why.push(`Energy availability was low on ${lowEa} of your last ${recent.length} logged days.`);
  const w = cleanWeights(s);
  const rate = weeklyRate(w);
  const kg = w.at(-1)?.kg;
  if (rate !== undefined && kg && rate < -(kg * 0.0075)) why.push('You’re losing faster than 0.75% a week.');
  const sleeps = sortByDate(s.sleeps).filter((e) => e.date > addDays(date, -5) && e.date <= date).map(sleepHours);
  if (sleeps.length >= 3 && sleeps.reduce((a, b) => a + b, 0) / sleeps.length < 7) why.push('Sleep has dropped below 7 hours on average (a common sign of a deficit biting).');
  const h = rhrAnalysis(date, s.vitals ?? {});
  if (h.delta !== undefined && h.delta >= 5) why.push(`Morning heart rate is up ${h.delta} bpm on your baseline.`);
  const due = since >= 12;
  if (due) why.unshift(`It’s been ${since} days since your last refeed.`);
  if (!due && why.length < 2) return { kind: 'none', title: '', why: [], how: [] };
  return {
    kind: 'refeed',
    title: due && why.length === 1 ? 'Refeed day due' : 'Refeed day recommended',
    why,
    how: [
      'Eat at maintenance today: about +500–700 kcal on your cut target.',
      'Add the extra as carbohydrate (rice, potatoes, oats, fruit, GF bread). Keep protein the same and fat moderate.',
      'Best placed on, or the day before, your hardest session.',
      'Tick “Refeed day” on Today, and Glow will ignore the next two weigh-ins (water and glycogen, not fat).',
    ],
  };
}

/** A complete rest day: no training, an easy walk at most. */
export function restCall(s: State, date: string, kg: number): Call {
  const why: string[] = [];
  const h = rhrAnalysis(date, s.vitals ?? {});
  if (h.delta !== undefined && h.delta >= 8) why.push(`Morning heart rate is ${h.delta} bpm above baseline: often the first sign of illness or deep fatigue.`);
  const sleeps = sortByDate(s.sleeps).filter((e) => e.date > addDays(date, -3) && e.date <= date).map(sleepHours);
  if (sleeps.length >= 2 && sleeps.every((x) => x < 6)) why.push('Two or more nights under 6 hours.');
  const load = assessLoad(date, s.training ?? {}, { kg, vitals: s.vitals ?? {}, sleepHours: sleeps, ea: dayResult(s, addDays(date, -1)).ea, inDeficit: phaseOn(s.profile.season, date)?.kind === 'cut' });
  if (load.level === 'too-much') why.push('Training load is in the “too much” zone.');
  const trained = Array.from({ length: 7 }, (_, i) => (s.training?.[addDays(date, -i)] ?? []).some((x) => x.kind !== 'walk')).filter(Boolean).length;
  const hasTraining = Object.keys(s.training ?? {}).length > 0;
  if (hasTraining && trained >= 7) why.push('You’ve trained 7 days in a row. One full rest day a week is when the repair happens.');
  if (!why.length) return { kind: 'none', title: '', why: [], how: [] };
  return {
    kind: 'rest',
    title: 'Take a complete rest day',
    why,
    how: ['No running or lifting today. A gentle walk outside is fine, and good for you.', 'Eat at least your normal target (rest days still need fuel to repair).', 'Get to bed 30–60 minutes early.', 'If you feel ill, rest until your morning heart rate is back within 3 bpm of baseline.'],
  };
}

// ── Next best moves ───────────────────────────────────────────────────────
export interface Move { text: string; impact: 'high' | 'medium' | 'low' }

export function nextMoves(s: State, date: string): Move[] {
  const moves: (Move & { w: number })[] = [];
  const r = dayResult(s, date);
  const yesterday = dayResult(s, addDays(date, -1));
  const vit = s.vitals?.[date] ?? {};
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(date, -i - 1));
  const logged = last7.filter((d) => resolveItems(s.days[d], s).length >= 3);

  if (!s.profile.season) moves.push({ w: 9, impact: 'high', text: 'Start your season plan (Body → Start this plan) so targets follow the France and Christmas phases.' });
  const sleeps = sortByDate(s.sleeps).filter((e) => e.date > addDays(date, -7) && e.date <= date).map(sleepHours);
  const sleepAvg = sleeps.length ? sleeps.reduce((a, b) => a + b, 0) / sleeps.length : undefined;
  if (sleepAvg !== undefined && sleepAvg < 8) moves.push({ w: 10, impact: 'high', text: `Sleep is averaging ${sleepAvg.toFixed(1)} h. Getting to 8+ is the single biggest lever for a lean, de-puffed, chiselled face and for keeping muscle on a cut.` });
  if (yesterday.ea !== undefined && yesterday.ea < 30) moves.push({ w: 10, impact: 'high', text: `Yesterday’s energy availability was ${Math.round(yesterday.ea)}. Add 200–400 kcal of carbs around training: hormones and recovery depend on it.` });
  const omegaDays = logged.filter((d) => dayResult(s, d).analysis.totals.omega3 >= 0.5).length;
  if (logged.length >= 4 && omegaDays < 2) moves.push({ w: 7, impact: 'medium', text: 'Oily fish only once or not at all this week. Salmon, mackerel or sardines 2–3 times calm inflammation and help your skin barrier.' });
  const plantsAvg = logged.length ? logged.reduce((a, d) => a + dayResult(s, d).analysis.plants, 0) / logged.length : undefined;
  if (plantsAvg !== undefined && logged.length >= 3 && plantsAvg < 6) moves.push({ w: 6, impact: 'medium', text: `About ${Math.round(plantsAvg)} different plant${Math.round(plantsAvg) === 1 ? '' : 's'} a day. Aim for 8 (herbs, spices, berries and seeds all count) to feed your gut microbiome.` });
  const acid = logged.reduce((a, d) => a + (dayResult(s, d).analysis.tagServings.acidic ?? 0), 0) / Math.max(1, logged.length);
  if (acid >= 2.5) moves.push({ w: 5, impact: 'medium', text: 'Squash and diet drinks average 3 or more a day. Keep them to meals and drink water in between to protect your enamel (a bright smile is part of the look).' });
  if (!vit.rhr) moves.push({ w: 4, impact: 'low', text: 'Log your morning heart rate (30 seconds, before getting up). It’s your best early warning for over-training and illness.' });
  if (vit.steps !== undefined && vit.steps > 16000) moves.push({ w: 6, impact: 'medium', text: 'Steps are very high. On a cut, keep them to 10–13k and spend the energy on training quality instead.' });
  if ((vit.outdoorMin ?? 0) < 10 && vit.outdoorMin !== undefined) moves.push({ w: 5, impact: 'medium', text: 'Under 10 minutes outdoors. Morning daylight sets tonight’s sleep and a healthy cortisol rhythm.' });
  if (!(s.bp ?? []).length) moves.push({ w: 3, impact: 'low', text: 'Take a blood pressure reading this week (Body → Health age). It completes your Glow age.' });
  if (logged.some((d) => resolveItems(s.days[d], s).some((i) => i.food.tags.includes('alc')))) moves.push({ w: 7, impact: 'high', text: 'Alcohol this week. Even small amounts cost deep sleep and show as puffiness. Skipping it until Christmas Eve is a quick win.' });
  if (r.analysis.totals.kcal > 0 && r.analysis.plants < 3) moves.push({ w: 3, impact: 'low', text: 'Add a colourful veg or berries to your next meal.' });
  return moves.sort((a, b) => b.w - a.w).slice(0, 3).map(({ text, impact }) => ({ text, impact }));
}

// ── Study and deep work ──────────────────────────────────────────────────
/**
 * Deep work (focused, demanding study) is limited by attention, not time.
 * Studies of deliberate practice found that even elite performers top out at
 * around 4 hours a day of truly focused work, spread over sessions with
 * breaks. The Open University plans about 16–18 hours a week for 60 credits
 * (8–9 hours per 30-credit module).
 */
export function studyVerdict(deepToday: number | undefined, weekDeep: number, weekTotal: number): { headline: string; tone: 'good' | 'sea' | 'warn' | 'bad'; text: string } {
  if (deepToday !== undefined && deepToday > 6) return { headline: 'Past the useful limit', tone: 'warn', text: `${deepToday} h of deep work is beyond what focus can sustain (about 4 h a day even for elite performers). Past that, retention drops and it eats into sleep, which is when memories consolidate. Switch to light review or rest.` };
  if (deepToday !== undefined && deepToday > 4) return { headline: 'Big day: protect tonight’s sleep', tone: 'sea', text: 'Over 4 hours of deep work: fine occasionally before a deadline, but not daily. Breaks every 50–90 minutes (walk, daylight, water) keep the quality up.' };
  if (deepToday !== undefined && deepToday >= 2) return { headline: 'Sweet spot', tone: 'good', text: '2–4 hours of focused work is where most learning per hour happens. Use retrieval practice (test yourself) and spacing: they beat re-reading by a wide margin.' };
  if (weekTotal >= 16 && weekTotal <= 22) return { headline: 'On the OU pace', tone: 'good', text: `${weekTotal} h this week, in line with the Open University’s 16–18 h for 60 credits.` };
  if (weekTotal > 25) return { headline: 'Heavy week', tone: 'warn', text: `${weekTotal} h this week. Above about 25 h on top of 7+ training sessions, recovery and sleep start to suffer. Make sure it isn’t coming out of your 8 hours.` };
  return { headline: 'Log today’s study', tone: 'sea', text: `${weekDeep} h of deep work this week. The OU plans about 16–18 h a week for your two modules, of which 2–4 focused hours a day is plenty.` };
}

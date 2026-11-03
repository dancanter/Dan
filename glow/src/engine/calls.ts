import { addDays, daysBetween, sleepHours, sortByDate, weeklyRate, type WeightEntry } from './body';
import { dayResult } from './game';
import { phaseOn } from './season';
import { assessLoad } from './training';
import { rhrAnalysis } from './vitals';
import { illAdvice } from './illness';
import { resolveItems, type State } from '@/store';

// The coach's judgement calls: when to refeed, when to take a full rest
// day, which weigh-ins to ignore, and the next best things to do.

/** Mornings after a refeed carry extra water and glycogen (often 1–3 lb). Glow ignores them in trends. */
export function noisyDates(s: State): Set<string> {
  const out = new Set<string>();
  for (const [d, log] of Object.entries(s.days)) {
    if (log.refeed || log.binges?.length) { out.add(addDays(d, 1)); out.add(addDays(d, 2)); }
  }
  return out;
}

export function cleanWeights(s: State): WeightEntry[] {
  const noisy = noisyDates(s);
  return sortByDate(s.weights).filter((w) => !noisy.has(w.date));
}

export interface Call { kind: 'refeed' | 'rest' | 'ease' | 'deload' | 'goal' | 'none'; title: string; why: string[]; how: string[] }

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
  if (!phase || phase.kind !== 'cut' || (s.profile.reverseFrom && s.profile.reverseFrom <= date)) return { kind: 'none', title: '', why: [], how: [] };
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
  const binges = Array.from({ length: 14 }, (_, i) => s.days[addDays(date, -i)]?.binges?.length ?? 0).reduce((a, b) => a + b, 0);
  if (binges >= 2) why.push(`${binges} binges in the last 2 weeks: often a sign the deficit is biting. A planned refeed usually prevents unplanned ones.`);
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
  const ill = s.days[date]?.ill;
  if (ill && illAdvice(ill).train === 'none') why.push('You logged being ill today with symptoms below the neck or badly: no training until you’re 24–48 hours symptom-free.');
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
  const month = Number(date.slice(5, 7));
  if ((month >= 10 || month <= 3) && logged.length >= 4) {
    const vitD = logged.reduce((a, d) => a + dayResult(s, d).analysis.totals.vitD, 0) / logged.length;
    if (vitD < 10) moves.push({ w: 7, impact: 'high', text: `Vitamin D from food is averaging ${vitD.toFixed(1)} µg a day (target 10, and the sun can’t make it until April). Mackerel or trout twice and wild salmon twice this week covers it. See Cellular → Seasons.` });
  }
  const study = studyLoad(s, date);
  if (study.level === 'too-much') moves.push({ w: 9, impact: 'high', text: `Too much deep work: ${study.reasons[0]} Cap it at 3–4 focused hours a day in 60–90-minute blocks, then switch to light review or rest.` });
  else if (study.level === 'too-little') moves.push({ w: 8, impact: 'high', text: `Not enough deep study: ${study.reasons[0]} Book two 90-minute focus blocks tomorrow, phone in another room.` });
  else if (study.level === 'light') moves.push({ w: 5, impact: 'medium', text: `${study.reasons[0]}` });
  else if (study.level === 'heavy') moves.push({ w: 6, impact: 'medium', text: `Heavy study week: ${study.reasons[0]} Protect your 8 hours. Stop deep work 1–2 h before bed.` });
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

// ── Is the study load too much? ──────────────────────────────────────────
export interface StudyLoad { level: 'ok' | 'heavy' | 'too-much' | 'light' | 'too-little'; reasons: string[]; weekDeep: number; weekTotal: number; deepDays: number; onPlan: boolean }

/**
 * Looks across the week, not just today: focused work is limited to about
 * 4 hours a day even in expert performers, the OU plans 16–18 hours a week
 * for 60 credits, and study that eats into sleep undoes itself, because
 * sleep is when memories are consolidated.
 */
export function studyLoad(s: State, date: string): StudyLoad {
  const days = Array.from({ length: 7 }, (_, i) => addDays(date, -i));
  const deepOf = (d: string) => s.vitals?.[d]?.deepHours ?? s.vitals?.[d]?.studyHours ?? 0;
  const totalOf = (d: string) => s.vitals?.[d]?.studyHours ?? s.vitals?.[d]?.deepHours ?? 0;
  const weekDeep = Math.round(days.reduce((a, d) => a + deepOf(d), 0) * 10) / 10;
  const weekTotal = Math.round(days.reduce((a, d) => a + totalOf(d), 0) * 10) / 10;
  const reasons: string[] = [];
  let level: StudyLoad['level'] = 'ok';
  const today = deepOf(date) || deepOf(addDays(date, -1));
  if (today > 6) { level = 'too-much'; reasons.push(`${today} h of deep work in a day is past what focus can sustain (about 4 h, even for experts). Retention drops after that.`); }
  const longDays = days.slice(0, 4).filter((d) => deepOf(d) > 4).length;
  if (longDays >= 3) { level = 'too-much'; reasons.push(`${longDays} of the last 4 days had over 4 h of deep work. That’s a pace for a deadline sprint, not a normal week.`); }
  if (weekDeep > 24) { level = 'too-much'; reasons.push(`${weekDeep} h of deep work this week. Over about 20–24 h, on top of 7+ training sessions in a deficit, sleep, recovery and mood start to pay.`); }
  else if (weekTotal > 25) { if (level === 'ok') level = 'heavy'; reasons.push(`${weekTotal} h of study this week, well above the OU’s 16–18 h guide for your two modules.`); }
  const sleeps = sortByDate(s.sleeps).filter((e) => e.date > addDays(date, -4) && e.date <= date).map(sleepHours);
  const sleepAvg = sleeps.length ? sleeps.reduce((a, b) => a + b, 0) / sleeps.length : undefined;
  if (sleepAvg !== undefined && sleepAvg < 7.5 && weekDeep >= 14) { if (level === 'ok') level = 'heavy'; reasons.push(`Sleep is averaging ${sleepAvg.toFixed(1)} h during a heavy study week. Late study costs more than it gains, because sleep is when learning is stored.`); }
  // Too little: only judged once a full week has been logged, so day one never nags.
  const deepDays = days.filter((d) => deepOf(d) >= 1).length;
  const firstLog = Object.keys(s.vitals ?? {}).filter((d) => s.vitals[d]?.deepHours !== undefined || s.vitals[d]?.studyHours !== undefined).sort()[0];
  const fullWeek = firstLog !== undefined && firstLog <= addDays(date, -6);
  // Following the study planner and finished its tasks? Then fewer hours means efficient, not behind.
  const onPlan = days.some((d) => s.vitals?.[d]?.studyOnPlan);
  if (level === 'ok' && fullWeek && !onPlan) {
    if (weekDeep < 8) { level = 'too-little'; reasons.push(`Only ${weekDeep} h of deep study in the last 7 days. For SK297 and SK298 that’s under half the OU’s 16–18 h a week, and distinction-level work needs about 12–20 deep hours.`); }
    else if (weekDeep < 12) { level = 'light'; reasons.push(`${weekDeep} h of deep study this week: enough to keep up, light for a distinction. About 12–20 h (2–3 h on 5–6 days) is the target.`); }
    else if (deepDays < 4) { level = 'light'; reasons.push(`Deep work on only ${deepDays} days this week. Spreading the same hours over 5–6 days (spaced practice) makes it stick far better than a few long sessions.`); }
  }
  return { level, reasons, weekDeep, weekTotal, deepDays, onPlan };
}

/** Ease off today: lighter, not off. For smaller warning signs than a full rest day. */
export function easeCall(s: State, date: string, kg: number): Call {
  if (restCall(s, date, kg).kind === 'rest') return { kind: 'none', title: '', why: [], how: [] };
  const why: string[] = [];
  const h = rhrAnalysis(date, s.vitals ?? {});
  if (h.delta !== undefined && h.delta >= 5) why.push(`Morning heart rate is up ${h.delta} bpm on baseline.`);
  const last = sortByDate(s.sleeps).filter((e) => e.date === date).map(sleepHours)[0];
  if (last !== undefined && last < 6.5) why.push(`Only ${last.toFixed(1)} h of sleep last night.`);
  if (s.days[date]?.ill) why.push('You logged a mild, above-the-neck illness today: easy only, or rest if you feel worse once you start.');
  const feelings = s.days[date]?.feelings ?? [];
  if (feelings.includes('tired') || feelings.includes('sore')) why.push(`You logged feeling ${feelings.includes('tired') ? 'tired' : 'sore'} today.`);
  const sleeps = sortByDate(s.sleeps).filter((e) => e.date > addDays(date, -7) && e.date <= date).map(sleepHours);
  const load = assessLoad(date, s.training ?? {}, { kg, vitals: s.vitals ?? {}, sleepHours: sleeps, inDeficit: phaseOn(s.profile.season, date)?.kind === 'cut' });
  if (load.level === 'pushing') why.push('Training load is “pushing it”.');
  if (!why.length) return { kind: 'none', title: '', why: [], how: [] };
  return {
    kind: 'ease', title: 'Ease off today', why,
    how: ['Swap any quality run for an easy, conversational one, or 20–30 minutes of walking.', 'If you lift: keep the weights, cut sets by about a third, and stop 3 reps short of failure.', 'Eat your full target, and get to bed early.'],
  };
}

/**
 * Deload week: a planned easier week (about half the sets, easy running
 * only) every 4–8 weeks of hard training, or sooner when fatigue builds
 * across a whole week. Fitness and muscle are kept; fatigue clears, and you
 * usually come back stronger. Travel weeks make natural deloads.
 */
export function deloadCall(s: State, date: string, kg: number): Call {
  const since = (s.profile.deloads ?? []).filter((d) => d <= date).sort().at(-1);
  if (since && daysBetween(since, date) < 7) return { kind: 'none', title: '', why: [], how: [] };
  const trainedDays = Object.keys(s.training ?? {}).filter((d) => d <= date && (s.training[d] ?? []).some((x) => x.kind !== 'walk')).sort();
  if (trainedDays.length < 6) return { kind: 'none', title: '', why: [], how: [] };
  const why: string[] = [];
  // Time-based: count only unbroken weeks of real training (3+ sessions every week),
  // starting no earlier than your plan start or last deload. Synced history from
  // before you started Glow, or weeks with a natural break, don't count.
  const planStart = s.profile.season?.map((p) => p.start).sort()[0];
  const floor = [since, planStart].filter((x): x is string => !!x).sort().at(-1);
  let weeks = 0;
  for (let w = 0; w < 26; w++) {
    const end = addDays(date, -7 * w);
    const start = addDays(end, -6);
    if (floor && start < floor) break;
    const sessions = Array.from({ length: 7 }, (_, i) => (s.training?.[addDays(end, -i)] ?? []).filter((x) => x.kind !== 'walk').length).reduce((a, b) => a + b, 0);
    if (sessions < 3) break;
    weeks++;
  }
  if (floor && weeks >= 6) why.push(`${weeks} unbroken weeks of training since ${since ? 'your last deload' : 'your plan started'}.`);
  const sleeps = sortByDate(s.sleeps).filter((e) => e.date > addDays(date, -7) && e.date <= date).map(sleepHours);
  const strainDays = Array.from({ length: 7 }, (_, i) => addDays(date, -i)).filter((d) => {
    const l = assessLoad(d, s.training ?? {}, { kg, vitals: s.vitals ?? {}, sleepHours: sleeps, inDeficit: true });
    return l.level === 'pushing' || l.level === 'too-much';
  }).length;
  if (strainDays >= 4) why.push(`Your load has been “pushing it” or higher on ${strainDays} of the last 7 days.`);
  const rhrUp = Array.from({ length: 7 }, (_, i) => rhrAnalysis(addDays(date, -i), s.vitals ?? {}).delta ?? 0).filter((d) => d >= 5).length;
  if (rhrUp >= 3) why.push(`Morning heart rate has been raised on ${rhrUp} of the last 7 days.`);
  if (!why.length) return { kind: 'none', title: '', why: [], how: [] };
  const travel = s.profile.season?.find((p) => p.kind === 'travel' && p.start > date && daysBetween(date, p.start) <= 10);
  return {
    kind: 'deload', title: 'Plan a deload week', why,
    how: [
      'For 5–7 days: lift with your normal weights but about half the sets, stopping well short of failure.',
      'Running: easy runs only, about 60–70% of your usual distance. Strides are fine; skip intervals and time trials.',
      'Keep protein high and sleep long. Eating at maintenance this week also helps.',
      travel ? `Your trip to ${travel.name} starts soon. Travel weeks make a natural deload, so line it up with that.` : 'You’ll usually come back stronger. Fitness and muscle don’t fade in a week.',
      'Tap “Start deload week” and Glow will stop suggesting one for 7 days.',
    ],
  };
}

/** Goal weight reached on a 7-day average of clean weigh-ins: stop cutting and start the reverse. */
export const DEFAULT_GOAL_KG = 124 / 2.20462;
export function goalCall(s: State, date: string): Call {
  const none: Call = { kind: 'none', title: '', why: [], how: [] };
  const phase = phaseOn(s.profile.season, date);
  if (!phase || phase.kind !== 'cut' || s.profile.reverseFrom) return none;
  const recent = cleanWeights(s).filter((w) => w.date <= date && w.date > addDays(date, -7));
  if (recent.length < 4) return none;
  const avgKg = recent.reduce((a, w) => a + w.kg, 0) / recent.length;
  const goal = s.profile.goalWeightKg ? s.profile.goalWeightKg + 0.23 : DEFAULT_GOAL_KG;
  if (avgKg > goal) return none;
  const lb = (avgKg * 2.20462).toFixed(1);
  return {
    kind: 'goal',
    title: 'Goal weight reached: time to eat more',
    why: [`Your 7-day average is ${lb} lb, inside your 122–124 lb target (refeed days excluded).`, 'Staying in a deficit now only costs muscle, hormones, sleep and facial fullness. The cut has done its job.'],
    how: [
      `Add ${100} kcal a week (1,899 next week, then about 2,000…) until you reach maintenance. Glow raises your target automatically.`,
      'Put the extra mostly into carbs around training, plus a little more fat (olive oil, salmon, egg yolks).',
      'Watch the 7-day average: a gain of up to 1–1.5 lb in the first fortnight is glycogen and water, not fat. You will look fuller, not softer.',
      'If the average climbs more than 0.5 lb a week after week 2, hold calories there for a week.',
    ],
  };
}

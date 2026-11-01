import { addDays } from './body';

// Steps, time outdoors and morning resting heart rate: the daily signals
// that aren't food, sleep or training sessions.

export interface Vitals {
  steps?: number;
  outdoorMin?: number;
  /** Morning resting heart rate, bpm: on waking, lying down, before getting up. */
  rhr?: number;
  /** Study hours today, and how many of them were deep, focused work. */
  studyHours?: number;
  deepHours?: number;
}

export type Tone = 'good' | 'ok' | 'warn' | 'bad';
export interface Verdict { score: number; tone: Tone; headline: string; detail: string }

/** Net walking energy: roughly 0.4 kcal per kg per 1,000 steps above resting. */
export function walkingKcal(steps: number, kg: number): number {
  return Math.round((steps / 1000) * 0.4 * kg);
}

/**
 * Health benefits of steps rise steeply to about 8,000–10,000 a day in
 * under-60s and then flatten (Paluch et al., 2022). Above that, extra steps
 * don't harm a healthy person, but stacked on 7+ sessions a week and an
 * energy deficit they add fatigue, energy cost and lower-leg load.
 */
export function stepsVerdict(steps: number, kg = 57): Verdict {
  const kcal = walkingKcal(steps, kg);
  if (steps < 4000) return { score: 25, tone: 'bad', headline: 'Very low movement day', detail: 'Under 4,000 steps is linked with clearly worse long-term health. On a rest day, a 20-minute stroll is recovery, not training.' };
  if (steps < 7000) return { score: 60, tone: 'warn', headline: 'Room to move', detail: 'Benefits climb steeply up to about 8,000 steps. A 10-minute walk after each meal gets you there and blunts the blood-sugar rise.' };
  if (steps < 8000) return { score: 85, tone: 'ok', headline: 'Nearly in the sweet spot', detail: 'One more short walk and you’re in the zone where the health benefit is at its peak.' };
  if (steps <= 14000) return { score: 100, tone: 'good', headline: 'Sweet spot', detail: `Right where the evidence says the benefit peaks. That’s about ${kcal} kcal of walking on top of your training.` };
  if (steps <= 18000) return { score: 85, tone: 'ok', headline: 'Big day on your feet', detail: `About ${kcal} kcal of walking. There’s no extra health payoff past about 10–12k, and on a cut with 7+ sessions a week it eats into recovery and energy availability. Eat for it, or keep tomorrow lighter.` };
  return { score: 65, tone: 'warn', headline: 'Probably too much for you right now', detail: `About ${kcal} kcal of walking: that’s a whole extra meal’s worth burned. With your training load and a deficit, this raises your risk of under-fuelling (REDs), shin and foot bone stress, and puffy-faced fatigue. Not dangerous in itself, but not helping you look or perform better. Aim for 10–13k.` };
}

/**
 * Outdoors: morning daylight sets the body clock, UK summer midday sun
 * makes vitamin D, and about 120 minutes a week in nature is linked with
 * better health and wellbeing (White et al., 2019).
 */
export function outdoorVerdict(min: number, month = new Date().getMonth() + 1): Verdict {
  const vitD = month >= 4 && month <= 9;
  const dNote = vitD
    ? ' April to September, 10–20 minutes of midday sun on your arms (SPF on your face) lets your skin make vitamin D.'
    : ' October to March the UK sun is too low to make vitamin D, so take 10 µg, but the daylight still sets your body clock.';
  if (min < 10) return { score: 20, tone: 'bad', headline: 'Barely saw the sky', detail: `Even overcast UK daylight is roughly 10–50 times brighter than indoor light. Ten minutes outside before 10am anchors your body clock: earlier sleepiness tonight, a better cortisol rhythm tomorrow.${dNote}` };
  if (min < 30) return { score: 65, tone: 'ok', headline: 'A taste of daylight', detail: `Good start. Make one block of it the morning for the biggest body-clock effect.${dNote}` };
  if (min < 120) return { score: 100, tone: 'good', headline: 'Sun-fed', detail: `Daylight, fresh air and a mood lift. Two hours a week in green space or by water is the threshold linked with better health.${dNote}` };
  return { score: 100, tone: 'good', headline: 'Outdoor creature', detail: `Fantastic for mood and body clock. Long sun exposure ages skin, so keep SPF topped up on your face, ears and neck (every 2 hours in strong sun).${dNote}` };
}

export interface RhrAnalysis {
  baseline?: number;
  delta?: number;
  verdict: Verdict;
  n: number;
}

/**
 * Morning resting heart rate against your own rolling baseline (the mean of
 * up to 28 previous mornings). A rise of 5+ bpm usually means something is
 * costing recovery: short sleep, alcohol, illness coming on, heat or
 * dehydration, stress, or under-fuelling.
 */
export function rhrAnalysis(date: string, all: Record<string, Vitals>): RhrAnalysis {
  const today = all[date]?.rhr;
  const prev: number[] = [];
  for (let k = 1; k <= 28; k++) {
    const v = all[addDays(date, -k)]?.rhr;
    if (v) prev.push(v);
  }
  if (!today) return { n: prev.length, verdict: { score: 0, tone: 'ok', headline: 'No morning HR yet', detail: 'Take it on waking, lying still, before you get up: same way, same time, every day.' } };
  if (prev.length < 5) {
    return { n: prev.length, verdict: { score: 80, tone: 'ok', headline: `${today} bpm logged`, detail: `Building your baseline: ${5 - prev.length} more morning${5 - prev.length === 1 ? '' : 's'} until Glow can tell you what today’s number means.` } };
  }
  const baseline = Math.round((prev.reduce((a, b) => a + b, 0) / prev.length) * 10) / 10;
  const delta = Math.round((today - baseline) * 10) / 10;
  let verdict: Verdict;
  if (delta <= -6) verdict = { score: 90, tone: 'ok', headline: 'Unusually low', detail: 'Lower than usual is normally good news, a sign of rising fitness. But if it keeps falling while you feel flat, cold or tired and your weight is dropping, very low heart rate can be a sign of low energy availability. Check your fuelling.' };
  else if (delta <= 3) verdict = { score: 100, tone: 'good', headline: 'Bang on baseline', detail: 'Your nervous system is recovered. Green light for whatever today holds.' };
  else if (delta <= 7) verdict = { score: 60, tone: 'warn', headline: `Up ${delta} bpm`, detail: 'Something is costing you recovery. Usual suspects: short or late sleep, alcohol, a cold coming on, heat, dehydration, stress or too few calories. Keep hard sessions honest, eat carbohydrate and get to bed early.' };
  else verdict = { score: 30, tone: 'bad', headline: `Up ${delta} bpm: recovery alarm`, detail: 'A big jump. If you also feel run-down, this is often the first sign of illness. Swap intensity for easy movement or rest, hydrate, eat well and sleep. Training through it is how colds turn into weeks off.' };
  return { baseline, delta, verdict, n: prev.length };
}

/** The vitality part of the Glow score: whatever was logged, averaged. */
export function vitalityScore(date: string, all: Record<string, Vitals>, kg?: number): number | undefined {
  const v = all[date];
  if (!v) return undefined;
  const parts: number[] = [];
  if (v.steps !== undefined) parts.push(stepsVerdict(v.steps, kg).score);
  if (v.outdoorMin !== undefined) parts.push(outdoorVerdict(v.outdoorMin, Number(date.slice(5, 7))).score);
  if (v.rhr !== undefined) parts.push(rhrAnalysis(date, all).verdict.score);
  return parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : undefined;
}

/** "14k steps, 45 min outside, HR 48": pulls vitals out of a sentence. */
export function parseVitals(text: string): Vitals {
  const s = text.toLowerCase().replace(/,(?=\d{3}\b)/g, '');
  const out: Vitals = {};
  const steps = s.match(/(\d+(?:\.\d+)?)\s*(k)?\s*steps?/) ?? s.match(/steps?\s*:?\s*(\d+(?:\.\d+)?)\s*(k)?/);
  if (steps) out.steps = Math.round(Number(steps[1]) * (steps[2] ? 1000 : 1));
  const out1 = s.match(/(\d+(?:\.\d+)?)\s*(h|hrs?|hours?|m|mins?|minutes?)\s*(?:of\s+)?(?:outside|outdoors?|out|daylight|sun|in the sun|nature|walk(?:ing)? outside)/);
  if (out1) out.outdoorMin = Math.round(Number(out1[1]) * (/^h/.test(out1[2]) ? 60 : 1));
  const hr = s.match(/(?:rhr|hr|heart\s*rate|pulse)\s*(?:was|of|:|=)?\s*(\d{2,3})/) ?? s.match(/(\d{2,3})\s*bpm/);
  if (hr) out.rhr = Number(hr[1]);
  return out;
}

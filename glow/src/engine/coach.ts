import type { DayResult } from './game';
import { outdoorVerdict, rhrAnalysis, stepsVerdict, walkingKcal, type Vitals } from './vitals';
import { plan } from '@/plan';

// The Glow coach: a few short, specific, slightly cheeky lines reacting to
// today's data. Always grounded in a number you logged, never generic.

export interface CoachLine { emoji: string; text: string; tone: 'good' | 'nudge' | 'alert' }

export function coachLines(r: DayResult, vitals: Record<string, Vitals>, opts: { isToday: boolean; hour: number }): CoachLine[] {
  const out: CoachLine[] = [];
  const v = vitals[r.date] ?? {};
  const a = r.analysis;
  const kg = r.weightKg ?? 57;

  if (v.rhr !== undefined) {
    const h = rhrAnalysis(r.date, vitals);
    if (h.delta !== undefined && h.delta > 7) out.push({ emoji: '🚨', tone: 'alert', text: `Heart’s up ${h.delta} bpm on your baseline of ${h.baseline}. Your body is asking for a recovery day. Easy movement only, extra carbohydrate, bed by 10:30.` });
    else if (h.delta !== undefined && h.delta > 3) out.push({ emoji: '🫀', tone: 'nudge', text: `Up ${h.delta} bpm this morning. Something cost you recovery (sleep? salt? stress?). Treat today as a "fuel and sleep" day.` });
    else if (h.delta !== undefined) out.push({ emoji: '💚', tone: 'good', text: `Resting HR ${v.rhr}, right on your ${h.baseline} baseline. Fully charged.` });
  }

  if (v.steps !== undefined) {
    const sv = stepsVerdict(v.steps, kg, r.date);
    if (v.steps > 18000) out.push({ emoji: '🦶', tone: 'alert', text: `${v.steps.toLocaleString('en-GB')} steps is roughly ${walkingKcal(v.steps, kg)} kcal of walking. Legendary legs, but on a cut that’s a meal you didn’t eat. Refuel tonight; tomorrow your usual step target is plenty.` });
    else if (v.steps >= 8000 && v.steps <= 14000) out.push({ emoji: '👟', tone: 'good', text: `${v.steps.toLocaleString('en-GB')} steps: ${sv.headline.toLowerCase()}. Peak health benefit, minimal recovery cost.` });
    else if (v.steps < 7000 && opts.isToday && opts.hour >= 12) out.push({ emoji: '🚶', tone: 'nudge', text: `${v.steps.toLocaleString('en-GB')} steps so far. A 10-minute walk after your next meal blunts its blood-sugar spike and gets you closer to your ${plan().stepsFloor} floor.` });
  }

  if (v.outdoorMin !== undefined) {
    if (v.outdoorMin < 10) out.push({ emoji: '☀️', tone: 'nudge', text: `Only ${v.outdoorMin} minutes outside. Ten minutes of daylight ${opts.hour < 12 ? 'this morning' : 'tomorrow before 10am'} is the cheapest sleep upgrade there is.` });
    else if (v.outdoorMin >= 30) out.push({ emoji: '🌿', tone: 'good', text: `${v.outdoorMin} minutes of sky. ${outdoorVerdict(v.outdoorMin, Number(r.date.slice(5, 7))).headline}. Your body clock thanks you.` });
  } else if (opts.isToday && opts.hour < 11) {
    out.push({ emoji: '🌅', tone: 'nudge', text: 'Get 10 minutes of morning light in your eyes before 10am: it’s what sets tonight’s melatonin.' });
  }

  if (r.sleep) {
    if (r.sleep.hours < 7) out.push({ emoji: '😴', tone: 'alert', text: `${r.sleep.hours.toFixed(1)} h sleep. Expect more hunger, less patience and a puffier face. Protect tonight: caffeine cut-off at 2pm, lights down at 10.` });
    else if (r.sleep.hours >= 8) out.push({ emoji: '🌙', tone: 'good', text: `${r.sleep.hours.toFixed(1)} h of sleep: growth hormone, collagen repair and testosterone all got their full shift.` });
  }

  if (a.totals.kcal > 0) {
    if (a.totals.omega3 >= 0.5) out.push({ emoji: '🐟', tone: 'good', text: `${a.totals.omega3.toFixed(1)} g omega-3 in. Your cell membranes are getting the good stuff.` });
    if (a.plants >= 8) out.push({ emoji: '🌈', tone: 'good', text: `${a.plants} different plants today. Your gut bacteria are throwing a party.` });
    else if (opts.isToday && opts.hour >= 15 && a.plants < 5) out.push({ emoji: '🥦', tone: 'nudge', text: `${a.plants} plants so far. Herbs, a handful of berries or seeds each count as one. Easy wins before bed.` });
    const weakest = [...a.pillars].sort((x, y) => x.score - y.score)[0];
    if (weakest && weakest.score < 55) out.push({ emoji: weakest.pillar.emoji, tone: 'nudge', text: `Weakest pillar: ${weakest.pillar.name} (${weakest.score}). ${weakest.pillar.topTip}` });
  }

  return out.slice(0, 5);
}

export const FUN_FACTS = [
  'Your body replaces about 330 billion cells every day: roughly 3.8 million every second. Today’s food literally becomes you.',
  'Your gut lining renews itself every few days, which is why going strictly gluten-free lets it heal.',
  'Red blood cells live about 120 days, so the iron you eat this week is building blood you’ll run on next season.',
  'Your mitochondria have their own DNA, inherited from your mother.',
  'Collagen is the most abundant protein in your body, and it can’t be made without vitamin C.',
  'You have roughly as many bacterial cells in your gut as human cells in your whole body.',
  'Eating more carotenoid-rich fruit and veg visibly warmed skin tone within about six weeks in one study, and people rated the result as healthier and more attractive.',
  'Overcast UK daylight is still roughly 10–50 times brighter than a well-lit room.',
  'Beetroot’s nitrate is turned into nitric oxide, which helps blood vessels relax and muscles use oxygen.',
  'Wild salmon is pink because of astaxanthin from the krill and shrimp it eats.',
  'A kiwi carries more vitamin C per gram than an orange.',
  'A 10-minute walk after a meal measurably flattens the blood-sugar rise that follows.',
  'Testosterone is mostly released during sleep, which is why a week of short nights lowers it.',
  'Two eggs give about a quarter of your day’s selenium, with choline for the brain.',
  'Oysters have more zinc per gram than almost any other food on earth.',
  'Your heart beats roughly 100,000 times a day. As your fitness grows, it needs fewer beats to do the same work.',
  'Health benefits from daily steps flatten out at around 8,000–10,000 for under-60s.', // plan-ok: the evidence figure
  'Caffeine’s half-life is about 5 hours. A 4pm coffee is still a quarter there at 2am.',
  'Cooking tomatoes with a little fat releases several times more lycopene than eating them raw.',
  'Two hours a week in nature is the threshold linked with better health and wellbeing in a study of 20,000 people.',
];

export function factFor(date: string): string {
  let h = 7;
  for (const c of date) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return FUN_FACTS[h % FUN_FACTS.length];
}

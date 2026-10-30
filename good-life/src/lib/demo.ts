import { addDays, todayISO, weekday } from '@/lib/dates';
import { MEALS } from '@/data/meals';
import { SPLITS } from '@/data/exercises';
import { paceZones, LADDERS } from '@/engine/running';
import type { AppData, CheckIn, FoodEntry, GymSession, RunLog, WeightEntry } from '@/store/types';

// Made-up demonstration data so every screen has something to show before
// real logs exist. Everything is flagged `demo: true`, a banner says so on
// every screen, and it is removed in one tap without touching real entries.

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildDemo(d: AppData, today = todayISO()): Partial<AppData> {
  const r = rng(42);
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)];
  const days = 42;
  const z = paceZones(57);
  const checkIns: Record<string, CheckIn> = {};
  const weights: WeightEntry[] = [];
  const runs: RunLog[] = [];
  const gym: GymSession[] = [];
  const food: FoodEntry[] = [];
  const baseKg = d.profile.startWeightKg ?? 57.5;

  for (let i = days; i >= 1; i--) {
    const date = addDays(today, -i);
    const wd = weekday(date);
    const plan = d.planTemplate[wd];
    const sleep = Math.round((7.4 + r() * 1.8 - (wd === 1 ? 0.4 : 0)) * 4) / 4;
    checkIns[date] = {
      date,
      demo: true,
      flags: r() < 0.08 ? ['sunshine'] : [],
      sleepHours: sleep,
      sleepQuality: Math.min(5, Math.max(2, Math.round(2.5 + (sleep - 7) + r()))),
      energy: Math.min(5, Math.max(2, Math.round(3 + (sleep - 8) * 0.8 + r() - 0.3))),
      soreness: Math.min(5, Math.max(1, Math.round(1.5 + (wd === 5 || wd === 1 ? 1 : 0) + r()))),
      legs: pick(['fresh', 'normal', 'normal', 'normal', wd === 5 ? 'heavy' : 'normal']),
      stress: Math.round(1.5 + r() * 2),
      motivation: Math.round(3 + r() * 2),
      restingHr: Math.round(47 + r() * 4 + (sleep < 7.5 ? 2 : 0)),
      meditationMin: r() < 0.6 ? 10 : 0,
      steps: Math.round(9000 + r() * 6000),
    };
    if (r() < 0.75) weights.push({ id: `demo-w-${date}`, demo: true, date, kg: Math.round((baseKg - (days - i) * 0.012 + (r() - 0.5) * 0.9) * 10) / 10, conditions: 'morning-fasted', waistCm: wd === 0 ? Math.round((73.5 - (days - i) * 0.02) * 10) / 10 : undefined });

    if (plan?.run && r() > 0.08) {
      const level = Math.min(3, 1 + Math.floor((days - i) / 14));
      if (plan.run === 'easy' || plan.run === 'easy-long') {
        const km = plan.run === 'easy' ? 5 : 8;
        const pace = z.E[0] + (z.E[1] - z.E[0]) * (r() * 0.8) - (r() < 0.2 ? 20 : 0);
        runs.push({ id: `demo-r-${date}`, demo: true, date, type: 'easy', distanceKm: km, durationSec: Math.round(km * pace), rpe: r() < 0.2 ? 6 : 3, legs: 'normal', avgHr: Math.round(140 + r() * 10) });
      } else if (plan.run === 'threshold') {
        const t = LADDERS.threshold[level - 1];
        const rep = Math.round(((z.T[0] + z.T[1]) / 2) * (t.distanceM! / 1000) * (1 + (r() - 0.6) * 0.03));
        runs.push({ id: `demo-r-${date}`, demo: true, date, type: 'threshold', sessionId: t.id, distanceKm: 4 + (t.count * t.distanceM!) / 1000, durationSec: 1500 + t.count * rep, reps: Array.from({ length: t.count }, (_, k) => ({ distanceM: t.distanceM!, timeSec: rep + k })), rpe: 7, legs: 'normal' });
      } else if (plan.run === 'q2') {
        const t = LADDERS.vo2[level - 1];
        const rep = Math.round(((z.I[0] + z.I[1]) / 2) * (t.distanceM! / 1000));
        runs.push({ id: `demo-r-${date}`, demo: true, date, type: 'vo2', sessionId: t.id, distanceKm: 4 + (t.count * t.distanceM!) / 1000, durationSec: 1500 + t.count * rep + 600, reps: Array.from({ length: t.count }, (_, k) => ({ distanceM: t.distanceM!, timeSec: rep + (k === t.count - 1 ? 3 : 0) })), rpe: r() < 0.3 ? 9 : 8, legs: r() < 0.25 ? 'heavy' : 'normal', notes: r() < 0.2 ? 'Windy on the back straight' : undefined });
      } else if (plan.run === 'speed') {
        runs.push({ id: `demo-r-${date}`, demo: true, date, type: 'speed', distanceKm: 3, durationSec: 1500, rpe: 7, legs: 'fresh' });
      }
    }

    if (plan?.gym && plan.gym !== 'other' && r() > 0.1) {
      const split = SPLITS[plan.gym];
      const wk = Math.floor((days - i) / 7);
      gym.push({
        id: `demo-g-${date}`,
        demo: true,
        date,
        split: plan.gym,
        durationMin: 60,
        rpe: 7,
        exercises: split.items.map((it) => {
          const base: Record<string, number> = { 'incline-db-press': 22, 'flat-bench': 60, 'pull-up': 0, 'lat-pulldown': 50, 'seated-db-press': 18, 'lateral-raise': 8, 'hack-squat': 80, rdl: 70 };
          const load = (base[it.exerciseId] ?? 15) + (base[it.exerciseId] ? Math.floor(wk / 2) * (base[it.exerciseId] > 40 ? 2.5 : 1) : 0);
          return { exerciseId: it.exerciseId, sets: Array.from({ length: it.sets }, (_, k) => ({ reps: 8 + Math.max(0, 2 - k) + (wk % 2), loadKg: load, rir: 1 + (k === 0 ? 1 : 0) })) };
        }),
      });
    }

    if (i <= 10) {
      const meals = [MEALS[0], pick([MEALS[3], MEALS[6]]), pick([MEALS[4], MEALS[5], MEALS[8]]), MEALS[11]];
      meals.forEach((m, k) => m.items.forEach((it, j) => food.push({ id: `demo-f-${date}-${k}-${j}`, demo: true, date, meal: m.slot, foodId: it.foodId, grams: it.grams })));
    }
  }

  return {
    checkIns,
    weights,
    runs,
    gym,
    food,
    performances: [{ id: 'demo-p-5k', demo: true, event: '5k', timeSec: 17 * 60 + 52, date: addDays(today, -30), kind: 'time-trial', notes: 'Demo time trial' }],
    assessments: [
      { id: 'demo-a1', demo: true, moduleCode: 'SK297', name: 'TMA 01', kind: 'TMA', due: addDays(today, 12), weightPct: 15, wordLimit: 1500, stages: { understand: true, research: true }, question: '(Demo) Evaluate the role of vaccination in controlling an infectious disease of your choice.' },
      { id: 'demo-a2', demo: true, moduleCode: 'SK298', name: 'TMA 01', kind: 'TMA', due: addDays(today, 26), stages: {} },
    ],
    study: Array.from({ length: 12 }, (_, k) => ({ id: `demo-s-${k}`, demo: true, date: addDays(today, -k - 1), moduleCode: k % 2 ? 'SK298' : 'SK297', minutes: 45 + Math.round(r() * 30), activity: pick(['reading', 'notes', 'recall', 'flashcards'] as const), focus: 3 + Math.round(r() * 2) })),
    topics: [
      { id: 'demo-t1', demo: true, moduleCode: 'SK297', name: '(Demo) Innate and adaptive immunity', status: 'notes', confidence: 3, detailedNotes: '', handwrittenDone: false, nextReview: addDays(today, 1) },
      { id: 'demo-t2', demo: true, moduleCode: 'SK297', name: '(Demo) Transmission routes', status: 'reading', confidence: 2, detailedNotes: '', handwrittenDone: false },
    ],
    flashcards: [
      { id: 'demo-c1', demo: true, moduleCode: 'SK297', front: '(Demo) What is R₀?', back: 'The average number of secondary cases from one case in a fully susceptible population.', ease: 2.5, intervalDays: 0, due: today, reps: 0, lapses: 0 },
      { id: 'demo-c2', demo: true, moduleCode: 'SK297', front: '(Demo) Vaccine efficacy vs effectiveness?', back: 'Efficacy: under trial conditions. Effectiveness: in real-world use.', ease: 2.5, intervalDays: 0, due: today, reps: 0, lapses: 0 },
    ],
    wardrobe: [
      { id: 'demo-wd1', demo: true, name: 'White linen shirt', category: 'shirt', colour: 'white', fabric: 'linen', seasons: ['spring', 'summer'], formality: 3, status: 'owned' },
      { id: 'demo-wd2', demo: true, name: 'Navy knitted polo', category: 'polo', colour: 'navy', fabric: 'cotton knit', seasons: ['spring', 'summer', 'autumn'], formality: 3, status: 'owned' },
      { id: 'demo-wd3', demo: true, name: 'Grey merino crewneck', category: 'knitwear', colour: 'grey', fabric: 'merino', seasons: ['spring', 'autumn', 'winter'], formality: 3, status: 'owned' },
      { id: 'demo-wd4', demo: true, name: 'Stone pleated trousers', category: 'trousers', colour: 'stone', fabric: 'cotton twill', seasons: ['spring', 'summer', 'autumn'], formality: 3, status: 'owned' },
      { id: 'demo-wd5', demo: true, name: 'Dark denim', category: 'trousers', colour: 'navy', fabric: 'denim', seasons: ['spring', 'summer', 'autumn', 'winter'], formality: 2, status: 'owned' },
      { id: 'demo-wd6', demo: true, name: 'Brown suede loafers', category: 'shoes', colour: 'dark-brown', fabric: 'suede', seasons: ['spring', 'summer', 'autumn'], formality: 3, status: 'owned' },
      { id: 'demo-wd7', demo: true, name: 'White leather trainers', category: 'shoes', colour: 'white', fabric: 'leather', seasons: ['spring', 'summer', 'autumn', 'winter'], formality: 2, status: 'owned' },
      { id: 'demo-wd8', demo: true, name: 'Stone trench', category: 'outerwear', colour: 'stone', fabric: 'cotton gabardine', seasons: ['spring', 'autumn'], formality: 3, status: 'owned' },
    ],
    life: [
      { id: 'demo-l1', demo: true, date: addDays(today, -6), title: 'Le Cercle Rouge at home', category: 'cinema', enjoyment: 5 },
      { id: 'demo-l2', demo: true, date: addDays(today, -13), title: 'Coastal walk and lunch', category: 'walk', enjoyment: 4, social: true },
    ],
  };
}

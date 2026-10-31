import { describe, expect, it } from 'vitest';
import { addDays } from '@/lib/dates';
import { parseSplits, parseTime } from '@/lib/time';
import { emptyData } from '@/store/defaults';
import type { AppData, RunLog } from '@/store/types';
import { analyseRun, assessGoal, currentFitness, ladderLevels, paceZones, predictTime, vdot, EVENT_METRES } from '@/engine/running';
import { readiness, trainingState } from '@/engine/readiness';
import { energyAvailability, weightTrend, weeklyAverages, assessWeightTarget } from '@/engine/physique';
import { kcalOf, targets } from '@/engine/nutrition';
import { nextTarget, weeklyVolume } from '@/engine/gym';
import { review, newCard, formatReference } from '@/engine/study';
import { buildToday } from '@/engine/today';
import { validateWeek } from '@/engine/plan';
import { offlineReply } from '@/engine/offlineCoach';
import { buildReview } from '@/engine/review';

const TODAY = '2026-10-29'; // a Thursday

function base(): AppData {
  const d = emptyData();
  d.profile.heightCm = 172.7;
  d.profile.dob = '2000-01-15';
  d.profile.targetWeightKg = [55.8, 56.2];
  d.performances.push({ id: 'p1', event: '5k', timeSec: 17 * 60 + 17, date: addDays(TODAY, -20), kind: 'time-trial' });
  return d;
}

const run = (p: Partial<RunLog>): RunLog => ({ id: Math.random().toString(36), date: TODAY, type: 'easy', distanceKm: 5, durationSec: 1500, ...p });

describe('time parsing', () => {
  it('reads the ways times are typed', () => {
    expect(parseTime('57')).toBe(57);
    expect(parseTime('57.3')).toBeCloseTo(57.3);
    expect(parseTime('2:23')).toBe(143);
    expect(parseTime('1:02:30')).toBe(3750);
    expect(parseTime('abc')).toBeNull();
    expect(parseSplits('3:24 3:25, 3:23')).toEqual([204, 205, 203]);
  });
});

describe('fitness model', () => {
  it('gives a VDOT of about 59 for a 17:17 5 km', () => {
    expect(vdot(5000, 1037)).toBeGreaterThan(58.5);
    expect(vdot(5000, 1037)).toBeLessThan(59.6);
  });
  it('round-trips a prediction', () => {
    const v = vdot(5000, 1037);
    expect(predictTime(v, EVENT_METRES['5k'])).toBeCloseTo(1037, 0);
  });
  it('sets threshold pace near 3:43/km at VDOT 59', () => {
    const z = paceZones(59);
    expect(z.T[0]).toBeGreaterThan(215);
    expect(z.T[1]).toBeLessThan(235);
    expect(z.E[0]).toBeGreaterThan(z.T[1]);
  });
  it('prefers a recent marker over an old, faster PB', () => {
    const d = base();
    d.performances.push({ id: 'old', event: '5k', timeSec: 16 * 60 + 30, date: addDays(TODAY, -400), kind: 'race' });
    const f = currentFitness(d, TODAY);
    expect(f.confidence).toBe('current');
    expect(f.source?.timeSec).toBe(1037);
  });
  it('flags a stale estimate when nothing is recent', () => {
    const d = emptyData();
    d.performances.push({ id: 'old', event: '5k', timeSec: 1037, date: '2025-05-01', kind: 'gps-best-effort' });
    expect(currentFitness(d, TODAY).confidence).toBe('stale');
  });
});

describe('goal assessment', () => {
  it('prefers a same-distance result and never projects distance goals from sprints', () => {
    const d = emptyData();
    d.performances.push(
      { id: 'a', event: '1k', timeSec: 180, date: addDays(TODAY, -7), kind: 'time-trial' },
      { id: 'b', event: '400m', timeSec: 60, date: addDays(TODAY, -1), kind: 'time-trial' },
    );
    expect(assessGoal(d, '1k', 164, TODAY).currentSec).toBe(180);
    expect(assessGoal(d, 'mile', 289, TODAY).basisNote).toMatch(/1 km/);
  });
  it('credits fitness held before and says so', () => {
    const d = emptyData();
    d.performances.push(
      { id: 'now', event: '5k', timeSec: 1089, date: addDays(TODAY, -40), kind: 'time-trial' },
      { id: 'then', event: '5k', timeSec: 1037, date: addDays(TODAY, -500), kind: 'race' },
    );
    const a = assessGoal(d, '5k', 1019, TODAY);
    expect(a.horizon).toBe('season');
    expect(a.comment).toMatch(/You have run 17:17/);
  });
});

describe('run analysis', () => {
  const zones = paceZones(59);
  it('calls threshold reps at 5 km pace too fast', () => {
    const a = analyseRun(run({ type: 'threshold', reps: Array(5).fill({ distanceM: 1000, timeSec: 207 }), rpe: 8 }), zones);
    expect(a.verdict).toBe('too-fast');
  });
  it('progresses an on-target session at the expected effort', () => {
    const t = Math.round(zones.T[1] - 2);
    const a = analyseRun(run({ type: 'threshold', reps: Array(5).fill({ distanceM: 1000, timeSec: t }), rpe: 7, legs: 'normal' }), zones);
    expect(a.verdict).toBe('progress');
  });
  it('repeats when on pace but costly', () => {
    const t = Math.round(zones.T[1] - 2);
    const a = analyseRun(run({ type: 'threshold', reps: Array(5).fill({ distanceM: 1000, timeSec: t }), rpe: 9, legs: 'heavy' }), zones);
    expect(a.verdict).toBe('repeat');
    expect(a.fatigueSignal).toBe(true);
  });
  it('regresses when slow and hard', () => {
    const t = Math.round(zones.T[1] * 1.06);
    const a = analyseRun(run({ type: 'threshold', reps: Array(5).fill({ distanceM: 1000, timeSec: t }), rpe: 9 }), zones);
    expect(a.verdict).toBe('regress');
  });
  it('flags easy runs run too hard', () => {
    const a = analyseRun(run({ type: 'easy', distanceKm: 8, durationSec: 8 * 215 }), zones);
    expect(a.verdict).toBe('easy-too-fast');
  });
  it('picks up context from notes', () => {
    const a = analyseRun(run({ type: 'vo2', notes: 'bad wind, low carbs', reps: [{ distanceM: 1000, timeSec: 205 }] }), zones);
    expect(a.points.join(' ')).toMatch(/wind/);
    expect(a.points.join(' ')).toMatch(/glycogen/);
  });
  it('climbs the ladder from logged sessions', () => {
    const d = base();
    const t = Math.round(zones.T[1] - 2);
    d.runs.push(run({ date: addDays(TODAY, -7), type: 'threshold', reps: Array(5).fill({ distanceM: 1000, timeSec: t }), rpe: 7 }));
    expect(ladderLevels(d, zones).threshold).toBe((d.settings.startLevels.threshold ?? 1) + 1);
  });
});

describe('readiness and training state', () => {
  it('reads a good morning as ready', () => {
    const d = base();
    d.checkIns[TODAY] = { date: TODAY, flags: [], sleepHours: 8.5, sleepQuality: 4, energy: 4, soreness: 1, legs: 'fresh', stress: 2 };
    expect(readiness(d, TODAY).band).toBe('high');
  });
  it('overrides everything for a fever', () => {
    const d = base();
    d.checkIns[TODAY] = { date: TODAY, flags: [], sleepHours: 9, energy: 4, legs: 'fresh', illness: 'fever' };
    const r = readiness(d, TODAY);
    expect(r.band).toBe('low');
    expect(r.override).toMatch(/rest/i);
  });
  it('identifies lagging recovery from short sleep', () => {
    const d = base();
    for (let i = 0; i < 5; i++) {
      const dt = addDays(TODAY, -i);
      d.checkIns[dt] = { date: dt, flags: [], sleepHours: 6, energy: 2, legs: 'heavy', soreness: 3 };
    }
    expect(trainingState(d, TODAY).kind).toBe('insufficient-recovery');
  });
});

describe('physique', () => {
  it('computes a trend from noisy daily weights', () => {
    const d = base();
    for (let i = 0; i < 21; i++) d.weights.push({ id: `w${i}`, date: addDays(TODAY, -20 + i), kg: 57.6 - i * 0.02 + (i % 2 ? 0.4 : -0.4) });
    const t = weightTrend(d, 21, TODAY);
    expect(t.reliable).toBe(true);
    expect(t.kgPerWeek!).toBeLessThan(0);
    expect(weeklyAverages(d).length).toBeGreaterThanOrEqual(3);
  });
  it('estimates low energy availability for a low intake with heavy training', () => {
    const d = base();
    for (let i = 1; i <= 7; i++) {
      const dt = addDays(TODAY, -i);
      d.weights.push({ id: `w${i}`, date: dt, kg: 57.6 });
      d.food.push({ id: `f${i}`, date: dt, meal: 'lunch', foodId: 'oats-gf', grams: 470 }); // ≈1,780 kcal
      d.runs.push(run({ id: `r${i}`, date: dt, distanceKm: 8, durationSec: 2400 }));
    }
    const ea = energyAvailability(d, kcalOf(d), TODAY);
    expect(ea.band).toBe('low');
  });
  it('questions a target below BMI 18.5', () => {
    const d = base();
    d.profile.targetWeightKg = [53, 54];
    for (let i = 0; i < 14; i++) d.weights.push({ id: `w${i}`, date: addDays(TODAY, -i), kg: 57.6 });
    expect(assessWeightTarget(d, kcalOf(d)).verdict).toBe('reconsider');
  });
});

describe('nutrition targets', () => {
  it('raises carbohydrate on a quality day', () => {
    const d = base();
    d.weights.push({ id: 'w', date: TODAY, kg: 57.6 });
    const q = targets(d, TODAY); // Thursday: Q2 + legs in the default plan
    const sat = targets(d, '2026-10-31'); // Saturday: rest
    expect(q.carbs.lo).toBeGreaterThan(sat.carbs.hi);
  });
});

describe('gym', () => {
  it('adds load when every set hits the top of the range', () => {
    const d = base();
    d.gym.push({ id: 'g', date: addDays(TODAY, -7), split: 'chest-triceps', exercises: [{ exerciseId: 'incline-db-press', sets: [10, 10, 10].map((reps) => ({ reps, loadKg: 24, rir: 1 })) }] });
    const t = nextTarget(d, 'incline-db-press', 3);
    expect(t.basis).toBe('add-load');
    expect(t.loadKg).toBe(26);
  });
  it('counts direct and indirect sets', () => {
    const d = base();
    d.gym.push({ id: 'g', date: TODAY, split: 'chest-triceps', exercises: [{ exerciseId: 'incline-db-press', sets: [8, 8, 8].map((reps) => ({ reps, loadKg: 24, rir: 2 })) }] });
    const v = weeklyVolume(d, '2026-10-26');
    expect(v['upper-chest']).toBe(3);
    expect(v.triceps).toBe(1.5);
  });
});

describe('study', () => {
  it('spaces reviews further apart as recall succeeds', () => {
    let c = newCard({ id: 'c', moduleCode: 'SK297', front: 'q', back: 'a' }, TODAY);
    c = review(c, 'good', TODAY);
    expect(c.intervalDays).toBe(1);
    c = review(c, 'good', TODAY);
    expect(c.intervalDays).toBe(3);
    c = review(c, 'good', TODAY);
    expect(c.intervalDays).toBeGreaterThan(6);
    c = review(c, 'again', TODAY);
    expect(c.intervalDays).toBe(1);
    expect(c.lapses).toBe(1);
  });
  it('formats a Cite Them Right journal reference', () => {
    const r = formatReference('journal', { authors: 'Tudor Hart, J.', year: '1971', title: 'The inverse care law', journal: 'The Lancet', volume: '297', issue: '7696', pages: '405–412', doi: '10.1016/S0140-6736(71)92410-X' });
    expect(r.list).toContain("(1971) 'The inverse care law', *The Lancet*, 297(7696), pp. 405–412.");
    expect(r.list).toContain('https://doi.org/10.1016/S0140-6736(71)92410-X');
  });
});

describe('today', () => {
  it('recommends recovery when exhausted', () => {
    const d = base();
    d.checkIns[TODAY] = { date: TODAY, flags: ['exhausted'], sleepHours: 6, energy: 2 };
    expect(buildToday(d, TODAY).recommended).toBe('recovery');
  });
  it('does not turn an easy day hard on motivation alone', () => {
    const d = base();
    const wed = '2026-10-28';
    d.checkIns[wed] = { date: wed, flags: ['brilliant'], sleepHours: 7, energy: 3, legs: 'normal' };
    const t = buildToday(d, wed);
    expect(t.broughtForward).toBeUndefined();
    expect(t.reasons.join(' ')).toMatch(/motivation is not readiness/);
  });
  it('brings a session forward when readiness backs it up', () => {
    const d = base();
    const wed = '2026-10-28';
    d.checkIns[wed] = { date: wed, flags: ['brilliant'], sleepHours: 9, sleepQuality: 5, energy: 5, soreness: 1, legs: 'fresh', stress: 1 };
    expect(buildToday(d, wed).broughtForward?.run).toBe('q2');
  });
  it('ships a default week with no clashes', () => {
    expect(validateWeek(base(), TODAY)).toEqual([]);
  });
});

describe('coach and reviews', () => {
  it('turns "I’m exhausted" into a flag and an adjusted plan', () => {
    const r = offlineReply(base(), 'I’m exhausted today', TODAY);
    expect(r.setFlags).toContain('exhausted');
    expect(r.text).toMatch(/Recovery/);
  });
  it('produces a weekly review even with thin data, and says so', () => {
    const r = buildReview(base(), 'weekly', TODAY);
    expect(r.dataNote).toMatch(/provisional/);
    expect(r.highestValue.length).toBeGreaterThan(0);
  });
});

describe('daily log inputs', () => {
  it('uses a typed kcal total when food is not logged item by item', () => {
    const d = base();
    const y = addDays(TODAY, -1);
    d.checkIns[y] = { date: y, flags: [], kcalEaten: 1800 };
    expect(energyAvailability(d, kcalOf(d), TODAY).daysWithIntake).toBe(1);
  });
  it('treats pain as a reason to hold back and says so', () => {
    const d = base();
    d.checkIns[TODAY] = { date: TODAY, flags: [], sleepHours: 9, energy: 5, legs: 'fresh', niggle: 'left achilles, tight' };
    expect(readiness(d, TODAY).score!).toBeLessThanOrEqual(58);
    const t = buildToday(d, TODAY);
    expect(t.level).toBe('amber');
    expect(t.warnings.join(' ')).toMatch(/left achilles/);
  });
});

describe('run context from titles', () => {
  it('reads heat and fuelling from a Strava title without mistaking hills for illness', () => {
    const hot = analyseRun(run({ type: 'speed', title: '4x300 m in 28 degree suppose to be 5 but too hot' }), null);
    expect(hot.points.join(' ')).toMatch(/heat/);
    const hill = analyseRun(run({ type: 'speed', title: '2x200 m half uphill hill 3 x 200 m flat sprints' }), null);
    expect(hill.points.join(' ')).not.toMatch(/unwell/);
    const ill = analyseRun(run({ notes: 'felt ill' }), null);
    expect(ill.points.join(' ')).toMatch(/unwell/);
  });
});

describe('achievements', () => {
  it('scores a day from the log, with rest days rewarded for resting', async () => {
    const { dayScore } = await import('@/engine/achievements');
    const d = base();
    d.profile.restDay = 6;
    const sat = '2026-10-31';
    d.checkIns[sat] = { date: sat, flags: [], sleepHours: 8.5, steps: 14000, habits: ['no-phone', 'skin-am', 'skin-pm', 'teeth'], meditationMin: 10 };
    d.study.push({ id: 's', date: sat, moduleCode: 'SK297', minutes: 60, activity: 'daily' });
    expect(dayScore(d, sat).score).toBe(100);
    d.runs.push(run({ date: sat, type: 'vo2' }));
    expect(dayScore(d, sat).score).toBe(85);
  });
  it('unlocks from logs only, ignores demo data, and never rewards intensity', async () => {
    const { achievements } = await import('@/engine/achievements');
    const d = base();
    for (let i = 0; i < 20; i++) d.runs.push(run({ date: addDays(TODAY, -i), type: 'vo2', distanceKm: 6, demo: true }));
    expect(achievements(d, TODAY).find((a) => a.id === 'km-100')!.unlocked).toBe(false);
    for (let i = 0; i < 20; i++) d.runs.push(run({ date: addDays(TODAY, -i), distanceKm: 6 }));
    const list = achievements(d, TODAY);
    expect(list.find((a) => a.id === 'km-100')!.unlocked).toBe(true);
    expect(list.find((a) => a.id === 'streak-7')!.unlocked).toBe(true);
    expect(list.some((a) => /hard sessions|vo2|faster more/i.test(a.detail) && a.group === 'Running' && a.id !== 'in-control')).toBe(false);
  });
  it('unlocks a running goal only with a result at or under the target', async () => {
    const { achievements } = await import('@/engine/achievements');
    const d = base();
    d.runGoals = [{ event: '5k', targetSec: 1019, label: 'Sub-17' }];
    const g = () => achievements(d, TODAY).find((a) => a.group === 'Goals')!;
    expect(g().unlocked).toBe(false);
    expect(g().progressLabel).toMatch(/to go/);
    d.performances.push({ id: 'p2', event: '5k', timeSec: 1015, date: TODAY, kind: 'race' });
    expect(g().unlocked).toBe(true);
  });
});

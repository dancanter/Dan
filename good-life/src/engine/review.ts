import { addDays, daysBetween, startOfWeek, todayISO, type ISODate } from '@/lib/dates';
import { mean, sd } from '@/lib/stats';
import { MUSCLE_LABEL, PRIORITY_MUSCLES } from '@/data/exercises';
import type { AppData, RoadmapPhase } from '@/store/types';
import { weeklyVolume, volumeTargets } from './gym';
import { kcalOf } from './nutrition';
import { energyAvailability, strengthChange, weeklyAverages, weightTrend } from './physique';
import { dayPlan, HARD_PLANNED } from './plan';
import { readiness, trainingState } from './readiness';
import { analyseRun, currentFitness, HARD_TYPES, paceZones } from './running';
import { dueCards } from './study';

export interface PeriodStats {
  from: ISODate;
  to: ISODate;
  runs: number;
  km: number;
  hardRuns: number;
  plannedRuns: number;
  plannedHard: number;
  gymSessions: number;
  plannedGym: number;
  checkIns: number;
  avgSleep: number | null;
  sleepSd: number | null;
  goodReadinessDays: number;
  avgWeightKg: number | null;
  studyMin: number;
  studyTargetMin: number;
  meditationDays: number;
  lifeEntries: number;
  avgEnjoyment: number | null;
  easyTooFast: number;
  fatigueSessions: number;
}

export function periodStats(d: AppData, from: ISODate, to: ISODate): PeriodStats {
  const days = daysBetween(from, to);
  const runs = d.runs.filter((r) => r.date >= from && r.date <= to);
  const fit = currentFitness(d, to);
  const zones = fit.vdot ? paceZones(fit.vdot) : null;
  const analysed = runs.map((r) => analyseRun(r, zones));
  const plans = days.map((dt) => dayPlan(d, dt));
  const checkIns = days.map((dt) => d.checkIns[dt]).filter(Boolean);
  const sleeps = checkIns.map((c) => c!.sleepHours).filter((x): x is number => x != null);
  const weeks = days.length / 7;
  const life = d.life.filter((l) => l.date >= from && l.date <= to);
  return {
    from,
    to,
    runs: runs.length,
    km: runs.reduce((s, r) => s + r.distanceKm, 0),
    hardRuns: runs.filter((r) => HARD_TYPES.includes(r.type)).length,
    plannedRuns: plans.filter((p) => p.run).length,
    plannedHard: plans.filter((p) => p.run && HARD_PLANNED.includes(p.run)).length,
    gymSessions: d.gym.filter((g) => g.date >= from && g.date <= to).length,
    plannedGym: plans.filter((p) => p.gym).length,
    checkIns: checkIns.length,
    avgSleep: mean(sleeps),
    sleepSd: sd(sleeps),
    goodReadinessDays: days.filter((dt) => ['high', 'normal'].includes(readiness(d, dt).band ?? '')).length,
    avgWeightKg: mean(d.weights.filter((w) => w.date >= from && w.date <= to).map((w) => w.kg)),
    studyMin: d.study.filter((s) => s.date >= from && s.date <= to).reduce((a, s) => a + s.minutes, 0),
    studyTargetMin: d.modules.reduce((a, m) => a + m.weeklyTargetHours * 60, 0) * weeks,
    meditationDays: checkIns.filter((c) => (c!.meditationMin ?? 0) > 0).length,
    lifeEntries: life.length,
    avgEnjoyment: mean(life.map((l) => l.enjoyment).filter((x): x is number => x != null)),
    easyTooFast: analysed.filter((a) => a.verdict === 'easy-too-fast').length,
    fatigueSessions: analysed.filter((a) => a.fatigueSignal).length,
  };
}

export interface Review {
  kind: 'weekly' | 'monthly';
  from: ISODate;
  to: ISODate;
  improved: string[];
  deteriorated: string[];
  holdingBack: string[];
  change: string[];
  keep: string[];
  highestValue: string;
  dataNote: string;
  stats: PeriodStats;
}

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

/**
 * Compares a period with the one before it. Each judgement is tied to a
 * number, and thin data is said out loud rather than papered over.
 */
export function buildReview(d: AppData, kind: 'weekly' | 'monthly', endDate: ISODate = addDays(startOfWeek(todayISO()), -1)): Review {
  const len = kind === 'weekly' ? 7 : 28;
  const to = endDate;
  const from = addDays(to, -(len - 1));
  const cur = periodStats(d, from, to);
  const prev = periodStats(d, addDays(from, -len), addDays(from, -1));
  const improved: string[] = [];
  const deteriorated: string[] = [];
  const holdingBack: string[] = [];
  const change: string[] = [];
  const keep: string[] = [];
  const [sleepLo] = d.profile.sleepTargetHours;

  const cmp = (label: string, a: number | null, b: number | null, unit: string, better: 'up' | 'down', threshold: number) => {
    if (a == null || b == null) return;
    const diff = a - b;
    if (Math.abs(diff) < threshold) return;
    const text = `${label}: ${b.toFixed(1)} → ${a.toFixed(1)} ${unit}`;
    ((better === 'up' ? diff > 0 : diff < 0) ? improved : deteriorated).push(text);
  };
  cmp('Average sleep', cur.avgSleep, prev.avgSleep, 'h', 'up', 0.25);
  cmp('Sleep variability (SD)', cur.sleepSd, prev.sleepSd, 'h', 'down', 0.2);
  cmp('Running volume', cur.km, prev.km, 'km', 'up', 3);
  cmp('Study time', cur.studyMin / 60, prev.studyMin / 60, 'h', 'up', 1);
  cmp('Days with good readiness', cur.goodReadinessDays, prev.goodReadinessDays, 'days', 'up', 1);
  if (cur.lifeEntries > prev.lifeEntries) improved.push(`Enjoyment logged: ${prev.lifeEntries} → ${cur.lifeEntries} activities`);
  else if (cur.lifeEntries < prev.lifeEntries) deteriorated.push(`Enjoyment logged: ${prev.lifeEntries} → ${cur.lifeEntries} activities`);

  const strength = strengthChange(d, to);
  const up = strength.filter((s) => s.changePct > 2);
  const down = strength.filter((s) => s.changePct < -3);
  if (up.length) improved.push(`${up.length} key lift${up.length > 1 ? 's' : ''} up >2% on the previous four weeks`);
  if (down.length) deteriorated.push(`${down.length} key lift${down.length > 1 ? 's' : ''} down >3% on the previous four weeks`);

  const runAdherence = pct(cur.runs, cur.plannedRuns);
  const gymAdherence = pct(cur.gymSessions, cur.plannedGym);
  const studyAdherence = pct(cur.studyMin, cur.studyTargetMin);

  // What is holding things back — the largest controllable constraint.
  if (cur.avgSleep != null && cur.avgSleep < sleepLo - 0.5) holdingBack.push(`Sleep (${cur.avgSleep.toFixed(1)} h average against a ${sleepLo} h floor). It sits upstream of training quality, recovery and study.`);
  if (cur.fatigueSessions >= 2) holdingBack.push(`${cur.fatigueSessions} sessions cost more effort than expected — fatigue is outpacing recovery.`);
  if (cur.easyTooFast >= 2) holdingBack.push(`${cur.easyTooFast} easy runs were run too hard. This is the most common, most fixable error in amateur training.`);
  const ea = energyAvailability(d, kcalOf(d), to);
  if (ea.band === 'low') holdingBack.push('Logged intake implies low energy availability — under-fuelling limits adaptation in both running and lifting.');
  if (cur.plannedRuns && runAdherence < 70) holdingBack.push(`Running consistency: ${cur.runs} of ${cur.plannedRuns} planned runs (${runAdherence}%).`);
  if (studyAdherence < 70 && cur.studyTargetMin > 0) holdingBack.push(`Study time at ${studyAdherence}% of target (${Math.round(cur.studyMin / 60)} of ${Math.round(cur.studyTargetMin / 60)} h).`);
  const trend = weightTrend(d, 21, to);
  if (trend.pctPerWeek != null && trend.pctPerWeek < -0.7) holdingBack.push(`Weight falling ${Math.abs(trend.pctPerWeek).toFixed(2)}%/week — faster than muscle-sparing pace.`);

  // What to change — one concrete change per constraint, at most three.
  for (const h of holdingBack.slice(0, 3)) {
    if (h.startsWith('Sleep')) change.push('Fix a wake time for all seven days and count back to a lights-out time. No other change this week.');
    else if (h.includes('fatigue')) change.push('Next week: one quality session plus the speed session only; easy runs at the slow end of the range.');
    else if (h.includes('easy runs')) change.push('Run easy days by feel at conversational effort, and check pace afterwards rather than during.');
    else if (h.includes('energy availability')) change.push('Add ~300 kcal on training days, mostly carbohydrate in the meal before and after running.');
    else if (h.startsWith('Running consistency')) change.push('Move sessions rather than drop them — the planner warns if a move creates a clash.');
    else if (h.startsWith('Study')) change.push('Put two 50-minute study blocks in the calendar at fixed times before training.');
    else if (h.startsWith('Weight')) change.push('Raise intake by ~200 kcal/day; aim for 0.25–0.5%/week.');
  }

  // What to leave alone.
  if (runAdherence >= 80) keep.push(`Running consistency (${runAdherence}% of planned runs).`);
  if (gymAdherence >= 80) keep.push(`Gym consistency (${gymAdherence}% of planned sessions).`);
  if (cur.avgSleep != null && cur.avgSleep >= sleepLo) keep.push(`Sleep at ${cur.avgSleep.toFixed(1)} h average.`);
  if (cur.meditationDays >= 4) keep.push(`Meditation on ${cur.meditationDays} days.`);
  if (studyAdherence >= 90) keep.push(`Study rhythm (${studyAdherence}% of target).`);
  if (!keep.length) keep.push('The overall plan structure — change one thing at a time so you can tell what worked.');

  const vol = weeklyVolume(d, startOfWeek(to));
  const targetsV = volumeTargets(d);
  const shortPriority = PRIORITY_MUSCLES.filter((m) => vol[m] < targetsV[m][0]);
  if (!holdingBack.length && shortPriority.length && cur.gymSessions >= 3) {
    holdingBack.push(`Priority muscles under their volume range last week: ${shortPriority.map((m) => MUSCLE_LABEL[m]).join(', ')}.`);
    change.push('Add the priority add-on sets already in the programme rather than new exercises.');
  }

  const highestValue = change[0] ?? (holdingBack.length ? 'Address the first item under "holding you back".' : 'Repeat this week. Consistency is the plan working.');
  const dataNote =
    cur.checkIns < (kind === 'weekly' ? 4 : 16)
      ? `Based on ${cur.checkIns} check-ins in ${len} days — treat conclusions as provisional.`
      : `Based on ${cur.checkIns} check-ins, ${cur.runs} runs and ${cur.gymSessions} gym sessions.`;
  return { kind, from, to, improved, deteriorated, holdingBack, change, keep, highestValue, dataNote, stats: cur };
}

export function reviewToText(r: Review): string {
  const sec = (t: string, xs: string[]) => (xs.length ? `${t}\n${xs.map((x) => `• ${x}`).join('\n')}\n` : '');
  return [
    `${r.kind === 'weekly' ? 'Weekly' : 'Monthly'} review ${r.from} → ${r.to}`,
    sec('Improved', r.improved),
    sec('Deteriorated', r.deteriorated),
    sec('Holding you back', r.holdingBack),
    sec('Change', r.change),
    sec('Keep', r.keep),
    `Highest-value action: ${r.highestValue}`,
    r.dataNote,
  ].join('\n');
}

// ─── Roadmap phases ────────────────────────────────────────────────────────
// Phases change on evidence, never on the calendar alone. The app proposes;
// Dan confirms.

export interface RoadmapCheck {
  label: string;
  met: boolean;
}

export interface RoadmapEvaluation {
  phase: RoadmapPhase;
  next: RoadmapPhase | null;
  ready: boolean;
  checks: RoadmapCheck[];
  summary: string;
}

export const ROADMAP: Record<RoadmapPhase, { label: string; aim: string }> = {
  baseline: { label: 'Phase 1 · Establish baseline', aim: 'Understand where you actually are: training, sleep, body, study load and nutrition.' },
  consistency: { label: 'Phase 2 · Build consistency', aim: 'Make the routine boring and reliable; find the weak links.' },
  development: { label: 'Phase 3 · Performance development', aim: 'Progress running, strength, muscle and academic work deliberately.' },
  consolidation: { label: 'Phase 4 · Consolidation', aim: 'Shed accumulated fatigue, test, and refine priorities.' },
  progression: { label: 'Phase 5 · Long-term progression', aim: 'Set new targets from real results and begin the next cycle.' },
};

export function evaluateRoadmap(d: AppData, today: ISODate = todayISO()): RoadmapEvaluation {
  const phase = d.roadmap.current;
  const last28 = periodStats(d, addDays(today, -27), today);
  const last21From = addDays(today, -20);
  const checks: RoadmapCheck[] = [];
  let next: RoadmapPhase | null = null;
  let summary = '';

  if (phase === 'baseline') {
    const checkIns = Object.keys(d.checkIns).filter((k) => k >= last21From).length;
    checks.push(
      { label: '14+ check-ins in the last 3 weeks', met: checkIns >= 14 },
      { label: '10+ weigh-ins', met: d.weights.filter((w) => w.date >= last21From).length >= 10 },
      { label: '8+ runs including 2 quality sessions', met: d.runs.filter((r) => r.date >= last21From).length >= 8 && d.runs.filter((r) => r.date >= last21From && ['threshold', 'vo2', 'race-pace'].includes(r.type)).length >= 2 },
      { label: 'A current fitness marker (race or time trial in 90 days)', met: currentFitness(d, today).confidence === 'current' },
      { label: '6+ gym sessions logged', met: d.gym.filter((g) => g.date >= last21From).length >= 6 },
      { label: 'Module assessment dates entered', met: d.assessments.length >= 2 },
    );
    next = 'consistency';
    summary = 'Collecting enough real data to make the rest of the app trustworthy.';
  } else if (phase === 'consistency') {
    checks.push(
      { label: '≥80% of planned runs over 4 weeks', met: pct(last28.runs, last28.plannedRuns) >= 80 },
      { label: '≥80% of planned gym sessions', met: pct(last28.gymSessions, last28.plannedGym) >= 80 },
      { label: 'Average sleep ≥ 7.5 h', met: (last28.avgSleep ?? 0) >= 7.5 },
      { label: 'Study ≥ 80% of target', met: pct(last28.studyMin, last28.studyTargetMin) >= 80 },
      { label: 'No energy-availability warning', met: energyAvailability(d, kcalOf(d), today).band !== 'low' },
    );
    next = 'development';
    summary = 'Progress comes from the routine, so the routine has to be solid first.';
  } else if (phase === 'development') {
    const state = trainingState(d, today);
    const weeksIn = Math.floor((new Date(today).getTime() - new Date(d.roadmap.since).getTime()) / (7 * 86_400_000));
    const upcomingEma = d.assessments.some((a) => (a.kind === 'EMA' || a.kind === 'Exam') && a.due >= today && a.due <= addDays(today, 28));
    checks.push(
      { label: '8+ weeks of development', met: weeksIn >= 8 },
      { label: 'Accumulated fatigue or recovery lagging', met: state.kind === 'accumulated-fatigue' || state.kind === 'insufficient-recovery' },
      { label: 'EMA or exam within 4 weeks', met: upcomingEma },
    );
    next = 'consolidation';
    summary = 'Any one of these means it is time to consolidate.';
    return { phase, next, ready: checks.some((c) => c.met), checks, summary };
  } else if (phase === 'consolidation') {
    checks.push(
      { label: 'Readiness good on 5 of the last 7 days', met: Array.from({ length: 7 }, (_, i) => readiness(d, addDays(today, -i)).band).filter((b) => b === 'high' || b === 'normal').length >= 5 },
      { label: 'A time trial or race logged in the last 3 weeks', met: d.runs.some((r) => (r.type === 'race' || r.type === 'time-trial') && r.date >= last21From) },
      { label: 'A monthly review saved', met: d.reviews.some((r) => r.kind === 'monthly' && r.created.slice(0, 10) >= last21From) },
    );
    next = 'progression';
    summary = 'Fresh, tested and reviewed — then set the next targets.';
  } else {
    checks.push({ label: 'New targets set from your latest results', met: d.runGoals.length > 0 });
    next = 'development';
    summary = 'Set targets from what the last cycle actually showed, then start the next development block.';
  }
  return { phase, next, ready: checks.every((c) => c.met), checks, summary };
}

export function weeklyWeightChange(d: AppData): number | null {
  const w = weeklyAverages(d);
  if (w.length < 2) return null;
  return w[w.length - 1].avgKg - w[w.length - 2].avgKg;
}

export function flashcardsDue(d: AppData): number {
  return dueCards(d).length;
}

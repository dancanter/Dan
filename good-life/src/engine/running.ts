import { diffDays, todayISO, type ISODate } from '@/lib/dates';
import { paceFor } from '@/lib/time';
import { mean, sd } from '@/lib/stats';
import type { AppData, Performance, RunEvent, RunLog, RunType, LegFeel } from '@/store/types';

// ─── Fitness model ─────────────────────────────────────────────────────────
// Daniels & Gilbert's oxygen-cost and %VO2max-sustainable curves ("VDOT").
// It is a coaching model fitted to race results, not a lab measurement: it
// is decent from ~1500 m to the half marathon and unreliable for 800 m and
// below, where anaerobic energy matters too much. So short events are kept
// as speed markers and never set training paces.

export const EVENT_METRES: Record<RunEvent, number> = {
  '200m': 200,
  '400m': 400,
  '600m': 600,
  '800m': 800,
  '1k': 1000,
  mile: 1609.344,
  '3k': 3000,
  '5k': 5000,
  '10k': 10000,
};

export const EVENT_LABEL: Record<RunEvent, string> = {
  '200m': '200 m',
  '400m': '400 m',
  '600m': '600 m',
  '800m': '800 m',
  '1k': '1 km',
  mile: 'Mile',
  '3k': '3 km',
  '5k': '5 km',
  '10k': '10 km',
};

/** Events long enough for the aerobic model to be meaningful. */
export const AEROBIC_EVENTS: RunEvent[] = ['mile', '3k', '5k', '10k'];

const vo2Cost = (v: number) => -4.6 + 0.182258 * v + 0.000104 * v * v; // v in m/min
const fractionSustainable = (tMin: number) =>
  0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin);

export function vdot(metres: number, sec: number): number {
  const t = sec / 60;
  return vo2Cost(metres / t) / fractionSustainable(t);
}

/** Running speed (m/min) whose oxygen cost equals the given VO2. */
export function velocityAt(vo2: number): number {
  const a = 0.000104;
  const b = 0.182258;
  const c = -4.6 - vo2;
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
}

export function paceAtFraction(v: number, fraction: number): number {
  return 60_000 / velocityAt(v * fraction); // sec per km
}

/** Equivalent race time for a distance at a given VDOT (bisection). */
export function predictTime(v: number, metres: number): number {
  let lo = metres / 12; // 12 m/s — faster than anyone
  let hi = metres / 1.5;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (vdot(metres, mid) > v) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export type Zone = 'E' | 'SubT' | 'T' | 'I' | 'R';

export interface PaceZones {
  vdot: number;
  /** [fast, slow] in seconds per km. */
  E: [number, number];
  SubT: [number, number];
  T: [number, number];
  I: [number, number];
  R: [number, number];
}

export function paceZones(v: number): PaceZones {
  const mile = predictTime(v, EVENT_METRES.mile) / 1.609344;
  return {
    vdot: v,
    E: [paceAtFraction(v, 0.72), paceAtFraction(v, 0.62)],
    SubT: [paceAtFraction(v, 0.86), paceAtFraction(v, 0.83)],
    T: [paceAtFraction(v, 0.89), paceAtFraction(v, 0.86)],
    I: [paceAtFraction(v, 1.0), paceAtFraction(v, 0.955)],
    R: [mile * 0.985, mile * 1.015],
  };
}

export const ZONE_LABEL: Record<Zone, string> = {
  E: 'Easy',
  SubT: 'Sub-threshold',
  T: 'Threshold',
  I: 'VO₂max interval',
  R: 'Mile pace',
};

// ─── Current fitness ───────────────────────────────────────────────────────

export interface FitnessEstimate {
  vdot: number | null;
  source: { event: RunEvent; timeSec: number; date: ISODate | null; kind: string } | null;
  confidence: 'current' | 'stale' | 'none';
  adjustments: number;
  note: string;
}

interface Marker {
  event: RunEvent;
  timeSec: number;
  date: ISODate | null;
  kind: string;
}

export function fitnessMarkers(d: AppData): Marker[] {
  const fromPerf = d.performances.map((p) => ({ event: p.event, timeSec: p.timeSec, date: p.date, kind: p.kind }));
  const fromRuns = d.runs
    .filter((r) => (r.type === 'race' || r.type === 'time-trial') && r.event)
    .map((r) => ({ event: r.event!, timeSec: r.durationSec, date: r.date, kind: r.type }));
  return [...fromPerf, ...fromRuns];
}

/**
 * Training paces come from *current* fitness, not the lifetime best. A PB
 * from a year ago sets paces that are too fast if fitness has slipped —
 * and every session then reads as "missed".
 */
export function currentFitness(d: AppData, today: ISODate = todayISO()): FitnessEstimate {
  const markers = fitnessMarkers(d).filter((m) => AEROBIC_EVENTS.includes(m.event));
  const scored = markers.map((m) => ({ ...m, v: vdot(EVENT_METRES[m.event], m.timeSec) }));
  const adj = d.settings.vdotAdjustments;
  const recent = scored.filter((m) => m.date && diffDays(m.date, today) <= 90);
  const pick = (list: typeof scored) => list.reduce((a, b) => (b.v > a.v ? b : a));
  if (recent.length) {
    const best = pick(recent);
    const later = adj.filter((a) => !best.date || a.date > best.date).reduce((s, a) => s + a.delta, 0);
    return {
      vdot: best.v + later,
      source: best,
      confidence: 'current',
      adjustments: later,
      note: `From your ${EVENT_LABEL[best.event]} on ${best.date}${later ? `, adjusted ${later > 0 ? '+' : ''}${later.toFixed(1)} from session evidence` : ''}.`,
    };
  }
  if (scored.length) {
    const best = pick(scored);
    const later = adj.reduce((s, a) => s + a.delta, 0);
    return {
      vdot: best.v + later,
      source: best,
      confidence: 'stale',
      adjustments: later,
      note: `Based on an older result (${EVENT_LABEL[best.event]}${best.date ? `, ${best.date}` : ''}). Paces may be too fast if fitness has changed — a 3 km or 5 km time trial would recalibrate them.`,
    };
  }
  return { vdot: null, source: null, confidence: 'none', adjustments: 0, note: 'Add a recent race or time trial (mile to 10 km) to set training paces.' };
}

export function bestTimes(d: AppData): Partial<Record<RunEvent, Marker>> {
  const out: Partial<Record<RunEvent, Marker>> = {};
  for (const m of fitnessMarkers(d)) {
    if (!out[m.event] || m.timeSec < out[m.event]!.timeSec) out[m.event] = m;
  }
  return out;
}

// ─── Goals: how far, and how realistic ─────────────────────────────────────

export interface GoalAssessment {
  event: RunEvent;
  targetSec: number;
  currentSec: number | null;
  basis: 'projection' | 'model' | 'best-time' | 'none';
  basisNote: string;
  gapPct: number | null;
  horizon: 'achieved' | 'near' | 'season' | 'multi-season' | 'long-term' | 'unknown';
  comment: string;
}

/** Riegel's endurance model; a steeper exponent for 1 km and below. */
export function riegel(fromM: number, fromSec: number, toM: number): number {
  const e = toM <= 1000 || fromM <= 1000 ? 1.08 : 1.06;
  return fromSec * (toM / fromM) ** e;
}

/**
 * Current ability at a goal distance: the best projection from any recent
 * result at a comparable distance (a 1 km trial says more about the mile
 * than a 5 km does), falling back to the aerobic model, then to the best
 * time on record.
 */
export function assessGoal(d: AppData, event: RunEvent, targetSec: number, today: ISODate = todayISO()): GoalAssessment {
  const target = EVENT_METRES[event];
  const markers = fitnessMarkers(d);
  const recent = markers.filter((m) => m.date && diffDays(m.date, today) <= 120);
  // A same-distance result beats any projection; sprint results (≤400 m)
  // never project to longer events, where aerobic fitness dominates.
  const same = recent.filter((m) => m.event === event);
  const projections = same.length
    ? same.map((m) => ({ m, sec: m.timeSec }))
    : recent
        .filter((m) => EVENT_METRES[m.event] / target >= 1 / 3 && EVENT_METRES[m.event] / target <= 3)
        .filter((m) => target <= 400 || EVENT_METRES[m.event] > 400)
        .map((m) => ({ m, sec: riegel(EVENT_METRES[m.event], m.timeSec, target) }));
  const fit = currentFitness(d, today);
  let currentSec: number | null = null;
  let basis: GoalAssessment['basis'] = 'none';
  let basisNote = '';
  if (projections.length) {
    const best = projections.reduce((a, b) => (b.sec < a.sec ? b : a));
    currentSec = best.sec;
    basis = 'projection';
    basisNote = best.m.event === event ? `your ${EVENT_LABEL[event]} on ${best.m.date}` : `projected from your ${EVENT_LABEL[best.m.event]} on ${best.m.date}`;
  } else if (AEROBIC_EVENTS.includes(event) && fit.vdot) {
    currentSec = predictTime(fit.vdot, target);
    basis = 'model';
    basisNote = 'aerobic model';
  } else {
    const best = bestTimes(d)[event];
    if (best) {
      currentSec = best.timeSec;
      basis = 'best-time';
      basisNote = best.date ? `best logged, ${best.date}` : 'best logged (undated)';
    }
  }
  if (currentSec == null) {
    return { event, targetSec, currentSec, basis, basisNote, gapPct: null, horizon: 'unknown', comment: 'Log a time at or near this distance to assess the goal.' };
  }
  const gapPct = ((currentSec - targetSec) / currentSec) * 100;
  const order: GoalAssessment['horizon'][] = ['achieved', 'near', 'season', 'multi-season', 'long-term'];
  let horizon: GoalAssessment['horizon'] = gapPct <= 0 ? 'achieved' : gapPct < 2 ? 'near' : gapPct < 5 ? 'season' : gapPct < 10 ? 'multi-season' : 'long-term';
  const COMMENT: Record<string, string> = {
    achieved: 'Your current level already meets this. Time to set the next target — or prove it in a race.',
    near: 'Within ~2%: realistic in weeks to a few months of consistent, well-fuelled training — and the right race on the right day.',
    season: 'A 2–5% improvement: a realistic season goal (3–9 months) if training is consistent and recovery is protected.',
    'multi-season': target <= 800
      ? 'A 5–10% gap: plausible over 1–2 years with consistent speed and speed-endurance work, strength training, and staying injury-free.'
      : 'A 5–10% gap: plausible over 1–2 years, usually needing a sustained rise in aerobic volume, not just harder sessions.',
    'long-term': 'More than 10% away: a long-term ambition. Worth holding, but no honest model can promise it — let intermediate targets do the motivating.',
  };
  let comment = COMMENT[horizon];
  // Fitness you have had before tends to come back faster than new fitness is built.
  const previous = markers
    .filter((m) => m.event === event && m.date && diffDays(m.date, today) <= 730 && m.timeSec < currentSec)
    .sort((a, b) => a.timeSec - b.timeSec)[0];
  if (previous && gapPct > 0) {
    const prevGap = ((previous.timeSec - targetSec) / previous.timeSec) * 100;
    const fromPrev: GoalAssessment['horizon'] = prevGap <= 0 ? 'achieved' : prevGap < 2 ? 'near' : prevGap < 5 ? 'season' : prevGap < 10 ? 'multi-season' : 'long-term';
    const better = order[Math.max(order.indexOf(fromPrev), order.indexOf(horizon) - 1)];
    if (better !== horizon) horizon = better;
    comment = `You have run ${formatSec(previous.timeSec)} here (${previous.date}) — ${(((currentSec - previous.timeSec) / currentSec) * 100).toFixed(1)}% faster than you are now. Regaining fitness you have had is usually quicker than building new fitness, so the first job is getting back there: consistent volume and proper fuelling. ${prevGap > 0 ? `From that level the target is a further ${prevGap.toFixed(1)}%.` : 'That time already beats the target.'}`;
  }
  return { event, targetSec, currentSec, basis, basisNote, gapPct, horizon, comment };
}

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return m ? `${m}:${(sec < 120 ? s.toFixed(1) : Math.round(s).toString()).padStart(2, '0')}` : s.toFixed(1);
}

/**
 * Which events look "soft" relative to the others. A weak 800 next to a
 * strong mile usually means the 800 was never raced properly, not a flaw.
 */
export function eventBalance(d: AppData): { event: RunEvent; predicted: number; actual: number; diffPct: number }[] {
  const fit = currentFitness(d);
  if (!fit.vdot) return [];
  const best = bestTimes(d);
  const out: { event: RunEvent; predicted: number; actual: number; diffPct: number }[] = [];
  for (const ev of ['1k', 'mile', '3k', '5k', '10k'] as RunEvent[]) {
    const b = best[ev];
    if (!b) continue;
    const predicted = predictTime(fit.vdot, EVENT_METRES[ev]);
    out.push({ event: ev, predicted, actual: b.timeSec, diffPct: ((b.timeSec - predicted) / predicted) * 100 });
  }
  return out;
}

// ─── Session library ───────────────────────────────────────────────────────

export type QualityKind = 'threshold' | 'vo2' | 'race-pace' | 'speed';

export interface SessionTemplate {
  id: string;
  kind: QualityKind;
  level: number;
  title: string;
  count: number;
  distanceM?: number;
  zone: Zone | null;
  recovery: string;
  expectedRpe: [number, number];
  purpose: string;
}

const T = (level: number, count: number, distanceM: number, recovery: string): SessionTemplate => ({
  id: `t${level}`,
  kind: 'threshold',
  level,
  title: `${count} × ${distanceM >= 1000 ? `${distanceM / 1000} km` : `${distanceM} m`} at threshold`,
  count,
  distanceM,
  zone: 'T',
  recovery,
  expectedRpe: [6, 7],
  purpose:
    'Raises the speed you can hold before lactate accumulates — the single biggest lever for 5 km. "Comfortably hard": you could say a short sentence.',
});

const I = (level: number, count: number, distanceM: number, recovery: string): SessionTemplate => ({
  id: `i${level}`,
  kind: 'vo2',
  level,
  title: `${count} × ${distanceM >= 1000 ? `${distanceM / 1000} km` : `${distanceM} m`} at VO₂max pace`,
  count,
  distanceM,
  zone: 'I',
  recovery,
  expectedRpe: [8, 9],
  purpose:
    'Time near VO₂max (your aerobic ceiling). Reps of 2–5 minutes with jogged recoveries; hard, but the last rep should match the first.',
});

const R = (level: number, count: number, distanceM: number, recovery: string, title?: string): SessionTemplate => ({
  id: `r${level}`,
  kind: 'race-pace',
  level,
  title: title ?? `${count} × ${distanceM} m at mile pace`,
  count,
  distanceM,
  zone: 'R',
  recovery,
  expectedRpe: [8, 9],
  purpose:
    'Mile-specific speed and economy: running fast while staying relaxed. Full-ish recoveries so quality stays high — this is not a fitness session.',
});

const S = (level: number, title: string, count: number, distanceM: number, recovery: string, purpose: string): SessionTemplate => ({
  id: `s${level}`,
  kind: 'speed',
  level,
  title,
  count,
  distanceM,
  zone: null,
  recovery,
  expectedRpe: [6, 9],
  purpose,
});

export const LADDERS: Record<QualityKind, SessionTemplate[]> = {
  threshold: [
    T(1, 4, 1000, '60 s jog'),
    T(2, 5, 1000, '60 s jog'),
    T(3, 3, 2000, '90 s jog'),
    T(4, 6, 1000, '60 s jog'),
    T(5, 4, 1600, '75 s jog'),
    T(6, 3, 2500, '90 s jog'),
  ],
  vo2: [
    I(1, 5, 800, '2:30 jog'),
    I(2, 6, 800, '2:30 jog'),
    I(3, 5, 1000, '2:30 jog'),
    I(4, 4, 1200, '3:00 jog'),
    I(5, 6, 1000, '2:30 jog'),
    I(6, 5, 1200, '3:00 jog'),
  ],
  'race-pace': [
    R(1, 8, 200, '200 m jog'),
    R(2, 6, 300, '2:00 walk/jog'),
    R(3, 5, 400, '2:30 jog'),
    R(4, 8, 300, '1:00 within sets, 4:00 between', '2 × (4 × 300 m) at mile pace'),
    R(5, 4, 500, '3:00 jog'),
    R(6, 3, 600, '4:00 walk/jog'),
  ],
  speed: [
    S(1, '6 × 60 m accelerations + 4 × 100 m strides', 6, 60, 'walk back (~2 min)', 'Acceleration mechanics and neuromuscular "wake-up". Fast, relaxed, never straining.'),
    S(2, '8 × 10 s hill sprints', 8, 60, 'walk down (~2 min)', 'Maximal force with low injury risk — the hill limits speed and overstriding.'),
    S(3, '6 × 80 m flying sprints (30 m build, 50 m fast)', 6, 80, '3 min walk', 'Maximum velocity. Full recovery so every rep is genuinely fast.'),
    S(4, '4 × 150 m at 400 m effort', 4, 150, '4 min walk', 'Speed endurance: holding form as speed starts to fade.'),
    S(5, '3 × 200 m at 400 m race effort', 3, 200, '6 min walk', 'Specific to the 400: fast, with complete recovery.'),
    S(6, '2 × 300 m at 400–800 effort', 2, 300, '8–10 min walk', 'Anaerobic capacity. Very demanding — only when properly fresh.'),
  ],
};

export function templateById(id: string | undefined): SessionTemplate | undefined {
  if (!id) return undefined;
  return Object.values(LADDERS).flat().find((t) => t.id === id);
}

export const RUN_TYPE_LABEL: Record<RunType, string> = {
  easy: 'Easy',
  long: 'Long easy',
  recovery: 'Recovery',
  threshold: 'Threshold',
  vo2: 'VO₂max intervals',
  'race-pace': 'Race-pace reps',
  speed: 'Speed / sprints',
  hills: 'Hills',
  tempo: 'Tempo',
  race: 'Race',
  'time-trial': 'Time trial',
};

const ZONE_FOR_TYPE: Partial<Record<RunType, Zone>> = {
  easy: 'E',
  long: 'E',
  recovery: 'E',
  threshold: 'T',
  tempo: 'T',
  vo2: 'I',
  'race-pace': 'R',
};

export const QUALITY_TYPES: RunType[] = ['threshold', 'vo2', 'race-pace', 'tempo'];
export const HARD_TYPES: RunType[] = ['threshold', 'vo2', 'race-pace', 'tempo', 'speed', 'hills', 'race', 'time-trial'];

export function kindForType(t: RunType): QualityKind | null {
  if (t === 'threshold' || t === 'tempo') return 'threshold';
  if (t === 'vo2') return 'vo2';
  if (t === 'race-pace') return 'race-pace';
  if (t === 'speed' || t === 'hills') return 'speed';
  return null;
}

// ─── Analysing a logged run ────────────────────────────────────────────────

export type Verdict =
  | 'progress'
  | 'repeat'
  | 'regress'
  | 'too-fast'
  | 'easy-ok'
  | 'easy-too-fast'
  | 'fitness-marker'
  | 'logged';

export interface RunAnalysis {
  zone: Zone | null;
  target: [number, number] | null;
  actualPace: number | null;
  /** Positive = slower than the slow end of the target; negative = faster than the fast end. */
  deviationPct: number | null;
  fadePct: number | null;
  spreadPct: number | null;
  rpeBand: 'below' | 'within' | 'above' | null;
  verdict: Verdict;
  fatigueSignal: boolean;
  improvementSignal: boolean;
  headline: string;
  points: string[];
  next: string;
}

const LEG_COST: Record<LegFeel, number> = { fresh: 0, normal: 0, heavy: 1, sore: 2 };

const CONTEXT_WORDS: [RegExp, string][] = [
  [/wind|windy|gust/i, 'You noted wind — a headwind can cost several seconds per km, so judge effort over pace.'],
  [/heat|hot|\b2[5-9]\s?°?c?\b|\b3\d\s?°?c?\b|humid/i, 'You noted heat. Expect slower paces at the same effort; heat is a real cost, not a fitness problem.'],
  [/deficit|low carb|no carbs|not enough carbs|fasted|hungry|under.?fuel/i, 'You noted low fuelling. Quality sessions run on muscle glycogen; under-fuelled sessions feel harder and adapt less. Carbohydrate in the 2–4 h before is part of the session.'],
  [/legs? (were|was|felt)? ?(sore|heavy|dead)|after legs|leg day/i, 'Your notes mention heavy or sore legs from lifting. Keep heavy lower-body work at least ~48 h away from the next quality run.'],
  [/ill|cold|sick|sore throat/i, 'You noted feeling unwell. Below-the-neck symptoms or a temperature mean rest, not training.'],
  [/gps|watch/i, 'GPS noted as unreliable — on a track, use lap counts rather than the watch.'],
];

export function analyseRun(run: RunLog, zones: PaceZones | null): RunAnalysis {
  const zone = ZONE_FOR_TYPE[run.type] ?? null;
  const points: string[] = [];
  let actualPace: number | null = null;
  let fadePct: number | null = null;
  let spreadPct: number | null = null;

  const reps = run.reps?.filter((r) => r.distanceM > 0 && r.timeSec > 0) ?? [];
  if (reps.length) {
    const totalM = reps.reduce((s, r) => s + r.distanceM, 0);
    const totalS = reps.reduce((s, r) => s + r.timeSec, 0);
    actualPace = paceFor(totalM, totalS);
    const paces = reps.map((r) => paceFor(r.distanceM, r.timeSec));
    const m = mean(paces)!;
    const s = sd(paces);
    spreadPct = s != null ? (s / m) * 100 : 0;
    if (paces.length >= 3) fadePct = ((paces[paces.length - 1] - paces[0]) / paces[0]) * 100;
  } else if (run.distanceKm > 0 && run.durationSec > 0) {
    actualPace = run.durationSec / run.distanceKm;
  }

  for (const [re, msg] of CONTEXT_WORDS) if (run.notes && re.test(run.notes)) points.push(msg);

  if (run.type === 'race' || run.type === 'time-trial') {
    return {
      zone: null, target: null, actualPace, deviationPct: null, fadePct, spreadPct, rpeBand: null,
      verdict: 'fitness-marker', fatigueSignal: false, improvementSignal: false,
      headline: run.event ? `${EVENT_LABEL[run.event]} result logged — this recalibrates your training paces.` : 'Race logged. Set the event so it can update your paces.',
      points,
      next: 'Take 1–2 easy days before the next quality session; an all-out effort costs more than it looks.',
    };
  }

  const target = zone && zones ? zones[zone] : null;
  let deviationPct: number | null = null;
  if (target && actualPace) {
    if (actualPace < target[0]) deviationPct = ((actualPace - target[0]) / target[0]) * 100;
    else if (actualPace > target[1]) deviationPct = ((actualPace - target[1]) / target[1]) * 100;
    else deviationPct = 0;
  }

  const tmpl = templateById(run.sessionId);
  const expected = tmpl?.expectedRpe ?? (zone === 'E' ? [2, 4] : zone === 'T' ? [6, 7] : zone ? [8, 9] : null);
  let rpeBand: RunAnalysis['rpeBand'] = null;
  if (run.rpe && expected) rpeBand = run.rpe < expected[0] ? 'below' : run.rpe > expected[1] ? 'above' : 'within';
  const legCost = run.legs ? LEG_COST[run.legs] : 0;

  // Easy running: the only failure mode that matters is running it too hard.
  if (zone === 'E') {
    const tooFast = deviationPct != null && deviationPct < -3;
    const highEffort = run.rpe != null && run.rpe >= 6;
    if (tooFast || highEffort) {
      points.unshift(
        'Easy runs drift faster without anyone noticing. That turns recovery days into medium days — enough to tire you, not enough to adapt — and it blunts the next quality session.',
      );
    }
    if (run.avgHr) points.push(`Average HR ${run.avgHr} bpm — useful as a trend at similar paces, not as a single verdict.`);
    return {
      zone, target, actualPace, deviationPct, fadePct, spreadPct, rpeBand,
      verdict: tooFast || highEffort ? 'easy-too-fast' : 'easy-ok',
      fatigueSignal: legCost >= 2 || (run.rpe != null && run.rpe >= 6 && !tooFast),
      improvementSignal: false,
      headline: tooFast || highEffort ? 'Easy run ran too hard.' : 'Easy run done at genuinely easy effort.',
      points,
      next: tooFast || highEffort ? 'Next easy run: hold the slow end of the easy range, conversational throughout.' : 'Keep easy days this easy — it is what lets the hard days be hard.',
    };
  }

  if (!zone || !target || deviationPct == null) {
    if (run.type === 'speed' || run.type === 'hills') {
      if (legCost >= 1) points.unshift('Sprinting on heavy or sore legs raises hamstring and calf strain risk. Cut the session short if the legs never feel springy.');
      return {
        zone, target, actualPace, deviationPct, fadePct, spreadPct, rpeBand,
        verdict: 'logged', fatigueSignal: legCost >= 2, improvementSignal: false,
        headline: 'Speed session logged. Quality is judged by how fast and relaxed the reps felt, not by fatigue.',
        points,
        next: 'Next speed session rotates to a different stimulus; keep full recoveries.',
      };
    }
    return {
      zone, target, actualPace, deviationPct, fadePct, spreadPct, rpeBand,
      verdict: 'logged', fatigueSignal: false, improvementSignal: false,
      headline: zones ? 'Logged.' : 'Logged. Add a recent race or time trial so sessions can be judged against your paces.',
      points,
      next: '',
    };
  }

  const fade = fadePct != null && fadePct > 4;
  if (fade) points.push(`Last rep was ${fadePct!.toFixed(1)}% slower than the first — either the first reps were too fast, or fatigue arrived early.`);
  if (spreadPct != null && spreadPct > 3 && !fade) points.push(`Uneven pacing between reps (±${spreadPct.toFixed(1)}%). Even reps make a session easier to judge and adapt to.`);

  const tooFastLimit = zone === 'T' || zone === 'SubT' ? -2 : -3.5;
  let verdict: Verdict;
  let headline: string;
  let next: string;
  let fatigueSignal = false;
  let improvementSignal = false;

  if (deviationPct < tooFastLimit) {
    verdict = 'too-fast';
    headline = zone === 'T' ? 'Faster than threshold — that is not a bonus.' : 'Reps ran faster than prescribed.';
    points.unshift(
      zone === 'T'
        ? 'Running threshold reps at 5 km pace turns a controlled session into a VO₂max one: more fatigue, a different stimulus, and the next session pays for it.'
        : 'Faster than target pace adds fatigue without a better stimulus. If it felt easy, that is a sign fitness is improving — the paces will follow once a time trial or repeated sessions confirm it.',
    );
    if (rpeBand !== 'above' && legCost === 0 && !fade) improvementSignal = true;
    next = 'Repeat this level next time, at the prescribed pace.';
  } else if (deviationPct <= 2) {
    if (rpeBand === 'above' || legCost >= 1 || fade) {
      verdict = 'repeat';
      fatigueSignal = true;
      headline = 'On pace, but it cost more than it should.';
      points.unshift('Hitting pace at a higher effort than expected (or on heavy legs) is a fatigue signal, not a failure. One such session means little; a run of them means recovery is lagging.');
      next = 'Repeat this level. If the next quality session also feels this hard, the plan will insert an easier week.';
    } else {
      verdict = 'progress';
      headline = 'On target, at the right effort. Move up a rung.';
      // At the fast end of the range without extra effort: a sign fitness is moving.
      if (actualPace != null && actualPace <= target[0] * 1.005) improvementSignal = true;
      next = 'Next session of this type steps up one level.';
    }
  } else if (rpeBand === 'above' || legCost >= 1) {
    verdict = 'regress';
    fatigueSignal = true;
    headline = 'Slower than target and harder than expected.';
    points.unshift('Missing pace at high effort usually points to accumulated fatigue, poor sleep or low fuelling rather than lost fitness. Check those before anything else.');
    next = 'Step back one level next time, and protect the next two easy days.';
  } else {
    verdict = 'repeat';
    headline = 'Slower than target at a manageable effort.';
    points.unshift('If conditions were tough (wind, heat, hills), this is fine. If not, you may have been holding back — aim for the target range next time.');
    next = 'Repeat this level.';
  }

  return { zone, target, actualPace, deviationPct, fadePct, spreadPct, rpeBand, verdict, fatigueSignal, improvementSignal, headline, points, next };
}

// ─── Ladders: where each session type currently sits ───────────────────────

/** Replays logged sessions in order, so editing or deleting a log just works. */
export function ladderLevels(d: AppData, zones: PaceZones | null): Record<QualityKind, number> {
  const start = d.settings.startLevels;
  const levels: Record<QualityKind, number> = {
    threshold: start.threshold ?? 1,
    vo2: start.vo2 ?? 1,
    'race-pace': start['race-pace'] ?? 1,
    speed: start.speed ?? 1,
  };
  const sorted = [...d.runs].sort((a, b) => a.date.localeCompare(b.date));
  for (const r of sorted) {
    const kind = kindForType(r.type);
    if (!kind) continue;
    const max = LADDERS[kind].length;
    if (kind === 'speed') {
      levels.speed = (levels.speed % max) + 1; // speed rotates rather than climbs
      continue;
    }
    const a = analyseRun(r, zones);
    if (a.verdict === 'progress') levels[kind] = Math.min(max, levels[kind] + 1);
    else if (a.verdict === 'regress') levels[kind] = Math.max(1, levels[kind] - 1);
  }
  return levels;
}

export function nextQ2Kind(d: AppData): QualityKind {
  const focus = d.settings.runFocus;
  if (focus === '5k') return 'vo2';
  if (focus === 'mile' || focus === 'short') {
    const recent = [...d.runs].filter((r) => r.type === 'vo2' || r.type === 'race-pace').sort((a, b) => b.date.localeCompare(a.date));
    const lastThree = recent.slice(0, 3).map((r) => r.type);
    return lastThree.length === 3 && !lastThree.includes('vo2') ? 'vo2' : 'race-pace';
  }
  const last = [...d.runs].filter((r) => r.type === 'vo2' || r.type === 'race-pace').sort((a, b) => b.date.localeCompare(a.date))[0];
  return last?.type === 'vo2' ? 'race-pace' : 'vo2';
}

// ─── Evidence that fitness has genuinely moved ─────────────────────────────

export interface FitnessProposal {
  delta: number;
  reason: string;
  sessions: string[];
}

/**
 * One fast session proves little (wind, a good day, a short track). Two of
 * the last three quality sessions run faster than target at normal effort,
 * with no fatigue flags, is evidence worth acting on.
 */
export function fitnessProposal(d: AppData, zones: PaceZones | null, today: ISODate = todayISO()): FitnessProposal | null {
  if (!zones) return null;
  const lastAdj = d.settings.vdotAdjustments.at(-1)?.date ?? '0000-00-00';
  const quality = d.runs
    .filter((r) => (r.type === 'threshold' || r.type === 'vo2') && r.date > lastAdj && diffDays(r.date, today) <= 28)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  if (quality.length < 3) return null;
  const analysed = quality.map((r) => ({ r, a: analyseRun(r, zones) }));
  const improving = analysed.filter((x) => x.a.improvementSignal);
  if (improving.length >= 2 && !analysed.some((x) => x.a.fatigueSignal)) {
    return {
      delta: 0.5,
      reason: `${improving.length} of your last 3 quality sessions ran faster than target at expected effort.`,
      sessions: improving.map((x) => x.r.date),
    };
  }
  return null;
}

export function weeklyKm(d: AppData, weekStart: ISODate, weekEnd: ISODate): number {
  return d.runs.filter((r) => r.date >= weekStart && r.date <= weekEnd).reduce((s, r) => s + r.distanceKm, 0);
}

export type IntensityBucket = 'easy' | 'moderate' | 'hard';

export function intensityOf(r: RunLog): IntensityBucket {
  if (r.type === 'easy' || r.type === 'long' || r.type === 'recovery') return r.rpe != null && r.rpe >= 6 ? 'moderate' : 'easy';
  if (r.type === 'threshold' || r.type === 'tempo') return 'moderate';
  return 'hard';
}

/**
 * Interval sessions are mostly easy running: warm-up, jog recoveries and
 * cool-down. Only the reps count towards the hard bucket; the rest is easy.
 */
export function distanceByIntensity(r: RunLog): Record<IntensityBucket, number> {
  const out: Record<IntensityBucket, number> = { easy: 0, moderate: 0, hard: 0 };
  const bucket = intensityOf(r);
  const repKm = (r.reps ?? []).reduce((s, x) => s + x.distanceM, 0) / 1000;
  if (bucket !== 'easy' && repKm > 0 && repKm < r.distanceKm) {
    out[bucket] += repKm;
    out.easy += r.distanceKm - repKm;
  } else out[bucket] += r.distanceKm;
  return out;
}

export function isPerformanceStale(p: Performance, today = todayISO()): boolean {
  return !p.date || diffDays(p.date, today) > 180;
}

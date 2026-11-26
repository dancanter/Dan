import { addDays, daysBetween, sleepHours, sortByDate } from './body';
import { dayResult } from './game';
import { phaseOn } from './season';
import { assessLoad } from './training';
import { rhrAnalysis } from './vitals';
import type { State } from '@/store';

// Illness log: sick days, episodes, how often, and what tended to come
// before each episode (short sleep, low energy availability, heavy training,
// a rising morning heart rate). Patterns are suggestions, not proof: colds
// are caught from viruses, and these only shift the odds.

export type IllKind = 'cold' | 'throat' | 'flu' | 'chest' | 'stomach' | 'headache' | 'other';
export interface IllLog { kind: IllKind; severity: 1 | 2 | 3 }

export const ILL_KINDS: { id: IllKind; label: string; belowNeck: boolean }[] = [
  { id: 'cold', label: 'Cold (runny or blocked nose)', belowNeck: false },
  { id: 'throat', label: 'Sore throat', belowNeck: false },
  { id: 'headache', label: 'Headache / migraine', belowNeck: false },
  { id: 'flu', label: 'Flu / fever / body aches', belowNeck: true },
  { id: 'chest', label: 'Chest (cough, tight, wheezy)', belowNeck: true },
  { id: 'stomach', label: 'Stomach bug / gut', belowNeck: true },
  { id: 'other', label: 'Something else', belowNeck: false },
];
export const SEVERITY = ['', 'Mild', 'Moderate', 'Bad'];

export function illDates(s: State): string[] {
  return Object.keys(s.days).filter((d) => s.days[d].ill).sort();
}

export interface Episode { start: string; end: string; days: number; kinds: IllKind[]; worst: number }

/** Sick days within one day of each other count as one episode. */
export function episodes(s: State): Episode[] {
  const out: Episode[] = [];
  for (const d of illDates(s)) {
    const log = s.days[d].ill!;
    const last = out.at(-1);
    if (last && daysBetween(last.end, d) <= 2) {
      last.end = d; last.days += 1; last.worst = Math.max(last.worst, log.severity);
      if (!last.kinds.includes(log.kind)) last.kinds.push(log.kind);
    } else out.push({ start: d, end: d, days: 1, kinds: [log.kind], worst: log.severity });
  }
  return out;
}

/** What to do about training today, using the "neck check". */
export function illAdvice(log: IllLog): { train: 'easy' | 'none'; text: string[] } {
  const below = ILL_KINDS.find((k) => k.id === log.kind)?.belowNeck;
  if (below || log.severity >= 3) {
    return { train: 'none', text: [
      'No training today. With fever, aches, chest or stomach symptoms, hard exercise can make it worse, and with a fever it can strain the heart.',
      'Return gradually: wait until you’ve been symptom-free (no fever) for 24–48 hours, then start with an easy session.',
      log.kind === 'stomach' ? 'Sip fluids little and often; add salt (broth) to replace what you’ve lost. Bland, low-fat food when you’re hungry again.' : 'Drink plenty, eat to appetite (protein still matters), and sleep as much as you can.',
      'Seek medical advice (NHS 111) if you have a high fever for more than 3 days, chest pain, shortness of breath, or can’t keep fluids down.',
    ] };
  }
  return { train: 'easy', text: [
    'Symptoms above the neck only (nose, throat, head): an easy run or light session is usually fine if you feel up to it. If you feel worse 10 minutes in, stop.',
    'Skip intervals, heavy legs and races until you’re clear. Recovery needs the energy.',
    'Today isn’t a day to be in a big deficit: eat at least your target, ideally a bit more, and keep protein high.',
    'Extra sleep is the most effective thing you can do.',
  ] };
}

export interface IllStats {
  monthDays: number; yearDays: number; yearEpisodes: number; allDays: number;
  daysSinceLast?: number; avgLength?: number; ill: IllLog | undefined;
  byPhase: { label: string; days: number; ill: number; per30: number }[];
  patterns: { label: string; count: number; of: number }[];
  benchmark: string;
}

export function illStats(s: State, today: string): IllStats {
  const dates = illDates(s);
  const eps = episodes(s);
  const year = today.slice(0, 4), month = today.slice(0, 7);
  const yearEps = eps.filter((e) => e.start.startsWith(year));
  const last = dates.filter((d) => d <= today).at(-1);
  // Per phase: sick days per 30 logged days, so short phases compare fairly.
  const logged = new Set<string>([...Object.keys(s.days), ...s.sleeps.map((x) => x.date), ...Object.keys(s.vitals ?? {})].filter((d) => d <= today));
  const groups = new Map<string, { days: number; ill: number }>();
  for (const d of logged) {
    const ph = phaseOn(s.profile.season, d);
    const label = s.profile.reverseFrom && d >= s.profile.reverseFrom && ph?.kind !== 'travel' ? 'Maintenance' : ph?.kind === 'cut' || ph?.kind === 'peak' ? 'Cutting' : ph?.kind === 'travel' ? 'Travel' : ph?.kind === 'maintain' ? 'Maintenance' : 'Other';
    const g = groups.get(label) ?? { days: 0, ill: 0 };
    g.days += 1; if (s.days[d]?.ill) g.ill += 1;
    groups.set(label, g);
  }
  const byPhase = [...groups.entries()].filter(([l]) => l !== 'Other').map(([label, g]) => ({ label, ...g, per30: Math.round((g.ill / g.days) * 30 * 10) / 10 }));
  // What came before each episode (the 7 days before it started).
  const kg = sortByDate(s.weights).at(-1)?.kg ?? 57;
  const counts = { sleep: 0, ea: 0, load: 0, rhr: 0, travel: 0 };
  for (const e of eps) {
    const before = Array.from({ length: 7 }, (_, i) => addDays(e.start, -i - 1));
    const sl = sortByDate(s.sleeps).filter((x) => before.includes(x.date)).map(sleepHours);
    if (sl.length >= 3 && sl.reduce((a, b) => a + b, 0) / sl.length < 7) counts.sleep++;
    const eas = before.map((d) => dayResult(s, d).ea).filter((x): x is number => x !== undefined);
    if (eas.length >= 3 && eas.reduce((a, b) => a + b, 0) / eas.length < 30) counts.ea++;
    if (assessLoad(addDays(e.start, -1), s.training ?? {}, { kg, vitals: s.vitals ?? {}, sleepHours: sl, inDeficit: true }).level === 'too-much') counts.load++;
    const r = rhrAnalysis(addDays(e.start, -1), s.vitals ?? {});
    if (r.delta !== undefined && r.delta >= 5) counts.rhr++;
    if (before.some((d) => phaseOn(s.profile.season, d)?.kind === 'travel')) counts.travel++;
  }
  const n = eps.length;
  const patterns = n ? [
    { label: 'Sleep under 7 h in the week before', count: counts.sleep, of: n },
    { label: 'Low energy availability (under 30) in the week before', count: counts.ea, of: n },
    { label: 'Training load “too much” just before', count: counts.load, of: n },
    { label: 'Morning heart rate up 5+ bpm the day before', count: counts.rhr, of: n },
    { label: 'Travelling in the week before', count: counts.travel, of: n },
  ].filter((p) => p.count > 0).sort((a, b) => b.count - a.count) : [];
  return {
    monthDays: dates.filter((d) => d.startsWith(month)).length,
    yearDays: dates.filter((d) => d.startsWith(year)).length,
    yearEpisodes: yearEps.length,
    allDays: dates.length,
    daysSinceLast: last ? daysBetween(last, today) : undefined,
    avgLength: n ? Math.round((eps.reduce((a, e) => a + e.days, 0) / n) * 10) / 10 : undefined,
    ill: s.days[today]?.ill,
    byPhase, patterns,
    benchmark: yearEps.length <= 2 ? 'At or below the typical adult rate (about 2–3 colds a year).' : yearEps.length <= 4 ? 'Around or a little above the typical adult rate of 2–3 colds a year.' : 'Above the typical 2–3 colds a year. Check the patterns below: sleep and under-fuelling are the usual culprits in athletes.',
  };
}

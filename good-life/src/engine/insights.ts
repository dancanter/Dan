import { addDays, todayISO, type ISODate } from '@/lib/dates';
import { mean } from '@/lib/stats';
import type { AppData } from '@/store/types';
import { readiness } from './readiness';
import { analyseRun, currentFitness, paceZones } from './running';

export interface Insight {
  id: string;
  title: string;
  body: string;
  n: number;
  kind: 'association' | 'pattern' | 'count';
}

/**
 * Personal patterns from Dan's own logs. These are associations in small
 * samples from one person — useful for noticing, never proof of cause —
 * and each says how many days it rests on.
 */
export function insights(d: AppData, today: ISODate = todayISO()): Insight[] {
  const out: Insight[] = [];
  const days = Array.from({ length: 90 }, (_, i) => addDays(today, -i));
  const [sleepLo] = d.profile.sleepTargetHours;

  // Sleep → next-day readiness
  const pairs = days
    .map((dt) => ({ sleep: d.checkIns[dt]?.sleepHours, r: readiness(d, dt).score }))
    .filter((p): p is { sleep: number; r: number } => p.sleep != null && p.r != null);
  const good = pairs.filter((p) => p.sleep >= sleepLo).map((p) => p.r);
  const short = pairs.filter((p) => p.sleep < sleepLo - 1).map((p) => p.r);
  if (good.length >= 5 && short.length >= 5) {
    out.push({
      id: 'sleep-readiness',
      title: 'Sleep and how you feel',
      body: `After ${sleepLo}+ h of sleep your readiness averaged ${Math.round(mean(good)!)}; after under ${sleepLo - 1} h, ${Math.round(mean(short)!)}. Note that sleep is also an input to the readiness score, so part of this is built in.`,
      n: good.length + short.length,
      kind: 'association',
    });
  }

  // Quality sessions vs sleep the night before
  const fit = currentFitness(d, today);
  const zones = fit.vdot ? paceZones(fit.vdot) : null;
  const q = d.runs
    .filter((r) => ['threshold', 'vo2', 'race-pace'].includes(r.type) && r.date >= days[days.length - 1])
    .map((r) => ({ r, a: analyseRun(r, zones), sleep: d.checkIns[r.date]?.sleepHours }))
    .filter((x) => x.sleep != null);
  if (q.length >= 6) {
    const rough = q.filter((x) => x.a.fatigueSignal || x.a.verdict === 'regress');
    const roughSleep = mean(rough.map((x) => x.sleep!));
    const okSleep = mean(q.filter((x) => !rough.includes(x)).map((x) => x.sleep!));
    if (roughSleep != null && okSleep != null && rough.length >= 2) {
      out.push({
        id: 'sleep-quality-sessions',
        title: 'Hard sessions that went badly',
        body: `Sessions that felt harder than expected followed ${roughSleep.toFixed(1)} h of sleep on average, versus ${okSleep.toFixed(1)} h for the rest.`,
        n: q.length,
        kind: 'association',
      });
    }
  }

  // Easy-run discipline
  const easy = d.runs.filter((r) => ['easy', 'long', 'recovery'].includes(r.type) && r.date >= addDays(today, -28));
  if (easy.length >= 4 && zones) {
    const tooFast = easy.filter((r) => analyseRun(r, zones).verdict === 'easy-too-fast').length;
    out.push({
      id: 'easy-discipline',
      title: 'Easy-run discipline',
      body: tooFast ? `${tooFast} of your last ${easy.length} easy runs were run too hard.` : `All ${easy.length} recent easy runs stayed genuinely easy. That is the discipline most runners lack.`,
      n: easy.length,
      kind: 'count',
    });
  }

  // Study focus by time of day is not tracked; focus vs sleep is.
  const studyPairs = d.study.filter((s) => s.focus != null && d.checkIns[s.date]?.sleepHours != null);
  if (studyPairs.length >= 8) {
    const hi = studyPairs.filter((s) => d.checkIns[s.date]!.sleepHours! >= sleepLo).map((s) => s.focus!);
    const lo = studyPairs.filter((s) => d.checkIns[s.date]!.sleepHours! < sleepLo - 1).map((s) => s.focus!);
    if (hi.length >= 3 && lo.length >= 3) {
      out.push({
        id: 'sleep-focus',
        title: 'Sleep and study focus',
        body: `Your rated study focus averaged ${mean(hi)!.toFixed(1)}/5 after a full night and ${mean(lo)!.toFixed(1)}/5 after a short one.`,
        n: hi.length + lo.length,
        kind: 'association',
      });
    }
  }

  // Enjoyment
  const life = d.life.filter((l) => l.date >= addDays(today, -60) && l.enjoyment != null);
  if (life.length >= 5) {
    const byCat = new Map<string, number[]>();
    for (const l of life) byCat.set(l.category, [...(byCat.get(l.category) ?? []), l.enjoyment!]);
    const best = [...byCat.entries()].filter(([, v]) => v.length >= 2).sort((a, b) => mean(b[1])! - mean(a[1])!)[0];
    if (best) out.push({ id: 'enjoyment', title: 'What you enjoy most', body: `“${best[0]}” activities rate highest for you (${mean(best[1])!.toFixed(1)}/5 across ${best[1].length}).`, n: life.length, kind: 'pattern' });
  }
  return out;
}

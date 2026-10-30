import { todayISO, type ISODate } from '@/lib/dates';
import { formatDuration, formatPace } from '@/lib/time';
import { formatWeight } from '@/lib/units';
import type { AppData, DayFlag } from '@/store/types';
import { kcalOf, rankFoods, GOALS, type FoodGoal } from './nutrition';
import { assessWeightTarget, energyAvailability, weightTrend } from './physique';
import { trainingState } from './readiness';
import { buildReview } from './review';
import { assessGoal, currentFitness, EVENT_LABEL, paceZones } from './running';
import { upcomingAssessments } from './study';
import { buildToday } from './today';

export interface OfflineReply {
  text: string;
  setFlags?: DayFlag[];
}

const FLAG_PATTERNS: [RegExp, DayFlag][] = [
  [/exhaust|knackered|shattered|wiped out|so tired|drained/i, 'exhausted'],
  [/\b(feel|feeling)\s+(brilliant|amazing|great|fantastic|fresh)\b|\bi'?m flying\b|\bfeel(ing)? brilliant\b/i, 'brilliant'],
  [/heavy legs|legs (are|feel|felt) (heavy|dead|sore)/i, 'heavy-legs'],
  [/\bonly (have )?\d{2}\s?min|short on time|only have (half an|an) hour/i, 'short-time'],
  [/deadline|\b(tma|ema|essay|assignment)\b.{0,20}\bdue\b/i, 'deadline'],
  [/\b(sunny|sunshine)\b|lovely day|nice weather|enjoy the sun\b/i, 'sunshine'],
  [/\b(seeing|meeting|out with) (friends|people|family)\b|\bdate tonight\b|\bparty\b/i, 'social'],
];

function todayAnswer(d: AppData, date: ISODate): string {
  const t = buildToday(d, date);
  const opt = t.options.find((o) => o.key === t.recommended)!;
  const lines = [
    `**Recommendation: ${opt.label}.**`,
    `Running — ${opt.running.title}. ${opt.running.detail[0] ?? ''}`,
    `Gym — ${opt.gym.title}. ${opt.gym.detail}`,
    `Nutrition — ${t.nutrition.line}`,
    `Recovery — ${t.recovery[0]}`,
    `University — ${t.study.blocks.map((b) => `${b.moduleCode}: ${b.activity} (${b.minutes} min)`).join('; ') || 'nothing scheduled'}`,
    `Life — ${t.lifestyle[0]}`,
    '',
    `Why: ${t.reasons.join(' ')}`,
    `Trade-off: ${opt.tradeoff}`,
  ];
  if (t.warnings.length) lines.unshift(`⚠ ${t.warnings.join(' ')}`);
  return lines.join('\n');
}

/**
 * A rules-based coach that works with no network and no API key. It cannot
 * hold a conversation, but it can answer the common questions directly from
 * the same engines the rest of the app uses — and it says when it cannot.
 */
export function offlineReply(d: AppData, message: string, date: ISODate = todayISO()): OfflineReply {
  const m = message.toLowerCase();
  const flags = FLAG_PATTERNS.filter(([re]) => re.test(m)).map(([, f]) => f);
  const unique = [...new Set(flags)];

  if (unique.length) {
    const existing = d.checkIns[date]?.flags ?? [];
    const merged = [...new Set([...existing, ...unique])];
    const next = { ...d, checkIns: { ...d.checkIns, [date]: { ...(d.checkIns[date] ?? { date, flags: [] }), flags: merged } } };
    return { text: `Noted (${unique.join(', ')}). Here is today, adjusted:\n\n${todayAnswer(next, date)}`, setFlags: merged };
  }

  if (/today|what should i do|plan for (the )?day|session today/.test(m)) return { text: todayAnswer(d, date) };

  if (/pace|vdot|how fast|threshold pace|easy pace/.test(m)) {
    const fit = currentFitness(d, date);
    if (!fit.vdot) return { text: fit.note };
    const z = paceZones(fit.vdot);
    const u = d.profile.distanceUnit;
    return {
      text: [
        `Current fitness (estimated): VDOT ${fit.vdot.toFixed(1)}. ${fit.note}`,
        `• Easy: ${formatPace(z.E[0], u)} – ${formatPace(z.E[1], u)}`,
        `• Sub-threshold: ${formatPace(z.SubT[0], u)} – ${formatPace(z.SubT[1], u)}`,
        `• Threshold: ${formatPace(z.T[0], u)} – ${formatPace(z.T[1], u)}`,
        `• VO₂max intervals: ${formatPace(z.I[0], u)} – ${formatPace(z.I[1], u)}`,
        `• Mile pace: ${formatPace(z.R[0], u)} – ${formatPace(z.R[1], u)}`,
        'These come from a model fitted to race results. Use them as guide rails; on windy or hot days, run by effort.',
      ].join('\n'),
    };
  }

  if (/goal|realistic|sub.?17|sub.?4|sub.?2|sub.?55|15.?min/.test(m)) {
    const lines = d.runGoals.map((g) => {
      const a = assessGoal(d, g.event, g.targetSec);
      return `• ${EVENT_LABEL[g.event]} ${formatDuration(g.targetSec, { tenths: g.targetSec < 120 })}: ${a.currentSec ? `now ~${formatDuration(a.currentSec, { tenths: a.currentSec < 120 })}, gap ${a.gapPct!.toFixed(1)}%. ` : ''}${a.comment}`;
    });
    return { text: `Honest read on your goals:\n${lines.join('\n')}` };
  }

  if (/overtrain|fatigue|tired all|recover|am i doing too much/.test(m)) {
    const s = trainingState(d, date);
    return { text: `**${s.label}.** ${s.summary}${s.evidence.length ? `\n\nEvidence:\n${s.evidence.map((e) => `• ${e}`).join('\n')}` : ''}` };
  }

  if (/weight|cut|lean|shred|lose|deficit|calorie/.test(m)) {
    const tr = weightTrend(d, 21, date);
    const a = assessWeightTarget(d, kcalOf(d));
    const ea = energyAvailability(d, kcalOf(d), date);
    return {
      text: [
        tr.latestAvg ? `7-day average ${formatWeight(tr.latestAvg, d.profile.weightUnit)}; trend ${tr.pctPerWeek != null ? `${tr.pctPerWeek.toFixed(2)}%/week` : 'not established'}${tr.reliable ? '' : ' (too few weigh-ins to trust)'}.` : 'No weigh-ins yet.',
        `**${a.headline}**`,
        ...a.points.map((p) => `• ${p}`),
        ea.value ? `Energy availability ≈ ${ea.value[0].toFixed(0)}–${ea.value[1].toFixed(0)} kcal/kg FFM/day (${ea.band}). ${ea.note}` : `Energy availability: ${ea.note}`,
      ].join('\n'),
    };
  }

  if (/deadline|tma|ema|assignment|essay|study/.test(m)) {
    const up = upcomingAssessments(d, date, 60);
    if (!up.length) return { text: 'No upcoming assessments entered. Add your TMA and EMA dates in University and the app will back-schedule each stage.' };
    return { text: up.map((u) => `• ${u.a.moduleCode} ${u.a.name}: due ${u.a.due} (${u.daysLeft} days). Next: ${u.nextStage?.label ?? 'submit'}${u.behind ? ' — behind schedule' : ''}.`).join('\n') };
  }

  if (/review|how did (my|the) week|this week/.test(m)) {
    const r = buildReview(d, 'weekly');
    return {
      text: [
        `**Week ${r.from} → ${r.to}**`,
        r.improved.length ? `Improved: ${r.improved.join('; ')}.` : '',
        r.deteriorated.length ? `Deteriorated: ${r.deteriorated.join('; ')}.` : '',
        r.holdingBack.length ? `Holding you back: ${r.holdingBack.join(' ')}` : '',
        `Highest-value action: ${r.highestValue}`,
        r.dataNote,
      ].filter(Boolean).join('\n'),
    };
  }

  const goal = GOALS.find((g) => m.includes(g.id) || m.includes(g.label.toLowerCase().split(' ')[0]));
  if (/eat|food|meal|nutrition|protein/.test(m) || goal) {
    const id: FoodGoal = goal?.id ?? (/protein|muscle/.test(m) ? 'muscle' : /run|carb/.test(m) ? 'running' : 'longevity');
    const def = GOALS.find((g) => g.id === id)!;
    const top = rankFoods(d, id, 6);
    return { text: `**${def.label}.** ${def.summary}\n${top.map((t) => `• ${t.food.name}${t.tolerance === 'tolerated' ? ' ✓' : ''}`).join('\n')}\n\n${def.evidence}\n(✓ = foods you tolerate.)` };
  }

  return {
    text:
      'I am the offline coach — rules-based, no AI connection right now. I can answer: “what should I do today”, “my paces”, “are my goals realistic”, “am I overtraining”, “my weight”, “my deadlines”, “how was my week”, or “foods for bone health”. You can also tell me “I’m exhausted”, “heavy legs”, “only 45 minutes”, “deadline”, or “it’s sunny” and I will adjust today.',
  };
}

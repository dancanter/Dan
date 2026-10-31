import { addDays, ageOn, startOfWeek, todayISO, type ISODate } from '@/lib/dates';
import { formatDuration, formatPace } from '@/lib/time';
import { formatWeight } from '@/lib/units';
import { MUSCLE_LABEL, PRIORITY_MUSCLES, SPLIT_LABEL } from '@/data/exercises';
import type { AppData } from '@/store/types';
import { weeklyVolume } from './gym';
import { kcalOf, targets } from './nutrition';
import { bodyComposition, energyAvailability, weeklyAverages, weightTrend, PHYSIQUE_PHASE_LABEL } from './physique';
import { describeDay } from './plan';
import { readiness, trainingState } from './readiness';
import { ROADMAP } from './review';
import { analyseRun, assessGoal, currentFitness, EVENT_LABEL, paceZones, RUN_TYPE_LABEL } from './running';
import { upcomingAssessments } from './study';
import { buildToday } from './today';

/**
 * The plain-text snapshot sent to the AI coach with each message. Every
 * line says where it came from — MEASURED (a device or a tape), REPORTED
 * (Dan's own rating), ESTIMATED (calculated by the app) — so the model can
 * keep the distinction too. It is also shown to Dan in full: nothing goes
 * to the coach that he cannot see.
 */
export function buildContext(d: AppData, today: ISODate = todayISO()): string {
  const p = d.profile;
  const L: string[] = [];
  const unit = p.weightUnit;
  L.push(`DATE: ${today}`);
  L.push('## PROFILE (REPORTED)');
  L.push(`${p.name || 'User'}, ${p.sex}${p.dob ? `, age ${ageOn(p.dob, today)}` : ''}${p.heightCm ? `, height ${Math.round(p.heightCm)} cm` : ''}. ${p.location?.name ?? 'UK'}.`);
  L.push(`Diet: ${p.diet.coeliac ? 'COELIAC DISEASE — strictly gluten-free. ' : ''}Tolerates: ${p.diet.tolerated.join(', ') || 'not set'}. Problems with: ${p.diet.problematic.join(', ') || 'none listed'}. ${p.diet.notes}`);
  L.push(`Study: ${p.degree}, ${p.university}. Modules: ${d.modules.map((m) => `${m.code}${m.title ? ` (${m.title})` : ''}`).join(', ')}. Career aim: ${p.careerAim}.`);
  L.push(`Rest day: ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][p.restDay]}. Sleep target ${p.sleepTargetHours[0]}–${p.sleepTargetHours[1]} h.`);
  L.push(`Phases: roadmap ${ROADMAP[d.roadmap.current].label} (since ${d.roadmap.since}); physique ${PHYSIQUE_PHASE_LABEL[d.physiquePhase.current]}.`);

  L.push('## RUNNING');
  const fit = currentFitness(d, today);
  if (fit.vdot) {
    const z = paceZones(fit.vdot);
    L.push(`ESTIMATED current fitness VDOT ${fit.vdot.toFixed(1)} (${fit.confidence}). ${fit.note}`);
    L.push(`ESTIMATED paces /km: easy ${formatPace(z.E[0])}–${formatPace(z.E[1])}, threshold ${formatPace(z.T[0])}–${formatPace(z.T[1])}, VO2 ${formatPace(z.I[0])}–${formatPace(z.I[1])}, mile pace ${formatPace(z.R[0])}–${formatPace(z.R[1])}.`);
  } else L.push('No current fitness marker.');
  if (d.performances.length) L.push(`Performances: ${d.performances.map((x) => `${EVENT_LABEL[x.event]} ${formatDuration(x.timeSec, { tenths: x.timeSec < 120 })} (${x.kind}${x.date ? `, ${x.date}` : ''})`).join('; ')}.`);
  L.push(`Goals: ${d.runGoals.map((g) => { const a = assessGoal(d, g.event, g.targetSec); return `${EVENT_LABEL[g.event]} ${formatDuration(g.targetSec, { tenths: g.targetSec < 120 })} (gap ${a.gapPct != null ? `${a.gapPct.toFixed(1)}%` : 'unknown'}, ${a.horizon})`; }).join('; ')}. Focus: ${d.settings.runFocus}.`);
  const zones = fit.vdot ? paceZones(fit.vdot) : null;
  const runs = [...d.runs].filter((r) => r.date >= addDays(today, -21)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  for (const r of runs) {
    const a = analyseRun(r, zones);
    const reps = r.reps?.length ? ` reps ${r.reps.map((x) => `${x.distanceM}m ${formatDuration(x.timeSec, { tenths: x.timeSec < 120 })}`).join(', ')}` : '';
    L.push(`- ${r.date} MEASURED ${RUN_TYPE_LABEL[r.type]} ${r.distanceKm.toFixed(1)} km in ${formatDuration(r.durationSec)}${reps}; REPORTED RPE ${r.rpe ?? '?'}, legs ${r.legs ?? '?'}${r.notes ? `, notes "${r.notes.slice(0, 120)}"` : ''}. APP VERDICT: ${a.verdict}.`);
  }

  L.push('## GYM (MEASURED loads/reps; REPORTED RIR)');
  for (const g of [...d.gym].filter((x) => x.date >= addDays(today, -14)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)) {
    L.push(`- ${g.date} ${SPLIT_LABEL[g.split]}: ${g.exercises.map((e) => `${e.exerciseId} ${e.sets.map((s) => `${s.loadKg}×${s.reps}${s.rir != null ? `@${s.rir}` : ''}`).join(' ')}`).join('; ')}`);
  }
  const vol = weeklyVolume(d, startOfWeek(today));
  L.push(`This week hard sets (priority muscles): ${PRIORITY_MUSCLES.map((m) => `${MUSCLE_LABEL[m]} ${vol[m]}`).join(', ')}.`);

  L.push('## BODY');
  const wk = weeklyAverages(d).slice(-6);
  if (wk.length) L.push(`MEASURED weekly average weight: ${wk.map((w) => `${w.weekStart} ${formatWeight(w.avgKg, unit)} (n=${w.n})`).join('; ')}.`);
  const trend = weightTrend(d, 21, today);
  if (trend.pctPerWeek != null) L.push(`ESTIMATED trend ${trend.pctPerWeek.toFixed(2)}%/week (${trend.reliable ? 'reliable' : 'too few weigh-ins'}).`);
  const comp = bodyComposition(d);
  if (comp.bodyFatPct) L.push(`ESTIMATED body fat ${comp.bodyFatPct[0].toFixed(0)}–${comp.bodyFatPct[1].toFixed(0)}% (${comp.basis}).`);
  if (p.targetWeightKg) L.push(`Target range ${formatWeight(p.targetWeightKg[0], unit)}–${formatWeight(p.targetWeightKg[1], unit)}.`);
  const ea = energyAvailability(d, kcalOf(d), today);
  L.push(ea.value ? `ESTIMATED energy availability ${ea.value[0].toFixed(0)}–${ea.value[1].toFixed(0)} kcal/kg FFM/day (${ea.band}); avg intake ${Math.round(ea.avgIntake!)} kcal over ${ea.daysWithIntake} logged days.` : `Energy availability: ${ea.note}`);
  const t = targets(d, today);
  L.push(`ESTIMATED today's targets: protein ${Math.round(t.protein.lo)}–${Math.round(t.protein.hi)} g, carbs ${Math.round(t.carbs.lo)}–${Math.round(t.carbs.hi)} g, energy ${t.energy.lo}–${t.energy.hi} kcal (${t.dayType}).`);

  L.push('## RECOVERY (REPORTED unless marked)');
  for (let i = 0; i < 7; i++) {
    const dt = addDays(today, -i);
    const c = d.checkIns[dt];
    if (!c) continue;
    const rd = readiness(d, dt);
    L.push(`- ${dt}: sleep ${c.sleepHours ?? '?'} h (quality ${c.sleepQuality ?? '?'}/5), energy ${c.energy ?? '?'}/5, soreness ${c.soreness ?? '?'}/5, legs ${c.legs ?? '?'}, stress ${c.stress ?? '?'}/5${c.restingHr ? `, MEASURED RHR ${c.restingHr}` : ''}${c.hrv ? `, MEASURED HRV ${c.hrv}` : ''}${c.flags.length ? `, flags: ${c.flags.join(', ')}` : ''}${c.illness && c.illness !== 'none' ? `, ILLNESS ${c.illness}` : ''}${c.niggle ? `, PAIN "${c.niggle.slice(0, 80)}"` : ''}${c.steps ? `, steps ${c.steps}` : ''}${c.kcalEaten ? `, REPORTED intake ${c.kcalEaten} kcal` : ''}. ESTIMATED readiness ${rd.band ?? '?'}.`);
  }
  const st = trainingState(d, today);
  L.push(`ESTIMATED training state: ${st.label}. ${st.evidence.join(' ')}`);

  L.push('## UNIVERSITY');
  for (const a of upcomingAssessments(d, today, 60)) L.push(`- ${a.a.moduleCode} ${a.a.name} due ${a.a.due} (${a.daysLeft} days; next stage: ${a.nextStage?.label ?? 'done'}${a.behind ? ', BEHIND' : ''}).`);
  const studyWeek = d.study.filter((s) => s.date >= startOfWeek(today));
  L.push(`Study this week: ${d.modules.map((m) => `${m.code} ${Math.round(studyWeek.filter((s) => s.moduleCode === m.code).reduce((x, s) => x + s.minutes, 0) / 60 * 10) / 10}/${m.weeklyTargetHours} h`).join(', ')}.`);

  L.push('## TODAY (APP RECOMMENDATION)');
  const plan = buildToday(d, today);
  L.push(`Planned: ${describeDay(plan.planned)}. Recommended option: ${plan.recommended}. ${plan.reasons.join(' ')}`);
  L.push(`Lifestyle: ${d.life.slice(-5).map((l) => `${l.date} ${l.title}${l.enjoyment ? ` (${l.enjoyment}/5)` : ''}`).join('; ') || 'nothing logged'}.`);
  return L.join('\n');
}

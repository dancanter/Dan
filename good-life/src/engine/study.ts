import { addDays, diffDays, startOfWeek, todayISO, type ISODate } from '@/lib/dates';
import type { AppData, Assessment, AssessmentStage, Flashcard } from '@/store/types';

// ─── Spaced repetition (SM-2) ──────────────────────────────────────────────
// Retrieval practice and spacing are the two study techniques with the
// strongest evidence across hundreds of experiments (Dunlosky et al., 2013;
// Cepeda et al., 2006). SM-2 is a simple, well-tested way to schedule them.

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export function review(card: Flashcard, grade: Grade, today: ISODate = todayISO()): Flashcard {
  const q = { again: 1, hard: 3, good: 4, easy: 5 }[grade];
  let { ease, intervalDays, reps, lapses } = card;
  if (q < 3) {
    reps = 0;
    intervalDays = 1;
    lapses += 1;
  } else {
    reps += 1;
    if (reps === 1) intervalDays = 1;
    else if (reps === 2) intervalDays = grade === 'easy' ? 4 : 3;
    else intervalDays = Math.round(intervalDays * ease * (grade === 'hard' ? 0.8 : grade === 'easy' ? 1.3 : 1));
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  return { ...card, ease, intervalDays, reps, lapses, due: addDays(today, intervalDays) };
}

export function newCard(partial: Pick<Flashcard, 'id' | 'moduleCode' | 'front' | 'back'> & Partial<Flashcard>, today: ISODate = todayISO()): Flashcard {
  return { ease: 2.5, intervalDays: 0, reps: 0, lapses: 0, due: today, ...partial };
}

export function dueCards(d: AppData, today: ISODate = todayISO()): Flashcard[] {
  return d.flashcards.filter((c) => c.due <= today).sort((a, b) => a.due.localeCompare(b.due));
}

/** Topics come back for review on an expanding schedule set by confidence. */
export function nextTopicReview(confidence: number, today: ISODate = todayISO()): ISODate {
  const gap = [1, 2, 4, 8, 16][Math.max(0, Math.min(4, confidence - 1))];
  return addDays(today, gap);
}

// ─── Hours ─────────────────────────────────────────────────────────────────

export function minutesThisWeek(d: AppData, moduleCode: string, today: ISODate = todayISO()): number {
  const from = startOfWeek(today);
  return d.study.filter((s) => s.moduleCode === moduleCode && s.date >= from && s.date <= today).reduce((a, s) => a + s.minutes, 0);
}

export function weeklyStudyMinutes(d: AppData, weekStart: ISODate): Record<string, number> {
  const end = addDays(weekStart, 6);
  const out: Record<string, number> = {};
  for (const s of d.study.filter((x) => x.date >= weekStart && x.date <= end)) out[s.moduleCode] = (out[s.moduleCode] ?? 0) + s.minutes;
  return out;
}

// ─── Assignments ───────────────────────────────────────────────────────────

export const STAGES: { id: AssessmentStage; label: string; daysBefore: number; guide: string }[] = [
  { id: 'understand', label: 'Decode the question', daysBefore: 21, guide: 'Underline command words (evaluate, discuss, compare), the scope, and what the marking guidance rewards. Write the question in your own words.' },
  { id: 'research', label: 'Gather evidence', daysBefore: 17, guide: 'Module materials first, then OU Library: WHO, NICE, UKHSA/OHID, peer-reviewed papers. Note full references as you go.' },
  { id: 'plan', label: 'Plan the argument', daysBefore: 13, guide: 'One-line thesis. One paragraph per point, each mapped to evidence. Decide where you evaluate and compare.' },
  { id: 'draft', label: 'Write the draft', daysBefore: 9, guide: 'Draft fast in your own words; do not polish yet. Use POINT → EVIDENCE → EXPLAIN → LIMITATIONS → COMPARE → EVALUATE → LINK.' },
  { id: 'critique', label: 'Critical revision', daysBefore: 5, guide: 'For every paragraph: is there a limitation, a comparison and a judgement? Description without evaluation caps the mark.' },
  { id: 'references', label: 'Check references', daysBefore: 3, guide: 'Every in-text citation in the list, every list entry cited. Cite Them Right Harvard, consistently.' },
  { id: 'proofread', label: 'Proofread & word count', daysBefore: 2, guide: 'Read aloud. Check word limit and British spelling. Confirm your work is your own and that any AI use follows the module’s rules.' },
  { id: 'submit', label: 'Submit (early)', daysBefore: 1, guide: 'Submit at least a day early — the eTMA system on deadline night is a needless risk.' },
];

export function stageDates(a: Assessment): { id: AssessmentStage; label: string; date: ISODate; done: boolean; guide: string }[] {
  return STAGES.map((s) => ({ id: s.id, label: s.label, date: addDays(a.due, -s.daysBefore), done: !!a.stages[s.id], guide: s.guide }));
}

export interface AssessmentStatus {
  a: Assessment;
  daysLeft: number;
  nextStage: ReturnType<typeof stageDates>[number] | null;
  behind: boolean;
  progressPct: number;
}

export function assessmentStatus(a: Assessment, today: ISODate = todayISO()): AssessmentStatus {
  const stages = stageDates(a);
  const done = stages.filter((s) => s.done).length;
  const nextStage = stages.find((s) => !s.done) ?? null;
  return {
    a,
    daysLeft: diffDays(today, a.due),
    nextStage,
    behind: !!nextStage && nextStage.date < today,
    progressPct: (done / stages.length) * 100,
  };
}

export function upcomingAssessments(d: AppData, today: ISODate = todayISO(), horizonDays = 60): AssessmentStatus[] {
  return d.assessments
    .filter((a) => !a.stages.submit && diffDays(today, a.due) >= -1 && diffDays(today, a.due) <= horizonDays)
    .map((a) => assessmentStatus(a, today))
    .sort((x, y) => x.daysLeft - y.daysLeft);
}

// ─── Today's study suggestion ──────────────────────────────────────────────

export interface StudySuggestion {
  blocks: { moduleCode: string; minutes: number; activity: string; why: string }[];
  headline: string;
}

/**
 * Hard thinking (drafting, new material) goes on fresh days; on tired days
 * the app switches to retrieval practice and review, which still pay off
 * and cost less mental energy.
 */
export function suggestStudy(d: AppData, opts: { fresh: boolean; tired: boolean; deadline: boolean; timeLimited: boolean }, today: ISODate = todayISO()): StudySuggestion {
  const upcoming = upcomingAssessments(d, today, 28);
  const urgent = upcoming[0];
  const due = dueCards(d, today);
  const blocks: StudySuggestion['blocks'] = [];
  const blockLen = opts.timeLimited ? 25 : 50;

  if (urgent && (urgent.daysLeft <= 7 || urgent.behind || opts.deadline)) {
    const stage = urgent.nextStage;
    blocks.push({
      moduleCode: urgent.a.moduleCode,
      minutes: blockLen,
      activity: stage ? `${urgent.a.name}: ${stage.label.toLowerCase()}` : `${urgent.a.name}: final checks`,
      why: `${urgent.a.name} is due in ${urgent.daysLeft} day${urgent.daysLeft === 1 ? '' : 's'}${urgent.behind ? ' and you are behind the stage plan' : ''}.`,
    });
    if (!opts.tired && !opts.timeLimited) blocks.push({ moduleCode: urgent.a.moduleCode, minutes: blockLen, activity: `${urgent.a.name}: continue`, why: 'A second focused block while the argument is warm.' });
  } else {
    const behindModules = d.modules
      .map((m) => ({ m, mins: minutesThisWeek(d, m.code, today), target: m.weeklyTargetHours * 60 }))
      .sort((a, b) => a.mins / a.target - b.mins / b.target);
    const primary = behindModules[0];
    if (primary) {
      blocks.push({
        moduleCode: primary.m.code,
        minutes: blockLen,
        activity: opts.tired ? 'Active recall on last week’s material' : 'Next unit: read, then close the book and write what you remember',
        why: `${primary.m.code} is at ${Math.round(primary.mins / 60)} of ${primary.m.weeklyTargetHours} h this week.`,
      });
    }
    if (!opts.tired && !opts.timeLimited && behindModules[1]) {
      blocks.push({ moduleCode: behindModules[1].m.code, minutes: blockLen, activity: 'Detailed notes on the current unit', why: 'Keeps the second module moving.' });
    }
  }
  if (due.length) blocks.push({ moduleCode: due[0].moduleCode, minutes: Math.min(20, 2 + due.length), activity: `${due.length} flashcards due`, why: 'Spaced retrieval: short, frequent, and the highest-yield 15 minutes of the day.' });

  const headline = opts.tired
    ? 'Lighter study day: retrieval and review rather than new material.'
    : urgent && urgent.daysLeft <= 7
      ? `Deadline focus: ${urgent.a.name}.`
      : `${blocks.length} focused block${blocks.length === 1 ? '' : 's'}.`;
  return { blocks, headline };
}

// ─── Harvard (Cite Them Right) ─────────────────────────────────────────────

export function formatReference(type: 'journal' | 'web' | 'report' | 'book', f: Record<string, string>): { list: string; inText: string } {
  const authors = (f.authors ?? '').trim();
  const year = (f.year ?? 'no date').trim();
  const firstAuthor = authors.split(/,|&| and /)[0]?.trim().split(' ')[0] ?? '';
  const many = (authors.match(/,|&| and /g) ?? []).length >= 2;
  const inText = `(${many ? `${firstAuthor} et al.` : authors.replace(/,\s*[A-Z]\.?(\s?[A-Z]\.)*/g, '') || 'Anon.'}, ${year})`;
  let list = '';
  if (type === 'journal') {
    list = `${authors} (${year}) '${f.title ?? ''}', *${f.journal ?? ''}*, ${f.volume ?? ''}${f.issue ? `(${f.issue})` : ''}${f.pages ? `, pp. ${f.pages}` : ''}.`;
    if (f.doi) list += ` Available at: https://doi.org/${f.doi.replace(/^https?:\/\/doi\.org\//, '')}.`;
  } else if (type === 'web') {
    list = `${authors} (${year}) *${f.title ?? ''}*. Available at: ${f.url ?? ''} (Accessed: ${f.accessed ?? ''}).`;
  } else if (type === 'report') {
    list = `${authors} (${year}) *${f.title ?? ''}*. ${f.place ? `${f.place}: ` : ''}${f.publisher ?? ''}.${f.url ? ` Available at: ${f.url} (Accessed: ${f.accessed ?? ''}).` : ''}`;
  } else {
    list = `${authors} (${year}) *${f.title ?? ''}*. ${f.edition ? `${f.edition} edn. ` : ''}${f.place ? `${f.place}: ` : ''}${f.publisher ?? ''}.`;
  }
  return { list: list.replace(/\s+/g, ' ').trim(), inText };
}

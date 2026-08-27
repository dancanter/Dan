import { sources as coreSources, SOURCE_TIER_LABEL } from './sources';
import { extendedSources } from './sourcesExtended';
import {
  guides,
  guideById,
  GUIDE_SECTIONS,
  GUIDE_PHASES,
  guidesInSection,
  sectionsInPhase,
} from './guides';
import { MIN_WEEK, MAX_WEEK } from './schema';
import { lossSections, lossIntro } from './loss';
import { equitySections, equityIntro } from './equity';
import { afterLossSections, afterLossIntro } from './afterLoss';
import { privacySections } from './privacy';
import { calmExercises, calmFacts, CALM_INTRO, CALM_ESCALATION } from './calm';
import { glossary, glossaryLookup, findGlossaryEntry } from './glossary';
import { sourceUrl, sourceLinkKind } from './sourceLinks';
import { evidenceFor, sourceYear } from './evidence';
import { searchGuides, searchSymptoms, urgentMatchFor, type SearchResult } from './search';
import { babyWeeks, babyWeekByNumber, milestones } from './babyWeeks';
import { myths, mythById } from './myths';
import { symptoms, symptomById } from './symptoms';
import { appointments } from './appointments';
import { redFlags, helpTopics } from './redFlags';
import { urgentSymptoms, urgentById, URGENT_DISCLAIMER } from './urgent';
import { midwifeQuestions } from './midwifeQuestions';
import { focusForWeek, noteForWeek, trimesterForWeek, trimesterLabel } from './weeklyFocus';
import { readsForWeek, newReadsBetween, weekReadGuideIds, type WeekRead } from './weeklyReads';
import {
  postnatalFocus,
  postnatalReads,
  postnatalNote,
  postnatalStageLabel,
  postnatalReadGuideIds,
  POSTNATAL_MAX_WEEK,
} from './afterBirth';

/** One registry, assembled from the two source files. */
export const sources = [...coreSources, ...extendedSources];
export const sourceById = new Map(sources.map((s) => [s.id, s]));

export * from './schema';
export {
  SOURCE_TIER_LABEL,
  guides,
  guideById,
  GUIDE_SECTIONS,
  GUIDE_PHASES,
  guidesInSection,
  sectionsInPhase,
  lossSections,
  lossIntro,
  equitySections,
  equityIntro,
  afterLossSections,
  afterLossIntro,
  privacySections,
  calmExercises,
  calmFacts,
  CALM_INTRO,
  CALM_ESCALATION,
  glossary,
  glossaryLookup,
  findGlossaryEntry,
  sourceUrl,
  sourceLinkKind,
  evidenceFor,
  sourceYear,
  searchGuides,
  searchSymptoms,
  urgentMatchFor,
  babyWeeks,
  babyWeekByNumber,
  milestones,
  myths,
  mythById,
  symptoms,
  symptomById,
  appointments,
  redFlags,
  helpTopics,
  urgentSymptoms,
  urgentById,
  URGENT_DISCLAIMER,
  midwifeQuestions,
  focusForWeek,
  noteForWeek,
  trimesterForWeek,
  trimesterLabel,
  readsForWeek,
  newReadsBetween,
  postnatalFocus,
  postnatalReads,
  postnatalNote,
  postnatalStageLabel,
  POSTNATAL_MAX_WEEK,
};
export type { WeekRead };
export type { SearchResult };
export type { CalmExercise, CalmFact } from './calm';
export type { Evidence, EvidenceStrength } from './evidence';
export type { UrgentSymptom, UrgentAction } from './urgent';

export interface ContentIssue {
  kind: 'missing-source' | 'duplicate-id' | 'coverage-gap' | 'bad-url';
  detail: string;
}

/**
 * Every claim in this app is supposed to be traceable to a named source.
 * This check enforces that structurally — a citation typo becomes an
 * immediate failure rather than a silently missing reference on screen.
 */
export function validateContent(): ContentIssue[] {
  const issues: ContentIssue[] = [];

  const check = (label: string, id: string, sourceIds: string[]) => {
    if (sourceIds.length === 0) {
      issues.push({ kind: 'missing-source', detail: `${label} "${id}" has no sources` });
    }
    for (const sid of sourceIds) {
      if (!sourceById.has(sid)) {
        issues.push({
          kind: 'missing-source',
          detail: `${label} "${id}" references unknown source "${sid}"`,
        });
      }
    }
  };

  const seen = new Set<string>();
  const unique = (label: string, id: string) => {
    const key = `${label}:${id}`;
    if (seen.has(key)) {
      issues.push({ kind: 'duplicate-id', detail: `Duplicate ${label} id "${id}"` });
    }
    seen.add(key);
  };

  for (const g of guides) {
    unique('guide', g.id);
    check('Guide', g.id, g.sourceIds);
  }
  for (const m of myths) {
    unique('myth', m.id);
    check('Myth', m.id, m.sourceIds);
  }
  for (const s of symptoms) {
    unique('symptom', s.id);
    check('Symptom', s.id, s.sourceIds);
    if (!s.flag.trim()) {
      issues.push({ kind: 'missing-source', detail: `Symptom "${s.id}" has an empty flag` });
    }
  }
  for (const t of helpTopics) {
    unique('helpTopic', t.id);
    check('Help topic', t.id, t.sourceIds);
  }
  for (const s of lossSections) {
    unique('lossSection', s.id);
    check('Loss section', s.id, s.sourceIds);
  }
  for (const s of urgentSymptoms) {
    unique('urgentSymptom', s.id);
    check('Urgent symptom', s.id, s.sourceIds);
    // The three-part structure is the safety design — an entry missing its
    // action line would leave someone with an explanation and no instruction.
    if (!s.now.trim()) {
      issues.push({ kind: 'coverage-gap', detail: `Urgent symptom "${s.id}" has no action line` });
    }
    if (!s.why.trim()) {
      issues.push({ kind: 'coverage-gap', detail: `Urgent symptom "${s.id}" has no explanation` });
    }
  }
  for (const s of equitySections) {
    unique('equitySection', s.id);
    check('Equity section', s.id, s.sourceIds);
  }
  for (const s of afterLossSections) {
    unique('afterLossSection', s.id);
    check('After-loss section', s.id, s.sourceIds);
  }

  // The disparity figures are only defensible if the actions that follow them
  // are actually present — that pairing is the whole design of the module.
  if (!equitySections.some((s) => s.tone === 'action')) {
    issues.push({
      kind: 'coverage-gap',
      detail: 'Inequalities module has no actionable section',
    });
  }

  // Duplicate source ids would make the registry lookup silently pick one —
  // worth catching now that sources come from two files.
  const seenSourceIds = new Set<string>();
  for (const s of sources) {
    if (seenSourceIds.has(s.id)) {
      issues.push({ kind: 'duplicate-id', detail: `Duplicate source id "${s.id}"` });
    }
    seenSourceIds.add(s.id);

    // A citation that opens the wrong page is worse than one that opens
    // nothing, so a hand-written link has to at least be a real https URL.
    if (s.url !== undefined) {
      let ok = false;
      try {
        ok = new URL(s.url).protocol === 'https:';
      } catch {
        ok = false;
      }
      if (!ok) {
        issues.push({
          kind: 'bad-url',
          detail: `Source "${s.id}" has a url that is not a valid https address`,
        });
      }
    }
  }

  // The calm page rests on the same citation rule as everything else — and
  // the escalation notice above the exercises is load-bearing, because a
  // breathing exercise is the wrong answer to a crisis.
  for (const e of calmExercises) {
    unique('calmExercise', e.id);
    check('Calm exercise', e.id, e.sourceIds);
  }
  for (const f of calmFacts) {
    check('Calm fact', f.text.slice(0, 30), f.sourceIds);
  }
  if (!CALM_ESCALATION.trim()) {
    issues.push({
      kind: 'coverage-gap',
      detail: 'Calm page has no escalation notice',
    });
  }

  // Every cited entry has to resolve to an evidence label, since that label is
  // now the first thing a reader sees about where a claim comes from. It is
  // derived from the sources, so this fails only if an entry cites nothing —
  // but that is exactly the case where a badge would be missing in silence.
  for (const g of guides) {
    const resolved = g.sourceIds.map((id) => sourceById.get(id)).filter((s) => s !== undefined);
    if (!evidenceFor(resolved)) {
      issues.push({
        kind: 'coverage-gap',
        detail: `Guide "${g.id}" has no resolvable evidence label`,
      });
    }
  }

  // Every declared section must actually contain guides, or the browse
  // hierarchy shows an empty heading.
  for (const section of GUIDE_SECTIONS) {
    if (guidesInSection(section.id).length === 0) {
      issues.push({
        kind: 'coverage-gap',
        detail: `Guide section "${section.id}" has no entries`,
      });
    }
  }

  // …and every guide must belong to a declared section.
  const declaredSections = new Set(GUIDE_SECTIONS.map((s) => s.id));
  for (const g of guides) {
    if (!declaredSections.has(g.section)) {
      issues.push({
        kind: 'coverage-gap',
        detail: `Guide "${g.id}" is in undeclared section "${g.section}"`,
      });
    }
  }

  // Baby weeks must cover the full browsable range with no holes, since the
  // Baby screen indexes straight into them.
  for (let w = MIN_WEEK; w <= MAX_WEEK; w++) {
    if (!babyWeekByNumber.has(w)) {
      issues.push({ kind: 'coverage-gap', detail: `No baby development entry for week ${w}` });
    }
  }

  // Every week must produce at least one focus item, or Today looks empty.
  for (let w = MIN_WEEK; w <= MAX_WEEK; w++) {
    if (focusForWeek(w).length === 0) {
      issues.push({ kind: 'coverage-gap', detail: `No focus items for week ${w}` });
    }
  }

  // The home screen surfaces guidance by week, so a renamed guide id must
  // fail here rather than quietly leaving the daily reading card short.
  for (const gid of [...weekReadGuideIds, ...postnatalReadGuideIds]) {
    if (!guideById.has(gid)) {
      issues.push({
        kind: 'missing-source',
        detail: `Weekly reading references unknown guide "${gid}"`,
      });
    }
  }

  for (let w = MIN_WEEK; w <= MAX_WEEK; w++) {
    if (readsForWeek(w).length === 0) {
      issues.push({
        kind: 'coverage-gap',
        detail: `No suggested reading for week ${w}`,
      });
    }
  }

  // After-birth mode has to hold up for a full year, not just the first month.
  for (let w = 0; w <= POSTNATAL_MAX_WEEK; w++) {
    if (postnatalFocus(w).length === 0) {
      issues.push({
        kind: 'coverage-gap',
        detail: `No focus items ${w} weeks after birth`,
      });
    }
    if (postnatalReads(w).length === 0) {
      issues.push({
        kind: 'coverage-gap',
        detail: `No suggested reading ${w} weeks after birth`,
      });
    }
  }

  return issues;
}

if (import.meta.env.DEV) {
  const issues = validateContent();
  if (issues.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `[content] ${issues.length} issue(s):\n` + issues.map((i) => `  - ${i.detail}`).join('\n'),
    );
  }
}

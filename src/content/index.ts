import { sources, sourceById, SOURCE_TIER_LABEL } from './sources';
import { guides, guideById, GUIDE_SECTIONS, guidesInSection } from './guides';
import { babyWeeks, babyWeekByNumber, milestones } from './babyWeeks';
import { myths, mythById } from './myths';
import { symptoms, symptomById } from './symptoms';
import { appointments } from './appointments';
import { redFlags, helpTopics } from './redFlags';
import { midwifeQuestions } from './midwifeQuestions';
import { badges, badgeById, WEEK_BADGES } from './badges';
import { focusForWeek, noteForWeek, trimesterForWeek, trimesterLabel } from './weeklyFocus';

export * from './schema';
export {
  sources,
  sourceById,
  SOURCE_TIER_LABEL,
  guides,
  guideById,
  GUIDE_SECTIONS,
  guidesInSection,
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
  midwifeQuestions,
  badges,
  badgeById,
  WEEK_BADGES,
  focusForWeek,
  noteForWeek,
  trimesterForWeek,
  trimesterLabel,
};

export interface ContentIssue {
  kind: 'missing-source' | 'duplicate-id' | 'coverage-gap';
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

  // Baby weeks must cover the full browsable range with no holes, since the
  // Baby screen indexes straight into them.
  for (let w = 4; w <= 42; w++) {
    if (!babyWeekByNumber.has(w)) {
      issues.push({ kind: 'coverage-gap', detail: `No baby development entry for week ${w}` });
    }
  }

  // Every week must produce at least one focus item, or Today looks empty.
  for (let w = 4; w <= 42; w++) {
    if (focusForWeek(w).length === 0) {
      issues.push({ kind: 'coverage-gap', detail: `No focus items for week ${w}` });
    }
  }

  for (const badgeRef of WEEK_BADGES) {
    if (!badgeById.has(badgeRef.badgeId)) {
      issues.push({
        kind: 'missing-source',
        detail: `WEEK_BADGES references unknown badge "${badgeRef.badgeId}"`,
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

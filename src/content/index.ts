import { allContentItems, contentItemById } from './topics';
import { allWeeks, weekByNumber } from './weeks';
import { sources, sourceById } from './sources';
import { badges, badgeById } from './badges';

export type { ContentItem, WeekPlan, Source, Badge, Trimester, ContentCategory } from './schema';
export { allContentItems, contentItemById, allWeeks, weekByNumber, sources, sourceById, badges, badgeById };

export interface ContentIntegrityIssue {
  kind: 'missing-source' | 'missing-content-item' | 'duplicate-id';
  detail: string;
}

/**
 * Validates that every cross-reference in the content data actually resolves,
 * so a typo in a topics/ or weeks/ file surfaces immediately instead of
 * silently breaking a screen at runtime.
 */
export function validateContentIntegrity(): ContentIntegrityIssue[] {
  const issues: ContentIntegrityIssue[] = [];

  const seenContentIds = new Set<string>();
  for (const item of allContentItems) {
    if (seenContentIds.has(item.id)) {
      issues.push({ kind: 'duplicate-id', detail: `Duplicate ContentItem id: ${item.id}` });
    }
    seenContentIds.add(item.id);

    for (const sourceId of item.sourceIds) {
      if (!sourceById.has(sourceId)) {
        issues.push({
          kind: 'missing-source',
          detail: `ContentItem "${item.id}" references missing source "${sourceId}"`,
        });
      }
    }
  }

  const seenWeekNumbers = new Set<number>();
  for (const week of allWeeks) {
    if (seenWeekNumbers.has(week.week)) {
      issues.push({ kind: 'duplicate-id', detail: `Duplicate WeekPlan for week ${week.week}` });
    }
    seenWeekNumbers.add(week.week);

    for (const id of [...week.dailyTipIds, ...week.featuredArticleIds]) {
      if (!contentItemById.has(id)) {
        issues.push({
          kind: 'missing-content-item',
          detail: `Week ${week.week} references missing ContentItem "${id}"`,
        });
      }
    }

    if (week.milestone && !badgeById.has(week.milestone.badgeId)) {
      issues.push({
        kind: 'missing-content-item',
        detail: `Week ${week.week} milestone references missing badge "${week.milestone.badgeId}"`,
      });
    }
  }

  return issues;
}

if (import.meta.env.DEV) {
  const issues = validateContentIntegrity();
  if (issues.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `[content integrity] ${issues.length} issue(s) found:\n` +
        issues.map((i) => `  - ${i.detail}`).join('\n'),
    );
  }
}

import type { Trimester, WeekPlan } from '../schema';

function trimesterForWeek(week: number): Trimester {
  if (week <= 12) return 1;
  if (week <= 27) return 2;
  return 3;
}

/**
 * Lightweight placeholder weeks so the timeline browses end-to-end without
 * gaps. These are meant to be replaced with fully-populated week-NN.ts files
 * (see week-09.ts / week-20.ts for the pattern) as more research is added.
 */
export function buildPlaceholderWeeks(weeks: number[]): WeekPlan[] {
  return weeks.map((week) => ({
    week,
    trimester: trimesterForWeek(week),
    headline: 'More content coming soon',
    dailyTipIds: [],
    featuredArticleIds: [],
  }));
}

const populatedWeeks = new Set([9, 20]);
const allWeekNumbers = Array.from({ length: 42 - 4 + 1 }, (_, i) => i + 4);
export const placeholderWeekNumbers = allWeekNumbers.filter(
  (w) => !populatedWeeks.has(w),
);

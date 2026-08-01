import type { WeekPlan } from '../schema';
import { week09 } from './week-09';
import { week20 } from './week-20';
import { buildPlaceholderWeeks, placeholderWeekNumbers } from './placeholders';

const populated: WeekPlan[] = [week09, week20];
const placeholders: WeekPlan[] = buildPlaceholderWeeks(placeholderWeekNumbers);

export const allWeeks: WeekPlan[] = [...populated, ...placeholders].sort(
  (a, b) => a.week - b.week,
);

export const weekByNumber = new Map(allWeeks.map((w) => [w.week, w]));

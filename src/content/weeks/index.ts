import type { WeekPlan } from '../schema';
import { week09 } from './week-09';
import { week20 } from './week-20';
import { buildRotatedWeeks, rotatedWeekNumbers } from './rotation';

const curated: WeekPlan[] = [week09, week20];
const rotated: WeekPlan[] = buildRotatedWeeks(rotatedWeekNumbers);

export const allWeeks: WeekPlan[] = [...curated, ...rotated].sort((a, b) => a.week - b.week);

export const weekByNumber = new Map(allWeeks.map((w) => [w.week, w]));

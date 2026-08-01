import type { Trimester } from '../content/schema';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const FULL_TERM_WEEKS = 40;
export const MIN_WEEK = 4;
export const MAX_WEEK = 42;

function clampWeek(week: number): number {
  return Math.min(MAX_WEEK, Math.max(MIN_WEEK, week));
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Given a due date, how many weeks pregnant someone is today. */
export function computeCurrentWeekFromDueDate(
  dueDateISO: string,
  today: Date = new Date(),
): number {
  const dueDate = new Date(`${dueDateISO}T00:00:00`);
  const weeksUntilDue = (dueDate.getTime() - today.getTime()) / MS_PER_WEEK;
  return clampWeek(Math.round(FULL_TERM_WEEKS - weeksUntilDue));
}

/** Given "I'm currently in week N," back-calculate an implied due date. */
export function computeDueDateFromCurrentWeek(
  currentWeek: number,
  today: Date = new Date(),
): string {
  const weeksRemaining = FULL_TERM_WEEKS - currentWeek;
  const dueDate = new Date(today.getTime() + weeksRemaining * MS_PER_WEEK);
  return toISODate(dueDate);
}

export function getTrimesterForWeek(week: number): Trimester {
  if (week <= 12) return 1;
  if (week <= 27) return 2;
  return 3;
}

export function formatDueDate(dueDateISO: string): string {
  const date = new Date(`${dueDateISO}T00:00:00`);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Day-of-week index (0-6), used to pick which daily tip to reveal today. */
export function dayIndexWithinWeek(today: Date = new Date()): number {
  return today.getDay();
}

export function todayKey(today: Date = new Date()): string {
  return toISODate(today);
}

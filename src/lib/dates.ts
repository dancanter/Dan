import { DUE_WEEK, MAX_WEEK, MIN_WEEK } from '../content/schema';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

function clampWeek(week: number): number {
  return Math.min(MAX_WEEK, Math.max(MIN_WEEK, week));
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseISO(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function computeCurrentWeekFromDueDate(dueDateISO: string, today = new Date()): number {
  const weeksUntilDue = (parseISO(dueDateISO).getTime() - today.getTime()) / MS_PER_WEEK;
  return clampWeek(Math.round(DUE_WEEK - weeksUntilDue));
}

export function computeDueDateFromCurrentWeek(currentWeek: number, today = new Date()): string {
  const due = new Date(today.getTime() + (DUE_WEEK - currentWeek) * MS_PER_WEEK);
  return toISODate(due);
}

export function daysUntil(dueDateISO: string, today = new Date()): number {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((parseISO(dueDateISO).getTime() - start.getTime()) / MS_PER_DAY);
}

export function formatDate(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function todayKey(today = new Date()): string {
  return toISODate(today);
}

/** Stable day-of-year index, used to pick the same daily card all day. */
export function dayOfYear(today = new Date()): number {
  const start = new Date(today.getFullYear(), 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / MS_PER_DAY);
}

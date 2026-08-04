import { useCallback, useMemo } from 'react';
import { usePersistedState } from './usePersistedState';
import { toISODate, todayKey } from '../lib/dates';

interface ProgressState {
  engagedDates: string[];
  /** Focus-checklist ticks, keyed `week:itemId` so each week tracks its own. */
  ticked: string[];
  readGuideIds: string[];
  revealedMythIds: string[];
  earnedBadgeIds: string[];
  /** Milestone weeks already celebrated, so the overlay shows once. */
  celebratedWeeks: number[];
}

const STORAGE_KEY = 'fieldnotes:progress';
const INITIAL: ProgressState = {
  engagedDates: [],
  ticked: [],
  readGuideIds: [],
  revealedMythIds: [],
  earnedBadgeIds: [],
  celebratedWeeks: [],
};

/**
 * Current unbroken run ending today. Not having opened the app *yet today*
 * does not break the streak — it just isn't counted yet, so nobody is told
 * they've lost something the moment they arrive.
 */
function computeStreak(dates: string[], today: Date): number {
  const set = new Set(dates);
  const cursor = new Date(today);
  if (!set.has(toISODate(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(toISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useProgress() {
  const [state, setState, reset] = usePersistedState<ProgressState>(STORAGE_KEY, INITIAL);

  const currentStreak = useMemo(
    () => computeStreak(state.engagedDates, new Date()),
    [state.engagedDates],
  );

  const toggle = useCallback(
    (list: keyof ProgressState, value: string) =>
      setState((prev) => {
        const arr = prev[list] as string[];
        return {
          ...prev,
          [list]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
        };
      }),
    [setState],
  );

  const addOnce = useCallback(
    (list: keyof ProgressState, value: string) =>
      setState((prev) => {
        const arr = prev[list] as string[];
        return arr.includes(value) ? prev : { ...prev, [list]: [...arr, value] };
      }),
    [setState],
  );

  const recordVisit = useCallback(() => {
    setState((prev) => {
      const key = todayKey();
      if (prev.engagedDates.includes(key)) return prev;
      const engagedDates = [...prev.engagedDates, key];
      const earned = new Set(prev.earnedBadgeIds);
      earned.add('first-visit');
      if (engagedDates.length >= 7) earned.add('week-of-checkins');
      return { ...prev, engagedDates, earnedBadgeIds: [...earned] };
    });
  }, [setState]);

  const markGuideRead = useCallback(
    (id: string) =>
      setState((prev) => {
        if (prev.readGuideIds.includes(id)) return prev;
        const readGuideIds = [...prev.readGuideIds, id];
        const earned = new Set(prev.earnedBadgeIds);
        if (readGuideIds.length >= 10) earned.add('curious');
        return { ...prev, readGuideIds, earnedBadgeIds: [...earned] };
      }),
    [setState],
  );

  const markMythRevealed = useCallback(
    (id: string) =>
      setState((prev) => {
        if (prev.revealedMythIds.includes(id)) return prev;
        const revealedMythIds = [...prev.revealedMythIds, id];
        const earned = new Set(prev.earnedBadgeIds);
        if (revealedMythIds.length >= 10) earned.add('myth-buster');
        return { ...prev, revealedMythIds, earnedBadgeIds: [...earned] };
      }),
    [setState],
  );

  const awardBadge = useCallback((id: string) => addOnce('earnedBadgeIds', id), [addOnce]);

  const markCelebrated = useCallback(
    (week: number) =>
      setState((prev) =>
        prev.celebratedWeeks.includes(week)
          ? prev
          : { ...prev, celebratedWeeks: [...prev.celebratedWeeks, week] },
      ),
    [setState],
  );

  return {
    currentStreak,
    daysVisited: state.engagedDates.length,
    engagedDates: state.engagedDates,
    ticked: state.ticked,
    readGuideIds: state.readGuideIds,
    revealedMythIds: state.revealedMythIds,
    earnedBadgeIds: state.earnedBadgeIds,
    celebratedWeeks: state.celebratedWeeks,
    isTicked: (key: string) => state.ticked.includes(key),
    toggleTick: (key: string) => toggle('ticked', key),
    recordVisit,
    markGuideRead,
    markMythRevealed,
    awardBadge,
    markCelebrated,
    resetProgress: reset,
  };
}

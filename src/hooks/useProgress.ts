import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import { todayKey } from '../lib/dates';

/**
 * Deliberately holds no streak, score or badge state.
 *
 * The brief rules those out, and the reasoning is sound for this audience:
 * a streak turns a missed day into a small failure at a time when people are
 * exhausted, and a badge for "reaching week 24" rewards the passage of time
 * as though it were an achievement someone earned. What survives here is
 * only what a reader gets something back from — which entries they have
 * read, which myths they have turned over, and which focus items they have
 * ticked this week.
 */
interface ProgressState {
  engagedDates: string[];
  /** Focus-checklist ticks, keyed `week:itemId` so each week tracks its own. */
  ticked: string[];
  readGuideIds: string[];
  revealedMythIds: string[];
  /** Milestone weeks already celebrated, so the overlay shows once. */
  celebratedWeeks: number[];
}

const STORAGE_KEY = 'fieldnotes:progress';
const INITIAL: ProgressState = {
  engagedDates: [],
  ticked: [],
  readGuideIds: [],
  revealedMythIds: [],
  celebratedWeeks: [],
};

export function useProgress() {
  const [state, setState, reset] = usePersistedState<ProgressState>(STORAGE_KEY, INITIAL);

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
      return { ...prev, engagedDates: [...prev.engagedDates, key] };
    });
  }, [setState]);

  const markGuideRead = useCallback((id: string) => addOnce('readGuideIds', id), [addOnce]);

  const markMythRevealed = useCallback((id: string) => addOnce('revealedMythIds', id), [addOnce]);

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
    daysVisited: state.engagedDates.length,
    engagedDates: state.engagedDates,
    ticked: state.ticked,
    readGuideIds: state.readGuideIds,
    revealedMythIds: state.revealedMythIds,
    celebratedWeeks: state.celebratedWeeks,
    isTicked: (key: string) => state.ticked.includes(key),
    toggleTick: (key: string) => toggle('ticked', key),
    recordVisit,
    markGuideRead,
    markMythRevealed,
    markCelebrated,
    resetProgress: reset,
  };
}

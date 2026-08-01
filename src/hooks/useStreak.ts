import { useCallback, useMemo } from 'react';
import { usePersistedState } from './usePersistedState';
import { toISODate, todayKey } from '../lib/dates';

interface StreakState {
  engagedDates: string[];
  viewedArticleIds: string[];
  earnedBadgeIds: string[];
}

const STORAGE_KEY = 'bump:streak';
const INITIAL_STATE: StreakState = {
  engagedDates: [],
  viewedArticleIds: [],
  earnedBadgeIds: [],
};

/**
 * Computes the current unbroken streak ending today. If the person hasn't
 * engaged yet today, that alone doesn't break the streak — it just means
 * today isn't counted yet. This deliberately avoids the guilt-inducing
 * "your streak just reset" moment the moment someone opens the app.
 */
function computeCurrentStreak(engagedDates: string[], today: Date): number {
  const set = new Set(engagedDates);
  const cursor = new Date(today);
  if (!set.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (set.has(toISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useStreak() {
  const [state, setState, resetStreak] = usePersistedState<StreakState>(
    STORAGE_KEY,
    INITIAL_STATE,
  );

  const currentStreak = useMemo(
    () => computeCurrentStreak(state.engagedDates, new Date()),
    [state.engagedDates],
  );
  const totalDaysEngaged = state.engagedDates.length;
  const engagedToday = state.engagedDates.includes(todayKey());

  const recordEngagementToday = useCallback(() => {
    setState((prev) => {
      const key = todayKey();
      if (prev.engagedDates.includes(key)) return prev;
      return { ...prev, engagedDates: [...prev.engagedDates, key] };
    });
  }, [setState]);

  const markArticleViewed = useCallback(
    (articleId: string) => {
      setState((prev) => {
        if (prev.viewedArticleIds.includes(articleId)) return prev;
        return { ...prev, viewedArticleIds: [...prev.viewedArticleIds, articleId] };
      });
    },
    [setState],
  );

  const awardBadge = useCallback(
    (badgeId: string) => {
      setState((prev) => {
        if (prev.earnedBadgeIds.includes(badgeId)) return prev;
        return { ...prev, earnedBadgeIds: [...prev.earnedBadgeIds, badgeId] };
      });
    },
    [setState],
  );

  return {
    currentStreak,
    totalDaysEngaged,
    engagedToday,
    viewedArticleIds: state.viewedArticleIds,
    earnedBadgeIds: state.earnedBadgeIds,
    recordEngagementToday,
    markArticleViewed,
    awardBadge,
    resetStreak,
  };
}

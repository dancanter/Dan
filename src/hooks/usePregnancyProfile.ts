import { useMemo } from 'react';
import { usePersistedState } from './usePersistedState';
import {
  computeCurrentWeekFromDueDate,
  computeDueDateFromCurrentWeek,
  getTrimesterForWeek,
  MAX_WEEK,
  MIN_WEEK,
} from '../lib/dates';

interface PregnancyProfile {
  dueDate: string | null;
}

const STORAGE_KEY = 'bump:profile';
const INITIAL_PROFILE: PregnancyProfile = { dueDate: null };

export function usePregnancyProfile() {
  const [profile, setProfile, resetProfile] = usePersistedState<PregnancyProfile>(
    STORAGE_KEY,
    INITIAL_PROFILE,
  );

  const currentWeek = useMemo(() => {
    if (!profile.dueDate) return null;
    return computeCurrentWeekFromDueDate(profile.dueDate);
  }, [profile.dueDate]);

  const trimester = currentWeek ? getTrimesterForWeek(currentWeek) : null;
  const isOnboarded = profile.dueDate !== null;

  function setDueDate(dueDateISO: string) {
    setProfile({ dueDate: dueDateISO });
  }

  function setCurrentWeek(week: number) {
    const clamped = Math.min(MAX_WEEK, Math.max(MIN_WEEK, week));
    setProfile({ dueDate: computeDueDateFromCurrentWeek(clamped) });
  }

  return {
    dueDate: profile.dueDate,
    currentWeek,
    trimester,
    isOnboarded,
    setDueDate,
    setCurrentWeek,
    resetProfile,
  };
}

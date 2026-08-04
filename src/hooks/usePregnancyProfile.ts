import { useMemo } from 'react';
import { usePersistedState } from './usePersistedState';
import {
  computeCurrentWeekFromDueDate,
  computeDueDateFromCurrentWeek,
  daysUntil,
} from '../lib/dates';
import { MAX_WEEK, MIN_WEEK } from '../content/schema';
import { trimesterForWeek } from '../content/weeklyFocus';

interface PregnancyProfile {
  dueDate: string | null;
  /** Optional nickname, used to warm up copy on the Baby screen. */
  babyName: string | null;
  firstPregnancy: boolean;
}

const STORAGE_KEY = 'fieldnotes:profile';
const INITIAL: PregnancyProfile = { dueDate: null, babyName: null, firstPregnancy: true };

export function usePregnancyProfile() {
  const [profile, setProfile, resetProfile] = usePersistedState<PregnancyProfile>(
    STORAGE_KEY,
    INITIAL,
  );

  const currentWeek = useMemo(
    () => (profile.dueDate ? computeCurrentWeekFromDueDate(profile.dueDate) : null),
    [profile.dueDate],
  );

  const daysToGo = useMemo(
    () => (profile.dueDate ? daysUntil(profile.dueDate) : null),
    [profile.dueDate],
  );

  return {
    dueDate: profile.dueDate,
    babyName: profile.babyName,
    firstPregnancy: profile.firstPregnancy,
    currentWeek,
    daysToGo,
    trimester: currentWeek ? trimesterForWeek(currentWeek) : null,
    isOnboarded: profile.dueDate !== null,
    setDueDate: (dueDateISO: string) => setProfile((p) => ({ ...p, dueDate: dueDateISO })),
    setCurrentWeek: (week: number) =>
      setProfile((p) => ({
        ...p,
        dueDate: computeDueDateFromCurrentWeek(
          Math.min(MAX_WEEK, Math.max(MIN_WEEK, week)),
        ),
      })),
    setBabyName: (name: string) =>
      setProfile((p) => ({ ...p, babyName: name.trim() || null })),
    setFirstPregnancy: (value: boolean) =>
      setProfile((p) => ({ ...p, firstPregnancy: value })),
    resetProfile,
  };
}

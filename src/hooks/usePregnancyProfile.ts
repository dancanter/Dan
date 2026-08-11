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
  /**
   * Set once the baby has actually arrived. Its presence — not the due date
   * passing — is what switches the app into its after-birth mode, because
   * babies routinely arrive weeks either side of a due date.
   */
  birthDate: string | null;
  /** Optional nickname, used to warm up copy on the Baby screen. */
  babyName: string | null;
  firstPregnancy: boolean;
}

const STORAGE_KEY = 'fieldnotes:profile';
const INITIAL: PregnancyProfile = {
  dueDate: null,
  birthDate: null,
  babyName: null,
  firstPregnancy: true,
};

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

  const babyAgeDays = useMemo(
    () => (profile.birthDate ? Math.max(0, -daysUntil(profile.birthDate)) : null),
    [profile.birthDate],
  );

  return {
    dueDate: profile.dueDate,
    birthDate: profile.birthDate,
    babyName: profile.babyName,
    firstPregnancy: profile.firstPregnancy,
    currentWeek,
    daysToGo,
    trimester: currentWeek ? trimesterForWeek(currentWeek) : null,
    isOnboarded: profile.dueDate !== null,
    /** True once a birth date is recorded — the app's after-birth mode. */
    hasBaby: profile.birthDate !== null,
    babyAgeDays,
    /** Completed weeks since birth, so the first seven days are week 0. */
    babyAgeWeeks: babyAgeDays === null ? null : Math.floor(babyAgeDays / 7),
    setDueDate: (dueDateISO: string) => setProfile((p) => ({ ...p, dueDate: dueDateISO })),
    setBirthDate: (birthDateISO: string | null) =>
      setProfile((p) => ({ ...p, birthDate: birthDateISO })),
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

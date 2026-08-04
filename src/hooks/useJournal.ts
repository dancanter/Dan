import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';
import { todayKey } from '../lib/dates';

export type JournalKind = 'mood' | 'note' | 'question' | 'symptom';

export interface JournalEntry {
  id: string;
  kind: JournalKind;
  text: string;
  /** ISO date string — stored rather than a Date so it survives JSON. */
  date: string;
  week: number | null;
}

const STORAGE_KEY = 'fieldnotes:journal';

export const JOURNAL_LABEL: Record<JournalKind, string> = {
  mood: 'Mood',
  note: 'Note',
  question: 'For my midwife',
  symptom: 'Symptom',
};

export const MOODS = [
  { value: 'Good', emoji: '😊', message: 'Good days are worth noticing too. Nice one.' },
  { value: 'OK', emoji: '😐', message: 'Perfectly normal. Most days are fine-ish days.' },
  {
    value: 'Tired',
    emoji: '😴',
    message: 'Tiredness in pregnancy is real, physical and expected — not a failing.',
  },
  {
    value: 'Anxious',
    emoji: '😟',
    message: 'Up to 1 in 4 people experience anxiety symptoms in pregnancy. You are not unusual.',
  },
  {
    value: 'Low',
    emoji: '😢',
    message: 'Shifting hormones genuinely affect mood. This is physical, not you overthinking.',
  },
] as const;

export function useJournal() {
  const [entries, setEntries, reset] = usePersistedState<JournalEntry[]>(STORAGE_KEY, []);

  const add = useCallback(
    (kind: JournalKind, text: string, week: number | null) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const entry: JournalEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind,
        text: trimmed,
        date: todayKey(),
        week,
      };
      setEntries((prev) => [entry, ...prev]);
    },
    [setEntries],
  );

  const remove = useCallback(
    (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)),
    [setEntries],
  );

  const moodHistory = entries.filter((e) => e.kind === 'mood').slice(0, 14).reverse();

  return { entries, add, remove, moodHistory, resetJournal: reset };
}

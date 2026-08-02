import { useCallback, useMemo } from 'react';
import { usePersistedState } from './usePersistedState';
import { createId } from '../lib/id';
import { sortEntriesByDateDesc, type JournalEntry, type MoodId } from '../lib/journal';
import { todayKey } from '../lib/dates';

interface JournalState {
  entries: JournalEntry[];
}

const STORAGE_KEY = 'bump:journal';
const INITIAL_STATE: JournalState = { entries: [] };

export interface JournalDraft {
  date: string;
  mood: MoodId | null;
  symptomIds: string[];
  note: string;
}

export function useJournal() {
  const [state, setState, resetJournal] = usePersistedState<JournalState>(
    STORAGE_KEY,
    INITIAL_STATE,
  );

  const entries = useMemo(() => sortEntriesByDateDesc(state.entries), [state.entries]);

  const addEntry = useCallback(
    (draft: JournalDraft): JournalEntry => {
      const now = new Date().toISOString();
      const entry: JournalEntry = {
        id: createId(),
        date: draft.date || todayKey(),
        createdAt: now,
        updatedAt: now,
        mood: draft.mood,
        symptomIds: draft.symptomIds,
        note: draft.note.trim(),
      };
      setState((prev) => ({ entries: [...prev.entries, entry] }));
      return entry;
    },
    [setState],
  );

  const updateEntry = useCallback(
    (id: string, draft: JournalDraft) => {
      setState((prev) => ({
        entries: prev.entries.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                date: draft.date || entry.date,
                mood: draft.mood,
                symptomIds: draft.symptomIds,
                note: draft.note.trim(),
                updatedAt: new Date().toISOString(),
              }
            : entry,
        ),
      }));
    },
    [setState],
  );

  const removeEntry = useCallback(
    (id: string) => {
      setState((prev) => ({ entries: prev.entries.filter((entry) => entry.id !== id) }));
    },
    [setState],
  );

  const entryById = useCallback(
    (id: string) => state.entries.find((entry) => entry.id === id) ?? null,
    [state.entries],
  );

  /** Days with at least one entry — feeds the "you've logged N days" summary. */
  const daysLogged = useMemo(
    () => new Set(state.entries.map((entry) => entry.date)).size,
    [state.entries],
  );

  return {
    entries,
    entryCount: state.entries.length,
    daysLogged,
    addEntry,
    updateEntry,
    removeEntry,
    entryById,
    resetJournal,
  };
}

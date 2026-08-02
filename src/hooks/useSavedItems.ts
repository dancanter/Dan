import { useCallback, useMemo } from 'react';
import { usePersistedState } from './usePersistedState';

interface SavedState {
  /** Content ids, most recently saved last. */
  itemIds: string[];
}

const STORAGE_KEY = 'bump:saved';
const INITIAL_STATE: SavedState = { itemIds: [] };

/**
 * Bookmarked reads. Distinct from `viewedArticleIds` in `useStreak`: that's an
 * automatic record of what's been opened, this is a deliberate "keep this one".
 */
export function useSavedItems() {
  const [state, setState, resetSaved] = usePersistedState<SavedState>(STORAGE_KEY, INITIAL_STATE);

  const savedIds = useMemo(() => [...state.itemIds].reverse(), [state.itemIds]);
  const savedSet = useMemo(() => new Set(state.itemIds), [state.itemIds]);

  const isSaved = useCallback((itemId: string) => savedSet.has(itemId), [savedSet]);

  const toggleSaved = useCallback(
    (itemId: string) => {
      setState((prev) =>
        prev.itemIds.includes(itemId)
          ? { itemIds: prev.itemIds.filter((id) => id !== itemId) }
          : { itemIds: [...prev.itemIds, itemId] },
      );
    },
    [setState],
  );

  return {
    savedIds,
    savedCount: state.itemIds.length,
    isSaved,
    toggleSaved,
    resetSaved,
  };
}

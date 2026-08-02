import { useCallback, useSyncExternalStore } from 'react';
import { readKey, removeKey, subscribe, writeKey } from '../lib/storage';

/**
 * React binding over the storage module in `src/lib/storage.ts`.
 *
 * Every call for the same key shares one cache entry and listener set, so a
 * write from one component (Onboarding setting the due date) is immediately
 * visible to every other component reading that key (the root App's tab bar),
 * and to other open tabs. Pass a module-level constant as `initialValue` —
 * a fresh object literal per render would resubscribe on every render.
 */
export function usePersistedState<T>(key: string, initialValue: T) {
  const subscribeToKey = useCallback(
    (onStoreChange: () => void) => subscribe(key, onStoreChange),
    [key],
  );

  const getSnapshot = useCallback(() => readKey(key, initialValue), [key, initialValue]);

  const value = useSyncExternalStore(subscribeToKey, getSnapshot, getSnapshot);

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const prev = readKey(key, initialValue);
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
      writeKey(key, next);
    },
    [key, initialValue],
  );

  const reset = useCallback(() => {
    removeKey(key);
  }, [key]);

  return [value, setValue, reset] as const;
}

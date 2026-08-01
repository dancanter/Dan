import { useCallback, useSyncExternalStore } from 'react';

type Listener = () => void;

// Every usePersistedState call for the same key shares one in-memory cache
// entry and listener set, so changes made by one component (e.g. Onboarding
// setting the due date) are immediately visible to every other mounted
// component reading that key (e.g. the root App's tab bar visibility) —
// plain component-local useState can't do this since separate hook
// instances never re-read localStorage after their initial mount.
const listeners = new Map<string, Set<Listener>>();
const cache = new Map<string, unknown>();

function readFromStorage<T>(key: string, initialValue: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored !== null ? (JSON.parse(stored) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

function getCached<T>(key: string, initialValue: T): T {
  if (!cache.has(key)) {
    cache.set(key, readFromStorage(key, initialValue));
  }
  return cache.get(key) as T;
}

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function writeValue<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable — state still works for this session via cache.
  }
  notify(key);
}

export function usePersistedState<T>(key: string, initialValue: T) {
  const subscribe = useCallback(
    (onStoreChange: Listener) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(onStoreChange);
      return () => listeners.get(key)?.delete(onStoreChange);
    },
    [key],
  );

  const getSnapshot = useCallback(() => getCached(key, initialValue), [key, initialValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot);

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const prev = getCached(key, initialValue);
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
      writeValue(key, next);
    },
    [key, initialValue],
  );

  const reset = useCallback(() => {
    cache.delete(key);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    notify(key);
  }, [key]);

  return [value, setValue, reset] as const;
}

import { useEffect, useState, useSyncExternalStore } from 'react';
import { getHealth, isStoragePersisted, subscribeHealth } from '../lib/storage';

/** Live view of whether saving is actually working, for the Settings screen. */
export function useStorageHealth() {
  const health = useSyncExternalStore(subscribeHealth, getHealth, getHealth);
  const [persisted, setPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    isStoragePersisted().then((result) => {
      if (!cancelled) setPersisted(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...health, persisted, setPersisted };
}

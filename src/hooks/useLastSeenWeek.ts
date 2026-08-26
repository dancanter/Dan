import { useEffect, useState } from 'react';
import { usePersistedState } from './usePersistedState';

const STORAGE_KEY = 'fieldnotes:lastSeenWeek';

/**
 * The week the reader was in the last time they opened the app.
 *
 * This exists so the daily screen can say what has *changed* rather than
 * repeating itself. Someone who opens the app every day and someone who opens
 * it once a fortnight should both get something useful — and neither should be
 * told how long it has been.
 *
 * That last part is the whole design constraint. "You haven't been here in 9
 * days" is a streak wearing a different hat: it turns an absence into a
 * failure, for a reader who may have been too exhausted, too sick, or too
 * frightened to open a pregnancy app. So this tracks the week, never the date,
 * and there is deliberately no way to compute a gap from it.
 */
export function useLastSeenWeek(currentWeek: number | null): number | null {
  const [stored, setStored] = usePersistedState<{ week: number | null }>(STORAGE_KEY, {
    week: null,
  });

  // Captured on the first render, before the effect below overwrites it —
  // otherwise recording this visit would erase the very thing we are about to
  // show, and the banner would flash and vanish.
  const [previous] = useState<number | null>(() => stored.week);

  useEffect(() => {
    if (currentWeek === null) return;
    if (stored.week === currentWeek) return;
    setStored({ week: currentWeek });
  }, [currentWeek, stored.week, setStored]);

  return previous;
}

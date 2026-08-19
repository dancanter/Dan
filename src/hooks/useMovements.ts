import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState';

export type MovementKind = 'kick' | 'roll' | 'flutter' | 'hiccup' | 'stretch';
export type MovementStrength = 'faint' | 'usual' | 'strong';

export interface MovementEntry {
  id: string;
  /** ISO timestamp — the *time* is the useful part, not any total. */
  at: string;
  kind: MovementKind;
  strength: MovementStrength;
  note?: string;
}

const STORAGE_KEY = 'fieldnotes:movements';

export const MOVEMENT_KINDS: { value: MovementKind; label: string }[] = [
  { value: 'kick', label: 'Kick' },
  { value: 'roll', label: 'Roll' },
  { value: 'flutter', label: 'Flutter' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'hiccup', label: 'Hiccups' },
];

export const MOVEMENT_STRENGTHS: { value: MovementStrength; label: string }[] = [
  { value: 'faint', label: 'Fainter than usual' },
  { value: 'usual', label: 'About usual' },
  { value: 'strong', label: 'Strong' },
];

/**
 * Deliberately NOT a kick counter.
 *
 * NHS and RCOG guidance is explicit that there is no target number of
 * movements and that counting is not recommended. So this stores *when* and
 * *what kind*, and nothing that could be read as a score: no totals, no
 * targets, no daily goal, no streak, and no derived judgement about whether
 * a pattern is reassuring. Adding a count here later would turn a memory aid
 * into a home diagnostic, which is precisely the thing the guidance warns
 * against.
 *
 * The only thing this is for is helping someone recognise their own baby's
 * usual pattern, so they would notice it change and call.
 */
export function useMovements() {
  const [entries, setEntries, reset] = usePersistedState<MovementEntry[]>(STORAGE_KEY, []);

  const log = useCallback(
    (kind: MovementKind, strength: MovementStrength, note?: string) => {
      setEntries((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          at: new Date().toISOString(),
          kind,
          strength,
          note: note?.trim() || undefined,
        },
        ...prev,
      ]);
    },
    [setEntries],
  );

  const remove = useCallback(
    (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)),
    [setEntries],
  );

  return { entries, log, remove, resetMovements: reset };
}

/**
 * Groups entries by hour of day across recent days, purely so someone can
 * see *when* their baby tends to be active. Returns raw presence, never a
 * count or an average — the shape of the day is the point.
 */
export function activeHours(entries: MovementEntry[], days = 7): Set<number> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const hours = new Set<number>();
  for (const e of entries) {
    const t = new Date(e.at).getTime();
    if (t >= cutoff) hours.add(new Date(e.at).getHours());
  }
  return hours;
}

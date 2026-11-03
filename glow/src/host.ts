import type { State } from '@/store';

// When Glow runs inside The Good Life tracker, the tracker is the host: its
// store is the only store, and its calls (calories, steps, the green light)
// are the only calls. Glow reads and writes through this interface and never
// keeps a second copy. On its own, none of this exists and Glow uses the
// browser's storage as before.

/** names: the foods logged that day, so the tracker can read its food groups. */
export interface DaySum { kcal: number; protein: number; nutrition: number; glow: number; plants: number; carbs?: number; fat?: number; fibre?: number; names?: string[] }
export interface Verdict { c: string; t: string; sub?: string }

export interface GlowHost {
  /** Glow's state, assembled from the tracker's store. */
  load(): Partial<State>;
  /** Write Glow's state back into the tracker's store, with each day's totals. */
  save(s: State, sums: Record<string, DaySum>): void;
  /** The tracker's calorie target for a date. */
  kcal(date: string): number | undefined;
  /** The tracker's step target for a date (Saturday is a ceiling, not a target). */
  steps(date: string): number | undefined;
  /** The tracker's training call for today (green / amber / red / done). */
  verdict(date: string): Verdict | null;
}

export const host = (): GlowHost | undefined => (globalThis as unknown as { __GLOW_HOST__?: GlowHost }).__GLOW_HOST__;
export const hosted = (): boolean => !!host();

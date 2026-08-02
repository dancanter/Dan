/**
 * The journal is the app's first genuinely personal data: how someone felt on
 * a given day, in their own words. The vocabulary below is deliberately
 * descriptive rather than evaluative — no "good day / bad day" scoring — to
 * match the anti-guilt tone of the underlying research content.
 */

export interface JournalEntry {
  id: string;
  /** ISO date (YYYY-MM-DD) the entry is *about*, not when it was typed. */
  date: string;
  createdAt: string;
  updatedAt: string;
  mood: MoodId | null;
  symptomIds: string[];
  note: string;
}

export type MoodId = 'tough' | 'mixed' | 'steady' | 'bright';

export interface MoodOption {
  id: MoodId;
  label: string;
  emoji: string;
}

/**
 * Four points, no numeric scale and no midpoint labelled "average" — the aim is
 * a vocabulary for a day, not a score to keep up.
 */
export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'tough', label: 'A tough day', emoji: '🌧️' },
  { id: 'mixed', label: 'Up and down', emoji: '⛅' },
  { id: 'steady', label: 'Steady', emoji: '🌤️' },
  { id: 'bright', label: 'A good day', emoji: '☀️' },
];

export interface SymptomOption {
  id: string;
  label: string;
}

/** Common, non-alarming symptoms — anything urgent belongs with a midwife, not a checkbox. */
export const SYMPTOM_OPTIONS: SymptomOption[] = [
  { id: 'nausea', label: 'Nausea' },
  { id: 'tiredness', label: 'Tiredness' },
  { id: 'heartburn', label: 'Heartburn' },
  { id: 'back-pain', label: 'Back pain' },
  { id: 'headache', label: 'Headache' },
  { id: 'cramps', label: 'Cramps' },
  { id: 'swelling', label: 'Swelling' },
  { id: 'poor-sleep', label: 'Trouble sleeping' },
  { id: 'breathlessness', label: 'Breathlessness' },
  { id: 'dizziness', label: 'Dizziness' },
  { id: 'low-mood', label: 'Low mood' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'movements', label: 'Baby moving' },
  { id: 'cravings', label: 'Cravings' },
];

export const symptomById = new Map(SYMPTOM_OPTIONS.map((option) => [option.id, option]));
export const moodById = new Map(MOOD_OPTIONS.map((option) => [option.id, option]));

export function symptomLabel(id: string): string {
  return symptomById.get(id)?.label ?? id;
}

/** Newest first — the journal reads as a feed, most recent day at the top. */
export function sortEntriesByDateDesc(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

/** True when an entry carries nothing worth saving, so empty saves can be refused. */
export function isEntryEmpty(
  draft: Pick<JournalEntry, 'mood' | 'symptomIds' | 'note'>,
): boolean {
  return draft.mood === null && draft.symptomIds.length === 0 && draft.note.trim() === '';
}

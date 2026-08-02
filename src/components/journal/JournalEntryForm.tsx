import { useEffect, useId, useState } from 'react';
import {
  isEntryEmpty,
  MOOD_OPTIONS,
  SYMPTOM_OPTIONS,
  type JournalEntry,
  type MoodId,
} from '../../lib/journal';
import { todayKey } from '../../lib/dates';
import type { JournalDraft } from '../../hooks/useJournal';

interface JournalEntryFormProps {
  /** Present when editing an existing entry; absent when writing a new one. */
  entry?: JournalEntry;
  onSave: (draft: JournalDraft) => void;
  onCancel?: () => void;
}

function draftFromEntry(entry?: JournalEntry): JournalDraft {
  return {
    date: entry?.date ?? todayKey(),
    mood: entry?.mood ?? null,
    symptomIds: entry?.symptomIds ?? [],
    note: entry?.note ?? '',
  };
}

export function JournalEntryForm({ entry, onSave, onCancel }: JournalEntryFormProps) {
  const [draft, setDraft] = useState<JournalDraft>(() => draftFromEntry(entry));
  const [error, setError] = useState<string | null>(null);
  const fieldId = useId();

  // Switching which entry is being edited must reload the form's contents.
  useEffect(() => {
    setDraft(draftFromEntry(entry));
    setError(null);
  }, [entry]);

  function toggleSymptom(id: string) {
    setDraft((prev) => ({
      ...prev,
      symptomIds: prev.symptomIds.includes(id)
        ? prev.symptomIds.filter((symptomId) => symptomId !== id)
        : [...prev.symptomIds, id],
    }));
  }

  function setMood(mood: MoodId) {
    setDraft((prev) => ({ ...prev, mood: prev.mood === mood ? null : mood }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isEntryEmpty(draft)) {
      setError('Add a note, a symptom, or how the day felt before saving.');
      return;
    }
    setError(null);
    onSave(draft);
    if (!entry) setDraft(draftFromEntry());
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-bump-border bg-bump-surface p-4 dark:border-bump-border-dark dark:bg-bump-surface-dark">
      <div>
        <label
          htmlFor={`${fieldId}-date`}
          className="text-sm font-semibold text-bump-text dark:text-bump-text-dark"
        >
          Date
        </label>
        <input
          id={`${fieldId}-date`}
          type="date"
          value={draft.date}
          max={todayKey()}
          onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
          className="mt-1 min-h-11 w-full rounded-xl border border-bump-border bg-bump-surface px-3 py-2 text-base text-bump-text dark:border-bump-border-dark dark:bg-bump-surface-dark dark:text-bump-text-dark"
        />
      </div>

      <fieldset className="mt-4 border-0 p-0">
        <legend className="text-sm font-semibold text-bump-text dark:text-bump-text-dark">
          How did today feel?
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMood(option.id)}
              aria-pressed={draft.mood === option.id}
              className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-medium ${
                draft.mood === option.id
                  ? 'border-bump-primary bg-bump-primary/10 text-bump-primary dark:text-bump-primary-dark'
                  : 'border-bump-border text-bump-text dark:border-bump-border-dark dark:text-bump-text-dark'
              }`}
            >
              <span aria-hidden="true">{option.emoji}</span> {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4 border-0 p-0">
        <legend className="text-sm font-semibold text-bump-text dark:text-bump-text-dark">
          Anything you noticed?
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleSymptom(option.id)}
              aria-pressed={draft.symptomIds.includes(option.id)}
              className={`min-h-11 rounded-full border px-3 py-2 text-sm font-medium ${
                draft.symptomIds.includes(option.id)
                  ? 'border-bump-accent bg-bump-accent/15 text-bump-text dark:text-bump-text-dark'
                  : 'border-bump-border text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <label
          htmlFor={`${fieldId}-note`}
          className="text-sm font-semibold text-bump-text dark:text-bump-text-dark"
        >
          Notes
        </label>
        <textarea
          id={`${fieldId}-note`}
          value={draft.note}
          onChange={(event) => setDraft((prev) => ({ ...prev, note: event.target.value }))}
          rows={4}
          placeholder="Anything you want to remember, or mention at your next appointment."
          className="mt-1 w-full rounded-xl border border-bump-border bg-bump-surface px-3 py-2 text-base leading-relaxed text-bump-text dark:border-bump-border-dark dark:bg-bump-surface-dark dark:text-bump-text-dark"
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="min-h-11 flex-1 rounded-xl bg-bump-primary px-4 py-2 text-sm font-semibold text-white"
        >
          {entry ? 'Save changes' : 'Save entry'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-xl border border-bump-border px-4 py-2 text-sm font-semibold text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

import { moodById, symptomLabel, type JournalEntry } from '../../lib/journal';
import { formatAppointmentDate } from '../../lib/appointments';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
}

export function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  const mood = entry.mood ? moodById.get(entry.mood) : null;

  return (
    <li className="rounded-2xl border border-bump-border bg-bump-surface p-4 dark:border-bump-border-dark dark:bg-bump-surface-dark">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-bump-text dark:text-bump-text-dark">
            {formatAppointmentDate(entry.date)}
          </h3>
          {mood && (
            <p className="mt-0.5 text-sm text-bump-muted dark:text-bump-muted-dark">
              <span aria-hidden="true">{mood.emoji}</span> {mood.label}
            </p>
          )}
        </div>
      </div>

      {entry.symptomIds.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {entry.symptomIds.map((id) => (
            <li
              key={id}
              className="rounded-full bg-bump-accent/15 px-2.5 py-1 text-xs font-medium text-bump-text dark:text-bump-text-dark"
            >
              {symptomLabel(id)}
            </li>
          ))}
        </ul>
      )}

      {entry.note && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-bump-text dark:text-bump-text-dark">
          {entry.note}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(entry)}
          className="min-h-11 rounded-xl border border-bump-border px-3 py-2 text-sm font-medium text-bump-text dark:border-bump-border-dark dark:text-bump-text-dark"
        >
          Edit<span className="sr-only"> entry for {formatAppointmentDate(entry.date)}</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(entry)}
          className="min-h-11 rounded-xl border border-bump-border px-3 py-2 text-sm font-medium text-bump-muted dark:border-bump-border-dark dark:text-bump-muted-dark"
        >
          Delete<span className="sr-only"> entry for {formatAppointmentDate(entry.date)}</span>
        </button>
      </div>
    </li>
  );
}

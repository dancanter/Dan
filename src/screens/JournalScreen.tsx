import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAutoFocusHeading } from '../hooks/useAutoFocusHeading';
import { useJournal, type JournalDraft } from '../hooks/useJournal';
import { useStreak } from '../hooks/useStreak';
import { JournalEntryForm } from '../components/journal/JournalEntryForm';
import { JournalEntryCard } from '../components/journal/JournalEntryCard';
import { formatAppointmentDate } from '../lib/appointments';
import type { JournalEntry } from '../lib/journal';

export function JournalScreen() {
  const headingRef = useAutoFocusHeading<HTMLHeadingElement>();
  const { entries, daysLogged, addEntry, updateEntry, removeEntry } = useJournal();
  const { recordEngagementToday } = useStreak();
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [composing, setComposing] = useState(false);
  const [status, setStatus] = useState('');

  const formOpen = composing || entries.length === 0;

  function handleSave(draft: JournalDraft) {
    if (editing) {
      updateEntry(editing.id, draft);
      setEditing(null);
      setStatus('Changes saved.');
    } else {
      addEntry(draft);
      setComposing(false);
      setStatus('Entry saved.');
    }
    recordEngagementToday();
  }

  function handleDelete(entry: JournalEntry) {
    const label = formatAppointmentDate(entry.date);
    if (!window.confirm(`Delete your entry for ${label}? This can't be undone.`)) return;
    removeEntry(entry.id);
    if (editing?.id === entry.id) setEditing(null);
    setStatus('Entry deleted.');
  }

  return (
    <main id="main-content" className="mx-auto max-w-md px-4 pb-28 pt-8">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold text-bump-text outline-none dark:text-bump-text-dark"
      >
        Your journal
      </h1>
      <p className="mt-1 text-sm text-bump-muted dark:text-bump-muted-dark">
        {daysLogged > 0
          ? `${daysLogged} ${daysLogged === 1 ? 'day' : 'days'} written down. Saved on this device — nothing is uploaded anywhere.`
          : 'Keep track of how you’re feeling. Saved on this device — nothing is uploaded anywhere.'}
      </p>

      <p className="mt-3 text-sm">
        <Link
          to="/appointments"
          className="font-semibold text-bump-primary underline dark:text-bump-primary-dark"
        >
          Appointments and questions →
        </Link>
      </p>

      <p aria-live="polite" className="sr-only">
        {status}
      </p>

      {editing ? (
        <section className="mt-6" aria-labelledby="edit-heading">
          <h2
            id="edit-heading"
            className="mb-3 text-lg font-semibold text-bump-text dark:text-bump-text-dark"
          >
            Editing {formatAppointmentDate(editing.date)}
          </h2>
          <JournalEntryForm
            entry={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : formOpen ? (
        <section className="mt-6" aria-labelledby="new-entry-heading">
          <h2
            id="new-entry-heading"
            className="mb-3 text-lg font-semibold text-bump-text dark:text-bump-text-dark"
          >
            New entry
          </h2>
          <JournalEntryForm
            onSave={handleSave}
            onCancel={entries.length > 0 ? () => setComposing(false) : undefined}
          />
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setComposing(true)}
          className="mt-6 min-h-11 w-full rounded-xl bg-bump-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Add an entry
        </button>
      )}

      {entries.length > 0 && (
        <section className="mt-8" aria-labelledby="entries-heading">
          <h2
            id="entries-heading"
            className="mb-3 text-lg font-semibold text-bump-text dark:text-bump-text-dark"
          >
            Earlier entries
          </h2>
          <ul className="space-y-3">
            {entries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={(selected) => {
                  setEditing(selected);
                  setComposing(false);
                }}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

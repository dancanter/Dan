import { useRef, useState } from 'react';
import {
  applyBackup,
  currentDataSummary,
  downloadBackup,
  parseBackup,
  summarizeBackup,
  type BackupSummary,
} from '../../lib/backup';
import { requestPersistentStorage } from '../../lib/storage';
import { useStorageHealth } from '../../hooks/useStorageHealth';
import { formatDueDate } from '../../lib/dates';

/** Time alone would be misleading for a save made days ago, so date it too. */
function formatLastSaved(iso: string): string {
  const saved = new Date(iso);
  const time = saved.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (saved.toDateString() === new Date().toDateString()) return `Today at ${time}`;
  return `${saved.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at ${time}`;
}

function describeSummary(summary: BackupSummary): string {
  const parts = [
    `${summary.journalEntries} journal ${summary.journalEntries === 1 ? 'entry' : 'entries'}`,
    `${summary.appointments} ${summary.appointments === 1 ? 'appointment' : 'appointments'}`,
    `${summary.questions} ${summary.questions === 1 ? 'question' : 'questions'}`,
    `${summary.savedReads} saved ${summary.savedReads === 1 ? 'read' : 'reads'}`,
  ];
  return parts.join(', ');
}

export function BackupSection() {
  const { writable, problem, lastSavedAt, persisted, setPersisted } = useStorageHealth();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const summary = currentDataSummary();

  function handleExport() {
    setError(null);
    try {
      downloadBackup();
      setStatus('Backup file downloaded.');
    } catch {
      setError("The backup couldn't be created. Try again, or use a different browser.");
    }
  }

  async function handlePersist() {
    const granted = await requestPersistentStorage();
    setPersisted(granted);
    setStatus(
      granted
        ? 'Your browser will now keep this data even when storage runs low.'
        : "Your browser didn't grant that. Exporting a backup is the reliable option.",
    );
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset the input so choosing the same file twice still fires a change event.
    event.target.value = '';
    if (!file) return;

    setStatus(null);
    setError(null);

    let text: string;
    try {
      text = await file.text();
    } catch {
      setError("That file couldn't be read.");
      return;
    }

    const result = parseBackup(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    const incoming = summarizeBackup(result.snapshot);
    const confirmed = window.confirm(
      `Restore this backup?\n\nIt contains ${describeSummary(incoming)}.\n\n` +
        `This replaces what's currently on this device (${describeSummary(summary)}).`,
    );
    if (!confirmed) {
      setStatus('Restore cancelled — nothing changed.');
      return;
    }

    applyBackup(result.snapshot);
    setStatus('Backup restored.');
  }

  return (
    <section className="mt-6" aria-labelledby="backup-heading">
      <h2
        id="backup-heading"
        className="text-sm font-semibold uppercase tracking-wide text-bump-muted dark:text-bump-muted-dark"
      >
        Your data
      </h2>

      <p className="mt-2 text-sm text-bump-text dark:text-bump-text-dark">
        Everything you write stays on this device — no account, no server, nothing uploaded.
        That also means clearing your browser data, or switching phones, would take it with it.
        A backup file is how you keep it.
      </p>

      <dl className="mt-3 rounded-2xl border border-bump-border p-3 text-sm dark:border-bump-border-dark">
        <div className="flex justify-between gap-3">
          <dt className="text-bump-muted dark:text-bump-muted-dark">Saved right now</dt>
          <dd className="text-right font-medium text-bump-text dark:text-bump-text-dark">
            {describeSummary(summary)}
          </dd>
        </div>
        {summary.dueDate && (
          <div className="mt-2 flex justify-between gap-3">
            <dt className="text-bump-muted dark:text-bump-muted-dark">Due date</dt>
            <dd className="text-right font-medium text-bump-text dark:text-bump-text-dark">
              {formatDueDate(summary.dueDate)}
            </dd>
          </div>
        )}
        <div className="mt-2 flex justify-between gap-3">
          <dt className="text-bump-muted dark:text-bump-muted-dark">Last saved</dt>
          <dd className="text-right font-medium text-bump-text dark:text-bump-text-dark">
            {lastSavedAt ? formatLastSaved(lastSavedAt) : 'Nothing yet'}
          </dd>
        </div>
      </dl>

      {!writable && (
        <p
          role="alert"
          className="mt-3 rounded-2xl border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {problem === 'quota-exceeded'
            ? "This device's storage is full, so new entries aren't being saved. Free up some space, then try again."
            : "This browser isn't letting Bump save anything — private browsing usually causes this. Your entries will last until you close the tab."}
        </p>
      )}

      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={handleExport}
          className="min-h-11 w-full rounded-xl bg-bump-primary px-3 py-2 text-sm font-semibold text-white"
        >
          Download a backup
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-11 w-full rounded-xl border border-bump-primary px-3 py-2 text-sm font-semibold text-bump-primary dark:text-bump-primary-dark"
        >
          Restore from a backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          className="sr-only"
          aria-label="Choose a backup file to restore"
        />

        {persisted === false && (
          <button
            type="button"
            onClick={handlePersist}
            className="min-h-11 w-full rounded-xl border border-bump-border px-3 py-2 text-sm font-semibold text-bump-text dark:border-bump-border-dark dark:text-bump-text-dark"
          >
            Ask my browser not to clear this data
          </button>
        )}
      </div>

      {persisted === true && (
        <p className="mt-2 text-sm text-bump-muted dark:text-bump-muted-dark">
          Your browser is keeping this data even when storage runs low. ✅
        </p>
      )}

      <p aria-live="polite" className="mt-2 text-sm text-bump-muted dark:text-bump-muted-dark">
        {status}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}

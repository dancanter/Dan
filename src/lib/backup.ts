/**
 * Backup files are what turn "saved in this browser" into "saved, and mine".
 *
 * localStorage is durable enough for daily use but it isn't a guarantee:
 * clearing site data, switching phones, or an aggressive "free up space" sweep
 * will take it. Export writes everything to a JSON file the person keeps, and
 * import puts it back — on this device or a new one — with no account, no
 * server, and no upload of anything personal.
 */

import { restore, snapshot, SCHEMA_VERSION, type StorageSnapshot } from './storage';

export type BackupParseResult =
  | { ok: true; snapshot: StorageSnapshot }
  | { ok: false; error: string };

export interface BackupSummary {
  exportedAt: string | null;
  dueDate: string | null;
  journalEntries: number;
  appointments: number;
  questions: number;
  savedReads: number;
  daysVisited: number;
}

export function backupFilename(now = new Date()): string {
  return `bump-backup-${now.toISOString().slice(0, 10)}.json`;
}

export function serializeBackup(): string {
  return JSON.stringify(snapshot(), null, 2);
}

/**
 * Triggers a file download of the current data. Uses an object URL rather than
 * a data: URL because iOS Safari truncates long data URLs.
 */
export function downloadBackup(now = new Date()): void {
  const blob = new Blob([serializeBackup()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = backupFilename(now);
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next tick so Safari has finished reading the blob.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates a file's contents before anything is written. A restore replaces
 * real data, so anything it can't positively identify as a Bump backup is
 * rejected with a message rather than half-applied.
 */
export function parseBackup(text: string): BackupParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file isn't valid JSON, so it can't be a Bump backup." };
  }

  if (!isRecord(parsed)) {
    return { ok: false, error: "That file doesn't look like a Bump backup." };
  }

  if (parsed.app !== 'bump') {
    return { ok: false, error: 'That file was made by a different app.' };
  }

  if (typeof parsed.schemaVersion !== 'number') {
    return { ok: false, error: 'That backup is missing its version, so it may be damaged.' };
  }

  if (parsed.schemaVersion > SCHEMA_VERSION) {
    return {
      ok: false,
      error: 'That backup was made by a newer version of Bump. Update the app, then try again.',
    };
  }

  if (!isRecord(parsed.data)) {
    return { ok: false, error: 'That backup has no data in it.' };
  }

  // Drop anything outside our namespace instead of trusting a hand-edited file.
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (key.startsWith('bump:')) data[key] = value;
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: 'That backup has no Bump data in it.' };
  }

  return {
    ok: true,
    snapshot: {
      app: 'bump',
      schemaVersion: parsed.schemaVersion,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
      data,
    },
  };
}

function countArray(container: unknown, field: string): number {
  if (!isRecord(container)) return 0;
  const value = container[field];
  return Array.isArray(value) ? value.length : 0;
}

/** Human-readable counts, so a restore can be confirmed with real numbers. */
export function summarizeBackup(source: StorageSnapshot): BackupSummary {
  const data = source.data;
  const profile = data['bump:profile'];
  return {
    exportedAt: source.exportedAt || null,
    dueDate:
      isRecord(profile) && typeof profile.dueDate === 'string' ? profile.dueDate : null,
    journalEntries: countArray(data['bump:journal'], 'entries'),
    appointments: countArray(data['bump:appointments'], 'appointments'),
    questions: countArray(data['bump:appointments'], 'questions'),
    savedReads: countArray(data['bump:saved'], 'itemIds'),
    daysVisited: countArray(data['bump:streak'], 'engagedDates'),
  };
}

export function applyBackup(source: StorageSnapshot): void {
  restore(source.data);
}

/** Counts for the current device, to show alongside the export button. */
export function currentDataSummary(): BackupSummary {
  return summarizeBackup(snapshot());
}

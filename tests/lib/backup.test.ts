import { describe, expect, it } from 'vitest';
import {
  applyBackup,
  backupFilename,
  parseBackup,
  serializeBackup,
  summarizeBackup,
} from '../../src/lib/backup';
import { clearAll, readKey, writeKey } from '../../src/lib/storage';

function seedData() {
  writeKey('bump:profile', { dueDate: '2026-12-01' });
  writeKey('bump:journal', {
    entries: [
      {
        id: '1',
        date: '2026-08-01',
        createdAt: '2026-08-01T10:00:00.000Z',
        updatedAt: '2026-08-01T10:00:00.000Z',
        mood: 'steady',
        symptomIds: ['nausea'],
        note: 'Felt alright today.',
      },
    ],
  });
  writeKey('bump:appointments', {
    appointments: [
      {
        id: 'a1',
        date: '2026-08-10',
        time: '09:30',
        kind: 'scan',
        location: 'City Hospital',
        notes: '',
        createdAt: '2026-08-01T10:00:00.000Z',
      },
    ],
    questions: [
      { id: 'q1', text: 'Is this normal?', asked: false, createdAt: '2026-08-01T10:00:00.000Z' },
    ],
  });
  writeKey('bump:saved', { itemIds: ['iron-anaemia-risk'] });
}

describe('backup', () => {
  it('names the file with the export date', () => {
    expect(backupFilename(new Date('2026-08-02T12:00:00Z'))).toBe('bump-backup-2026-08-02.json');
  });

  it('exports and re-imports every saved record unchanged', () => {
    seedData();
    const exported = serializeBackup();

    clearAll();
    expect(readKey('bump:journal', null)).toBeNull();

    const result = parseBackup(exported);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    applyBackup(result.snapshot);

    expect(readKey('bump:profile', null)).toEqual({ dueDate: '2026-12-01' });
    expect(readKey<{ entries: unknown[] }>('bump:journal', { entries: [] }).entries).toHaveLength(1);
    expect(readKey('bump:saved', null)).toEqual({ itemIds: ['iron-anaemia-risk'] });
  });

  it('summarises a backup with counts a person can check before restoring', () => {
    seedData();
    const result = parseBackup(serializeBackup());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(summarizeBackup(result.snapshot)).toMatchObject({
      dueDate: '2026-12-01',
      journalEntries: 1,
      appointments: 1,
      questions: 1,
      savedReads: 1,
    });
  });

  it('rejects a file that is not JSON', () => {
    const result = parseBackup('not json at all');
    expect(result).toEqual({ ok: false, error: expect.stringContaining('valid JSON') });
  });

  it('rejects a JSON file from a different app', () => {
    const result = parseBackup(JSON.stringify({ app: 'other', schemaVersion: 1, data: {} }));
    expect(result).toEqual({ ok: false, error: expect.stringContaining('different app') });
  });

  it('refuses a backup from a newer version rather than importing it partially', () => {
    const result = parseBackup(
      JSON.stringify({ app: 'bump', schemaVersion: 99, data: { 'bump:profile': {} } }),
    );
    expect(result).toEqual({ ok: false, error: expect.stringContaining('newer version') });
  });

  it('strips keys outside the bump namespace from a hand-edited file', () => {
    const result = parseBackup(
      JSON.stringify({
        app: 'bump',
        schemaVersion: 1,
        exportedAt: '2026-08-02T00:00:00.000Z',
        data: { 'bump:profile': { dueDate: '2026-12-01' }, 'evil:key': 'nope' },
      }),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.keys(result.snapshot.data)).toEqual(['bump:profile']);
  });

  it('rejects a backup with no bump data left in it', () => {
    const result = parseBackup(
      JSON.stringify({ app: 'bump', schemaVersion: 1, data: { 'evil:key': 'nope' } }),
    );
    expect(result.ok).toBe(false);
  });
});

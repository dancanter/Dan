import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearAll,
  getHealth,
  readKey,
  removeKey,
  restore,
  snapshot,
  subscribe,
  writeKey,
} from '../../src/lib/storage';

describe('storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('round-trips a value through localStorage', () => {
    writeKey('bump:test', { hello: 'world' });
    expect(JSON.parse(window.localStorage.getItem('bump:test')!)).toEqual({ hello: 'world' });
    expect(readKey('bump:test', null)).toEqual({ hello: 'world' });
  });

  it('returns the fallback for a missing key', () => {
    expect(readKey('bump:absent', { count: 0 })).toEqual({ count: 0 });
  });

  it('falls back rather than throwing when a stored value is corrupt', () => {
    window.localStorage.setItem('bump:corrupt', '{not json');
    expect(readKey('bump:corrupt', { safe: true })).toEqual({ safe: true });
  });

  it('notifies subscribers of the key that changed, and only that key', () => {
    const onTarget = vi.fn();
    const onOther = vi.fn();
    subscribe('bump:target', onTarget);
    subscribe('bump:other', onOther);

    writeKey('bump:target', 1);

    expect(onTarget).toHaveBeenCalledTimes(1);
    expect(onOther).not.toHaveBeenCalled();
  });

  it('picks up a write made by another tab', () => {
    writeKey('bump:shared', { from: 'this tab' });
    const listener = vi.fn();
    subscribe('bump:shared', listener);

    // Simulate the other tab's write: localStorage already holds the new value
    // by the time the event fires.
    window.localStorage.setItem('bump:shared', JSON.stringify({ from: 'other tab' }));
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'bump:shared',
        newValue: JSON.stringify({ from: 'other tab' }),
        storageArea: window.localStorage,
      }),
    );

    expect(listener).toHaveBeenCalled();
    expect(readKey('bump:shared', null)).toEqual({ from: 'other tab' });
  });

  it('ignores storage events for other apps sharing the origin', () => {
    const listener = vi.fn();
    subscribe('bump:mine', listener);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'someone-else:key',
        newValue: 'x',
        storageArea: window.localStorage,
      }),
    );

    expect(listener).not.toHaveBeenCalled();
  });

  it('reports a quota failure instead of silently losing the write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });

    const saved = writeKey('bump:big', 'x'.repeat(10));

    expect(saved).toBe(false);
    expect(getHealth().writable).toBe(false);
    expect(getHealth().problem).toBe('quota-exceeded');
    // The value still works for the rest of the session.
    expect(readKey('bump:big', null)).toBe('x'.repeat(10));
  });

  it('records a last-saved time on success and clears the problem flag', () => {
    writeKey('bump:ok', 1);
    expect(getHealth().writable).toBe(true);
    expect(getHealth().problem).toBeNull();
    expect(getHealth().lastSavedAt).not.toBeNull();
  });

  it('snapshots every bump key and nothing else', () => {
    window.localStorage.setItem('other-app:data', '"leave me"');
    writeKey('bump:profile', { dueDate: '2026-12-01' });
    writeKey('bump:journal', { entries: [] });

    const result = snapshot();

    expect(result.app).toBe('bump');
    expect(Object.keys(result.data).sort()).toEqual(['bump:journal', 'bump:profile']);
    expect(result.data['bump:profile']).toEqual({ dueDate: '2026-12-01' });
  });

  it('restore replaces existing data rather than merging into it', () => {
    writeKey('bump:profile', { dueDate: '2026-01-01' });
    writeKey('bump:saved', { itemIds: ['a'] });

    restore({ 'bump:profile': { dueDate: '2027-05-05' } });

    expect(readKey('bump:profile', null)).toEqual({ dueDate: '2027-05-05' });
    // Absent from the backup, so cleared — a restore makes the device match it.
    expect(window.localStorage.getItem('bump:saved')).toBeNull();
  });

  it('clearAll removes bump keys but leaves the rest of the origin alone', () => {
    window.localStorage.setItem('other-app:data', 'keep');
    writeKey('bump:profile', { dueDate: '2026-12-01' });
    writeKey('bump:journal', { entries: [1] });

    clearAll();

    expect(window.localStorage.getItem('bump:profile')).toBeNull();
    expect(window.localStorage.getItem('bump:journal')).toBeNull();
    expect(window.localStorage.getItem('other-app:data')).toBe('keep');
  });

  it('keeps its own bookkeeping keys out of backups', () => {
    writeKey('bump:profile', { dueDate: '2026-12-01' });

    // The write above also stamps schemaVersion and lastSavedAt on disk.
    expect(window.localStorage.getItem('bump:lastSavedAt')).not.toBeNull();
    expect(Object.keys(snapshot().data)).toEqual(['bump:profile']);
  });

  it('remembers the last save time across a reload', () => {
    writeKey('bump:profile', { dueDate: '2026-12-01' });
    const stamped = window.localStorage.getItem('bump:lastSavedAt');

    expect(stamped).toBe(getHealth().lastSavedAt);
    // Survives the module cache being dropped, which is what a reload does.
    expect(window.localStorage.getItem('bump:lastSavedAt')).toBe(stamped);
  });

  it('removeKey drops the cached value too', () => {
    writeKey('bump:temp', 'value');
    removeKey('bump:temp');
    expect(readKey('bump:temp', 'fallback')).toBe('fallback');
  });
});

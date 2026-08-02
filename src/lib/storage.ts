/**
 * The single place this app talks to persistent storage.
 *
 * Everything the person using Bump enters — due date, journal entries,
 * appointments, saved reads, settings — ends up here, so this module owns the
 * things that make saving trustworthy rather than incidental:
 *
 * - one in-memory cache + listener set per key, so every mounted component
 *   reading a key sees a write immediately (plain useState can't do this),
 * - cross-tab sync via the `storage` event, so two open tabs don't silently
 *   overwrite each other's view of the data,
 * - write failures (private mode, quota) are detected and reported instead of
 *   being swallowed, so the UI can tell someone their data isn't being saved
 *   rather than pretending it was,
 * - a versioned snapshot/restore pair that backup files are built from.
 */

export const STORAGE_PREFIX = 'bump:';

/** Bumped only when the on-disk shape changes in a way restore must handle. */
export const SCHEMA_VERSION = 1;

const VERSION_KEY = `${STORAGE_PREFIX}schemaVersion`;
const LAST_SAVED_KEY = `${STORAGE_PREFIX}lastSavedAt`;

/** Bookkeeping keys — never exported in a backup, never restored from one. */
const META_KEYS = new Set([VERSION_KEY, LAST_SAVED_KEY]);

type Listener = () => void;

export type StorageProblem = 'quota-exceeded' | 'unavailable';

export interface StorageHealth {
  /** False when localStorage can't be used at all (private mode, blocked cookies). */
  writable: boolean;
  /** Set when the most recent write failed, cleared when one succeeds. */
  problem: StorageProblem | null;
  /** ISO timestamp of the last successful write, or null if nothing saved yet. */
  lastSavedAt: string | null;
}

const listeners = new Map<string, Set<Listener>>();
const cache = new Map<string, unknown>();
const healthListeners = new Set<Listener>();

let health: StorageHealth = {
  writable: true,
  problem: null,
  lastSavedAt: null,
};

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function setHealth(next: Partial<StorageHealth>) {
  const merged = { ...health, ...next };
  if (
    merged.writable === health.writable &&
    merged.problem === health.problem &&
    merged.lastSavedAt === health.lastSavedAt
  ) {
    return;
  }
  health = merged;
  healthListeners.forEach((listener) => listener());
}

function classifyWriteError(error: unknown): StorageProblem {
  // Browsers disagree on the name/code for "you've filled the quota", so match
  // the union of what Chrome, Firefox and Safari actually throw.
  if (error instanceof DOMException) {
    if (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014
    ) {
      return 'quota-exceeded';
    }
  }
  return 'unavailable';
}

function readRaw(key: string): string | null {
  if (!hasWindow()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Corrupt or hand-edited value: fall back rather than crashing the screen.
    return fallback;
  }
}

/** Reads a key, preferring the in-memory cache so snapshots stay referentially stable. */
export function readKey<T>(key: string, fallback: T): T {
  if (!cache.has(key)) {
    cache.set(key, parse(readRaw(key), fallback));
  }
  return cache.get(key) as T;
}

/**
 * Writes a key and tells every subscriber. Returns whether the value actually
 * reached disk — the in-memory cache is updated either way, so a failed write
 * degrades to "works for this session" instead of losing the value mid-edit.
 */
export function writeKey<T>(key: string, value: T): boolean {
  cache.set(key, value);
  notify(key);

  if (!hasWindow()) return false;

  try {
    const savedAt = new Date().toISOString();
    window.localStorage.setItem(key, JSON.stringify(value));
    window.localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
    // Written straight to localStorage rather than through writeKey, which
    // would recurse. Persisted so "last saved" still reads true after a
    // reload, instead of resetting to "nothing yet" on every launch.
    window.localStorage.setItem(LAST_SAVED_KEY, savedAt);
    setHealth({ writable: true, problem: null, lastSavedAt: savedAt });
    return true;
  } catch (error) {
    setHealth({ writable: false, problem: classifyWriteError(error) });
    return false;
  }
}

export function removeKey(key: string) {
  cache.delete(key);
  if (hasWindow()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Nothing useful to do — the cache delete above already took effect.
    }
  }
  notify(key);
}

export function subscribe(key: string, listener: Listener): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  return () => {
    listeners.get(key)?.delete(listener);
  };
}

export function subscribeHealth(listener: Listener): () => void {
  healthListeners.add(listener);
  return () => {
    healthListeners.delete(listener);
  };
}

export function getHealth(): StorageHealth {
  return health;
}

/** Every Bump key currently on disk, whether or not a hook has read it yet. */
function ownedKeys(): string[] {
  if (!hasWindow()) return [];
  const keys: string[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && !META_KEYS.has(key)) {
        keys.push(key);
      }
    }
  } catch {
    return [];
  }
  return keys;
}

export interface StorageSnapshot {
  app: 'bump';
  schemaVersion: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

/** Builds the object a backup file is written from. */
export function snapshot(): StorageSnapshot {
  const data: Record<string, unknown> = {};
  for (const key of ownedKeys()) {
    data[key] = parse(readRaw(key), null);
  }
  // Anything written this session but not yet visible on disk (failed write)
  // still belongs in the backup — that's exactly when a backup matters most.
  for (const [key, value] of cache) {
    if (key.startsWith(STORAGE_PREFIX) && !META_KEYS.has(key) && !(key in data)) {
      data[key] = value;
    }
  }
  return {
    app: 'bump',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

/**
 * Replaces stored state with a snapshot's contents. Keys absent from the
 * snapshot are cleared, so restoring is "make this device look like the
 * backup" rather than an ambiguous merge.
 */
export function restore(data: Record<string, unknown>) {
  for (const key of ownedKeys()) {
    if (!(key in data)) removeKey(key);
  }
  for (const [key, value] of Object.entries(data)) {
    if (!key.startsWith(STORAGE_PREFIX) || META_KEYS.has(key)) continue;
    writeKey(key, value);
  }
}

/** Wipes every Bump key. Used by "Reset my data" in Settings. */
export function clearAll() {
  for (const key of ownedKeys()) {
    removeKey(key);
  }
  for (const key of [...cache.keys()]) {
    if (key.startsWith(STORAGE_PREFIX)) removeKey(key);
  }
  if (hasWindow()) {
    for (const key of META_KEYS) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Best effort — the data keys above are what actually matter.
      }
    }
  }
  setHealth({ lastSavedAt: null });
}

/**
 * Asks the browser to exempt this origin from eviction under storage pressure.
 * Chrome grants it silently for installed PWAs; Safari and Firefox may not, so
 * the result is surfaced in Settings rather than assumed.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!hasWindow() || !navigator.storage?.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function isStoragePersisted(): Promise<boolean> {
  if (!hasWindow() || !navigator.storage?.persisted) return false;
  try {
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
}

/**
 * Another tab wrote to storage: drop our cached value so the next read picks
 * up theirs, then re-render anything showing it.
 */
function handleExternalChange(event: StorageEvent) {
  if (event.storageArea !== window.localStorage) return;

  // A `null` key means the whole store was cleared (e.g. site data wiped).
  if (event.key === null) {
    const keys = [...cache.keys()];
    cache.clear();
    keys.forEach(notify);
    return;
  }

  if (!event.key.startsWith(STORAGE_PREFIX)) return;
  cache.delete(event.key);
  notify(event.key);
}

if (hasWindow()) {
  window.addEventListener('storage', handleExternalChange);

  health = { ...health, lastSavedAt: readRaw(LAST_SAVED_KEY) };

  // Probe once at startup so Settings can warn immediately in private mode,
  // rather than only after the first real write fails.
  try {
    const probe = `${STORAGE_PREFIX}__probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
  } catch (error) {
    health = { ...health, writable: false, problem: classifyWriteError(error) };
  }
}

/** Test-only: clears the module-level cache so suites start from a clean slate. */
export function __resetStorageForTests() {
  cache.clear();
  listeners.clear();
  healthListeners.clear();
  health = { writable: true, problem: null, lastSavedAt: null };
}

import { clearPhotos, photosSupported } from './photoStore';

/**
 * Delete everything this app has stored on the device.
 *
 * This exists because "Delete everything permanently" did not. It reset the
 * profile, progress and journal — and left behind the bump photos, the
 * movement journal, the maternity unit's phone number, and the week the person
 * had reached. Someone who has just lost a pregnancy and chose to delete
 * everything would have found a bump photo still there.
 *
 * Two rules keep it fixed:
 *
 * 1. **Enumerate, never list.** Every key under the app's prefixes goes,
 *    whether or not anyone remembered to add it here. A new store added next
 *    year is covered without a code change; a hard-coded list is exactly how
 *    this broke in the first place.
 * 2. **One caller.** Anything offering deletion calls this, so there is no
 *    second implementation to drift.
 */
const PREFIXES = ['fieldnotes:', 'bump:'];

export function localKeys(): string[] {
  try {
    return Object.keys(window.localStorage).filter((k) => PREFIXES.some((p) => k.startsWith(p)));
  } catch {
    return [];
  }
}

export async function wipeAllLocalData(): Promise<void> {
  for (const key of localKeys()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage disabled — nothing to remove, and nothing to report.
    }
  }

  // Tell every mounted hook its cache is stale, or the screen keeps rendering
  // data that no longer exists on disk.
  try {
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  } catch {
    // Older browsers construct StorageEvent differently; the reload below
    // covers it either way.
  }

  if (photosSupported()) {
    // Errors are swallowed deliberately: a browser that will not open the
    // database has no photos in it to delete.
    await clearPhotos().catch(() => undefined);
  }
}

/**
 * What deletion will actually remove, so the confirmation can say it out loud
 * rather than making a promise nobody has checked.
 */
export interface StoredSummary {
  keys: number;
  photos: number;
}

export async function summariseStoredData(): Promise<StoredSummary> {
  let photos = 0;
  if (photosSupported()) {
    const { allPhotos } = await import('./photoStore');
    photos = await allPhotos()
      .then((p) => p.length)
      .catch(() => 0);
  }
  return { keys: localKeys().length, photos };
}

/**
 * Photo storage for the bump gallery.
 *
 * IndexedDB rather than localStorage, for a boring but decisive reason:
 * localStorage holds strings and caps out around 5MB, which is roughly two
 * phone photos. IndexedDB stores Blobs directly and has orders of magnitude
 * more room.
 *
 * Same privacy rule as everything else — this never leaves the device. There
 * is no upload path in the codebase, deliberately.
 */

const DB_NAME = 'fieldnotes-photos';
const STORE = 'bump';
const VERSION = 1;

export interface BumpPhoto {
  /** Pregnancy week — one photo per week, so re-saving replaces. */
  week: number;
  blob: Blob;
  takenAt: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'week' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = run(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

export async function savePhoto(week: number, blob: Blob): Promise<void> {
  await tx('readwrite', (s) =>
    s.put({ week, blob, takenAt: new Date().toISOString() } satisfies BumpPhoto),
  );
}

export async function deletePhoto(week: number): Promise<void> {
  await tx('readwrite', (s) => s.delete(week));
}

export async function allPhotos(): Promise<BumpPhoto[]> {
  const rows = await tx<BumpPhoto[]>('readonly', (s) => s.getAll() as IDBRequest<BumpPhoto[]>);
  return rows.sort((a, b) => a.week - b.week);
}

export async function clearPhotos(): Promise<void> {
  await tx('readwrite', (s) => s.clear());
}

/**
 * Phone photos are several megabytes each and a gallery of forty would be
 * needlessly large. Downscaling to a sane width keeps a full pregnancy's
 * worth of photos comfortably within any device's storage.
 */
export async function downscale(file: File, maxWidth = 1080): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', 0.82),
  );
}

import { createStore, del, get, set } from 'idb-keyval';

// Progress photos stay in this browser's IndexedDB. They are never sent to
// the coach or anywhere else.
const store = typeof indexedDB !== 'undefined' ? createStore('good-life-photos', 'photos') : undefined;

export async function savePhoto(id: string, blob: Blob) {
  if (store) await set(id, blob, store);
}
export async function loadPhoto(id: string): Promise<Blob | undefined> {
  return store ? get<Blob>(id, store) : undefined;
}
export async function deletePhoto(id: string) {
  if (store) await del(id, store);
}

/** Downscale before storing: a 1600 px JPEG is plenty to compare progress. */
export async function downscale(file: File, max = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res) => canvas.toBlob((b) => res(b ?? file), 'image/jpeg', 0.85));
}

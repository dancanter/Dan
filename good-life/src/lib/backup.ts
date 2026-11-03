import { migrate } from '@/store/defaults';
import type { AppData } from '@/store/types';
import { loadPhoto, savePhoto } from './photos';

export const APP_ID = 'the-good-life';

function download(name: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const toDataUrl = (b: Blob) => new Promise<string>((res) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result));
  r.readAsDataURL(b);
});

export async function exportData(data: AppData, includePhotos: boolean) {
  const photos: Record<string, string> = {};
  if (includePhotos) {
    for (const p of data.photos) {
      const b = await loadPhoto(p.id);
      if (b) photos[p.id] = await toDataUrl(b);
    }
  }
  const payload = { app: APP_ID, kind: 'backup', exportedAt: new Date().toISOString(), data, photos: includePhotos ? photos : undefined };
  download(`good-life-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 1));
}

export interface ParsedImport {
  kind: 'backup' | 'starting-profile';
  data: Partial<AppData>;
  photos?: Record<string, string>;
}

/**
 * Two file types: a full backup (replaces everything), or a starting
 * profile (merges profile, goals and performances into what is there).
 */
export async function parseImport(file: File): Promise<ParsedImport> {
  let json: unknown;
  try {
    json = JSON.parse(await file.text());
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const o = json as { app?: string; kind?: string; data?: unknown; photos?: Record<string, string> };
  if (o.app !== APP_ID || !o.data || typeof o.data !== 'object') throw new Error('That file was not exported from The Good Life.');
  if (o.kind === 'starting-profile') return { kind: 'starting-profile', data: o.data as Partial<AppData> };
  return { kind: 'backup', data: migrate(o.data), photos: o.photos };
}

export async function restorePhotos(photos?: Record<string, string>) {
  if (!photos) return;
  for (const [id, url] of Object.entries(photos)) {
    const blob = await (await fetch(url)).blob();
    await savePhoto(id, blob);
  }
}

export function mergeStartingProfile(current: AppData, incoming: Partial<AppData>): AppData {
  const out = { ...current };
  if (incoming.profile) out.profile = { ...current.profile, ...incoming.profile, diet: { ...current.profile.diet, ...(incoming.profile.diet ?? {}) } };
  if (incoming.performances) {
    const have = new Set(current.performances.map((p) => p.id));
    out.performances = [...current.performances, ...incoming.performances.filter((p) => !have.has(p.id))];
  }
  if (incoming.runGoals?.length) out.runGoals = incoming.runGoals;
  if (incoming.modules?.length) out.modules = incoming.modules;
  if (incoming.foodTolerance) out.foodTolerance = { ...current.foodTolerance, ...incoming.foodTolerance };
  if (incoming.settings) out.settings = { ...current.settings, ...incoming.settings };
  if (incoming.runs?.length) {
    const have = new Set(current.runs.map((r) => r.id));
    out.runs = [...current.runs, ...incoming.runs.filter((r) => !have.has(r.id))];
  }
  if (incoming.weights?.length) {
    const have = new Set(current.weights.map((w) => w.id));
    out.weights = [...current.weights, ...incoming.weights.filter((w) => !have.has(w.id))];
  }
  return out;
}

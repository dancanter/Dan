import { useSyncExternalStore } from 'react';
import { getState, replaceState, subscribe, type DayLog, type State } from '@/store';

// When Glow runs as a page inside Claude, logs are saved to the page's
// private per-person store, so they persist across devices and browsers.
// On the website, this file does nothing and Glow keeps using the
// browser's own storage.
//
// Layout: data/users/<id>/meta holds the profile and every small list;
// data/users/<id>/meta/months/<YYYY-MM> holds that month's food and ritual
// logs, keeping every document far below the 256 KiB limit.

type Status = 'local' | 'connecting' | 'synced' | 'saving' | 'offline' | 'error';

interface DocRef {
  get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>;
  set(data: Record<string, unknown>): Promise<void>;
  collection(path: string): { get(): Promise<{ docs: { id: string; data(): Record<string, unknown> | undefined }[] }>; doc(id: string): DocRef };
}
interface Db { doc(path: string): DocRef }
interface ClaudeRuntime { use(name: string): Promise<unknown> }

let status: Status = 'local';
const listeners = new Set<() => void>();
function setStatus(s: Status) {
  status = s;
  listeners.forEach((l) => l());
}
export function useCloudStatus(): Status {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => status);
}

export const runtime = (): ClaudeRuntime | undefined => (window as unknown as { claude?: ClaudeRuntime }).claude;
export const inClaude = () => typeof runtime()?.use === 'function';

function metaOf(s: State): Record<string, unknown> {
  const { days: _days, ...rest } = s;
  void _days;
  return JSON.parse(JSON.stringify(rest));
}
function months(s: State): Map<string, Record<string, DayLog>> {
  const m = new Map<string, Record<string, DayLog>>();
  for (const [date, log] of Object.entries(s.days)) {
    const k = date.slice(0, 7);
    if (!m.has(k)) m.set(k, {});
    m.get(k)![date] = log;
  }
  return m;
}
const hasData = (s: State) => Object.keys(s.days).length > 0 || s.weights.length > 0 || s.sleeps.length > 0 || Object.keys(s.vitals ?? {}).length > 0;

export async function startCloud() {
  const rt = runtime();
  if (!rt) return;
  setStatus('connecting');
  const timeout = setTimeout(() => { if (status === 'connecting') setStatus('offline'); }, 10_000);
  try {
    const [db, user] = (await Promise.all([rt.use('db'), rt.use('user')])) as [Db | null, { id(): Promise<string | null> } | null];
    const uid = user ? await user.id() : null;
    if (!db || !uid) { clearTimeout(timeout); setStatus('local'); return; }
    const meta = db.doc(`data/users/${uid}/meta`);
    const monthCol = meta.collection('months');

    const [metaSnap, monthSnap] = await Promise.all([meta.get(), monthCol.get()]);
    clearTimeout(timeout);
    const written = new Map<string, string>();
    let writtenMeta = '';

    if (metaSnap.exists) {
      // The store is the source of truth: load it over the browser cache.
      const days: Record<string, DayLog> = {};
      for (const d of monthSnap.docs) {
        const body = d.data() as { days?: Record<string, DayLog> } | undefined;
        Object.assign(days, body?.days ?? {});
        written.set(d.id, JSON.stringify(body?.days ?? {}));
      }
      const m = metaSnap.data() as Partial<State>;
      replaceState({ ...(m as State), days });
      writtenMeta = JSON.stringify(metaOf(getState()));
    } else if (!hasData(getState())) {
      writtenMeta = JSON.stringify(metaOf(getState()));
    }
    // (If the store is empty but this browser has logs, the first save below uploads them.)

    let timer: ReturnType<typeof setTimeout> | undefined;
    let running = false;
    let again = false;
    const flush = async () => {
      if (running) { again = true; return; }
      running = true;
      try {
        do {
          again = false;
          const s = getState();
          const m = JSON.stringify(metaOf(s));
          const changed: [string, string][] = [];
          for (const [k, v] of months(s)) { const j = JSON.stringify(v); if (written.get(k) !== j) changed.push([k, j]); }
          for (const k of written.keys()) if (!months(s).has(k)) changed.push([k, '{}']);
          if (m === writtenMeta && !changed.length) continue;
          setStatus('saving');
          if (m !== writtenMeta) { await meta.set(JSON.parse(m)); writtenMeta = m; }
          for (const [k, j] of changed) { await monthCol.doc(k).set({ days: JSON.parse(j) }); written.set(k, j); }
        } while (again);
        setStatus('synced');
      } catch {
        setStatus('error');
      } finally {
        running = false;
      }
    };
    subscribe(() => { clearTimeout(timer); timer = setTimeout(() => void flush(), 1200); });
    setStatus('synced');
    void flush();
  } catch {
    clearTimeout(timeout);
    setStatus('error');
  }
}

/** Save a backup file: through the viewer's download prompt inside Claude, or a normal download on the website. */
export async function saveBackup(filename: string, json: string): Promise<'saved' | 'declined'> {
  const rt = runtime();
  if (rt) {
    const dl = (await rt.use('downloads')) as { save(o: { filename: string; data: string | Blob }): Promise<unknown> } | null;
    if (dl) {
      try { await dl.save({ filename, data: new Blob([json], { type: 'application/json' }) }); return 'saved'; } catch { return 'declined'; }
    }
    return 'declined';
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  a.download = filename;
  a.click();
  return 'saved';
}

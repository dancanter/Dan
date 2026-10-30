import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { del, get, set } from 'idb-keyval';
import { todayISO, type ISODate } from '@/lib/dates';
import { emptyData, migrate } from './defaults';
import type { AppData, ChatMessage, CheckIn, DayPlan, FilmState, PhaseRecord, PhysiquePhase, RoadmapPhase } from './types';

type ListKey = {
  [K in keyof AppData]: AppData[K] extends { id: string }[] ? K : never;
}[keyof AppData];
type ItemOf<K extends ListKey> = AppData[K] extends (infer T)[] ? T : never;

// IndexedDB holds far more than localStorage's ~5 MB and survives longer
// under storage pressure. If it is unavailable (some private windows), fall
// back to localStorage, and surface any write failure rather than silently
// losing a log.
let reportStorageError: (msg: string | null) => void = () => {};

const idbStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return (await get<string>(name)) ?? null;
    } catch {
      return localStorage.getItem(name);
    }
  },
  setItem: async (name, value) => {
    try {
      await set(name, value);
      reportStorageError(null);
    } catch {
      try {
        localStorage.setItem(name, value);
        reportStorageError(null);
      } catch (e) {
        reportStorageError(e instanceof Error ? e.message : 'Storage is full or unavailable.');
      }
    }
  },
  removeItem: async (name) => {
    try {
      await del(name);
    } catch {
      localStorage.removeItem(name);
    }
  },
};

interface StoreState {
  data: AppData;
  hydrated: boolean;
  storageError: string | null;
  /** Insert or replace by id. */
  upsert: <K extends ListKey>(key: K, item: ItemOf<K>) => void;
  remove: <K extends ListKey>(key: K, id: string) => void;
  setCheckIn: (date: ISODate, patch: Partial<CheckIn>) => void;
  patch: <K extends 'profile' | 'settings'>(key: K, value: Partial<AppData[K]>) => void;
  setPlanTemplate: (weekday: number, plan: DayPlan) => void;
  setOverride: (date: ISODate, plan: DayPlan | null) => void;
  setFilm: (id: string, state: FilmState | null) => void;
  setTolerance: (foodId: string, status: 'tolerated' | 'problematic' | 'untested') => void;
  setPhase: (which: 'roadmap' | 'physiquePhase', phase: RoadmapPhase | PhysiquePhase, reason: string) => void;
  addChat: (msg: ChatMessage) => void;
  updateChat: (id: string, content: string) => void;
  clearChat: () => void;
  replaceAll: (data: unknown) => void;
  mergeDemo: (demo: Partial<AppData>) => void;
  clearDemo: () => void;
  resetAll: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (setState) => {
      const mutate = (fn: (d: AppData) => AppData) => setState((s) => ({ data: fn(s.data) }));
      return {
        data: emptyData(),
        hydrated: false,
        storageError: null,
        upsert: (key, item) =>
          mutate((d) => {
            const list = d[key] as unknown as { id: string }[];
            const i = list.findIndex((x) => x.id === (item as { id: string }).id);
            const next = i === -1 ? [...list, item] : list.map((x, j) => (j === i ? item : x));
            return { ...d, [key]: next };
          }),
        remove: (key, id) =>
          mutate((d) => ({ ...d, [key]: (d[key] as unknown as { id: string }[]).filter((x) => x.id !== id) })),
        setCheckIn: (date, p) =>
          mutate((d) => {
            const prev = d.checkIns[date] ?? { date, flags: [] };
            const next = { ...prev, ...p, date };
            if (!p.demo) delete next.demo;
            return { ...d, checkIns: { ...d.checkIns, [date]: next } };
          }),
        patch: (key, value) => mutate((d) => ({ ...d, [key]: { ...d[key], ...value } })),
        setPlanTemplate: (wd, plan) => mutate((d) => ({ ...d, planTemplate: { ...d.planTemplate, [wd]: plan } })),
        setOverride: (date, plan) =>
          mutate((d) => {
            const o = { ...d.planOverrides };
            if (plan) o[date] = plan;
            else delete o[date];
            return { ...d, planOverrides: o };
          }),
        setFilm: (id, st) =>
          mutate((d) => {
            const films = { ...d.films };
            if (st) films[id] = st;
            else delete films[id];
            return { ...d, films };
          }),
        setTolerance: (foodId, status) =>
          mutate((d) => ({ ...d, foodTolerance: { ...d.foodTolerance, [foodId]: status } })),
        setPhase: (which, phase, reason) =>
          mutate((d) => {
            const rec = d[which] as PhaseRecord<string>;
            const today = todayISO();
            const next: PhaseRecord<string> = {
              current: phase,
              since: today,
              history: [...rec.history, { phase: rec.current, from: rec.since, to: today, reason }],
            };
            return { ...d, [which]: next };
          }),
        addChat: (msg) => mutate((d) => ({ ...d, chat: [...d.chat, msg].slice(-200) })),
        updateChat: (id, content) =>
          mutate((d) => ({ ...d, chat: d.chat.map((m) => (m.id === id ? { ...m, content } : m)) })),
        clearChat: () => mutate((d) => ({ ...d, chat: [] })),
        replaceAll: (incoming) => setState({ data: migrate(incoming) }),
        mergeDemo: (demo) =>
          mutate((d) => {
            const next: AppData = { ...d };
            for (const [k, v] of Object.entries(demo)) {
              const key = k as keyof AppData;
              if (Array.isArray(v)) (next as unknown as Record<string, unknown>)[key] = [...(d[key] as unknown[]), ...v];
              else if (key === 'checkIns') next.checkIns = { ...(v as AppData['checkIns']), ...d.checkIns };
            }
            return next;
          }),
        clearDemo: () =>
          mutate((d) => {
            const next = { ...d } as unknown as Record<string, unknown>;
            for (const [k, v] of Object.entries(d)) {
              if (Array.isArray(v)) next[k] = v.filter((x: { demo?: boolean }) => !x?.demo);
            }
            next.checkIns = Object.fromEntries(Object.entries(d.checkIns).filter(([, c]) => !c.demo));
            return next as unknown as AppData;
          }),
        resetAll: () => setState({ data: emptyData() }),
      };
    },
    {
      name: 'good-life-v1',
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ data: s.data }),
      merge: (persisted, current) => ({
        ...current,
        data: migrate((persisted as { data?: unknown } | undefined)?.data),
      }),
      onRehydrateStorage: () => () => {
        useStore.setState({ hydrated: true });
      },
    },
  ),
);

reportStorageError = (msg) => {
  if (useStore.getState().storageError !== msg) useStore.setState({ storageError: msg });
};

export const useData = () => useStore((s) => s.data);

export function hasDemoData(d: AppData): boolean {
  return (
    Object.values(d).some((v) => Array.isArray(v) && v.some((x: { demo?: boolean }) => x?.demo)) ||
    Object.values(d.checkIns).some((c) => c.demo)
  );
}

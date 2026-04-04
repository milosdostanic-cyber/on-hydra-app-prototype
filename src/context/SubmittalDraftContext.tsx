import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'hydra-submittal-draft';

export type SubmittalDraftLine = {
  id: string;
  partKey: string;
  partSku: string;
  title: string;
};

type DraftStore = Record<string, SubmittalDraftLine[]>;

function readStore(): DraftStore {
  if (typeof sessionStorage === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DraftStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: DraftStore) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

let storeCache: DraftStore = readStore();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setStore(updater: (prev: DraftStore) => DraftStore) {
  storeCache = updater(storeCache);
  writeStore(storeCache);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): DraftStore {
  return storeCache;
}

function getServerSnapshot(): DraftStore {
  return {};
}

type SubmittalDraftContextValue = {
  linesForProject: (projectId: string) => SubmittalDraftLine[];
  countForProject: (projectId: string) => number;
  addLine: (
    projectId: string,
    line: Omit<SubmittalDraftLine, 'id'> & { id?: string },
  ) => void;
  removeLine: (projectId: string, lineId: string) => void;
};

const SubmittalDraftContext = createContext<SubmittalDraftContextValue | null>(null);

export function SubmittalDraftProvider({ children }: { children: ReactNode }) {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const linesForProject = useCallback(
    (projectId: string) => store[projectId] ?? [],
    [store],
  );

  const countForProject = useCallback(
    (projectId: string) => (store[projectId] ?? []).length,
    [store],
  );

  const addLine = useCallback(
    (
      projectId: string,
      line: Omit<SubmittalDraftLine, 'id'> & { id?: string },
    ) => {
      const id = line.id ?? `${projectId}-${line.partKey}-${Date.now()}`;
      const nextLine: SubmittalDraftLine = { ...line, id };
      setStore((prev) => {
        const list = prev[projectId] ?? [];
        return {
          ...prev,
          [projectId]: [...list, nextLine],
        };
      });
    },
    [],
  );

  const removeLine = useCallback((projectId: string, lineId: string) => {
    setStore((prev) => {
      const list = prev[projectId] ?? [];
      const next = list.filter((l) => l.id !== lineId);
      const out = { ...prev };
      if (next.length === 0) delete out[projectId];
      else out[projectId] = next;
      return out;
    });
  }, []);

  const value = useMemo(
    () => ({
      linesForProject,
      countForProject,
      addLine,
      removeLine,
    }),
    [linesForProject, countForProject, addLine, removeLine],
  );

  return (
    <SubmittalDraftContext.Provider value={value}>{children}</SubmittalDraftContext.Provider>
  );
}

export function useSubmittalDraft() {
  const ctx = useContext(SubmittalDraftContext);
  if (!ctx) {
    throw new Error('useSubmittalDraft must be used within SubmittalDraftProvider');
  }
  return ctx;
}

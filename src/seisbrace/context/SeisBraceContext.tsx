import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {
  BRACES_SEED,
  SEISBRACE_FILES_SEED,
  SEISMIC_DESIGNS_SEED,
} from '../data/seisbraceMockData';
import type { Brace, SeisBraceFile, SeismicDesign } from '../types';

const DESIGNS_KEY = 'hydra-seisbrace-designs';
const BRACES_KEY = 'hydra-seisbrace-braces';
const FILES_KEY = 'hydra-seisbrace-files';

/* ------------------------------------------------------------------ */
/* Generic sessionStorage-backed external store                        */
/* ------------------------------------------------------------------ */

function makeStore<T>(key: string, seed: T[]) {
  function read(): T[] {
    if (typeof sessionStorage === 'undefined') return seed;
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return seed;
      const parsed = JSON.parse(raw) as T[];
      return Array.isArray(parsed) ? parsed : seed;
    } catch {
      return seed;
    }
  }

  let cache: T[] = read();
  const listeners = new Set<() => void>();

  function write(next: T[]) {
    cache = next;
    try {
      sessionStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => cache,
    getServerSnapshot: () => seed,
    set(updater: (prev: T[]) => T[]) {
      write(updater(cache));
    },
  };
}

const designsStore = makeStore<SeismicDesign>(DESIGNS_KEY, SEISMIC_DESIGNS_SEED);
const bracesStore = makeStore<Brace>(BRACES_KEY, BRACES_SEED);
const filesStore = makeStore<SeisBraceFile>(FILES_KEY, SEISBRACE_FILES_SEED);

/* ------------------------------------------------------------------ */
/* Context value                                                       */
/* ------------------------------------------------------------------ */

export type NewDesignInput = Pick<
  SeismicDesign,
  'name' | 'projectDate' | 'codeRequirement' | 'loadType' | 'unit' | 'notes'
>;

export type NewBraceInput = Omit<Brace, 'id' | 'seismicDesignId' | 'order'>;

type SeisBraceContextValue = {
  designsForProject: (projectId: string) => SeismicDesign[];
  designCountForProject: (projectId: string) => number;
  getDesign: (id: string | undefined) => SeismicDesign | undefined;
  bracesForDesign: (seismicDesignId: string | undefined) => Brace[];
  getBrace: (id: string | undefined) => Brace | undefined;
  filesForProject: (projectId: string) => SeisBraceFile[];

  createDesign: (projectId: string, input: NewDesignInput) => string;
  updateDesign: (id: string, input: NewDesignInput) => void;
  deleteDesign: (id: string) => void;
  copyDesign: (id: string) => string | undefined;

  createBrace: (seismicDesignId: string, input: NewBraceInput) => string;
  updateBrace: (id: string, input: Partial<NewBraceInput>) => void;
  deleteBraces: (ids: string[]) => void;
  copyBrace: (id: string, targetDesignId?: string) => string | undefined;
  moveBrace: (seismicDesignId: string, braceId: string, direction: 'up' | 'down') => void;

  addFile: (projectId: string, filename: string) => void;
  deleteFile: (id: string) => void;
};

const SeisBraceContext = createContext<SeisBraceContextValue | null>(null);

export function SeisBraceProvider({ children }: { children: ReactNode }) {
  const designs = useSyncExternalStore(
    designsStore.subscribe,
    designsStore.getSnapshot,
    designsStore.getServerSnapshot,
  );
  const braces = useSyncExternalStore(
    bracesStore.subscribe,
    bracesStore.getSnapshot,
    bracesStore.getServerSnapshot,
  );
  const files = useSyncExternalStore(
    filesStore.subscribe,
    filesStore.getSnapshot,
    filesStore.getServerSnapshot,
  );

  const designsForProject = useCallback(
    (projectId: string) =>
      designs
        .filter((d) => d.projectId === projectId)
        .sort((a, b) => new Date(b.projectDate).getTime() - new Date(a.projectDate).getTime()),
    [designs],
  );

  const designCountForProject = useCallback(
    (projectId: string) => designs.filter((d) => d.projectId === projectId).length,
    [designs],
  );

  const getDesign = useCallback(
    (id: string | undefined) => (id ? designs.find((d) => d.id === id) : undefined),
    [designs],
  );

  const bracesForDesign = useCallback(
    (seismicDesignId: string | undefined) =>
      seismicDesignId
        ? braces.filter((b) => b.seismicDesignId === seismicDesignId).sort((a, b) => a.order - b.order)
        : [],
    [braces],
  );

  const getBrace = useCallback(
    (id: string | undefined) => (id ? braces.find((b) => b.id === id) : undefined),
    [braces],
  );

  const filesForProject = useCallback(
    (projectId: string) => files.filter((f) => f.projectId === projectId),
    [files],
  );

  const createDesign = useCallback((projectId: string, input: NewDesignInput) => {
    const id = `sd-${Date.now()}`;
    const next: SeismicDesign = {
      id,
      projectId,
      name: input.name.trim() || 'Untitled design',
      displayName: input.name.trim() || 'Untitled design',
      projectDate: input.projectDate || new Date().toISOString(),
      codeRequirement: input.codeRequirement,
      loadType: input.loadType,
      unit: input.unit,
      notes: input.notes,
    };
    designsStore.set((prev) => [next, ...prev]);
    return id;
  }, []);

  const updateDesign = useCallback((id: string, input: NewDesignInput) => {
    designsStore.set((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              ...input,
              name: input.name.trim() || d.name,
              displayName: input.name.trim() || d.displayName,
            }
          : d,
      ),
    );
  }, []);

  const deleteDesign = useCallback((id: string) => {
    designsStore.set((prev) => prev.filter((d) => d.id !== id));
    bracesStore.set((prev) => prev.filter((b) => b.seismicDesignId !== id));
  }, []);

  const copyDesign = useCallback(
    (id: string) => {
      const source = designsStore.getSnapshot().find((d) => d.id === id);
      if (!source) return undefined;
      const newId = `sd-${Date.now()}`;
      const copyName = `${source.name} (copy)`;
      designsStore.set((prev) => [
        { ...source, id: newId, name: copyName, displayName: copyName },
        ...prev,
      ]);
      const sourceBraces = bracesStore.getSnapshot().filter((b) => b.seismicDesignId === id);
      if (sourceBraces.length > 0) {
        bracesStore.set((prev) => [
          ...prev,
          ...sourceBraces.map((b, i) => ({
            ...b,
            id: `br-${Date.now()}-${i}`,
            seismicDesignId: newId,
          })),
        ]);
      }
      return newId;
    },
    [],
  );

  const createBrace = useCallback((seismicDesignId: string, input: NewBraceInput) => {
    const id = `br-${Date.now()}`;
    const order = bracesStore.getSnapshot().filter((b) => b.seismicDesignId === seismicDesignId).length;
    const next: Brace = { ...input, id, seismicDesignId, order };
    bracesStore.set((prev) => [...prev, next]);
    return id;
  }, []);

  const updateBrace = useCallback((id: string, input: Partial<NewBraceInput>) => {
    bracesStore.set((prev) => prev.map((b) => (b.id === id ? { ...b, ...input } : b)));
  }, []);

  const deleteBraces = useCallback((ids: string[]) => {
    const set = new Set(ids);
    bracesStore.set((prev) => prev.filter((b) => !set.has(b.id)));
  }, []);

  const copyBrace = useCallback((id: string, targetDesignId?: string) => {
    const source = bracesStore.getSnapshot().find((b) => b.id === id);
    if (!source) return undefined;
    const seismicDesignId = targetDesignId ?? source.seismicDesignId;
    const target = designsStore.getSnapshot().find((d) => d.id === seismicDesignId);
    if (!target) return undefined;
    const newId = `br-${Date.now()}`;
    const order = bracesStore.getSnapshot().filter((b) => b.seismicDesignId === seismicDesignId).length;
    const copyName = `${source.name} (copy)`;
    bracesStore.set((prev) => [
      ...prev,
      {
        ...source,
        id: newId,
        seismicDesignId,
        name: copyName,
        displayName: copyName,
        order,
      },
    ]);
    return newId;
  }, []);

  const moveBrace = useCallback(
    (seismicDesignId: string, braceId: string, direction: 'up' | 'down') => {
      bracesStore.set((prev) => {
        const scoped = prev
          .filter((b) => b.seismicDesignId === seismicDesignId)
          .sort((a, b) => a.order - b.order);
        const index = scoped.findIndex((b) => b.id === braceId);
        if (index < 0) return prev;
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= scoped.length) return prev;
        [scoped[index], scoped[target]] = [scoped[target], scoped[index]];
        const orderById = new Map(scoped.map((b, i) => [b.id, i]));
        return prev.map((b) =>
          orderById.has(b.id) ? { ...b, order: orderById.get(b.id) as number } : b,
        );
      });
    },
    [],
  );

  const addFile = useCallback((projectId: string, filename: string) => {
    const id = `file-${Date.now()}`;
    filesStore.set((prev) => [
      ...prev,
      { id, projectId, title: filename.replace(/\.[^.]+$/, ''), filename, kind: 'user' },
    ]);
  }, []);

  const deleteFile = useCallback((id: string) => {
    filesStore.set((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const value = useMemo<SeisBraceContextValue>(
    () => ({
      designsForProject,
      designCountForProject,
      getDesign,
      bracesForDesign,
      getBrace,
      filesForProject,
      createDesign,
      updateDesign,
      deleteDesign,
      copyDesign,
      createBrace,
      updateBrace,
      deleteBraces,
      copyBrace,
      moveBrace,
      addFile,
      deleteFile,
    }),
    [
      designsForProject,
      designCountForProject,
      getDesign,
      bracesForDesign,
      getBrace,
      filesForProject,
      createDesign,
      updateDesign,
      deleteDesign,
      copyDesign,
      createBrace,
      updateBrace,
      deleteBraces,
      copyBrace,
      moveBrace,
      addFile,
      deleteFile,
    ],
  );

  return <SeisBraceContext.Provider value={value}>{children}</SeisBraceContext.Provider>;
}

export function useSeisBrace(): SeisBraceContextValue {
  const ctx = useContext(SeisBraceContext);
  if (!ctx) throw new Error('useSeisBrace must be used within SeisBraceProvider');
  return ctx;
}

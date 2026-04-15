import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { PROJECT_SEED_ROWS, type ProjectRow } from '../shell/projectSeed';

const STORAGE_KEY = 'hydra:bomActiveProjectId';

function readStoredId(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? PROJECT_SEED_ROWS[0]?.key ?? '1';
  } catch {
    return PROJECT_SEED_ROWS[0]?.key ?? '1';
  }
}

type ActiveProjectContextValue = {
  projectId: string;
  project: ProjectRow | undefined;
  setProjectId: (id: string) => void;
};

const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(null);

export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectIdState] = useState<string>(readStoredId);

  const project = useMemo(
    () => PROJECT_SEED_ROWS.find((r) => r.key === projectId),
    [projectId],
  );

  const setProjectId = useCallback((id: string) => {
    setProjectIdState(id);
    try {
      sessionStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ projectId, project, setProjectId }),
    [projectId, project, setProjectId],
  );

  return <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>;
}

export function useActiveProject(): ActiveProjectContextValue {
  const ctx = useContext(ActiveProjectContext);
  if (!ctx) throw new Error('useActiveProject must be used inside ActiveProjectProvider');
  return ctx;
}

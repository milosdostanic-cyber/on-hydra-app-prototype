import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { clearLastScopedProjectId, setLastScopedProjectId } from '../shell/lastProjectScope';
import { PROJECT_SEED_ROWS, type ProjectRow } from '../shell/projectSeed';

const STORAGE_KEY = 'hydra:bomActiveProjectId';

/** No silent fallback: a missing id means "no active project" (enables search-first / Path B). */
function readStoredId(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export type NewProjectInput = Pick<
  ProjectRow,
  'name' | 'address' | 'address2' | 'country' | 'city' | 'state' | 'zipCode' | 'notes' | 'contacts'
>;

type ActiveProjectContextValue = {
  projectId: string | null;
  project: ProjectRow | undefined;
  /** Full user project list — shared by Home hub, top-bar switcher, and the project gate. */
  projects: ProjectRow[];
  setProjectId: (id: string) => void;
  /** Clear the active construction project (search-first / no scope). */
  clearProjectId: () => void;
  /** Create a project, returning its new key. Does not change the active project. */
  addProject: (fields: NewProjectInput) => string;
  updateProject: (key: string, fields: NewProjectInput) => void;
  deleteProject: (key: string) => void;
};

const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(null);

export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectIdState] = useState<string | null>(readStoredId);
  const [projects, setProjects] = useState<ProjectRow[]>(() => [...PROJECT_SEED_ROWS]);

  const project = useMemo(
    () => (projectId ? projects.find((r) => r.key === projectId) : undefined),
    [projectId, projects],
  );

  const setProjectId = useCallback((id: string) => {
    setProjectIdState(id);
    try {
      sessionStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
    setLastScopedProjectId(id);
  }, []);

  const clearProjectId = useCallback(() => {
    setProjectIdState(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    clearLastScopedProjectId();
  }, []);

  const addProject = useCallback((fields: NewProjectInput) => {
    const key = `p-${Date.now()}`;
    setProjects((prev) => [
      { key, ...fields, lastOpened: 'Just now', recent: true },
      ...prev,
    ]);
    return key;
  }, []);

  const updateProject = useCallback((key: string, fields: NewProjectInput) => {
    setProjects((prev) => prev.map((r) => (r.key === key ? { ...r, ...fields } : r)));
  }, []);

  const deleteProject = useCallback((key: string) => {
    setProjects((prev) => prev.filter((r) => r.key !== key));
    setProjectIdState((current) => {
      if (current !== key) return current;
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      clearLastScopedProjectId();
      return null;
    });
  }, []);

  const value = useMemo(
    () => ({
      projectId,
      project,
      projects,
      setProjectId,
      clearProjectId,
      addProject,
      updateProject,
      deleteProject,
    }),
    [projectId, project, projects, setProjectId, clearProjectId, addProject, updateProject, deleteProject],
  );

  return <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>;
}

export function useActiveProject(): ActiveProjectContextValue {
  const ctx = useContext(ActiveProjectContext);
  if (!ctx) throw new Error('useActiveProject must be used inside ActiveProjectProvider');
  return ctx;
}

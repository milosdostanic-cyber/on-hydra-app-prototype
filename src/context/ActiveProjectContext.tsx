import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { clearLastScopedProjectId, setLastScopedProjectId } from '../shell/lastProjectScope';
import {
  PROJECT_SEED_ROWS,
  readStoredProjects,
  writeStoredProjects,
  type ConstructionProjectInput,
  type ProjectRow,
} from '../shell/projectSeed';

const STORAGE_KEY = 'hydra:bomActiveProjectId';

/** No silent fallback: a missing id means "no active project" (enables search-first / Path B). */
function readStoredId(projects: ProjectRow[]): string | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && projects.some((p) => p.key === stored)) return stored;
    if (stored === null) return null;
  } catch {
    /* ignore */
  }
  return null;
}

export type NewProjectInput = Pick<
  ProjectRow,
  'name' | 'address' | 'address2' | 'country' | 'city' | 'state' | 'zipCode' | 'notes' | 'contacts'
>;

type ActiveProjectContextValue = {
  projectId: string | null;
  project: ProjectRow | undefined;
  projects: ProjectRow[];
  setProjectId: (id: string) => void;
  clearProjectId: () => void;
  addProject: (fields: NewProjectInput) => string;
  createProject: (input: ConstructionProjectInput) => ProjectRow;
  updateProject: (key: string, fields: NewProjectInput | ConstructionProjectInput) => void;
  deleteProject: (key: string) => string;
};

const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(null);

export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectRow[]>(() => readStoredProjects());
  const [projectId, setProjectIdState] = useState<string | null>(() => readStoredId(readStoredProjects()));

  const persistProjects = useCallback((next: ProjectRow[]) => {
    setProjects(next);
    writeStoredProjects(next);
  }, []);

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

  const addProject = useCallback(
    (fields: NewProjectInput) => {
      const key = `p-${Date.now()}`;
      persistProjects([{ key, ...fields, lastOpened: 'Just now', recent: true }, ...projects]);
      return key;
    },
    [persistProjects, projects],
  );

  const createProject = useCallback(
    (input: ConstructionProjectInput): ProjectRow => {
      const row: ProjectRow = {
        key: `local-${Date.now()}`,
        name: input.name.trim(),
        address: input.address?.trim() || '—',
        city: input.city?.trim() || '—',
        state: input.state?.trim() || '—',
        lastOpened: 'Just now',
        recent: true,
      };
      persistProjects([row, ...projects]);
      setProjectId(row.key);
      return row;
    },
    [persistProjects, projects, setProjectId],
  );

  const updateProject = useCallback(
    (key: string, fields: NewProjectInput | ConstructionProjectInput) => {
      persistProjects(
        projects.map((r) =>
          r.key === key
            ? {
                ...r,
                ...fields,
                name: fields.name.trim(),
                address: fields.address?.trim() || r.address,
                city: fields.city?.trim() || r.city,
                state: fields.state?.trim() || r.state,
              }
            : r,
        ),
      );
    },
    [persistProjects, projects],
  );

  const deleteProject = useCallback(
    (key: string): string => {
      const next = projects.filter((r) => r.key !== key);
      const restored = next.length > 0 ? next : [...PROJECT_SEED_ROWS];
      persistProjects(restored);
      const fallback = restored[0];
      let nextActiveId = projectId ?? fallback?.key ?? '1';
      if (projectId === key) {
        nextActiveId = fallback?.key ?? '1';
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        clearLastScopedProjectId();
        setProjectIdState(fallback ? fallback.key : null);
        if (fallback) {
          try {
            sessionStorage.setItem(STORAGE_KEY, fallback.key);
          } catch {
            /* ignore */
          }
          setLastScopedProjectId(fallback.key);
        }
      }
      return nextActiveId;
    },
    [persistProjects, projectId, projects],
  );

  const value = useMemo(
    () => ({
      projectId,
      project,
      projects,
      setProjectId,
      clearProjectId,
      addProject,
      createProject,
      updateProject,
      deleteProject,
    }),
    [
      projectId,
      project,
      projects,
      setProjectId,
      clearProjectId,
      addProject,
      createProject,
      updateProject,
      deleteProject,
    ],
  );

  return <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>;
}

export function useActiveProject(): ActiveProjectContextValue {
  const ctx = useContext(ActiveProjectContext);
  if (!ctx) throw new Error('useActiveProject must be used inside ActiveProjectProvider');
  return ctx;
}

/** BOM hub for a construction project. */
export function bomSitePath(constructionProjectId: string): string {
  return `/bom/site/${constructionProjectId}`;
}

export function useBomHubPath(): string {
  const { projectId, projects } = useActiveProject();
  const resolvedId = projectId ?? projects[0]?.key ?? PROJECT_SEED_ROWS[0]?.key ?? '1';
  return bomSitePath(resolvedId);
}

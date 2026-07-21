import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { clearLastScopedProjectId, getLastScopedProjectId, setLastScopedProjectId } from '../shell/lastProjectScope';
import {
  PROJECT_SEED_ROWS,
  readStoredProjects,
  writeStoredProjects,
  type ConstructionProjectInput,
  type ProjectRow,
} from '../shell/projectSeed';

const STORAGE_KEY = 'hydra:bomActiveProjectId';

/** Lucas unified: no silent fallback — null enables search-first / Path B. */
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
  projects: ProjectRow[];
  setProjectId: (id: string) => void;
  clearProjectId: () => void;
  /** Lucas gate / Home hub — creates without switching active project. */
  addProject: (fields: NewProjectInput) => string;
  /** Milos BOM shell — creates and activates (persisted list). */
  createProject: (input: ConstructionProjectInput) => ProjectRow;
  updateProject: (key: string, fields: NewProjectInput | ConstructionProjectInput) => void;
  deleteProject: (key: string) => string;
};

const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(null);

function fieldsFromConstructionInput(input: ConstructionProjectInput): NewProjectInput {
  return {
    name: input.name.trim(),
    address: input.address?.trim() || '—',
    city: input.city?.trim() || '—',
    state: input.state?.trim() || '—',
  };
}

export function resolveActiveConstructionProjectId(projectId: string | null | undefined): string {
  return projectId ?? getLastScopedProjectId() ?? PROJECT_SEED_ROWS[0]?.key ?? '1';
}

export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectIdState] = useState<string | null>(readStoredId);
  const [projects, setProjects] = useState<ProjectRow[]>(() => {
    const stored = readStoredProjects();
    return stored.length > 0 ? stored : [...PROJECT_SEED_ROWS];
  });

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
      const key = `local-${Date.now()}`;
      const row: ProjectRow = {
        key,
        ...fieldsFromConstructionInput(input),
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
      const normalized =
        'name' in fields && typeof fields.name === 'string'
          ? 'address' in fields && !('contacts' in fields)
            ? fieldsFromConstructionInput(fields as ConstructionProjectInput)
            : (fields as NewProjectInput)
          : (fields as NewProjectInput);
      persistProjects(projects.map((r) => (r.key === key ? { ...r, ...normalized } : r)));
    },
    [persistProjects, projects],
  );

  const deleteProject = useCallback(
    (key: string): string => {
      const next = projects.filter((r) => r.key !== key);
      const restored = next.length > 0 ? next : [...PROJECT_SEED_ROWS];
      persistProjects(restored);
      const fallback = restored[0]?.key ?? PROJECT_SEED_ROWS[0]?.key ?? '1';
      if (projectId === key) {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        clearLastScopedProjectId();
        setProjectIdState(null);
        return fallback;
      }
      return resolveActiveConstructionProjectId(projectId);
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
  const { projectId } = useActiveProject();
  return bomSitePath(resolveActiveConstructionProjectId(projectId));
}

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  PROJECT_SEED_ROWS,
  readStoredProjects,
  writeStoredProjects,
  type ConstructionProjectInput,
  type ProjectRow,
} from '../shell/projectSeed';

const STORAGE_KEY = 'hydra:bomActiveProjectId';

function readStoredId(projects: ProjectRow[]): string {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && projects.some((p) => p.key === stored)) return stored;
  } catch {
    /* ignore */
  }
  return projects[0]?.key ?? PROJECT_SEED_ROWS[0]?.key ?? '1';
}

type ActiveProjectContextValue = {
  projectId: string;
  project: ProjectRow | undefined;
  projects: ProjectRow[];
  setProjectId: (id: string) => void;
  createProject: (input: ConstructionProjectInput) => ProjectRow;
  updateProject: (id: string, input: ConstructionProjectInput) => void;
  deleteProject: (id: string) => string;
};

const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(null);

export function ActiveProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectRow[]>(() => readStoredProjects());
  const [projectId, setProjectIdState] = useState<string>(() => readStoredId(readStoredProjects()));

  const persistProjects = useCallback((next: ProjectRow[]) => {
    setProjects(next);
    writeStoredProjects(next);
  }, []);

  const project = useMemo(
    () => projects.find((r) => r.key === projectId),
    [projects, projectId],
  );

  const setProjectId = useCallback((id: string) => {
    setProjectIdState(id);
    try {
      sessionStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

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
    (id: string, input: ConstructionProjectInput) => {
      persistProjects(
        projects.map((p) =>
          p.key === id
            ? {
                ...p,
                name: input.name.trim(),
                address: input.address?.trim() || p.address,
                city: input.city?.trim() || p.city,
                state: input.state?.trim() || p.state,
              }
            : p,
        ),
      );
    },
    [persistProjects, projects],
  );

  const deleteProject = useCallback(
    (id: string): string => {
      const next = projects.filter((p) => p.key !== id);
      const restored = next.length > 0 ? next : [...PROJECT_SEED_ROWS];
      persistProjects(restored);
      const fallback = restored[0];
      const nextActiveId = projectId === id ? (fallback?.key ?? projectId) : projectId;
      if (projectId === id && fallback) setProjectId(fallback.key);
      return nextActiveId;
    },
    [persistProjects, projectId, projects, setProjectId],
  );

  const value = useMemo(
    () => ({
      projectId,
      project,
      projects,
      setProjectId,
      createProject,
      updateProject,
      deleteProject,
    }),
    [projectId, project, projects, setProjectId, createProject, updateProject, deleteProject],
  );

  return <ActiveProjectContext.Provider value={value}>{children}</ActiveProjectContext.Provider>;
}

export function useActiveProject(): ActiveProjectContextValue {
  const ctx = useContext(ActiveProjectContext);
  if (!ctx) throw new Error('useActiveProject must be used inside ActiveProjectProvider');
  return ctx;
}

/** BOM hub for the active construction project. */
export function bomSitePath(constructionProjectId: string): string {
  return `/bom/site/${constructionProjectId}`;
}

export function useBomHubPath(): string {
  const { projectId } = useActiveProject();
  return bomSitePath(projectId);
}

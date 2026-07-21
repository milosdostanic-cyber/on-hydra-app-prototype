const STORAGE_KEY = 'hydra:lastProjectId';

/**
 * Last project used for shell deep-links to Spec / Submittal / Content (demo scope).
 * Returns null when the user has never scoped a project, so callers can route to the
 * project gate / home instead of silently assuming a seed project.
 */
export function getLastScopedProjectId(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setLastScopedProjectId(projectId: string): void {
  sessionStorage.setItem(STORAGE_KEY, projectId);
}

export function clearLastScopedProjectId(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

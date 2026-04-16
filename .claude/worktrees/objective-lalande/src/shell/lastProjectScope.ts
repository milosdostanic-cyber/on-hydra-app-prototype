import { PROJECT_SEED_ROWS } from './projectSeed';

const STORAGE_KEY = 'hydra:lastProjectId';

const defaultProjectId = PROJECT_SEED_ROWS[0]?.key ?? '1';

/** Last project used for shell links to Spec / Submittal / Content (demo scope). */
export function getLastScopedProjectId(): string {
  if (typeof sessionStorage === 'undefined') return defaultProjectId;
  return sessionStorage.getItem(STORAGE_KEY) ?? defaultProjectId;
}

export function setLastScopedProjectId(projectId: string): void {
  sessionStorage.setItem(STORAGE_KEY, projectId);
}

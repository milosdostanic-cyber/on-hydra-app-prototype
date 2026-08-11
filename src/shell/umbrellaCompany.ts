/**
 * Demo company labels for unified hub UX (flat routes on `new_unified`).
 * Paths use `/dashboard` and `/projects/:projectId/...`; no Umbrella outlet.
 */
export const UMBRELLA_COMPANY_SLUG = 'acme-electric';

export const UMBRELLA_COMPANY_LABEL = 'Acme Electric';

export type FlatWorkspaceModule = 'content' | 'submittal' | 'sales-brace' | 'seis-brace';

export function flatProjectWorkspacePath(projectId: string, modulePath: FlatWorkspaceModule): string {
  return `/projects/${projectId}/${modulePath}`;
}

import { ensureDemoPendingImports, listPendingImportsForProject } from './bomImportProgressState';
import { bomProjectById } from './data/mockData';
import type { BomProject, BomProjectStatus } from './data/types';

/**
 * BOM project list status — only two values:
 * - needs-review: one or more file uploads still in progress for this project
 * - ready: no unfinished uploads
 *
 * Not derived from workspace line confirmation or export readiness.
 */
export function resolveBomProjectStatus(bomProjectId: string): BomProjectStatus {
  ensureDemoPendingImports(bomProjectId);
  const pendingUploads = listPendingImportsForProject(bomProjectId);
  return pendingUploads.length > 0 ? 'needs-review' : 'ready';
}

export function withResolvedBomProjectStatus(project: BomProject): BomProject {
  return { ...project, status: resolveBomProjectStatus(project.id) };
}

export function bomProjectByIdResolved(bomProjectId: string | undefined): BomProject | undefined {
  const project = bomProjectById(bomProjectId);
  if (!project) return undefined;
  return withResolvedBomProjectStatus(project);
}

/** Short explanation for tooltips and helper copy. */
export function bomProjectStatusDescription(status: BomProjectStatus): string {
  if (status === 'needs-review') {
    return 'One or more BOM file uploads are still in progress (map, parse, or match). Finish or dismiss them from the workspace.';
  }
  return 'No unfinished file uploads. Export is available when every line in the workspace is confirmed.';
}

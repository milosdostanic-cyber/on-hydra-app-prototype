import { buildWorkspaceRowFromMatch } from './bomMatchingWorkspaceImport';
import { addBomProject } from './data/mockData';
import type { BomItem, BomMatchResult } from './data/types';
import { resolveUploadDestination, type BomUploadFlowLocationState } from './bomUploadFlowState';

export function importFileBaseName(uploadFileName: string): string {
  const trimmed = uploadFileName.trim();
  const withoutExt = trimmed.replace(/\.[^.]+$/i, '').trim();
  return withoutExt || 'Imported BOM';
}

/** Resolve workspace target — creates a BOM project row when upload started as "new". */
export function resolveImportBomProjectId(
  routeBomProjectId: string,
  uploadState: BomUploadFlowLocationState,
  constructionProjectId: string,
  uploadFileName: string,
): string {
  const { destination, appendTargetId } = resolveUploadDestination(routeBomProjectId, uploadState);
  if (destination === 'append' && appendTargetId) return appendTargetId;
  if (routeBomProjectId !== 'new') return routeBomProjectId;
  return addBomProject(importFileBaseName(uploadFileName), undefined, constructionProjectId).id;
}

export function buildImportedWorkspaceRows(
  matchResults: BomMatchResult[],
  parsedItems: BomItem[],
  startIndex: number,
): BomItem[] {
  const accepted = matchResults.filter((r) => r.lineStatus === 'accepted' || r.source === 'manual');
  return accepted.map((result, i) => {
    const item = parsedItems.find((p) => p.id === result.itemId);
    return buildWorkspaceRowFromMatch(result, item, startIndex + i + 1);
  });
}

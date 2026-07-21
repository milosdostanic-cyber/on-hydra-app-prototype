import type { BomImportSession } from './bomImportProgressState';
import { buildWorkspaceRowFromMatch } from './bomMatchingWorkspaceImport';
import { ensureWorkspaceRowDisplayFields } from './data/bomWorkspaceSeed';
import type { BomItem, BomMatchResult } from './data/types';

export function isPendingUploadPreviewRow(row: BomItem): boolean {
  return Boolean(row.pendingUploadId);
}

/** `pending:{uploadId}:{itemId}` — preview rows merged into the workspace table. */
export function parsePendingPreviewRowId(
  rowId: string,
): { uploadId: string; itemId: string } | null {
  const prefix = 'pending:';
  if (!rowId.startsWith(prefix)) return null;
  const rest = rowId.slice(prefix.length);
  const separator = rest.lastIndexOf(':');
  if (separator <= 0) return null;
  return {
    uploadId: rest.slice(0, separator),
    itemId: rest.slice(separator + 1),
  };
}

function previewRowId(uploadId: string, itemId: string): string {
  return `pending:${uploadId}:${itemId}`;
}

export function buildPendingUploadPreviewRow(
  session: BomImportSession,
  result: BomMatchResult,
  rowIndex: number,
): BomItem {
  const parsed = session.parsedItems.find((item) => item.id === result.itemId);
  const base =
    result.lineStatus === 'accepted' && result.topMatch
      ? buildWorkspaceRowFromMatch(result, parsed, rowIndex)
      : ensureWorkspaceRowDisplayFields({
          id: previewRowId(session.uploadId, result.itemId),
          rowNumber: rowIndex,
          originalInput: result.originalRequest,
          importedDescription: parsed?.parsedDescription,
          importedRowNumber: parsed?.rowNumber,
          parsedDescription: parsed?.parsedDescription ?? result.originalRequest,
          size: parsed?.size ?? '',
          pressureClass: parsed?.pressureClass ?? '',
          connectionType: parsed?.connectionType ?? '',
          quantity: parsed?.quantity ?? 1,
          confidence: parsed?.confidence ?? 'medium',
          category: parsed?.category,
          unit: parsed?.unit ?? 'EA',
          manufacturer: parsed?.manufacturer,
          status: 'pending',
        });

  return {
    ...base,
    id: previewRowId(session.uploadId, result.itemId),
    pendingUploadId: session.uploadId,
    pendingUploadFileName: session.progress.fileName,
    importMatchLineStatus: result.lineStatus,
    status: result.lineStatus === 'accepted' ? 'confirmed' : 'pending',
  };
}

/** Append preview lines from unfinished uploads so the workspace table shows Pending / Skipped / Accepted. */
export function mergeWorkspaceRowsWithPendingUploads(
  workspaceRows: BomItem[],
  sessions: BomImportSession[],
): BomItem[] {
  const importedItemIds = new Set(
    workspaceRows
      .filter((row) => row.id.startsWith('ws-import-'))
      .map((row) => row.id.slice('ws-import-'.length)),
  );

  const previewRows: BomItem[] = [];
  for (const session of sessions) {
    session.matchResults.forEach((result) => {
      if (importedItemIds.has(result.itemId)) return;
      previewRows.push(buildPendingUploadPreviewRow(session, result, workspaceRows.length + previewRows.length + 1));
    });
  }

  const combined = [...workspaceRows, ...previewRows];
  return combined.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

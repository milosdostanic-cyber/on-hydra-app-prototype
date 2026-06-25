import { isBomItemFullyDefined, isBomTranslationUnfinished, mockAscParts } from './data/mockData';
import type { AscCatalogPart, BomItem } from './data/types';

export function suggestedAscPartForRow(row: BomItem): AscCatalogPart {
  const text = `${row.parsedDescription} ${row.category ?? ''}`.toLowerCase();
  if (text.includes('coupling') || text.includes('firelok') || text.includes('firelock')) return mockAscParts[0];
  if (text.includes('sprinkler')) return mockAscParts[1];
  return mockAscParts[2];
}

export function isWorkspaceRowConfirmed(row: BomItem): boolean {
  return isBomItemFullyDefined(row);
}

/** PRD §2.10–2.11: export only when every workspace line is confirmed. */
export function canExportWorkspace(rows: BomItem[]): boolean {
  const workspaceOnly = rows.filter((row) => !row.pendingUploadId);
  return workspaceOnly.length > 0 && workspaceOnly.every(isWorkspaceRowConfirmed);
}

/** Export requires no in-progress uploads and every imported/workspace line confirmed. */
export function canExportBomProject(rows: BomItem[], pendingUploadCount: number): boolean {
  if (pendingUploadCount > 0) return false;
  return canExportWorkspace(rows);
}

export function resolveExportDisabledReason(
  rows: BomItem[],
  pendingUploadCount: number,
): string | undefined {
  if (pendingUploadCount > 0) {
    return 'Finish all in-progress file uploads before exporting.';
  }
  const workspaceOnly = rows.filter((row) => !row.pendingUploadId);
  if (workspaceOnly.length === 0) {
    return 'Add and confirm items before exporting.';
  }
  if (!canExportWorkspace(workspaceOnly)) {
    return 'Confirm every BOM line before exporting.';
  }
  return undefined;
}

export const EXPORT_ENABLED_TOOLTIP = 'Every part is confirmed and all uploads are finished.';

/** Contextual subtitle under the workspace project title. */
export function workspacePageHeaderDescription(
  rows: BomItem[],
  options?: { pendingUploads?: number },
): string {
  const workspaceRows = rows.filter((row) => !row.pendingUploadId);
  const confirmedCount = workspaceRows.filter(isWorkspaceRowConfirmed).length;
  const unconfirmedCount = workspaceRows.length - confirmedCount;
  const pendingUploads = options?.pendingUploads ?? 0;
  const partLabel = (n: number) => `${n} part${n === 1 ? '' : 's'}`;

  if (confirmedCount === 0 && workspaceRows.length === 0) {
    if (pendingUploads > 0) {
      return 'Finish your file upload above, or add parts from the catalog.';
    }
    return 'Upload a BOM file to import parts, browse the ASC catalog, or add items one by one.';
  }

  const exportReady = canExportBomProject(rows, pendingUploads);
  const pendingUploadLineNote =
    ' Lines from those uploads appear in the table as Pending, Skipped, or Confirmed.';

  if (pendingUploads > 0) {
    if (confirmedCount === 0) {
      return `Finish ${pendingUploads} in-progress upload${pendingUploads === 1 ? '' : 's'} above before this BOM is ready.`;
    }
    return `${partLabel(confirmedCount)} in this BOM. Finish ${pendingUploads} in-progress file upload${pendingUploads === 1 ? '' : 's'} before export.${pendingUploadLineNote}`;
  }

  if (exportReady) {
    return `${partLabel(confirmedCount)} in this BOM. Ready to export.`;
  }

  if (confirmedCount === 0) {
    return 'Confirm your parts before they appear in this list.';
  }

  if (unconfirmedCount > 0) {
    return `${partLabel(confirmedCount)} in this BOM. ${partLabel(unconfirmedCount)} still need confirmation.`;
  }

  return `${partLabel(confirmedCount)} in this BOM. Confirm remaining lines before export.`;
}

export function isWorkspaceTranslationUnfinished(row: BomItem): boolean {
  return isBomTranslationUnfinished(row);
}

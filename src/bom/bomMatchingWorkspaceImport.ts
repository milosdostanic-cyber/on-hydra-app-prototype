import type { BomItem, BomItemConfidence, BomItemMatchStatus, BomMatchResult } from './data/types';
import { ensureWorkspaceRowDisplayFields } from './data/bomWorkspaceSeed';

/** Workspace status after picking a part from catalog in the BOM workspace (not import). */
export function workspaceStatusAfterManualPick(confidence: BomItemConfidence): BomItemMatchStatus {
  return confidence === 'low' ? 'needs-review' : 'matched';
}

export function buildWorkspaceRowFromMatch(
  result: BomMatchResult,
  parsedItem: BomItem | undefined,
  rowIndex: number,
): BomItem {
  const match = result.topMatch;
  const conf: BomItemConfidence =
    result.source === 'manual' || (match?.matchConfidence ?? 0) >= 90
      ? 'high'
      : (match?.matchConfidence ?? 0) >= 70
        ? 'medium'
        : 'low';
  const figureNumber =
    result.figureNumber ?? match?.figureNumber ?? parsedItem?.figureNumber;
  const sku = result.matchLevel === 'figure' && !result.selectedVariantId
    ? undefined
    : match?.partNumber;

  const variantLabel = [match?.dimensions, match?.connectionType].filter(Boolean).join(' · ') || undefined;

  // Accepted rows reached import only after explicit Confirm/Choose in matching — treat as
  // workspace-confirmed. Manual catalog adds (not via this path) use workspaceStatusAfterManualPick.
  const status: BomItemMatchStatus = 'confirmed';

  return ensureWorkspaceRowDisplayFields({
    id: `ws-import-${result.itemId}`,
    rowNumber: rowIndex,
    originalInput: result.originalRequest,
    importedDescription: parsedItem?.parsedDescription,
    importedRowNumber: parsedItem?.rowNumber,
    parsedDescription: match?.description ?? result.originalRequest,
    figureNumber,
    sku,
    variantLabel,
    size: match?.dimensions ?? parsedItem?.size ?? '',
    pressureClass: match?.pressureRating ?? parsedItem?.pressureClass ?? '',
    connectionType: match?.connectionType ?? parsedItem?.connectionType ?? '',
    quantity: parsedItem?.quantity ?? 1,
    confidence: conf,
    category: match?.productFamily ?? parsedItem?.category,
    unit: parsedItem?.unit ?? 'EA',
    manufacturer: parsedItem?.manufacturer,
    upc: parsedItem?.upc,
    matchSource: result.source,
    status,
  });
}

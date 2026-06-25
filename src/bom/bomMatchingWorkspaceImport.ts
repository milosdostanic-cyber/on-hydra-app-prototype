import type { BomItem, BomItemConfidence, BomItemMatchStatus, BomMatchResult } from './data/types';
import { ensureWorkspaceRowDisplayFields } from './data/bomWorkspaceSeed';

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

  // Imported lines have already been reviewed (skipped lines are excluded), so they
  // land as "Matched". Low-confidence rows surface "Needs Review" so the workspace
  // nudges a final human check instead of a misleading "Pending" state.
  const status: BomItemMatchStatus = conf === 'low' ? 'needs-review' : 'matched';

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

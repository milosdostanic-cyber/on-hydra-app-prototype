import { ascBrowserRowToCatalogPart } from './bomChoosePartUtils';
import { workspaceStatusAfterManualPick } from './bomMatchingWorkspaceImport';
import { suggestedAscPartForRow } from './bomWorkspaceHelpers';
import type { AscBrowserProductRow } from './data/ascBrowserProducts';
import { ensureWorkspaceRowDisplayFields } from './data/bomWorkspaceSeed';
import type { BomItem, BomMatchResult } from './data/types';

/** Synthetic matching context so workspace lines reuse {@link BomChoosePartModal}. */
export function buildChoosePartContextFromWorkspaceRow(row: BomItem): {
  matchRow: BomMatchResult;
  parsedItem: BomItem;
} {
  const topMatch = suggestedAscPartForRow(row);
  return {
    parsedItem: row,
    matchRow: {
      itemId: row.id,
      originalRequest: row.originalInput,
      suggestedParts: [topMatch],
      topMatch,
      lineStatus: 'accepted',
      source: row.matchSource ?? 'auto',
      figureNumber: row.figureNumber ?? topMatch.figureNumber,
      matchLevel: 'sku',
    },
  };
}

export function applyBrowserProductToWorkspaceRow(
  row: BomItem,
  product: AscBrowserProductRow,
): BomItem {
  const catalogPart = ascBrowserRowToCatalogPart(product);
  return ensureWorkspaceRowDisplayFields({
    ...row,
    parsedDescription: product.description,
    figureNumber: product.figureNumber,
    sku: product.ascNumber,
    size: product.size,
    category: product.partType,
    matchSource: 'manual',
    confidence: 'medium',
    status: workspaceStatusAfterManualPick('medium'),
    variantLabel: [catalogPart.dimensions, catalogPart.connectionType].filter(Boolean).join(' · ') || undefined,
  });
}

export function buildWorkspaceRowFromBrowserProduct(
  product: AscBrowserProductRow,
  rowNumber: number,
): BomItem {
  const catalogPart = ascBrowserRowToCatalogPart(product);
  return ensureWorkspaceRowDisplayFields({
    id: `ws-asc-${Date.now()}`,
    rowNumber,
    originalInput: product.ascNumber,
    parsedDescription: product.description,
    figureNumber: product.figureNumber,
    sku: product.ascNumber,
    size: product.size,
    pressureClass: '',
    connectionType: '',
    quantity: product.qty || 1,
    confidence: 'medium',
    category: product.partType,
    unit: 'EA',
    matchSource: 'manual',
    status: workspaceStatusAfterManualPick('medium'),
    variantLabel: [catalogPart.dimensions, catalogPart.connectionType].filter(Boolean).join(' · ') || undefined,
  });
}

import { ascBrowserRowToCatalogPart } from './bomChoosePartUtils';
import { applyVariantToMatch } from './bomMatchSkuUtils';
import type { BomUploadFlowLocationState } from './bomUploadFlowState';
import { ASC_BROWSER_PRODUCTS, type AscBrowserProductRow } from './data/ascBrowserProducts';
import { getSkuVariantsForFigure } from './data/ascSkuVariants';
import type { BomMatchResult } from './data/types';

/** Passed when opening ASC catalog from guided matching / summary table. */
export type BomCatalogPickLocationState = {
  matchingPickItemId: string;
  returnTo: string;
  returnLabel?: string;
  uploadFlowState?: BomUploadFlowLocationState;
  /** Pre-fill catalog search from the BOM line. */
  catalogSearch?: string;
  pickSource?: {
    partNumber?: string;
    description?: string;
    size?: string;
    category?: string;
  };
  /** Set on the SKU step after a figure-level part is chosen. */
  pickedProductKey?: string;
};

/** Returned to matching review after catalog + optional SKU pick. */
export type BomCatalogPickReturnState = BomUploadFlowLocationState & {
  matchingPickApplied?: {
    itemId: string;
    productKey: string;
    variantId?: string;
  };
  focusItemId?: string;
};

export function matchingCatalogPickRoute(bomProjectId: string): string {
  return `/bom/projects/${bomProjectId}/asc-products`;
}

export function matchingCatalogSkuPickRoute(bomProjectId: string): string {
  return `/bom/projects/${bomProjectId}/asc-products/sku`;
}

export function readCatalogPickState(state: unknown): BomCatalogPickLocationState | null {
  const s = state as Partial<BomCatalogPickLocationState> | null | undefined;
  if (!s?.matchingPickItemId || !s.returnTo) return null;
  return {
    matchingPickItemId: s.matchingPickItemId,
    returnTo: s.returnTo,
    returnLabel: s.returnLabel,
    uploadFlowState: s.uploadFlowState,
    catalogSearch: s.catalogSearch,
    pickSource: s.pickSource,
    pickedProductKey: s.pickedProductKey,
  };
}

export function readCatalogPickReturn(state: unknown): BomCatalogPickReturnState['matchingPickApplied'] {
  const s = state as Partial<BomCatalogPickReturnState> | null | undefined;
  const applied = s?.matchingPickApplied;
  if (!applied?.itemId || !applied.productKey) return undefined;
  return applied;
}

export function catalogProductByKey(key: string): AscBrowserProductRow | undefined {
  return ASC_BROWSER_PRODUCTS.find((row) => row.key === key);
}

export function catalogPickNeedsSkuStep(product: AscBrowserProductRow): boolean {
  return getSkuVariantsForFigure(product.figureNumber).length > 0;
}

export function applyCatalogPickToMatchResult(
  matchRow: BomMatchResult,
  product: AscBrowserProductRow,
  variantId?: string,
): BomMatchResult {
  const topMatch = ascBrowserRowToCatalogPart(product);

  let next: BomMatchResult = {
    ...matchRow,
    topMatch,
    source: 'manual',
    lineStatus: 'pending',
    matchLevel: 'sku',
    figureNumber: product.figureNumber,
    selectedVariantId: variantId ? variantId : `manual-${product.key}`,
    suggestedParts: [
      topMatch,
      ...matchRow.suggestedParts.filter((p) => p.partNumber !== topMatch.partNumber),
    ].slice(0, 3),
  };

  if (variantId) {
    const variant = getSkuVariantsForFigure(product.figureNumber).find((entry) => entry.id === variantId);
    if (variant) {
      next = applyVariantToMatch(next, variant);
    }
  }

  return next;
}

export function catalogPickSuccessMessage(
  hadSuggestion: boolean,
  pickedSku: boolean,
): string {
  if (pickedSku) {
    return hadSuggestion
      ? 'Part and SKU updated — confirm the match to continue.'
      : 'Part and SKU selected — confirm the match to continue.';
  }
  return hadSuggestion
    ? 'Part updated — confirm the match to continue.'
    : 'Part selected — confirm the match to continue.';
}

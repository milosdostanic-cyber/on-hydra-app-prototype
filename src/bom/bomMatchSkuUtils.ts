import { getSkuVariantsForFigure } from './data/ascSkuVariants';
import type { AscCatalogPart, AscSkuVariant, BomMatchLevel, BomMatchResult } from './data/types';

export function resolveFigureNumber(match: BomMatchResult): string | undefined {
  return match.figureNumber ?? match.topMatch?.figureNumber ?? match.topMatch?.partNumber;
}

export function resolveMatchLevel(result: BomMatchResult): BomMatchLevel {
  if (result.matchLevel) return result.matchLevel;
  if (result.topMatch?.matchLevel) return result.topMatch.matchLevel;
  const figure = resolveFigureNumber(result);
  if (figure && getSkuVariantsForFigure(figure).length > 0) {
    const variants = getSkuVariantsForFigure(figure);
    const isParentOnly =
      result.topMatch?.partNumber === figure ||
      variants.every((v) => v.sku !== result.topMatch?.partNumber);
    if (isParentOnly && !result.selectedVariantId) return 'figure';
  }
  return 'sku';
}

export function matchRequiresSkuSelection(result: BomMatchResult): boolean {
  if (!result.topMatch) return false;
  return resolveMatchLevel(result) === 'figure' && !result.selectedVariantId;
}

export function isReadyToConfirmMatch(result: BomMatchResult): boolean {
  if (!result.topMatch) return false;
  return !matchRequiresSkuSelection(result);
}

export function variantToCatalogPart(variant: AscSkuVariant, parent: AscCatalogPart): AscCatalogPart {
  return {
    ...parent,
    partNumber: variant.sku,
    description: variant.description,
    dimensions: variant.size,
    pressureRating: variant.pressureRating ?? parent.pressureRating,
    connectionType: variant.connectionType ?? parent.connectionType,
    figureNumber: variant.figureNumber,
    matchLevel: 'sku',
  };
}

export function applyVariantToMatch(result: BomMatchResult, variant: AscSkuVariant): BomMatchResult {
  if (!result.topMatch) return result;
  return {
    ...result,
    topMatch: variantToCatalogPart(variant, result.topMatch),
    matchLevel: 'sku',
    selectedVariantId: variant.id,
    figureNumber: variant.figureNumber,
  };
}

export function variantMetadataLine(variant: AscSkuVariant): string {
  return [
    variant.size,
    variant.finish,
    variant.domesticImport,
    variant.painted,
  ]
    .filter(Boolean)
    .join(' · ');
}

import { getSkuVariantsForFigure } from './data/ascSkuVariants';
import { matchScoreBand } from './data/bomImportFlowSeed';
import type { AscCatalogPart, AscSkuVariant, BomMatchLevel, BomMatchResult } from './data/types';

/** One sellable SKU row in guided matching review (figure suggestions are expanded). */
export type SkuMatchCardItem = {
  key: string;
  variantId?: string;
  catalogPart: AscCatalogPart;
  parentPart: AscCatalogPart;
};

function isFigureOnlyCatalogPart(part: AscCatalogPart): boolean {
  const figure = part.figureNumber ?? part.partNumber;
  const variants = getSkuVariantsForFigure(figure);
  if (variants.length === 0) return false;
  return (
    part.matchLevel === 'figure' ||
    part.partNumber === figure ||
    variants.every((variant) => variant.sku !== part.partNumber)
  );
}

export type ReviewSkuConfidenceTier = 'high' | 'medium' | 'low';

export const REVIEW_SKU_TIER_LABEL: Record<ReviewSkuConfidenceTier, string> = {
  high: 'Best match',
  medium: 'Good alternatives',
  low: 'Possible matches',
};

export function reviewSkuConfidenceTier(confidence: number): ReviewSkuConfidenceTier {
  const band = matchScoreBand(confidence);
  if (band === 'high') return 'high';
  if (band === 'medium') return 'medium';
  return 'low';
}

/** Guided review SKU grid — all matcher suggestions, highest confidence first. */
export function buildMatchReviewSkuCards(matchRow: BomMatchResult): SkuMatchCardItem[] {
  const cards = expandSuggestedPartsToSkuCards(matchRow.suggestedParts.filter(Boolean));
  return [...cards].sort((a, b) => b.parentPart.matchConfidence - a.parentPart.matchConfidence);
}

export function bestMatchReviewSkuCard(matchRow: BomMatchResult): SkuMatchCardItem | undefined {
  return buildMatchReviewSkuCards(matchRow)[0];
}

export function matchRowMatchesSkuCard(row: BomMatchResult, item: SkuMatchCardItem): boolean {
  if (item.variantId) return row.selectedVariantId === item.variantId;
  return (
    row.topMatch?.partNumber === item.catalogPart.partNumber &&
    row.matchLevel === 'sku' &&
    !row.selectedVariantId
  );
}

/** Pre-select highest-confidence SKU when the row has suggestions but no concrete pick yet. */
export function rowNeedsBestSkuAutoSelect(row: BomMatchResult): boolean {
  if (row.lineStatus !== 'pending') return false;
  const cards = buildMatchReviewSkuCards(row);
  if (cards.length === 0) return false;
  const best = cards[0];
  if (matchRowMatchesSkuCard(row, best)) return false;
  if (row.matchLevel === 'sku' && row.topMatch && cards.some((card) => matchRowMatchesSkuCard(row, card))) {
    return false;
  }
  return true;
}

export function applySkuCardToMatchRow(row: BomMatchResult, item: SkuMatchCardItem): BomMatchResult {
  if (item.variantId) {
    const figure =
      item.catalogPart.figureNumber ?? item.parentPart.figureNumber ?? item.parentPart.partNumber;
    const variant = getSkuVariantsForFigure(figure).find((entry) => entry.id === item.variantId);
    if (variant) {
      return applyVariantToMatch({ ...row, topMatch: item.parentPart }, variant);
    }
  }
  return {
    ...row,
    topMatch: item.catalogPart,
    figureNumber: item.catalogPart.figureNumber ?? item.catalogPart.partNumber,
    matchLevel: 'sku',
    selectedVariantId: undefined,
    source: row.source === 'manual' ? 'manual' : 'auto',
  };
}

export function groupMatchReviewSkuCardsByTier(
  cards: SkuMatchCardItem[],
): Record<ReviewSkuConfidenceTier, SkuMatchCardItem[]> {
  const grouped: Record<ReviewSkuConfidenceTier, SkuMatchCardItem[]> = {
    high: [],
    medium: [],
    low: [],
  };
  for (const card of cards) {
    grouped[reviewSkuConfidenceTier(card.parentPart.matchConfidence)].push(card);
  }
  return grouped;
}

export function matchReviewHasMixedConfidenceTiers(cards: SkuMatchCardItem[]): boolean {
  const tiers = new Set(cards.map((card) => reviewSkuConfidenceTier(card.parentPart.matchConfidence)));
  return tiers.size > 1;
}

/** Expand matcher suggestions to sellable SKU cards — no figure-only rows. */
export function expandSuggestedPartsToSkuCards(candidates: AscCatalogPart[]): SkuMatchCardItem[] {
  const seen = new Set<string>();
  const items: SkuMatchCardItem[] = [];

  for (const part of candidates) {
    const figure = part.figureNumber ?? part.partNumber;
    const variants = getSkuVariantsForFigure(figure);

    if (variants.length > 0 && isFigureOnlyCatalogPart(part)) {
      for (const variant of variants) {
        if (seen.has(variant.sku)) continue;
        seen.add(variant.sku);
        items.push({
          key: variant.id,
          variantId: variant.id,
          catalogPart: variantToCatalogPart(variant, part),
          parentPart: part,
        });
      }
      continue;
    }

    const skuKey = part.partNumber;
    if (seen.has(skuKey)) continue;
    seen.add(skuKey);
    const matchedVariant = variants.find((variant) => variant.sku === part.partNumber);
    items.push({
      key: matchedVariant?.id ?? skuKey,
      variantId: matchedVariant?.id,
      catalogPart: {
        ...part,
        matchLevel: 'sku',
        figureNumber: figure,
      },
      parentPart: part,
    });
  }

  return items;
}

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

/** Card title when the suggestion is a product family, not an exact SKU. */
export function figureLevelMatchCardTitle(description: string): string {
  const base = description.trim();
  if (!base) return 'Product family match — select SKU variant';
  return `${base} — select SKU variant`;
}

/** Inline copy explaining why the user must pick a SKU variant (James / Matt feedback). */
export function figureLevelMatchExplanation(figureNumber: string, optionCount: number): string {
  const figure = figureNumber.trim();
  if (optionCount > 0) {
    return `We matched your part to figure ${figure}. This is a product family — choose one of ${optionCount} sellable SKU option${optionCount === 1 ? '' : 's'} below before you confirm.`;
  }
  return `We matched your part to figure ${figure}. Pick the exact SKU variant before you confirm this line.`;
}

/** Short hint for matching table rows that still need a SKU. */
export function figureLevelMatchTableHint(): string {
  return 'Product family match — pick the exact SKU variant to finish this line.';
}

function bestHighConfidenceSkuCard(row: BomMatchResult): SkuMatchCardItem | undefined {
  const cards = expandSuggestedPartsToSkuCards(row.suggestedParts.filter(Boolean));
  const highCards = cards.filter((card) => matchScoreBand(card.parentPart.matchConfidence) === 'high');
  if (highCards.length === 0) return undefined;
  return highCards.reduce((best, card) =>
    card.parentPart.matchConfidence > best.parentPart.matchConfidence ? card : best,
  );
}

function resolveAutoAcceptedRow(row: BomMatchResult, best: SkuMatchCardItem): BomMatchResult {
  let resolved: BomMatchResult = { ...row, topMatch: best.parentPart };

  if (best.variantId) {
    const figure =
      best.catalogPart.figureNumber ?? best.parentPart.figureNumber ?? best.parentPart.partNumber;
    const variant = getSkuVariantsForFigure(figure).find((entry) => entry.id === best.variantId);
    if (variant) {
      resolved = applyVariantToMatch(resolved, variant);
    } else {
      resolved = {
        ...resolved,
        topMatch: best.catalogPart,
        matchLevel: 'sku',
        figureNumber: best.catalogPart.figureNumber ?? best.catalogPart.partNumber,
        selectedVariantId: best.variantId,
      };
    }
  } else {
    resolved = {
      ...resolved,
      topMatch: best.catalogPart,
      matchLevel: 'sku',
      figureNumber: best.catalogPart.figureNumber ?? best.catalogPart.partNumber,
      selectedVariantId: undefined,
    };
  }

  return { ...resolved, lineStatus: 'accepted', source: 'auto' };
}

export function rowHasHighConfidenceAutoMatch(row: BomMatchResult): boolean {
  if (row.lineStatus !== 'pending') return false;
  return bestHighConfidenceSkuCard(row) != null;
}

export function countHighConfidenceAutoMatchableRows(results: BomMatchResult[]): number {
  return results.filter(rowHasHighConfidenceAutoMatch).length;
}

/** Accept highest-score high-confidence SKU per pending row; skip medium/low or unmatched lines. */
export function applyAutoMatchHighConfidence(results: BomMatchResult[]): BomMatchResult[] {
  return results.map((row) => {
    if (row.lineStatus !== 'pending') return row;
    const best = bestHighConfidenceSkuCard(row);
    if (!best) return { ...row, lineStatus: 'skipped' as const };
    return resolveAutoAcceptedRow(row, best);
  });
}

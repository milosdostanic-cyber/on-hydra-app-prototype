import type { BomParsingReviewColumnProfile } from './data/types';

/** Must match `SKIP_VALUE` on `BomFieldMappingPage`. */
export const BOM_FIELD_SKIP_VALUE = '--Skip--';

export function normalizeFieldMappingSkip(val: string | undefined): string | undefined {
  if (!val || val === BOM_FIELD_SKIP_VALUE || val === '— Skip —') return undefined;
  return val;
}

/** Which parsing-review table variant to show based on field mapping (Figma 03a / 03b / 03c). */
export function parsingReviewColumnProfile(
  fieldMapping: Record<string, string | undefined> | undefined,
): BomParsingReviewColumnProfile {
  const map = fieldMapping ?? {};
  const hasDescription = Boolean(normalizeFieldMappingSkip(map.DESCRIPTION));
  const hasSku = Boolean(normalizeFieldMappingSkip(map.SKU));
  const hasUpc = Boolean(normalizeFieldMappingSkip(map.UPC));

  if (hasDescription) return 'description';
  if (hasUpc && !hasDescription) return 'upc';
  if (hasSku) return 'sku-only';
  return 'description';
}

export function countMappedAscFields(fieldMapping: Record<string, string | undefined> | undefined): number {
  if (!fieldMapping) return 0;
  return Object.values(fieldMapping).filter((v) => Boolean(normalizeFieldMappingSkip(v))).length;
}

export const ASC_FIELD_MAPPING_TOTAL = 13;

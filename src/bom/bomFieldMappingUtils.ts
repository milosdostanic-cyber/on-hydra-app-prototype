import type { BomParsingReviewColumnProfile } from './data/types';

function normalizeSkip(val: string | undefined): string | undefined {
  if (!val || val === '— Skip —') return undefined;
  return val;
}

/** Which parsing-review table variant to show based on field mapping (Figma 03a / 03b / 03c). */
export function parsingReviewColumnProfile(
  fieldMapping: Record<string, string | undefined> | undefined,
): BomParsingReviewColumnProfile {
  const map = fieldMapping ?? {};
  const hasDescription = Boolean(normalizeSkip(map.DESCRIPTION));
  const hasSku = Boolean(normalizeSkip(map.SKU));
  const hasUpc = Boolean(normalizeSkip(map.UPC));

  if (hasDescription) return 'description';
  if (hasUpc && !hasDescription) return 'upc';
  if (hasSku) return 'sku-only';
  return 'description';
}

export function countMappedAscFields(fieldMapping: Record<string, string | undefined> | undefined): number {
  if (!fieldMapping) return 0;
  return Object.values(fieldMapping).filter((v) => Boolean(normalizeSkip(v))).length;
}

export const ASC_FIELD_MAPPING_TOTAL = 11;

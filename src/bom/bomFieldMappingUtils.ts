import {
  ASC_DEST_FIELDS,
  BOM_CONCATENATED_SOURCE_COLUMN,
  BOM_FIELD_SKIP_VALUE,
  DEFAULT_FIELD_MAPPING,
  type BomFieldAliasMap,
} from './bomFieldMappingConfig';
import type { BomParsingReviewColumnProfile } from './data/types';

export { BOM_FIELD_SKIP_VALUE } from './bomFieldMappingConfig';

export type BomMappingConfidence = 'high' | 'partial' | 'blocked';

export type MappingSummaryEntry = {
  ascKey: string;
  ascLabel: string;
  bomColumn: string;
  isMapped: boolean;
  isRequired: boolean;
};

/** ASC fields where at least one must be linked before parsing (Description, SKU, or UPC). */
export const PARSING_IDENTIFIER_FIELD_KEYS = ['DESCRIPTION', 'SKU', 'UPC'] as const;

/** Used for required indicators in mapping tables (mirrors {@link hasRequiredFieldMapping}). */
export const REQUIRED_ASC_FIELD_KEYS = new Set<string>(PARSING_IDENTIFIER_FIELD_KEYS);

export const PARSING_IDENTIFIER_MAPPING_TOOLTIP =
  'You need at least Description, SKU or UPC column';

export function hasParsingIdentifierMapping(fieldMapping: BomFieldAliasMap): boolean {
  return PARSING_IDENTIFIER_FIELD_KEYS.some((key) =>
    Boolean(normalizeFieldMappingSkip(fieldMapping[key])),
  );
}

export function normalizeFieldMappingSkip(val: string | undefined): string | undefined {
  if (!val || val === BOM_FIELD_SKIP_VALUE || val === '— Skip —') return undefined;
  return val;
}

export function deriveDefaultFieldMapping(): BomFieldAliasMap {
  return { ...DEFAULT_FIELD_MAPPING };
}

/** True when the uploaded file is a single concatenated column (demo: filename pattern). */
export function isConcatenatedColumnUpload(fileName?: string): boolean {
  return /single|one-?col|concat|combined/i.test(fileName?.trim() ?? '');
}

function concatenatedColumnFieldMapping(): BomFieldAliasMap {
  const skip = BOM_FIELD_SKIP_VALUE;
  return {
    'PART NUMBER': skip,
    DESCRIPTION: BOM_CONCATENATED_SOURCE_COLUMN,
    SKU: skip,
    UPC: skip,
    'FIGURE NUM': skip,
    FINISH: skip,
    'MFR NUM': skip,
    'INSTALL TYPE': skip,
    MANUFACTURER: skip,
    QTY: skip,
    BRAND: skip,
    MATERIAL: skip,
    UNIT: skip,
  };
}

/**
 * Simulates what a real auto-mapper finds on a first-time upload: common column names like
 * Description, Figure Number, Manufacturer and Finish are recognised, but Part Number and
 * Quantity are not found because customer files typically use non-standard names for those
 * (e.g. "Item No", "item_number", "qty ordered"). This produces 'blocked' confidence so the
 * user is sent to Review Columns before they can proceed.
 */
function autoDetectedFieldMapping(): BomFieldAliasMap {
  const skip = BOM_FIELD_SKIP_VALUE;
  return {
    'PART NUMBER': skip,        // not auto-detected — customer files vary widely
    DESCRIPTION: 'DESCRIPTION', // recognised ✓
    SKU: skip,
    UPC: skip,
    'FIGURE NUM': 'FIGURE NUM', // recognised ✓
    FINISH: 'FINISH',           // recognised ✓
    'MFR NUM': skip,
    'INSTALL TYPE': skip,
    MANUFACTURER: 'MANUFACTURER', // recognised ✓
    QTY: skip,                  // not auto-detected — too many variants (qty, quantity, qty_ord)
    BRAND: skip,
    MATERIAL: 'MATERIAL',       // recognised ✓
    UNIT: skip,
  };
}

export function deriveFieldMappingForUpload(
  fileName?: string,
  saved?: BomFieldAliasMap,
): BomFieldAliasMap {
  const hasSavedMappings =
    saved &&
    Object.values(saved).some((v) => Boolean(normalizeFieldMappingSkip(v)));
  if (hasSavedMappings) {
    return resolveFieldMapping(saved);
  }
  if (isConcatenatedColumnUpload(fileName)) {
    return concatenatedColumnFieldMapping();
  }
  return autoDetectedFieldMapping();
}

export function resolveFieldMapping(saved?: BomFieldAliasMap): BomFieldAliasMap {
  if (saved && Object.keys(saved).length > 0) {
    return { ...DEFAULT_FIELD_MAPPING, ...saved };
  }
  return deriveDefaultFieldMapping();
}

export function isConcatenatedFieldMapping(fieldMapping: BomFieldAliasMap): boolean {
  const description = normalizeFieldMappingSkip(fieldMapping.DESCRIPTION);
  if (description !== BOM_CONCATENATED_SOURCE_COLUMN) return false;
  return (
    !normalizeFieldMappingSkip(fieldMapping['PART NUMBER']) &&
    !normalizeFieldMappingSkip(fieldMapping.QTY)
  );
}

export function hasRequiredFieldMapping(fieldMapping: BomFieldAliasMap): boolean {
  return hasParsingIdentifierMapping(fieldMapping);
}

/** User-facing labels when no parsing identifier column is linked. */
export function getMissingRequiredFieldLabels(fieldMapping: BomFieldAliasMap): string[] {
  if (hasParsingIdentifierMapping(fieldMapping)) return [];
  return ['Description, SKU or UPC'];
}

export function findDuplicateBomColumns(fieldMapping: BomFieldAliasMap): Set<string> {
  const counts = new Map<string, number>();
  for (const v of Object.values(fieldMapping)) {
    const normalized = normalizeFieldMappingSkip(v);
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([col]) => col));
}

export function evaluateMappingConfidence(fieldMapping: BomFieldAliasMap): BomMappingConfidence {
  const duplicates = findDuplicateBomColumns(fieldMapping);
  if (!hasRequiredFieldMapping(fieldMapping) || duplicates.size > 0) {
    return 'blocked';
  }
  if (isConcatenatedFieldMapping(fieldMapping)) return 'partial';
  const mappedCount = countMappedAscFields(fieldMapping);
  if (mappedCount >= 8) return 'high';
  return 'partial';
}

export function buildMappingSummaryEntries(fieldMapping: BomFieldAliasMap): MappingSummaryEntry[] {
  return ASC_DEST_FIELDS.map(({ key, label }) => {
    const bomColumn = normalizeFieldMappingSkip(fieldMapping[key]) ?? '';
    return {
      ascKey: key,
      ascLabel: label,
      bomColumn,
      isMapped: Boolean(bomColumn),
      isRequired: REQUIRED_ASC_FIELD_KEYS.has(key),
    };
  }).filter((entry) => entry.isMapped);
}

export function bomMappingSummaryRoute(bomProjectId: string): string {
  return `/bom/projects/${bomProjectId}/mapping-summary`;
}

export function bomAdvancedFieldMappingRoute(bomProjectId: string): string {
  return `/bom/projects/${bomProjectId}/field-mapping`;
}

export function mappingConfidenceLabel(confidence: BomMappingConfidence): string {
  switch (confidence) {
    case 'high':
      return 'High confidence';
    case 'partial':
      return 'Some columns need review';
    case 'blocked':
      return 'Required fields missing';
    default:
      return confidence;
  }
}

/** Which parsing-review table variant to show based on field mapping (Figma 03a / 03b / 03c). */
export function isAscFieldMapped(
  fieldMapping: Record<string, string | undefined> | undefined,
  ascKey: string,
): boolean {
  if (!fieldMapping) return true;
  return Boolean(normalizeFieldMappingSkip(fieldMapping[ascKey]));
}

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

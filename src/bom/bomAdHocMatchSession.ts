import { ASC_FIELD_MAPPING_TOTAL } from './bomFieldMappingUtils';
import { suggestedAscPartForRow } from './bomWorkspaceHelpers';
import { getSkuVariantsForFigure } from './data/ascSkuVariants';
import { mockAscParts } from './data/mockData';
import type { BomItem, BomMatchLevel, BomMatchResult } from './data/types';
import {
  createImportSession,
  updateImportSession,
  type BomImportSession,
} from './bomImportProgressState';

const ADHOC_MATCH_KEYWORDS = [
  'coupling',
  'firelock',
  'firelok',
  'sprinkler',
  'valve',
  'grooved',
  'tyco',
  'victaulic',
  'pump',
  'head',
];

function buildAdHocParsedItem(originalInput: string): BomItem {
  const trimmed = originalInput.trim();
  const id = `adhoc-${Date.now()}`;
  return {
    id,
    rowNumber: 1,
    originalInput: trimmed,
    parsedDescription: trimmed,
    size: '',
    pressureClass: '',
    connectionType: '',
    quantity: 1,
    confidence: 'medium',
    matchSource: 'manual',
  };
}

export function buildAdHocMatchResult(item: BomItem): BomMatchResult {
  const text = item.originalInput.toLowerCase();
  const hasSignal = ADHOC_MATCH_KEYWORDS.some((keyword) => text.includes(keyword));

  if (!hasSignal) {
    return {
      itemId: item.id,
      originalRequest: item.originalInput,
      suggestedParts: [],
      lineStatus: 'pending',
      source: 'auto',
    };
  }

  const top = suggestedAscPartForRow(item);
  const figure = top.figureNumber ?? top.partNumber;
  const variantCount = getSkuVariantsForFigure(figure).length;
  const matchLevel: BomMatchLevel = variantCount > 0 ? 'figure' : (top.matchLevel ?? 'sku');
  const suggested = [top, ...mockAscParts.filter((part) => part.partNumber !== top.partNumber)].slice(0, 3);

  return {
    itemId: item.id,
    originalRequest: item.originalInput,
    suggestedParts: suggested,
    topMatch: top,
    lineStatus: 'pending',
    source: 'auto',
    matchLevel,
    figureNumber: figure,
  };
}

/** One-line competitor / manual entry routed through guided BOM matching. */
export function createAdHocCompetitorMatchSession(
  bomProjectId: string,
  originalInput: string,
): BomImportSession {
  const parsedItem = buildAdHocParsedItem(originalInput);
  const matchResults = [buildAdHocMatchResult(parsedItem)];

  const session = createImportSession(bomProjectId, 'Manual entry');
  return (
    updateImportSession(session.uploadId, {
      currentStep: 'match',
      mappedAscFields: ASC_FIELD_MAPPING_TOTAL,
      totalRows: 1,
      parsedRows: 1,
      parsedItems: [parsedItem],
      matchResults,
      acceptedCount: 0,
      skippedCount: 0,
      manualCount: 0,
      matchedRows: 0,
    }) ?? session
  );
}

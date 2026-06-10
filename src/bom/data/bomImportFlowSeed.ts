import type { BomItem, BomMatchResult, BomMatchScoreBand } from './types';
import { mockAscParts } from './mockData';

export const PARSING_REVIEW_MIN_ROWS = 6;
export const PARSING_REVIEW_MAX_ROWS = 10;

type ParsingReviewTemplate = Omit<BomItem, 'id' | 'rowNumber'>;

/** Archetype rows cycled when simulating parse results from an uploaded file. */
const PARSING_REVIEW_TEMPLATES: ParsingReviewTemplate[] = [
  {
    originalInput: 'Victaulic 005 coupling 4" grooved',
    parsedDescription: 'FireLock coupling, grooved',
    sku: 'Grooved',
    size: '4 inch',
    pressureClass: '300 PSI',
    connectionType: 'Grooved',
    manufacturer: 'Victaulic',
    figureNumber: 'FP7450',
    upc: '123456',
    quantity: 24,
    confidence: 'high',
  },
  {
    originalInput: 'Tyco TY3251 sprinkler head 155F',
    parsedDescription: '',
    sku: '',
    size: '1/2 inch',
    pressureClass: '175 PSI',
    connectionType: 'Threaded',
    manufacturer: 'Tyco',
    figureNumber: 'ASC-SR-155-TH',
    upc: '',
    quantity: 180,
    confidence: 'medium',
  },
  {
    originalInput: 'Gate valve 6in flanged 150lb',
    parsedDescription: 'Gate valve, flanged',
    sku: 'Flanged',
    size: '6 inch',
    pressureClass: '150 PSI',
    connectionType: 'Flanged',
    manufacturer: 'Generic',
    figureNumber: 'GV-600-FL',
    upc: '345678',
    quantity: 12,
    confidence: 'high',
  },
  {
    originalInput: 'Red pipe 2.5 sch40',
    parsedDescription: 'Fire protection pipe',
    sku: '',
    size: '',
    pressureClass: '',
    connectionType: '',
    manufacturer: '',
    figureNumber: '',
    upc: '',
    quantity: 450,
    confidence: 'low',
  },
  {
    originalInput: 'Check valve 4" grooved type',
    parsedDescription: 'Check valve, grooved',
    sku: 'Grooved',
    size: '4 inch',
    pressureClass: '300 PSI',
    connectionType: 'Grooved',
    manufacturer: 'Victaulic',
    figureNumber: 'CV-400-GR',
    upc: '567890',
    quantity: 6,
    confidence: 'high',
  },
  {
    originalInput: 'Flexible drop 1in victaulic style',
    parsedDescription: 'Flexible drop assembly',
    sku: '',
    size: '1 inch',
    pressureClass: '300 PSI',
    connectionType: 'Grooved',
    manufacturer: '',
    figureNumber: '',
    upc: '678901',
    quantity: 32,
    confidence: 'medium',
  },
  {
    originalInput: 'Angle hose valve 2.5 npt',
    parsedDescription: 'Angle hose valve, threaded',
    sku: 'Threaded',
    size: '2.5 inch',
    pressureClass: '175 PSI',
    connectionType: 'Threaded',
    manufacturer: 'ASC',
    figureNumber: 'AHV-250-TH',
    upc: '789012',
    quantity: 8,
    confidence: 'high',
  },
  {
    originalInput: 'misc coupling part',
    parsedDescription: '',
    sku: '',
    size: '',
    pressureClass: '',
    connectionType: '',
    manufacturer: '',
    figureNumber: '',
    upc: '',
    quantity: 15,
    confidence: 'low',
  },
  {
    originalInput: 'Grooved tee 4 inch',
    parsedDescription: '',
    sku: 'Grooved',
    size: '4 inch',
    pressureClass: '300 PSI',
    connectionType: 'Grooved',
    manufacturer: '',
    figureNumber: 'TEE-400-GR',
    upc: '',
    quantity: 20,
    confidence: 'medium',
  },
  {
    originalInput: 'Rigid coupling 6" groove',
    parsedDescription: 'Rigid coupling, grooved',
    sku: 'Grooved',
    size: '6 inch',
    pressureClass: '300 PSI',
    connectionType: 'Grooved',
    manufacturer: 'Victaulic',
    figureNumber: 'RC-600-GR',
    upc: '890123',
    quantity: 14,
    confidence: 'high',
  },
  {
    originalInput: 'unknown sprinkler escutcheon',
    parsedDescription: '',
    sku: '',
    size: '',
    pressureClass: '',
    connectionType: '',
    manufacturer: '',
    figureNumber: '',
    upc: '',
    quantity: 60,
    confidence: 'low',
  },
  {
    originalInput: 'Alarm check valve 4 flanged',
    parsedDescription: 'Alarm check valve',
    sku: '',
    size: '4 inch',
    pressureClass: '175 PSI',
    connectionType: 'Flanged',
    manufacturer: '',
    figureNumber: '',
    upc: '',
    quantity: 3,
    confidence: 'medium',
  },
];

export function parsedItemsNeedExpansion(parsedItems: BomItem[] | undefined): boolean {
  return !parsedItems?.length || parsedItems.length < PARSING_REVIEW_MIN_ROWS;
}

/** Ensure upload sessions carry 6–10 parsed lines (upgrade undersized legacy demos). */
export function normalizeParsedItemsForUpload(
  parsedItems: BomItem[] | undefined,
  fileName?: string,
): BomItem[] {
  const source = !parsedItemsNeedExpansion(parsedItems)
    ? parsedItems!
    : createParsingReviewRows(fileName);

  if (source.length <= PARSING_REVIEW_MAX_ROWS) {
    return source;
  }

  return source.slice(0, PARSING_REVIEW_MAX_ROWS).map((row, index) => ({
    ...row,
    rowNumber: index + 1,
    id: `item-${index + 1}`,
  }));
}

const PARSING_REVIEW_TEMPLATE_COUNT = PARSING_REVIEW_TEMPLATES.length;

/** Deterministic row count (6–10) from upload file name for prototype demos. */
export function resolveParsingReviewRowCount(fileName?: string): number {
  if (!fileName?.trim()) {
    return 8;
  }
  let hash = 0;
  const normalized = fileName.trim().toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) | 0;
  }
  const span = PARSING_REVIEW_MAX_ROWS - PARSING_REVIEW_MIN_ROWS + 1;
  return PARSING_REVIEW_MIN_ROWS + (Math.abs(hash) % span);
}

/** Simulated parse output after upload — always between 6 and 10 lines per file. */
export function createParsingReviewRows(fileName?: string): BomItem[] {
  const count = resolveParsingReviewRowCount(fileName);
  return Array.from({ length: count }, (_, index) => {
    const rowNumber = index + 1;
    const template = PARSING_REVIEW_TEMPLATES[index % PARSING_REVIEW_TEMPLATE_COUNT];
    const isRepeat = index >= PARSING_REVIEW_TEMPLATE_COUNT;
    return {
      ...template,
      id: `item-${rowNumber}`,
      rowNumber,
      originalInput: isRepeat ? `${template.originalInput} (row ${rowNumber})` : template.originalInput,
      quantity: Math.max(1, template.quantity + ((rowNumber % 5) - 2)),
    };
  });
}

export function matchScoreBand(confidence: number): BomMatchScoreBand {
  if (confidence >= 90) return 'high';
  if (confidence >= 70) return 'medium';
  if (confidence > 0) return 'low';
  return 'processing';
}

export function matchScoreLabel(
  source: BomMatchResult['source'],
  confidence: number | undefined,
): string {
  if (source === 'manual') return 'Added manually';
  const band = matchScoreBand(confidence ?? 0);
  return band.charAt(0).toUpperCase() + band.slice(1);
}

function withConfidence(part: (typeof mockAscParts)[number], matchConfidence: number) {
  return { ...part, matchConfidence };
}

function parsingReviewTemplateKey(item: BomItem): string {
  const templateIndex = ((item.rowNumber - 1) % PARSING_REVIEW_TEMPLATE_COUNT) + 1;
  return `item-${templateIndex}`;
}

/** Demo match rows — keyed by template archetype so expanded uploads stay consistent. */
function matchForItem(item: BomItem): BomMatchResult {
  const pool = mockAscParts;
  const base = (
    top: (typeof pool)[number] | undefined,
    suggested: typeof pool,
    lineStatus: BomMatchResult['lineStatus'],
    source: BomMatchResult['source'] = 'auto',
    extra?: Partial<BomMatchResult>,
  ): BomMatchResult => ({
    itemId: item.id,
    originalRequest: item.originalInput,
    suggestedParts: suggested.slice(0, 3),
    topMatch: top,
    lineStatus,
    source,
    ...extra,
  });

  switch (parsingReviewTemplateKey(item)) {
    case 'item-1': {
      const top = withConfidence(
        { ...pool[0], matchLevel: 'sku', figureNumber: 'FP7450', partNumber: '4371000570' },
        94,
      );
      if (item.rowNumber === 1) {
        return base(top, pool, 'accepted', 'auto', {
          matchLevel: 'sku',
          figureNumber: 'FP7450',
          selectedVariantId: 'fl-400-g-sku',
        });
      }
      return base(top, [top, ...pool.filter((p) => p.partNumber !== top.partNumber)], 'pending', 'auto', {
        matchLevel: 'sku',
        figureNumber: 'FP7450',
      });
    }
    case 'item-2': {
      const top = withConfidence(
        {
          ...pool[1],
          matchLevel: 'figure',
          figureNumber: 'ASC-SR-155-TH',
          partNumber: 'ASC-SR-155-TH',
          description: 'Standard Response Sprinkler family — select SKU variant',
        },
        92,
      );
      return base(top, [top, ...pool.filter((p) => p.partNumber !== top.partNumber)], 'pending', 'auto', {
        matchLevel: 'figure',
        figureNumber: 'ASC-SR-155-TH',
      });
    }
    case 'item-3': {
      const top = withConfidence(
        {
          ...pool[2],
          matchLevel: 'figure',
          figureNumber: 'ASC-GV-600-FL',
          partNumber: 'ASC-GV-600-FL',
          description: 'Gate Valve family (Class 150) — select SKU variant',
        },
        78,
      );
      return base(top, [top, ...pool.filter((p) => p.partNumber !== top.partNumber)], 'pending', 'auto', {
        matchLevel: 'figure',
        figureNumber: 'ASC-GV-600-FL',
      });
    }
    case 'item-4':
    case 'item-8':
    case 'item-11':
      return base(undefined, [], 'pending');
    case 'item-5': {
      const top = withConfidence(
        { ...pool[0], matchLevel: 'sku', figureNumber: 'CV-400-GR', partNumber: '4371000570' },
        91,
      );
      if (item.rowNumber === 5) {
        return base(top, [top, ...pool.filter((p) => p.partNumber !== top.partNumber)], 'accepted', 'manual', {
          matchLevel: 'sku',
          figureNumber: 'CV-400-GR',
          selectedVariantId: 'cv-400-gr-sku',
        });
      }
      return base(top, [top, ...pool.filter((p) => p.partNumber !== top.partNumber)], 'pending', 'auto', {
        matchLevel: 'sku',
        figureNumber: 'CV-400-GR',
      });
    }
    default: {
      const top = withConfidence(pool[0], 88);
      return base(top, pool, 'pending');
    }
  }
}

export function createInitialMatchResults(parsedItems: BomItem[]): BomMatchResult[] {
  return parsedItems.map(matchForItem);
}

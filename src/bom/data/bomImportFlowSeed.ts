import type { BomItem, BomMatchResult, BomMatchScoreBand } from './types';
import { mockAscParts } from './mockData';

/** Parsing review rows aligned with Figma 03a sample (5 items). */
export function createParsingReviewRows(): BomItem[] {
  return [
    {
      id: 'item-1',
      rowNumber: 1,
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
      id: 'item-2',
      rowNumber: 2,
      originalInput: 'Tyco TY3251 sprinkler head 155F',
      parsedDescription: '',
      sku: 'Threaded',
      size: '1/2 inch',
      pressureClass: '175 PSI',
      connectionType: 'Threaded',
      manufacturer: 'Tyco',
      figureNumber: 'ASC-SR-155-TH',
      upc: '234567',
      quantity: 180,
      confidence: 'medium',
    },
    {
      id: 'item-3',
      rowNumber: 3,
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
      id: 'item-4',
      rowNumber: 4,
      originalInput: 'Red pipe 2.5 sch40',
      parsedDescription: 'Fire protection pipe',
      sku: 'Threaded',
      size: '2.5 inch',
      pressureClass: '',
      connectionType: '',
      manufacturer: 'Generic',
      figureNumber: 'ASC-PIPE-2.5-S40',
      upc: '456789',
      quantity: 450,
      confidence: 'low',
    },
    {
      id: 'item-5',
      rowNumber: 5,
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
  ];
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

/** Demo rows aligned with Figma 12 Matching Results (mixed scores + statuses). */
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

  switch (item.id) {
    case 'item-1': {
      const top = withConfidence(
        { ...pool[0], matchLevel: 'sku', figureNumber: 'FP7450', partNumber: '4371000570' },
        94,
      );
      return base(top, pool, 'accepted', 'auto', {
        matchLevel: 'sku',
        figureNumber: 'FP7450',
        selectedVariantId: 'fl-400-g-sku',
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
      return base(undefined, [], 'pending');
    case 'item-5': {
      const top = withConfidence(
        { ...pool[0], matchLevel: 'sku', figureNumber: 'CV-400-GR', partNumber: '4371000570' },
        91,
      );
      return base(top, [top, ...pool.filter((p) => p.partNumber !== top.partNumber)], 'accepted', 'manual', {
        matchLevel: 'sku',
        figureNumber: 'CV-400-GR',
        selectedVariantId: 'cv-400-gr-sku',
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

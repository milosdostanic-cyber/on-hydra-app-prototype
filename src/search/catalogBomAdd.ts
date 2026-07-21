import type { BomItem } from '../bom/data/types';

export type CatalogBomPartInput = {
  partKey: string;
  sku: string;
  displayName: string;
  figureNumber?: string;
};

export function buildCatalogBomItem(input: CatalogBomPartInput, existingRowCount: number): BomItem {
  const rowNumber = existingRowCount + 1;
  return {
    id: `catalog-${input.partKey}-${Date.now()}`,
    rowNumber,
    originalInput: input.displayName,
    parsedDescription: input.displayName,
    figureNumber: input.figureNumber ?? input.partKey,
    sku: input.sku,
    size: '—',
    pressureClass: '—',
    connectionType: '—',
    quantity: 1,
    unit: 'EA',
    confidence: 'high',
    matchSource: 'manual',
    status: 'confirmed',
  };
}

export function isSkuInBomRows(rows: BomItem[], sku: string): boolean {
  return rows.some((row) => row.sku === sku);
}

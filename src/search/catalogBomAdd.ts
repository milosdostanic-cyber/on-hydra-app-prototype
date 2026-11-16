import type { BomItem } from '../bom/data/types';
import type { PartVariationRow } from './partDetailDemoData';

export type CatalogBomPartInput = {
  partKey: string;
  sku: string;
  displayName: string;
  figureNumber?: string;
};

export function buildCatalogBomItem(
  input: CatalogBomPartInput,
  existingRowCount: number,
  idSuffix?: string,
): BomItem {
  const rowNumber = existingRowCount + 1;
  const stamp = idSuffix ?? `${Date.now()}`;
  return {
    id: `catalog-${input.partKey}-${stamp}`,
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

export function partFromVariation(variation: PartVariationRow): CatalogBomPartInput {
  const label = variation.name || variation.description || variation.sku;
  return {
    partKey: variation.key,
    sku: variation.sku,
    displayName: label === variation.sku ? variation.sku : `${variation.sku} — ${label}`,
  };
}

/** Append nonduplicate SKUs with sequential row numbers and unique ids. */
export function appendCatalogBomItems(
  existingRows: BomItem[],
  parts: CatalogBomPartInput[],
): { nextRows: BomItem[]; added: BomItem[]; skippedSkus: string[] } {
  const nextRows = [...existingRows];
  const added: BomItem[] = [];
  const skippedSkus: string[] = [];
  const stamp = Date.now();

  parts.forEach((part, index) => {
    if (isSkuInBomRows(nextRows, part.sku)) {
      skippedSkus.push(part.sku);
      return;
    }
    const row = buildCatalogBomItem(part, nextRows.length, `${stamp}-${index}`);
    nextRows.push(row);
    added.push(row);
  });

  return { nextRows, added, skippedSkus };
}

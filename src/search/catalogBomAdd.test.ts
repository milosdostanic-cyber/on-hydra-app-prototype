import {
  appendCatalogBomItems,
  buildCatalogBomItem,
  isSkuInBomRows,
} from './catalogBomAdd';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/** Pure helper coverage — invoke via `npx tsx -e "import('./src/search/catalogBomAdd.test.ts').then(m => console.log(m.runCatalogBomAddTests()))"`. */
export function runCatalogBomAddTests() {
  const base = buildCatalogBomItem(
    { partKey: 'v1', sku: 'SKU-1', displayName: 'SKU-1 — One' },
    0,
    'a',
  );
  assert(base.rowNumber === 1, 'First row number must be 1');
  assert(base.id.includes('v1'), 'Row id must include part key');

  const { added, skippedSkus, nextRows } = appendCatalogBomItems([base], [
    { partKey: 'v1', sku: 'SKU-1', displayName: 'dup' },
    { partKey: 'v2', sku: 'SKU-2', displayName: 'SKU-2 — Two' },
    { partKey: 'v3', sku: 'SKU-3', displayName: 'SKU-3 — Three' },
  ]);

  assert(skippedSkus.length === 1 && skippedSkus[0] === 'SKU-1', 'Duplicate SKU must be skipped');
  assert(added.length === 2, 'Two unique SKUs must be added');
  assert(nextRows.length === 3, 'Result must keep existing plus added rows');
  assert(added[0].rowNumber === 2 && added[1].rowNumber === 3, 'Row numbers must be sequential');
  assert(added[0].id !== added[1].id, 'Batch row ids must be unique');
  assert(isSkuInBomRows(nextRows, 'SKU-2'), 'Added SKU must be detectable');

  return { added: added.length, skipped: skippedSkus.length, total: nextRows.length };
}

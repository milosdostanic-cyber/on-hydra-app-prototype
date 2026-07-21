/** Extract search partKey from catalog-added BOM row ids (`catalog-{partKey}-{timestamp}`). */
export function partKeyFromCatalogRowId(rowId: string): string | undefined {
  if (!rowId.startsWith('catalog-')) return undefined;
  const body = rowId.slice('catalog-'.length);
  const tsSep = body.lastIndexOf('-');
  if (tsSep <= 0) return undefined;
  const maybeTs = body.slice(tsSep + 1);
  if (!/^\d+$/.test(maybeTs)) return undefined;
  return body.slice(0, tsSep);
}

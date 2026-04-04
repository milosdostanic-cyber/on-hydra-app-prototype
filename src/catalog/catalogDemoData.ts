export type CatalogPartRow = { key: string; sku: string; description: string };

/** Stub catalog rows — shared by landing preview, results, and part page metadata. */
export const CATALOG_DEMO_PARTS: CatalogPartRow[] = [
  { key: 'p-100', sku: '100-A', description: 'Demo fixture — open part page' },
  { key: 'p-200', sku: '200-B', description: 'Another demo row' },
];

/** Quick category chips on catalog home (stub taxonomy). */
export const CATALOG_QUICK_CATEGORIES = ['Fixtures', 'Supports', 'Finishes', 'Fasteners'] as const;

export function catalogPartByKey(partKey: string): CatalogPartRow | undefined {
  return CATALOG_DEMO_PARTS.find((p) => p.key === partKey);
}

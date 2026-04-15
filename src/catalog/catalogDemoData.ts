export type CatalogPartRow = { key: string; sku: string; description: string };

/** Stub catalog rows — shared by landing preview, results, and part page metadata. */
export const CATALOG_DEMO_PARTS: CatalogPartRow[] = [
  { key: 'p-100', sku: '100-A', description: 'Demo fixture — open part page' },
  { key: 'p-200', sku: '200-B', description: 'Another demo row' },
  { key: 'p-300', sku: '300-C', description: 'Grooved coupling 4 inch FireLock style 005' },
  { key: 'p-400', sku: '400-D', description: 'Standard response sprinkler head 155F pendent' },
  { key: 'p-500', sku: '500-E', description: 'Gate valve flanged class 150 6 inch' },
  { key: 'p-600', sku: '600-F', description: 'Threaded rod seismic brace hardware kit' },
  { key: 'p-700', sku: '700-G', description: 'Check valve grooved 300 PSI 4 inch' },
  { key: 'p-800', sku: '800-H', description: 'Pipe clamp adjustable for CPVC' },
];

/** Quick category chips on catalog home (stub taxonomy). */
export const CATALOG_QUICK_CATEGORIES = ['Fixtures', 'Supports', 'Finishes', 'Fasteners'] as const;

export function catalogPartByKey(partKey: string): CatalogPartRow | undefined {
  return CATALOG_DEMO_PARTS.find((p) => p.key === partKey);
}

import {
  CATALOG_DEMO_PARTS,
  catalogPartByKey,
  type CatalogPartRow,
} from '../catalog/catalogDemoData';

/**
 * Unified search demo aggregators. Parts are fully wired (real rows linking to part
 * detail); the other domains return stub rows that prove the multi-domain results model
 * without indexing production data. In production these map to the search service across
 * the Content, Submittal, BOM, and SeisBrace modules.
 */
export type SearchDomain = 'parts' | 'content' | 'submittal' | 'bom' | 'seisbrace';

export type UnifiedResultRow = {
  key: string;
  domain: SearchDomain;
  title: string;
  subtitle: string;
  /** Present for `parts` rows — links to `/search/parts/:partKey`. */
  partKey?: string;
};

export const SEARCH_DOMAIN_LABELS: Record<SearchDomain, string> = {
  parts: 'Parts',
  content: 'Content',
  submittal: 'Submittal',
  bom: 'BOM',
  seisbrace: 'SeisBrace',
};

export const SEARCH_DOMAIN_ORDER: SearchDomain[] = [
  'parts',
  'content',
  'submittal',
  'bom',
  'seisbrace',
];

function normalize(query: string): string {
  return query.trim().toLowerCase();
}

function matchesText(haystack: string, q: string): boolean {
  if (!q || q === 'all') return true;
  return haystack.toLowerCase().includes(q);
}

function matchesPart(part: CatalogPartRow, q: string): boolean {
  return (
    matchesText(part.sku, q) ||
    matchesText(part.description, q) ||
    matchesText(part.key, q)
  );
}

function partResults(q: string): UnifiedResultRow[] {
  return CATALOG_DEMO_PARTS.filter((p) => matchesPart(p, q)).map((p) => ({
    key: `parts-${p.key}`,
    domain: 'parts',
    title: p.sku,
    subtitle: p.description,
    partKey: p.key,
  }));
}

/** Stub rows derived from the matching parts so other domains feel coherent in the demo. */
function stubResults(
  domain: Exclude<SearchDomain, 'parts'>,
  q: string,
  build: (part: CatalogPartRow) => { title: string; subtitle: string },
): UnifiedResultRow[] {
  return CATALOG_DEMO_PARTS.filter((p) => matchesPart(p, q))
    .slice(0, 3)
    .map((p) => {
      const { title, subtitle } = build(p);
      return { key: `${domain}-${p.key}`, domain, title, subtitle };
    });
}

export function searchByDomain(query: string): Record<SearchDomain, UnifiedResultRow[]> {
  const q = normalize(query);
  return {
    parts: partResults(q),
    content: stubResults('content', q, (p) => ({
      title: `${p.sku} cut sheet`,
      subtitle: `Spec & installation documents for ${p.description}`,
    })),
    submittal: stubResults('submittal', q, (p) => ({
      title: `${p.sku} submittal line`,
      subtitle: 'Appears in submittal packages that include this part',
    })),
    bom: stubResults('bom', q, (p) => ({
      title: `${p.sku} on BOM`,
      subtitle: 'Bill of materials lines referencing this part',
    })),
    seisbrace: stubResults('seisbrace', q, (p) => ({
      title: `${p.sku} bracing input`,
      subtitle: 'Seismic bracing designs that use this part',
    })),
  };
}

export function searchAll(query: string): UnifiedResultRow[] {
  const byDomain = searchByDomain(query);
  return SEARCH_DOMAIN_ORDER.flatMap((domain) => byDomain[domain]);
}

export function unifiedPartByKey(partKey: string): CatalogPartRow | undefined {
  return catalogPartByKey(partKey);
}

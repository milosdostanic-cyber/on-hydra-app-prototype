import {
  catalogPartByKey,
  type CatalogPartRow,
} from '../catalog/catalogDemoData';
import { initialWorkspaceRowsForBomProject, mockBomProjects } from '../bom/data/mockData';
import type { BomItem } from '../bom/data/types';
import { projectTitleById } from '../shell/projectSeed';
import { SUBMITTAL_PACKAGES_SEED } from '../submittal/data/submittalPackagesMockData';

import { searchGlobal } from './globalSearchIndex';
import type { GlobalSearchResult, SearchEntityType } from './globalSearchModel';

/**
 * Unified search demo aggregators. The full results page and the header typeahead share the
 * same local index so direct lookups and "See all results" stay aligned.
 */
export type SearchDomain =
  | 'parts'
  | 'projects'
  | 'bom'
  | 'submittal'
  | 'seisbrace'
  | 'spec'
  | 'content';

export type UnifiedResultRow = {
  key: string;
  domain: SearchDomain;
  title: string;
  subtitle: string;
  context?: string;
  meta?: string[];
  href: string;
  projectId?: string;
  entityType: SearchEntityType;
  /** Present for `parts` rows — links to `/search/parts/:partKey`. */
  partKey?: string;
  usageContexts?: UnifiedUsageContext[];
};

export type UnifiedUsageContext = {
  module: Extract<SearchDomain, 'bom' | 'submittal' | 'content' | 'seisbrace' | 'spec'>;
  label: string;
  destinationName: string;
  projectName?: string;
  detail?: string;
};

export const SEARCH_DOMAIN_LABELS: Record<SearchDomain, string> = {
  parts: 'Parts',
  projects: 'Projects',
  bom: 'BOM',
  submittal: 'Submittal',
  seisbrace: 'SeisBrace',
  spec: 'Specs',
  content: 'Downloads',
};

export const SEARCH_DOMAIN_ORDER: SearchDomain[] = [
  'parts',
  'projects',
  'bom',
  'submittal',
  'seisbrace',
  'spec',
  'content',
];

const DESCRIPTION_STOP_WORDS = new Set([
  'and',
  'class',
  'demo',
  'fixture',
  'inch',
  'open',
  'page',
  'part',
  'style',
  'the',
  'with',
]);

function normalizeForMatch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function descriptionTokens(value: string): string[] {
  return normalizeForMatch(value)
    .split(' ')
    .filter((token) => token.length > 2 && !DESCRIPTION_STOP_WORDS.has(token));
}

function bomRowMatchesPart(row: BomItem, part: CatalogPartRow): boolean {
  const partIdentifiers = [part.sku, part.key].map(normalizeForMatch);
  const rowIdentifiers = [row.sku, row.figureNumber, row.originalInput]
    .filter((value): value is string => Boolean(value))
    .map(normalizeForMatch);
  if (rowIdentifiers.some((value) => partIdentifiers.includes(value))) return true;

  const partTokens = descriptionTokens(part.description);
  if (partTokens.length === 0) return false;
  const rowText = normalizeForMatch([
    row.parsedDescription,
    row.importedDescription,
    row.originalInput,
    row.figureNumber,
    row.variantLabel,
  ].filter(Boolean).join(' '));
  const matches = partTokens.filter((token) => rowText.includes(token)).length;
  return matches >= Math.min(3, partTokens.length);
}

function usageContextsForPart(partKey: string | undefined): UnifiedUsageContext[] | undefined {
  if (!partKey) return undefined;
  const part = catalogPartByKey(partKey);
  if (!part) return undefined;

  const submittalContexts = SUBMITTAL_PACKAGES_SEED.flatMap((pkg): UnifiedUsageContext[] => {
    const match = pkg.parts.find((packagePart) => packagePart.partKey === partKey);
    if (!match) return [];
    return [{
      module: 'submittal',
      label: 'Submittal Package',
      destinationName: pkg.name,
      projectName: projectTitleById(pkg.projectId),
      detail: `Figure ${match.figureNumber}`,
    }];
  });

  const bomContexts = mockBomProjects.flatMap((bom): UnifiedUsageContext[] => {
    const match = initialWorkspaceRowsForBomProject(bom.id).find((row) => bomRowMatchesPart(row, part));
    if (!match) return [];
    return [{
      module: 'bom',
      label: 'BOM',
      destinationName: bom.name,
      projectName: projectTitleById(bom.projectId),
      detail: match.quantity ? `${match.quantity} ${match.unit ?? 'items'}` : undefined,
    }];
  });

  const contexts = [...submittalContexts, ...bomContexts];
  return contexts.length > 0 ? contexts : undefined;
}

function domainForEntity(entityType: SearchEntityType): SearchDomain {
  switch (entityType) {
    case 'part':
      return 'parts';
    case 'project':
      return 'projects';
    case 'bom':
      return 'bom';
    case 'submittal':
      return 'submittal';
    case 'seismic-design':
      return 'seisbrace';
    case 'spec':
      return 'spec';
    case 'download':
      return 'content';
  }
}

function toUnifiedRow(result: GlobalSearchResult): UnifiedResultRow {
  return {
    key: result.key,
    domain: domainForEntity(result.entityType),
    title: result.title,
    subtitle: result.subtitle,
    context: result.context,
    meta: result.meta,
    href: result.href,
    projectId: result.projectId,
    partKey: result.partKey,
    entityType: result.entityType,
    usageContexts: result.entityType === 'part' ? usageContextsForPart(result.partKey) : undefined,
  };
}

export function searchByDomain(query: string): Record<SearchDomain, UnifiedResultRow[]> {
  const initial = SEARCH_DOMAIN_ORDER.reduce(
    (acc, domain) => ({ ...acc, [domain]: [] }),
    {} as Record<SearchDomain, UnifiedResultRow[]>,
  );
  searchGlobal(query, 'all')
    .map(toUnifiedRow)
    .forEach((row) => {
      initial[row.domain].push(row);
    });
  return initial;
}

export function searchAll(query: string): UnifiedResultRow[] {
  const byDomain = searchByDomain(query);
  return SEARCH_DOMAIN_ORDER.flatMap((domain) => byDomain[domain]);
}

export function unifiedPartByKey(partKey: string): CatalogPartRow | undefined {
  return catalogPartByKey(partKey);
}

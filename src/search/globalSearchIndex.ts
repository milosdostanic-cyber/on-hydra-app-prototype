import { CATALOG_DEMO_PARTS } from '../catalog/catalogDemoData';
import { mockBomProjects } from '../bom/data/mockData';
import { PROJECT_SEED_ROWS, projectTitleById } from '../shell/projectSeed';
import { SEISBRACE_FILES_SEED, SEISMIC_DESIGNS_SEED } from '../seisbrace/data/seisbraceMockData';
import { SUBMITTAL_PACKAGES_SEED } from '../submittal/data/submittalPackagesMockData';

import { partDetailContentFor } from './partDetailDemoData';
import {
  SEARCH_ENTITY_ORDER,
  SEARCH_SCOPE_ENTITY_TYPES,
  type GlobalSearchResult,
  type SearchEntityType,
  type SearchScope,
} from './globalSearchModel';

const RECENT_SEARCHES_STORAGE_KEY = 'hydra:globalSearch:recent';
const RECENT_SEARCH_LIMIT = 6;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function compact(parts: Array<string | undefined | null | false>): string {
  return parts.filter(Boolean).join(' ');
}

function compactList(parts: Array<string | undefined | null | false>): string[] {
  return parts.filter(Boolean) as string[];
}

function includesQuery(values: string[], query: string): boolean {
  if (!query || query === 'all') return true;
  return values.some((value) => normalize(value).includes(query));
}

function scoreResult(result: GlobalSearchResult, query: string): number {
  if (!query || query === 'all') return 0;
  const title = normalize(result.title);
  const subtitle = normalize(result.subtitle);
  const meta = normalize((result.meta ?? []).join(' '));
  if (title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (title.includes(query)) return 2;
  if (subtitle.includes(query)) return 3;
  if (meta.includes(query)) return 4;
  return 5;
}

function sortResults(results: GlobalSearchResult[], query: string): GlobalSearchResult[] {
  return [...results].sort((a, b) => {
    const entityDiff = SEARCH_ENTITY_ORDER.indexOf(a.entityType) - SEARCH_ENTITY_ORDER.indexOf(b.entityType);
    if (entityDiff !== 0) return entityDiff;
    const scoreDiff = scoreResult(a, query) - scoreResult(b, query);
    if (scoreDiff !== 0) return scoreDiff;
    return a.title.localeCompare(b.title);
  });
}

function specField(partKey: string, label: string): string | undefined {
  const part = CATALOG_DEMO_PARTS.find((p) => p.key === partKey);
  if (!part) return undefined;
  return partDetailContentFor(part).specifications.find((field) => field.label === label)?.value;
}

function partResults(query: string): GlobalSearchResult[] {
  return CATALOG_DEMO_PARTS.map((part) => {
    const detail = partDetailContentFor(part);
    const material = detail.specifications.find((field) => field.key === 'material')?.value;
    const size = detail.specifications.find((field) => field.key === 'size-range')?.value;
    const family = detail.specifications.find((field) => field.key === 'product-line')?.value;
    return {
      key: `part-${part.key}`,
      entityType: 'part' as const,
      title: part.sku,
      subtitle: part.description,
      context: 'ASC part',
      meta: compactList([size && `Size: ${size}`, material && `Material: ${material}`, family]),
      href: `/search/parts/${encodeURIComponent(part.key)}`,
      partKey: part.key,
    };
  }).filter((result) =>
    includesQuery(
      [
        result.title,
        result.subtitle,
        result.partKey ?? '',
        specField(result.partKey ?? '', 'Material') ?? '',
        specField(result.partKey ?? '', 'Size range') ?? '',
        specField(result.partKey ?? '', 'Product line') ?? '',
      ],
      query,
    ),
  );
}

function projectResults(query: string): GlobalSearchResult[] {
  return PROJECT_SEED_ROWS.map((project) => ({
    key: `project-${project.key}`,
    entityType: 'project' as const,
    title: project.name,
    subtitle: compact([project.address, project.city, project.state]),
    context: 'Project workspace',
    meta: compactList([project.recent ? 'Recent' : undefined, `Last opened ${project.lastOpened}`]),
    href: `/projects/${encodeURIComponent(project.key)}/content`,
    projectId: project.key,
  })).filter((result) =>
    includesQuery([result.title, result.subtitle, result.context ?? '', ...(result.meta ?? [])], query),
  );
}

function bomResults(query: string): GlobalSearchResult[] {
  return mockBomProjects.map((bom) => {
    const projectName = projectTitleById(bom.projectId) ?? `Project ${bom.projectId}`;
    return {
      key: `bom-${bom.id}`,
      entityType: 'bom' as const,
      title: bom.name,
      subtitle: `${bom.items} items · ${bom.status}`,
      context: projectName,
      meta: [`Last edited ${bom.lastEdited}`],
      href: `/bom/projects/${encodeURIComponent(bom.id)}/workspace`,
      projectId: bom.projectId,
      status: bom.status,
      updatedAt: bom.lastEdited,
    };
  }).filter((result) =>
    includesQuery([result.title, result.subtitle, result.context ?? '', ...(result.meta ?? [])], query),
  );
}

function submittalResults(query: string): GlobalSearchResult[] {
  return SUBMITTAL_PACKAGES_SEED.map((pkg) => {
    const projectName = projectTitleById(pkg.projectId) ?? `Project ${pkg.projectId}`;
    const partSummary = pkg.parts.map((part) => `${part.figureNumber} ${part.displayName}`).join(' ');
    return {
      key: `submittal-${pkg.id}`,
      entityType: 'submittal' as const,
      title: pkg.name,
      subtitle: `${pkg.parts.length} part${pkg.parts.length === 1 ? '' : 's'}`,
      context: projectName,
      meta: compactList([`Updated ${new Date(pkg.updatedAt).toLocaleDateString()}`, partSummary]),
      href: `/projects/${encodeURIComponent(pkg.projectId)}/submittal?package=${encodeURIComponent(pkg.id)}`,
      projectId: pkg.projectId,
      updatedAt: pkg.updatedAt,
    };
  }).filter((result) =>
    includesQuery([result.title, result.subtitle, result.context ?? '', ...(result.meta ?? [])], query),
  );
}

function seismicDesignResults(query: string): GlobalSearchResult[] {
  return SEISMIC_DESIGNS_SEED.map((design) => {
    const projectName = projectTitleById(design.projectId) ?? `Project ${design.projectId}`;
    return {
      key: `seismic-design-${design.id}`,
      entityType: 'seismic-design' as const,
      title: design.displayName,
      subtitle: `${design.codeRequirement.replaceAll('_', ' ')} · ${design.loadType} · ${design.unit}`,
      context: projectName,
      meta: compactList([design.notes, `Project date ${new Date(design.projectDate).toLocaleDateString()}`]),
      href: '/seisbrace',
      projectId: design.projectId,
      updatedAt: design.projectDate,
    };
  }).filter((result) =>
    includesQuery([result.title, result.subtitle, result.context ?? '', ...(result.meta ?? [])], query),
  );
}

function specResults(query: string): GlobalSearchResult[] {
  return PROJECT_SEED_ROWS.slice(0, 3).map((project) => ({
    key: `spec-${project.key}`,
    entityType: 'spec' as const,
    title: `${project.name} — Spec workspace`,
    subtitle: 'SalesBrace spec experience',
    context: `${project.city}, ${project.state}`,
    meta: ['Placeholder result'],
    href: `/projects/${encodeURIComponent(project.key)}/sales-brace`,
    projectId: project.key,
  })).filter((result) =>
    includesQuery([result.title, result.subtitle, result.context ?? '', ...(result.meta ?? [])], query),
  );
}

function downloadResults(query: string): GlobalSearchResult[] {
  return SEISBRACE_FILES_SEED.map((file) => {
    const projectName = projectTitleById(file.projectId) ?? `Project ${file.projectId}`;
    return {
      key: `download-${file.id}`,
      entityType: 'download' as const,
      title: file.title,
      subtitle: file.filename,
      context: projectName,
      meta: [file.kind],
      href: `/projects/${encodeURIComponent(file.projectId)}/content`,
      projectId: file.projectId,
    };
  }).filter((result) =>
    includesQuery([result.title, result.subtitle, result.context ?? '', ...(result.meta ?? [])], query),
  );
}

const SEARCH_BUILDERS: Record<SearchEntityType, (query: string) => GlobalSearchResult[]> = {
  part: partResults,
  project: projectResults,
  bom: bomResults,
  submittal: submittalResults,
  'seismic-design': seismicDesignResults,
  spec: specResults,
  download: downloadResults,
};

export function searchGlobal(query: string, scope: SearchScope = 'parts'): GlobalSearchResult[] {
  const normalizedQuery = normalize(query);
  const entityTypes = SEARCH_SCOPE_ENTITY_TYPES[scope];
  return sortResults(
    entityTypes.flatMap((entityType) => SEARCH_BUILDERS[entityType](normalizedQuery)),
    normalizedQuery,
  );
}

export function getRecentGlobalSearches(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function saveRecentGlobalSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed || trimmed === 'all') return;
  try {
    const next = [
      trimmed,
      ...getRecentGlobalSearches().filter((existing) => normalize(existing) !== normalize(trimmed)),
    ].slice(0, RECENT_SEARCH_LIMIT);
    sessionStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage failures */
  }
}

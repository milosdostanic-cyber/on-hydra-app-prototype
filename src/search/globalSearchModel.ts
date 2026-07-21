export type SearchScope = 'parts' | 'connected' | 'all';

export type SearchEntityType =
  | 'part'
  | 'project'
  | 'bom'
  | 'submittal'
  | 'seismic-design'
  | 'spec'
  | 'download';

export type GlobalSearchResult = {
  key: string;
  entityType: SearchEntityType;
  title: string;
  subtitle: string;
  context?: string;
  meta?: string[];
  href: string;
  projectId?: string;
  partKey?: string;
  thumbnailUrl?: string;
  status?: string;
  updatedAt?: string;
};

export const SEARCH_SCOPE_LABELS: Record<SearchScope, string> = {
  parts: 'ASC Parts',
  connected: 'ConnectED',
  all: 'All',
};

export const SEARCH_SCOPE_PLACEHOLDERS: Record<SearchScope, string> = {
  parts: 'Search parts by figure number, description, size, or material',
  connected: 'Search projects, BOMs, submittals, specs, or designs',
  all: 'Search parts, projects, submittals, specs, and more',
};

export const SEARCH_SCOPE_ENTITY_TYPES: Record<SearchScope, SearchEntityType[]> = {
  parts: ['part'],
  connected: ['project', 'bom', 'submittal', 'seismic-design', 'spec', 'download'],
  all: ['part', 'project', 'bom', 'submittal', 'seismic-design', 'spec', 'download'],
};

export const SEARCH_ENTITY_LABELS: Record<SearchEntityType, string> = {
  part: 'ASC Parts',
  project: 'Projects',
  bom: 'BOMs',
  submittal: 'Submittal Packages',
  'seismic-design': 'Seismic Designs',
  spec: 'Specs',
  download: 'Downloads',
};

export const SEARCH_ENTITY_ORDER: SearchEntityType[] = [
  'part',
  'project',
  'bom',
  'submittal',
  'seismic-design',
  'spec',
  'download',
];

export const MIN_GLOBAL_SEARCH_CHARS = 2;

export type GroupedGlobalSearchResults = Partial<Record<SearchEntityType, GlobalSearchResult[]>>;

export function groupGlobalSearchResults(results: GlobalSearchResult[]): GroupedGlobalSearchResults {
  return results.reduce<GroupedGlobalSearchResults>((acc, result) => {
    const group = acc[result.entityType] ?? [];
    group.push(result);
    acc[result.entityType] = group;
    return acc;
  }, {});
}

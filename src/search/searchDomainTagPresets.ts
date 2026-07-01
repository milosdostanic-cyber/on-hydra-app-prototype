import type { HydraColorfulPreset } from '../ui/HydraTag';

import type { SearchDomain } from './unifiedSearchData';

/** Colorful Tag preset per search domain — Used in + All-tab category chips. */
export const SEARCH_DOMAIN_TAG_PRESET: Record<SearchDomain, HydraColorfulPreset> = {
  parts: 'blue',
  projects: 'geekblue',
  bom: 'volcano',
  submittal: 'purple',
  seisbrace: 'cyan',
  spec: 'geekblue',
  content: 'green',
};

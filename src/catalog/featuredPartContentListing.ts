import { productCatalogPartVariantsPath } from './productCatalogNavigation';

/** Resolves demo featured `CatalogPartRow.key` to a leaf part in the project Content hierarchy (variants listing). */
export type FeaturedContentListingTarget = {
  categoryId: string;
  subcategoryId: string;
  productLineId: string;
  partId: string;
};

const FEATURED_KEY_TO_CONTENT_LISTING: Record<string, FeaturedContentListingTarget> = {
  'p-100': {
    categoryId: 'flow-control',
    subcategoryId: 'fc-industrial',
    productLineId: 'pl-instrumentation-cwp',
    partId: 'lp-needle-s7166',
  },
  'p-200': {
    categoryId: 'flow-control',
    subcategoryId: 'fc-industrial',
    productLineId: 'pl-instrumentation-cwp',
    partId: 'lp-ball-s76',
  },
  'p-300': {
    categoryId: 'flow-control',
    subcategoryId: 'fc-industrial',
    productLineId: 'pl-instrumentation-cwp',
    partId: 'lp-check-s76',
  },
  'p-400': {
    categoryId: 'flow-control',
    subcategoryId: 'fc-industrial',
    productLineId: 'pl-instrumentation-cwp',
    partId: 'lp-stub-4',
  },
  'p-500': {
    categoryId: 'flow-control',
    subcategoryId: 'fc-industrial',
    productLineId: 'pl-instrumentation-cwp',
    partId: 'lp-stub-5',
  },
  'p-600': {
    categoryId: 'flow-control',
    subcategoryId: 'fc-industrial',
    productLineId: 'pl-actuators',
    partId: 'lp-act-1',
  },
  'p-700': {
    categoryId: 'support-systems',
    subcategoryId: 'ss-hangers',
    productLineId: 'pl-cable-hangers',
    partId: 'lp-loop-clutch',
  },
  'p-800': {
    categoryId: 'fire-protection',
    subcategoryId: 'fp-grooved',
    productLineId: 'pl-fire-search',
    partId: 'lp-fire-alarm-bell',
  },
  'p-900': {
    categoryId: 'pipe-joining',
    subcategoryId: 'pj-fittings',
    productLineId: 'pl-pj-demo',
    partId: 'lp-pj-1',
  },
  'p-1000': {
    categoryId: 'flow-control',
    subcategoryId: 'fc-commercial',
    productLineId: 'pl-cr-mix',
    partId: 'lp-cr-1',
  },
};

export function featuredPartContentListingTarget(partKey: string): FeaturedContentListingTarget | undefined {
  return FEATURED_KEY_TO_CONTENT_LISTING[partKey];
}

/** Absolute path to the **part variants** listing in project Content, or `undefined` if the key is not mapped. */
export function featuredPartContentListingPath(projectId: string, partKey: string): string | undefined {
  const t = featuredPartContentListingTarget(partKey);
  if (!t) return undefined;
  return productCatalogPartVariantsPath(
    projectId,
    t.categoryId,
    t.subcategoryId,
    t.productLineId,
    t.partId,
  );
}

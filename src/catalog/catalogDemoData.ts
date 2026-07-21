export type CatalogPartRow = {
  key: string;
  sku: string;
  description: string;
  /** Featured card subcopy (2 lines in UI; title is `sku`). */
  featuredCardSubtitle?: string;
  /**
   * Featured / tile image: prototype uses static assets under `public/assets/catalog/featured-tiles/`.
   * Production may use `ContentPart` image URLs.
   */
  featuredImageUrl?: string;
};

/**
 * Featured Parts PRD (FR-2): production target is 3–10 public highlights.
 * Prototype raises the cap so longer lists (e.g. carousel paging) can be exercised without localStorage.
 */
export const FEATURED_PARTS_MIN = 3;
export const FEATURED_PARTS_MAX = 30;

/** Fallback if a row omits `featuredImageUrl` (first tile from asc-es.com/products). */
export const FEATURED_PARTS_FALLBACK_IMAGE_URL =
  'https://s3.us-east-1.amazonaws.com/ue1.asc-es.com/images/categories/products/_productCategory/1707791/SCI-Press_Copper-Group.webp';

/** Stub catalog rows — shared by landing preview, results, and part page metadata. */
export const CATALOG_DEMO_PARTS: CatalogPartRow[] = [
  {
    key: 'p-100',
    sku: '100-A',
    description: 'Demo fixture — open part page',
    featuredCardSubtitle: 'Elbows, bushings, and threaded fittings for industrial runs.',
    featuredImageUrl: '/assets/catalog/featured-tiles/pipe-fittings-group.png',
  },
  {
    key: 'p-200',
    sku: '200-B',
    description: 'Another demo row',
    featuredCardSubtitle: 'Rigid couplings with gasket seal for grooved pipe systems.',
    featuredImageUrl: '/assets/catalog/featured-tiles/groove-group.png',
  },
  {
    key: 'p-300',
    sku: '300-C',
    description: 'Grooved coupling 4 inch FireLock style 005',
    featuredCardSubtitle: 'Lightweight rigid check valve rated to 300 PSI.',
    featuredImageUrl: '/assets/catalog/featured-tiles/7000-lr.png',
  },
  {
    key: 'p-400',
    sku: '400-D',
    description: 'Standard response sprinkler head 155F pendent',
    featuredCardSubtitle: 'Standard-response pendent head for commercial sprinkler grids.',
    featuredImageUrl: '/assets/catalog/featured-tiles/sf-17-thumbnail.png',
  },
  {
    key: 'p-500',
    sku: '500-E',
    description: 'Gate valve flanged class 150 6 inch',
    featuredCardSubtitle: 'Pre-assembled flex drop with standard groove ends.',
    featuredImageUrl: '/assets/catalog/featured-tiles/ffp-flex-drop.png',
  },
  {
    key: 'p-600',
    sku: '600-F',
    description: 'Threaded rod seismic brace hardware kit',
    featuredCardSubtitle: 'UL listed brass valve with red handwheel for standpipe.',
    featuredImageUrl: '/assets/catalog/featured-tiles/angle-hose-valve.png',
  },
  {
    key: 'p-700',
    sku: '700-G',
    description: 'Check valve grooved 300 PSI 4 inch',
    featuredImageUrl: '/assets/catalog/featured-tiles/7000-lr.png',
  },
  {
    key: 'p-800',
    sku: '800-H',
    description: 'Pipe clamp adjustable for CPVC',
    featuredImageUrl: '/assets/catalog/featured-tiles/pipe-fittings-group.png',
  },
  {
    key: 'p-900',
    sku: '900-I',
    description: 'Flexible sprinkler drop assembly 1 inch adjustable',
    featuredImageUrl: '/assets/catalog/featured-tiles/sf-17-thumbnail.png',
  },
  {
    key: 'p-1000',
    sku: '1000-J',
    description: 'Waterflow switch vane type for alarm riser',
    featuredImageUrl: '/assets/catalog/featured-tiles/0700000.png',
  },
  // Extra stub rows (carousel / long-list demo); images cycle existing tiles under `public/assets/catalog/featured-tiles/`.
  {
    key: 'p-2011',
    sku: 'PROT-011',
    description: 'Demo catalog row — grooved reducer transition stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/pipe-fittings-group.png',
  },
  {
    key: 'p-2012',
    sku: 'PROT-012',
    description: 'Demo catalog row — flange gasket kit stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/groove-group.png',
  },
  {
    key: 'p-2013',
    sku: 'PROT-013',
    description: 'Demo catalog row — hose thread adapter stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/7000-lr.png',
  },
  {
    key: 'p-2014',
    sku: 'PROT-014',
    description: 'Demo catalog row — inspector test valve stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/sf-17-thumbnail.png',
  },
  {
    key: 'p-2015',
    sku: 'PROT-015',
    description: 'Demo catalog row — pressure gauge snubber stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/ffp-flex-drop.png',
  },
  {
    key: 'p-2016',
    sku: 'PROT-016',
    description: 'Demo catalog row — seismic sway brace fitting stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/angle-hose-valve.png',
  },
  {
    key: 'p-2017',
    sku: 'PROT-017',
    description: 'Demo catalog row — dry pipe accelerator stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/0700000.png',
  },
  {
    key: 'p-2018',
    sku: 'PROT-018',
    description: 'Demo catalog row — alarm line strainer stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/pipe-fittings-group.png',
  },
  {
    key: 'p-2019',
    sku: 'PROT-019',
    description: 'Demo catalog row — flow switch paddle kit stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/groove-group.png',
  },
  {
    key: 'p-2020',
    sku: 'PROT-020',
    description: 'Demo catalog row — cabinet trim escutcheon stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/7000-lr.png',
  },
  {
    key: 'p-2021',
    sku: 'PROT-021',
    description: 'Demo catalog row — nipple assortment pack stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/sf-17-thumbnail.png',
  },
  {
    key: 'p-2022',
    sku: 'PROT-022',
    description: 'Demo catalog row — grooved end cap stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/ffp-flex-drop.png',
  },
  {
    key: 'p-2023',
    sku: 'PROT-023',
    description: 'Demo catalog row — standpipe hose valve cover stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/angle-hose-valve.png',
  },
  {
    key: 'p-2024',
    sku: 'PROT-024',
    description: 'Demo catalog row — sprinkler wrench head stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/0700000.png',
  },
  {
    key: 'p-2025',
    sku: 'PROT-025',
    description: 'Demo catalog row — test drain ball valve stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/pipe-fittings-group.png',
  },
  {
    key: 'p-2026',
    sku: 'PROT-026',
    description: 'Demo catalog row — flexible connector guard stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/groove-group.png',
  },
  {
    key: 'p-2027',
    sku: 'PROT-027',
    description: 'Demo catalog row — riser manifold spacer stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/7000-lr.png',
  },
  {
    key: 'p-2028',
    sku: 'PROT-028',
    description: 'Demo catalog row — inspector’s gauge port stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/sf-17-thumbnail.png',
  },
  {
    key: 'p-2029',
    sku: 'PROT-029',
    description: 'Demo catalog row — trim identification tag stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/ffp-flex-drop.png',
  },
  {
    key: 'p-2030',
    sku: 'PROT-030',
    description: 'Demo catalog row — spare O-ring service pack stub',
    featuredCardSubtitle: 'Prototype row for featured carousel paging.',
    featuredImageUrl: '/assets/catalog/featured-tiles/angle-hose-valve.png',
  },
];

/** Quick category chips on catalog home (stub taxonomy). */
export const CATALOG_QUICK_CATEGORIES = ['Fixtures', 'Supports', 'Finishes', 'Fasteners'] as const;

export function catalogPartByKey(partKey: string): CatalogPartRow | undefined {
  return CATALOG_DEMO_PARTS.find((p) => p.key === partKey);
}

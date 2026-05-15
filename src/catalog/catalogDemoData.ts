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
 * Featured Parts PRD (FR-2): public list length is enforced at 3–10 in product systems.
 * Prototype uses the same bounds against stub catalog rows.
 */
export const FEATURED_PARTS_MIN = 3;
export const FEATURED_PARTS_MAX = 10;

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
];

/** Quick category chips on catalog home (stub taxonomy). */
export const CATALOG_QUICK_CATEGORIES = ['Fixtures', 'Supports', 'Finishes', 'Fasteners'] as const;

export function catalogPartByKey(partKey: string): CatalogPartRow | undefined {
  return CATALOG_DEMO_PARTS.find((p) => p.key === partKey);
}

export type CatalogPartRow = {
  key: string;
  sku: string;
  description: string;
  /**
   * Category tile image URL as published on ASC Engineered Solutions products hub (prototype fixture).
   * @see https://www.asc-es.com/products
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
    featuredImageUrl:
      'https://s3.us-east-1.amazonaws.com/ue1.asc-es.com/images/categories/products/_productCategory/1707791/SCI-Press_Copper-Group.webp',
  },
  {
    key: 'p-200',
    sku: '200-B',
    description: 'Another demo row',
    featuredImageUrl:
      'https://s3.us-east-1.amazonaws.com/ue1.asc-es.com/images/categories/products/_productCategory/2517436/Groove-Group.webp',
  },
  {
    key: 'p-300',
    sku: '300-C',
    description: 'Grooved coupling 4 inch FireLock style 005',
    featuredImageUrl:
      'https://s3.us-east-1.amazonaws.com/ue1.asc-es.com/images/categories/products/_productCategory/2517435/Pipe-Fittings-Group.webp',
  },
  {
    key: 'p-400',
    sku: '400-D',
    description: 'Standard response sprinkler head 155F pendent',
    featuredImageUrl:
      'https://s3.us-east-1.amazonaws.com/ue1.asc-es.com/images/categories/products/_productCategory/533996/SF-17-thumbnail.webp',
  },
  {
    key: 'p-500',
    sku: '500-E',
    description: 'Gate valve flanged class 150 6 inch',
    featuredImageUrl:
      'https://s3.us-east-1.amazonaws.com/ue1.asc-es.com/images/categories/products/_productCategory/554909/website_GruvSPFfire_Lvl2_Valves.webp',
  },
  {
    key: 'p-600',
    sku: '600-F',
    description: 'Threaded rod seismic brace hardware kit',
    featuredImageUrl:
      'https://s3.us-east-1.amazonaws.com/ue1.asc-es.com/images/categories/products/_productCategory/554967/website_HangersSupportsBraces_Lvl2_Afcon_2021-03-15-204859.webp',
  },
  {
    key: 'p-700',
    sku: '700-G',
    description: 'Check valve grooved 300 PSI 4 inch',
    featuredImageUrl:
      'https://s3.us-east-1.amazonaws.com/ue1.asc-es.com/images/categories/products/_productCategory/546099/7000-LR.webp',
  },
  {
    key: 'p-800',
    sku: '800-H',
    description: 'Pipe clamp adjustable for CPVC',
    featuredImageUrl:
      'https://s3.us-east-1.amazonaws.com/ue1.asc-es.com/images/categories/products/_productCategory/555595/website_HangersSupportsBraces_Lvl2_PipeAttachments.webp',
  },
  {
    key: 'p-900',
    sku: '900-I',
    description: 'Flexible sprinkler drop assembly 1 inch adjustable',
    featuredImageUrl:
      'https://s3.us-east-1.amazonaws.com/ue1.asc-es.com/images/categories/products/_productCategory/145130/FFP-with-std-groove-ends.webp',
  },
  {
    key: 'p-1000',
    sku: '1000-J',
    description: 'Waterflow switch vane type for alarm riser',
    featuredImageUrl:
      'https://s3.us-east-1.amazonaws.com/ue1.asc-es.com/images/categories/products/_productCategory/935401/0700000.webp',
  },
];

/** Ordered slice for the featured-parts row (global list; max ten per PRD). */
export function featuredPartsListForPrototype(): CatalogPartRow[] {
  if (CATALOG_DEMO_PARTS.length < FEATURED_PARTS_MIN) return [];
  return CATALOG_DEMO_PARTS.slice(0, Math.min(FEATURED_PARTS_MAX, CATALOG_DEMO_PARTS.length));
}

/** Quick category chips on catalog home (stub taxonomy). */
export const CATALOG_QUICK_CATEGORIES = ['Fixtures', 'Supports', 'Finishes', 'Fasteners'] as const;

export function catalogPartByKey(partKey: string): CatalogPartRow | undefined {
  return CATALOG_DEMO_PARTS.find((p) => p.key === partKey);
}

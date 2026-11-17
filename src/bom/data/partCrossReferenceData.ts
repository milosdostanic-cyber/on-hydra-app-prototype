/**
 * Part Cross-Reference (live: `/bom/projects/:id/static-matches`) — demo data.
 * Categories mirror the 42 live tabs (plus "All categories"), grouped for the dropdown
 * (Figma BOM - RSFC · "Category dropdown · all 42 categories"). Parts and equivalents are
 * prototype samples modelled on the live results for "valve".
 */

import { PIM_PRODUCT_TYPE_GROUP, type PimProductGroup } from './pimDisplayMapping';

export const ALL_CATEGORIES = 'all' as const;

export type CrossReferenceCategoryGroup = {
  label: string;
  categories: string[];
};

export const CROSS_REFERENCE_CATEGORY_GROUPS: CrossReferenceCategoryGroup[] = [
  {
    label: 'Valves',
    categories: [
      'Balancing Valves',
      'Ball Valves',
      'Ball Valves, 3-Piece, ASME Class',
      'Ball Valves, Flanged, ASME Class',
      'Ball Valves, Multi-Port',
      'Ball Vlv, Unibody/2-pc, Brass/Bronze – CWP',
      'Ball Vlv, Unibody/2-pc, Iron Steel/Alloys – CWP',
      'Ball Vlv, Unibody/2-Piece, Iron Steel/Alloys – CWP',
      'Ball Vlv, Unibody/2-Piece, Iron Steel/Alloys–ASME',
      'Butterfly Valves',
      'Butterfly Valves, High Performance, Double Offset',
      'Butterfly Valves, High Performance, Triple Offset',
      'Butterfly Valves, Rubber-Lined, CWP Rated',
      'Check Valves',
      'Flow Controls',
      'Gate Valves',
      'Gate Valves, Resilient Seated Wedge',
      'Gate, Globe & Check Valves, Forged Steel – ASME',
      'Gate, Globe and Check Valves, Flanged and Wafer',
      'Globe Valves',
    ],
  },
  {
    label: 'Fittings & piping',
    categories: [
      'Copper Press',
      'Fittings',
      'FlexHead',
      'Pipe Connections',
      'Pipe Specialties, Accessories, and Coil Kits',
      'SprinkFlex',
      'Stainless Steel Fittings',
      'Stainless Steel Press',
      'Strainers',
    ],
  },
  {
    label: 'Hangers & supports',
    categories: [
      'Anvil-Strut Channel and Accessories',
      'Guides and Slides',
      'Hanger Rods and Accessories',
      'Pipe Attachments',
      'Pipe Rolls and Saddles',
      'Seismic Restraints',
      'Stanchions and Supports',
      'Structural Attachments',
    ],
  },
  {
    label: 'Other',
    categories: ['Accessories', 'Brass Trim', 'Indicator Posts', 'Lubricants', 'Tools'],
  },
];

export const CROSS_REFERENCE_CATEGORY_COUNT = CROSS_REFERENCE_CATEGORY_GROUPS.reduce(
  (sum, group) => sum + group.categories.length,
  0,
);

export type RsfcMatchType = 'Exact match' | 'Substitute';
export type RsfcOrigin = 'Domestic' | 'Import';

export type RsfcEquivalent = {
  sku: string;
  name: string;
  brand: string;
  figure: string;
  size: string;
  matchType: RsfcMatchType;
  origin: RsfcOrigin;
  hasSubmittalPdf: boolean;
  /** Caveat the user must check before using this equivalent (e.g. pressure rating). */
  note?: string;
};

export type CompetitorPart = {
  sku: string;
  figure: string;
  description: string;
  brand: string;
  size: string;
  material?: string;
  category: string;
  equivalents: RsfcEquivalent[];
};

const check716 = (size: string, sku: string, sciSku: string): RsfcEquivalent[] => [
  {
    sku,
    name: `7811 ${size} EPDM GROOVED CHECK VALVE`,
    brand: 'Gruvlok',
    figure: '7811',
    size,
    matchType: 'Exact match',
    origin: 'Domestic',
    hasSubmittalPdf: true,
  },
  {
    sku: sciSku,
    name: `${size} 300 CHECK VALVE GROOVED EPDM`,
    brand: 'SCI',
    figure: '67CVE',
    size,
    matchType: 'Substitute',
    origin: 'Import',
    hasSubmittalPdf: false,
  },
];

const valve716: Array<[string, string, string, string, string]> = [
  ['V024716PE0', '2-1/2 PTD GRV CHK VLV EPDM 716', '2-1/2', '2200750046', '4323000102'],
  ['V030716PE0', '3 PTD GRV CHK VLV EPDM 716', '3', '2200750054', '4323000110'],
  ['V040716PE0', '4 GRV CHK VLV 716', '4', '2200750062', '4323000128'],
  ['V040716PT0', '716 4 CKV 716 T STD MCH 114.3', '4', '2200750063', '4323000129'],
  ['V050716PE0', '5 PTD GRV CHK VLV EPDM 716', '5', '2200750070', '4323000136'],
  ['V060716PE0', '6 PTD GRV CHK VLV EPDM 716', '6', '2200750088', '4323000144'],
  ['V060716PT0', '6/168.3MM CKV T BLK STD 716', '6', '2200750089', '4323000145'],
  ['V080716PE0', '8 PTD GRV CHK VLV EPDM 716', '8', '2200750096', '4323000152'],
  ['V080716PT0', '8/219.1MM CKV T BLK STD 716', '8', '2200750097', '4323000153'],
  ['V100716PE0', '10 PTD GRV CHK VLV EPDM 716', '10', '2200750104', '4323000160'],
];

const valve779: Array<[string, string, string]> = [
  ['V040779PE0', '4 VENTURI CHK VLV & FLOW KIT 779', '4'],
  ['V050779PE0', '5 VENTURI CHK VLV W/ FLOW KIT 779', '5'],
  ['V060779PE0', '6 VENTURI CHK VLV & FLOW KIT 779', '6'],
  ['V080779PE0', '8 VENTURI CHK VLV & FLOW KIT 779', '8'],
];

const couplings: Array<[string, string, string, string, string]> = [
  ['L030007PT0', '*NLA LF 3 PTD GRV RIGID COUP T GSKT', '7', '3', 'Ductile Iron'],
  ['L100007PE0', '10 PTD Z-FLEX RGD GRV COUP E 07', '7', '10', 'Ductile Iron'],
  ['L120007PE0', '12 PTD GRV COUP W/ E GSKT 07', '7', '12', 'Ductile Iron'],
  ['L034077PE0', '3-1/2 PTD FLX GRV COUP E 77', '77', '3-1/2', 'Ductile Iron'],
  ['L020078PEB', '2 PLT SJ COUP W/ E GSKT 78', '78', '2', 'Ductile Iron'],
  ['L060489XT0', '489 6 COUP 489 SS T 168.3MM', '489', '6', 'Stainless Steel'],
];

export const COMPETITOR_PARTS: CompetitorPart[] = [
  ...valve716.map(([sku, description, size, gruvlokSku, sciSku]) => ({
    sku,
    figure: '716',
    description,
    brand: 'Victaulic',
    size,
    category: 'Check Valves',
    equivalents: check716(size, gruvlokSku, sciSku),
  })),
  {
    sku: 'V020717PHR',
    figure: '717',
    description: '2 HP RSR CHK VLV 717HR',
    brand: 'Victaulic',
    size: '2',
    category: 'Check Valves',
    equivalents: [
      {
        sku: '7005010140',
        name: '78FP 2 UL/ULC/FM GROOVED CHECK VALVE',
        brand: 'Gruvlok',
        figure: '78FP',
        size: '2',
        matchType: 'Substitute',
        origin: 'Domestic',
        hasSubmittalPdf: true,
        note: 'Gruvlok max. working pressure is 300 psi. Confirm it meets the job spec.',
      },
    ],
  },
  ...(
    [
      ['V024717PHR', '2-1/2 HP RSR CHK VLV 717HR', '2-1/2', '7005010158'],
      ['V030717PHR', '3 HP RSR CHK VLV 717HR', '3', '7005010166'],
    ] as Array<[string, string, string, string]>
  ).map(([sku, description, size, gruvlokSku]) => ({
    sku,
    figure: '717',
    description,
    brand: 'Victaulic',
    size,
    category: 'Check Valves',
    equivalents: [
      {
        sku: gruvlokSku,
        name: `78FP ${size} UL/ULC/FM GROOVED CHECK VALVE`,
        brand: 'Gruvlok',
        figure: '78FP',
        size,
        matchType: 'Exact match' as const,
        origin: 'Domestic' as const,
        hasSubmittalPdf: true,
      },
      {
        sku: `43230${gruvlokSku.slice(5)}`,
        name: `${size} 300 RISER CHECK VALVE GROOVED`,
        brand: 'SCI',
        figure: '67RCV',
        size,
        matchType: 'Substitute' as const,
        origin: 'Import' as const,
        hasSubmittalPdf: false,
      },
    ],
  })),
  ...valve779.map(([sku, description, size]) => ({
    sku,
    figure: '779',
    description,
    brand: 'Victaulic',
    size,
    category: 'Check Valves',
    equivalents: [
      {
        sku: `22008${sku.slice(1, 4)}10`,
        name: `7800 ${size} VENTURI CHECK VALVE W/ FLOW KIT`,
        brand: 'Gruvlok',
        figure: '7800',
        size,
        matchType: 'Exact match' as const,
        origin: 'Domestic' as const,
        hasSubmittalPdf: true,
      },
    ],
  })),
  ...couplings.map(([sku, description, figure, size, material]) => ({
    sku,
    figure,
    description,
    brand: 'Victaulic',
    size,
    material,
    category: 'Pipe Connections',
    equivalents: [
      {
        sku: `03900${sku.slice(1, 6)}`,
        name: `7401 ${size} PTD E GSKT RIGIDLOK CPLG`,
        brand: 'Gruvlok',
        figure: '7401',
        size,
        matchType: 'Exact match' as const,
        origin: 'Domestic' as const,
        hasSubmittalPdf: true,
      },
      {
        sku: `0416${sku.slice(1, 7)}`,
        name: `C9-CL ${size} SPF E TYPE A GSKT RIGID CPLG`,
        brand: 'ASC Engineered',
        figure: 'C9',
        size,
        matchType: 'Substitute' as const,
        origin: 'Import' as const,
        hasSubmittalPdf: false,
      },
    ],
  })),
];

/** Best match first: exact matches before substitutes, domestic before import. */
export function sortEquivalents(equivalents: RsfcEquivalent[]): RsfcEquivalent[] {
  const rank = (e: RsfcEquivalent) => (e.matchType === 'Exact match' ? 0 : 2) + (e.origin === 'Domestic' ? 0 : 1);
  return [...equivalents].sort((a, b) => rank(a) - rank(b));
}

function haystack(part: CompetitorPart): string {
  return [part.figure, part.sku, part.description, part.brand, part.category, ...part.equivalents.map((e) => `${e.figure} ${e.sku} ${e.name}`)]
    .join(' ')
    .toLowerCase();
}

/**
 * Every word must appear somewhere in the part (figure, SKU, description, brand, category, or an
 * RSFC equivalent's figure/SKU/name), so "check valve" and "7811" both work.
 */
export function searchCompetitorParts(query: string, category: string = ALL_CATEGORIES): CompetitorPart[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return COMPETITOR_PARTS.filter(
    (part) =>
      (category === ALL_CATEGORIES || part.category === category) &&
      words.every((word) => haystack(part).includes(word)),
  );
}

/* -------------------------------------------------------------------------------------------------
 * Concept B (part cards): filters, browse-all listing and the RSFC-grouped view.
 * Filter attributes follow the PIM display mapping (CON-347, `pimDisplayMapping.ts`); values are samples.
 * ----------------------------------------------------------------------------------------------- */

export type CrossReferenceDirection = 'competitor' | 'rsfc';

/** Match data (Domestic/Import, Exact/Substitute) plus RSFC PIM attributes (see `pimDisplayMapping.ts`). */
export type CrossReferenceFilters = {
  matchTypes: RsfcMatchType[];
  origins: RsfcOrigin[];
  productTypes: string[];
  sizes: string[];
  endConnections: string[];
  materials: string[];
  certifications: string[];
  brands: string[];
};

export const EMPTY_CROSS_REFERENCE_FILTERS: CrossReferenceFilters = {
  matchTypes: [],
  origins: [],
  productTypes: [],
  sizes: [],
  endConnections: [],
  materials: [],
  certifications: [],
  brands: [],
};

export function countActiveFilters(filters: CrossReferenceFilters): number {
  return Object.values(filters).reduce((sum, values) => sum + values.length, 0);
}

/** RSFC PIM fields for one equivalent. Undefined = empty cell = hidden. */
export type RsfcPimAttributes = {
  productType: string;
  group: PimProductGroup;
  /** Body */
  material?: string;
  /** End Connection 1 (both ends the same in the sample data) */
  endConnection?: string;
  /** Certification columns with a value, e.g. UL Listed, FM Approved */
  certifications: string[];
};

/**
 * Sample PIM values derived from the demo part names. Product types follow Sofija's mapping:
 * Gruvlok and SCI check valves are `Check Valve` (Commercial and industrial valves), couplings are `Rigid Coupling`.
 */
export function rsfcPimAttributes(part: CompetitorPart, equivalent: RsfcEquivalent): RsfcPimAttributes {
  const name = equivalent.name.toUpperCase();
  const productType = /CPLG|COUP/.test(name) ? 'Rigid Coupling' : 'Check Valve';
  const certifications = [
    ...(/\bUL\b|UL\//.test(name) ? ['UL Listed'] : []),
    ...(/\bFM\b|\/FM/.test(name) ? ['FM Approved'] : []),
  ];
  return {
    productType,
    group: PIM_PRODUCT_TYPE_GROUP[productType],
    material: equivalent.brand === 'SCI' ? 'Cast Iron' : (part.material ?? 'Ductile Iron'),
    endConnection: /GROOVED|GRV|RIGIDLOK|GSKT/.test(name) ? 'Grooved' : undefined,
    certifications,
  };
}

function pimPasses(pim: RsfcPimAttributes, size: string, brand: string, filters: CrossReferenceFilters): boolean {
  const has = (selected: string[], value: string | undefined) =>
    selected.length === 0 || (value !== undefined && selected.includes(value));
  return (
    has(filters.productTypes, pim.productType) &&
    has(filters.sizes, size) &&
    has(filters.endConnections, pim.endConnection) &&
    has(filters.materials, pim.material) &&
    has(filters.brands, brand) &&
    (filters.certifications.length === 0 || filters.certifications.some((c) => pim.certifications.includes(c)))
  );
}

function equivalentPasses(part: CompetitorPart, equivalent: RsfcEquivalent, filters: CrossReferenceFilters): boolean {
  return (
    (filters.matchTypes.length === 0 || filters.matchTypes.includes(equivalent.matchType)) &&
    (filters.origins.length === 0 || filters.origins.includes(equivalent.origin)) &&
    pimPasses(rsfcPimAttributes(part, equivalent), equivalent.size, equivalent.brand, filters)
  );
}

function queryWords(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export type CompetitorPartResult = {
  part: CompetitorPart;
  /** Equivalents that pass the filters, best match first. */
  equivalents: RsfcEquivalent[];
};

/** Empty query = browse all parts (open decision, BOM-360). */
export function listCompetitorParts(
  query: string,
  category: string,
  filters: CrossReferenceFilters,
): CompetitorPartResult[] {
  const words = queryWords(query);
  return COMPETITOR_PARTS.filter(
    (part) =>
      (category === ALL_CATEGORIES || part.category === category) &&
      words.every((word) => haystack(part).includes(word)),
  )
    .map((part) => ({
      part,
      equivalents: sortEquivalents(part.equivalents.filter((e) => equivalentPasses(part, e, filters))),
    }))
    .filter((result) => result.equivalents.length > 0);
}

export type RsfcCompetitorMatch = {
  part: CompetitorPart;
  matchType: RsfcMatchType;
  origin: RsfcOrigin;
};

export type RsfcPart = {
  sku: string;
  name: string;
  brand: string;
  figure: string;
  size: string;
  origin: RsfcOrigin;
  hasSubmittalPdf: boolean;
  pim: RsfcPimAttributes;
  categories: string[];
  /** Competitor parts that match this RSFC part, exact matches first. */
  competitors: RsfcCompetitorMatch[];
};

function buildRsfcParts(): RsfcPart[] {
  const bySku = new Map<string, RsfcPart>();
  for (const part of COMPETITOR_PARTS) {
    for (const e of part.equivalents) {
      const existing = bySku.get(e.sku);
      const match: RsfcCompetitorMatch = { part, matchType: e.matchType, origin: e.origin };
      if (existing) {
        existing.competitors.push(match);
        if (!existing.categories.includes(part.category)) existing.categories.push(part.category);
      } else {
        bySku.set(e.sku, {
          sku: e.sku,
          name: e.name,
          brand: e.brand,
          figure: e.figure,
          size: e.size,
          origin: e.origin,
          hasSubmittalPdf: e.hasSubmittalPdf,
          pim: rsfcPimAttributes(part, e),
          categories: [part.category],
          competitors: [match],
        });
      }
    }
  }
  const parts = [...bySku.values()];
  for (const p of parts) p.competitors.sort((a, b) => (a.matchType === b.matchType ? 0 : a.matchType === 'Exact match' ? -1 : 1));
  return parts;
}

export const RSFC_PARTS: RsfcPart[] = buildRsfcParts();

function rsfcHaystack(part: RsfcPart): string {
  return [
    part.figure,
    part.sku,
    part.name,
    part.brand,
    part.pim.productType,
    ...part.competitors.map((c) => `${c.part.figure} ${c.part.sku} ${c.part.description} ${c.part.brand}`),
  ]
    .join(' ')
    .toLowerCase();
}

export type RsfcPartResult = {
  part: RsfcPart;
  /** Competitor matches that pass the match type filter. */
  competitors: RsfcCompetitorMatch[];
};

export function listRsfcParts(query: string, category: string, filters: CrossReferenceFilters): RsfcPartResult[] {
  const words = queryWords(query);
  return RSFC_PARTS.filter(
    (part) =>
      (category === ALL_CATEGORIES || part.categories.includes(category)) &&
      (filters.origins.length === 0 || filters.origins.includes(part.origin)) &&
      pimPasses(part.pim, part.size, part.brand, filters) &&
      words.every((word) => rsfcHaystack(part).includes(word)),
  )
    .map((part) => ({
      part,
      competitors: part.competitors.filter(
        (c) => filters.matchTypes.length === 0 || filters.matchTypes.includes(c.matchType),
      ),
    }))
    .filter((result) => result.competitors.length > 0);
}

function sortedUnique(values: Array<string | undefined>, numeric = false): string[] {
  const unique = [...new Set(values.filter((v): v is string => Boolean(v)))];
  const toNumber = (v: string) => {
    const [whole, frac] = v.split('-');
    const [n, d] = (frac ?? '0/1').split('/').map(Number);
    return Number(whole) + n / d;
  };
  return numeric ? unique.sort((a, b) => toNumber(a) - toNumber(b)) : unique.sort((a, b) => a.localeCompare(b));
}

/** Filter values present in the data. A facet with no values is hidden (mapping: an empty cell is hidden). */
export const CROSS_REFERENCE_FACETS = {
  productTypes: sortedUnique(RSFC_PARTS.map((p) => p.pim.productType)),
  sizes: sortedUnique(RSFC_PARTS.map((p) => p.size), true),
  endConnections: sortedUnique(RSFC_PARTS.map((p) => p.pim.endConnection)),
  materials: sortedUnique(RSFC_PARTS.map((p) => p.pim.material)),
  certifications: sortedUnique(RSFC_PARTS.flatMap((p) => p.pim.certifications)),
  brands: sortedUnique(RSFC_PARTS.map((p) => p.brand)),
};

/**
 * Filter version 2 (open groups with counts): how many results there would be if this value were the only one
 * picked in its group, with every other group's selection kept. 0 = the value is disabled.
 */
export function countForFilterValue(
  direction: CrossReferenceDirection,
  query: string,
  category: string,
  filters: CrossReferenceFilters,
  key: keyof CrossReferenceFilters,
  value: string,
): number {
  const next = { ...filters, [key]: [value] } as CrossReferenceFilters;
  return direction === 'rsfc' ? listRsfcParts(query, category, next).length : listCompetitorParts(query, category, next).length;
}

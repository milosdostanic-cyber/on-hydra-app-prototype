/**
 * Part Cross-Reference (live: `/bom/projects/:id/static-matches`) — demo data.
 * Categories mirror the 42 live tabs (plus "All categories"), grouped for the dropdown
 * (Figma BOM - RSFC · "Category dropdown · all 42 categories"). Parts and equivalents are
 * prototype samples modelled on the live results for "valve".
 */

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

/** Prototype fixtures for competitor parts and their mapped RSFC replacements. */

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

export const FIGURE_MATCH = 'Figure match';
export const CROSS_REFERENCE_MATCH_TYPES = ['Exact match', 'Substitute', FIGURE_MATCH] as const;
type CrossReferenceMatchType = (typeof CROSS_REFERENCE_MATCH_TYPES)[number];

export function crossReferenceMatchTypeLabel(value: string): string {
  return value === FIGURE_MATCH ? value : `SKU · ${value}`;
}
export type RsfcOrigin = 'Domestic' | 'Import';

const PHOTO_DIR = '/assets/catalog/cross-reference';
const GRUVLOK_7811_PHOTO = `${PHOTO_DIR}/gruvlok-7811.jpg`;
const GRUVLOK_78FP_PHOTO = `${PHOTO_DIR}/gruvlok-78fp.png`;
const GRUVLOK_7401_PHOTO = `${PHOTO_DIR}/gruvlok-7401.jpg`;

/** Catalog variant photos and ASC catalog photos of the verified model displayed by the demo SKU. */
const RSFC_SKU_PHOTOS: Readonly<Record<string, string | undefined>> = {
  '2200750046': GRUVLOK_7811_PHOTO,
  '2200750054': GRUVLOK_7811_PHOTO,
  '2200750062': GRUVLOK_7811_PHOTO,
  '2200750063': GRUVLOK_7811_PHOTO,
  '2200750070': GRUVLOK_7811_PHOTO,
  '2200750088': GRUVLOK_7811_PHOTO,
  '2200750089': GRUVLOK_7811_PHOTO,
  '2200750096': GRUVLOK_7811_PHOTO,
  '2200750097': GRUVLOK_7811_PHOTO,
  '2200750104': GRUVLOK_7811_PHOTO,
  '7005010140': GRUVLOK_78FP_PHOTO,
  '7005010158': GRUVLOK_78FP_PHOTO,
  '7005010166': GRUVLOK_78FP_PHOTO,
  '7005010181': GRUVLOK_78FP_PHOTO,
  '0390003000': GRUVLOK_7401_PHOTO,
  '0390010000': GRUVLOK_7401_PHOTO,
  '0390012000': GRUVLOK_7401_PHOTO,
  '0390003407': GRUVLOK_7401_PHOTO,
  '0390002007': GRUVLOK_7401_PHOTO,
  '0390013662': GRUVLOK_7401_PHOTO,
  '0390065308': `${PHOTO_DIR}/gruvlok-7401ss.png`,
  '4323000102': `${PHOTO_DIR}/sci-67cve.jpg`,
  // Illustrative demo options (DEMO_EXTRA_OPTIONS): photo of the same product family.
  '2200750064': GRUVLOK_7811_PHOTO,
  '2200750065': GRUVLOK_7811_PHOTO,
  '4323000128': `${PHOTO_DIR}/sci-67cve.jpg`,
  '4323000130': `${PHOTO_DIR}/sci-67cve.jpg`,
  '4323000131': `${PHOTO_DIR}/sci-67cve.jpg`,
};

export function rsfcSkuPhoto(sku: string): string | undefined {
  return RSFC_SKU_PHOTOS[sku];
}

export type RsfcEquivalent = {
  sku: string;
  name: string;
  brand: string;
  figure: string;
  size: string;
  matchType: RsfcMatchType;
  origin: RsfcOrigin;
  productUrl?: string;
  productType: string;
  /** Caveat the user must check before using this equivalent (e.g. pressure rating). */
  note?: {
    title: string;
    description: string;
  };
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
    productType: 'Check Valve',
  },
  {
    sku: sciSku,
    name: `${size} 300 CHECK VALVE GROOVED EPDM`,
    brand: 'SCI',
    figure: '67CVE',
    size,
    matchType: 'Substitute',
    origin: 'Import',
    productType: 'Check Valve',
  },
];

const demoCheckOption = (
  sku: string,
  name: string,
  brand: 'Gruvlok' | 'SCI',
  figure: string,
  size: string,
): RsfcEquivalent => ({
  sku,
  name,
  brand,
  figure,
  size,
  matchType: 'Substitute',
  origin: brand === 'Gruvlok' ? 'Domestic' : 'Import',
  productType: 'Check Valve',
});

/**
 * Illustrative extra options, not verified against the ASC data. They exist only to show the match details
 * modal with the 6 option edge case (V040716PE0), as in Figma BOM - RSFC 05c.
 */
const DEMO_EXTRA_OPTIONS: Readonly<Record<string, RsfcEquivalent[]>> = {
  V040716PE0: [
    demoCheckOption('2200750064', '7811 4 NITRILE GROOVED CHECK VALVE', 'Gruvlok', '7811', '4'),
    demoCheckOption('4323000130', '4 300 CHECK VALVE GROOVED NITRILE', 'SCI', '67CVN', '4'),
    demoCheckOption('2200750065', '7811 4 FKM GROOVED CHECK VALVE', 'Gruvlok', '7811', '4'),
    demoCheckOption('4323000131', '4 300 CHECK VALVE GROOVED FKM', 'SCI', '67CVF', '4'),
  ],
};

/**
 * Long product name edge case (Figma BOM - RSFC, "RSFC Option Card" states, 8017:11748): V030716PE0 shows the
 * real Gruvlok 7811 exact match (normal name) and two Sharpe options with long PIM descriptions. The two names
 * are the PIM long descriptions used on the Figma cards; the SKUs and the mapping to this part are illustrative.
 */
const DEMO_LONG_NAME_OPTIONS: Readonly<Record<string, RsfcEquivalent[]>> = {
  V030716PE0: [
    {
      ...demoCheckOption(
        '5500253000',
        'Sharpe Fig. SERIES 25 flanged ASME check valve is a steel flanged ASME check valve designed for industrial and commercial flow control applications. Spring-loaded disc provides reliable backflow prevention with low cracking pressure.',
        'SCI',
        'SERIES 25',
        '3',
      ),
      brand: 'Sharpe',
      origin: 'Import',
    },
    {
      ...demoCheckOption(
        '5500353000',
        'Sharpe Fig. SERIES 35 flanged asme gate valves is a steel flanged asme gate valves designed for industrial and commercial flow control applications. Flanged ends allow installation and removal without disturbing adjacent piping.',
        'SCI',
        'SERIES 35',
        '3',
      ),
      brand: 'Sharpe',
      origin: 'Import',
      productType: 'Gate Valve',
    },
  ],
};

/** Demo options stay out of the figure SKU lists, which show one real SKU per size. */
const DEMO_EXTRA_SKUS = new Set(
  [...Object.values(DEMO_EXTRA_OPTIONS), ...Object.values(DEMO_LONG_NAME_OPTIONS)].flat().map((option) => option.sku),
);

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
    equivalents: DEMO_LONG_NAME_OPTIONS[sku]
      ? [check716(size, gruvlokSku, sciSku)[0], ...DEMO_LONG_NAME_OPTIONS[sku]]
      : [...check716(size, gruvlokSku, sciSku), ...(DEMO_EXTRA_OPTIONS[sku] ?? [])],
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
        productType: 'Check Valve',
        note: {
          title: 'Check the working pressure',
          description: 'Gruvlok max. working pressure is 300 psi. Confirm it meets the job spec.',
        },
      },
    ],
  },
  // Equal mappings with a confirmed RSFC SKU and catalog photo.
  {
    sku: 'L020007PT0',
    figure: '7',
    description: '2 PTD GRV COUP W/T GSKT 07',
    brand: 'Victaulic',
    size: '2',
    material: 'Ductile Iron',
    category: 'Pipe Connections',
    equivalents: [
      {
        sku: '0390013662',
        name: '7401 2 PTD T GSKT RGD CPLG',
        brand: 'Gruvlok',
        figure: '7401',
        size: '2',
        matchType: 'Exact match',
        origin: 'Domestic',
        productUrl: 'https://www.asc-es.com/products/7401-rigidlok-coupling',
        productType: 'Rigid Coupling',
      },
    ],
  },
  {
    sku: 'L030489XE0',
    figure: '489',
    description: '3 SS 316 RGD GRV COUP E 489',
    brand: 'Victaulic',
    size: '3',
    material: 'Stainless Steel',
    category: 'Pipe Connections',
    equivalents: [
      {
        sku: '0390065308',
        name: '7401SS 3 IMP 316SS E RIGID GROOVED CPLG',
        brand: 'Gruvlok',
        figure: '7401SS',
        size: '3',
        matchType: 'Exact match',
        origin: 'Import',
        productUrl: 'https://www.asc-es.com/products/7401ss-stainless-steel-rigid-coupling',
        productType: 'Rigid Coupling',
      },
    ],
  },
  {
    sku: 'V050717PE0',
    figure: '717',
    description: '5 GRV F/LOCK CHK VLV 717',
    brand: 'Victaulic',
    size: '5',
    category: 'Check Valves',
    equivalents: [
      {
        sku: '7005010181',
        name: '78FP 5 UL/ULC/FM GRVD CHK VLV',
        brand: 'Gruvlok',
        figure: '78FP',
        size: '5',
        matchType: 'Exact match',
        origin: 'Domestic',
        productUrl: 'https://www.asc-es.com/products/78fp-check-valve',
        productType: 'Check Valve',
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
        productType: 'Check Valve',
      },
      {
        sku: `43230${gruvlokSku.slice(5)}`,
        name: `${size} 300 RISER CHECK VALVE GROOVED`,
        brand: 'SCI',
        figure: '67RCV',
        size,
        matchType: 'Substitute' as const,
        origin: 'Import' as const,
        productType: 'Check Valve',
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
        productType: 'Check Valve',
      },
    ],
  })),
  {
    sku: 'L020109PE2',
    figure: '109',
    description: '2 CPL 109 E TYPE A ORG ND',
    brand: 'Victaulic',
    size: '2',
    category: 'Pipe Connections',
    equivalents: [
      {
        sku: '0890020606',
        name: 'SPF C9-CL Centerlok 2 in rigid coupling',
        brand: 'SPF Anvil',
        figure: 'C9-CL',
        size: '2',
        matchType: 'Exact match',
        origin: 'Import',
        productType: 'Rigid Coupling',
        productUrl: 'https://www.asc-es.com/products/c9-cl-sl-rigid-coupling',
        note: {
          title: 'Verify availability',
          description: 'Uses two bolts instead of one.',
        },
      },
    ],
  },
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
        productType: 'Rigid Coupling',
      },
      {
        sku: `0416${sku.slice(1, 7)}`,
        name: `C9-CL ${size} SPF E TYPE A GSKT RIGID CPLG`,
        brand: 'ASC Engineered',
        figure: 'C9',
        size,
        matchType: 'Substitute' as const,
        origin: 'Import' as const,
        productType: 'Rigid Coupling',
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

export type CrossReferenceFilters = {
  matchTypes: CrossReferenceMatchType[];
  brands: string[];
  origins: RsfcOrigin[];
  productTypes: string[];
  sizes: string[];
};

export const EMPTY_CROSS_REFERENCE_FILTERS: CrossReferenceFilters = {
  matchTypes: [],
  brands: [],
  origins: [],
  productTypes: [],
  sizes: [],
};

export function countActiveFilters(filters: CrossReferenceFilters): number {
  return Object.values(filters).reduce((sum, values) => sum + values.length, 0);
}

export type CompetitorPartResult = {
  kind: 'competitor-sku';
  part: CompetitorPart;
  equivalents: RsfcEquivalent[];
};

export type CrossReferenceFigure = {
  brand: string;
  figure: string;
  description: string;
  photo?: string;
};

export type FigureMatchResult = {
  kind: 'figure';
  key: string;
  source: CrossReferenceFigure;
  targets: CrossReferenceFigure[];
  productType: string;
};

export type CrossReferenceResult = CompetitorPartResult | FigureMatchResult;

export function summarizeCrossReferenceResult(result: CrossReferenceResult) {
  const isFigure = result.kind === 'figure';
  const part = isFigure ? result.source : result.part;
  const count = isFigure ? result.targets.length : result.equivalents.length;
  const countNoun = isFigure ? 'figure' : 'option';
  const identifierLabel = isFigure ? 'Fig.' : 'SKU';
  const identifierValue = isFigure ? result.source.figure : result.part.sku;
  const matchType: CrossReferenceMatchType = isFigure ? FIGURE_MATCH : result.equivalents[0].matchType;
  return {
    key: isFigure ? `figure:${result.key}` : result.part.sku,
    description: part.description,
    brand: part.brand,
    identifier: `${identifierLabel} ${identifierValue}`,
    identifierLabel,
    identifierValue,
    matchType,
    countLabel: `${count} ${countNoun}${count === 1 ? '' : 's'}`,
  };
}

type FigureMapping = {
  competitor: CrossReferenceFigure;
  rsfcFigures: CrossReferenceFigure[];
  category: string;
  productType: string;
};

/** Demo subset of the Hydra figure-level valve mappings. The source provides figures, not SKU matches. */
const FIGURE_MAPPINGS: FigureMapping[] = [
  {
    competitor: { brand: 'Victaulic', figure: '717', description: 'Spring-assisted grooved check valve' },
    rsfcFigures: [
      {
        brand: 'Gruvlok',
        figure: '78FP',
        description: 'Spring-loaded grooved check valve for fire protection',
        photo: GRUVLOK_78FP_PHOTO,
      },
    ],
    category: 'Check Valves',
    productType: 'Check Valve',
  },
  {
    competitor: { brand: 'Victaulic', figure: '712', description: 'Grooved-end ductile iron swing check valve' },
    rsfcFigures: [
      { brand: 'Gruvlok', figure: '90G', description: 'Grooved swing check valve' },
      {
        brand: 'Gruvlok',
        figure: '7811',
        description: 'Grooved check valve with a spring-assisted clapper',
        photo: GRUVLOK_7811_PHOTO,
      },
      { brand: 'Gruvlok', figure: '7821', description: 'Grooved check valve with a spring-assisted clapper' },
    ],
    category: 'Check Valves',
    productType: 'Check Valve',
  },
];

function figureKey(part: Pick<CrossReferenceFigure, 'brand' | 'figure'>): string {
  return `${part.brand}:${part.figure}`;
}

export function crossReferenceFigureLabel(part: CrossReferenceFigure): string {
  return `${part.brand} Fig. ${part.figure}`;
}

/** Catalog variants shown as choices for a figure, without asserting a SKU-level match. */
export function listPrototypeVariantsForFigure(figure: CrossReferenceFigure): RsfcEquivalent[] {
  const variants = new Map<string, RsfcEquivalent>();
  for (const { equivalents } of COMPETITOR_PARTS) {
    for (const equivalent of equivalents) {
      if (DEMO_EXTRA_SKUS.has(equivalent.sku)) continue;
      if (figureKey(equivalent) === figureKey(figure)) variants.set(equivalent.sku, equivalent);
    }
  }
  return [...variants.values()];
}

const ASC_SUBMITTALS = 'https://www.asc-es.com/resource';
const FIGURE_SUBMITTALS: Record<string, string | undefined> = {
  'Gruvlok:7811': `${ASC_SUBMITTALS}/7800%2BCheck%2BValve%2BSubmittal`,
  'Gruvlok:78FP': `${ASC_SUBMITTALS}/78FP%2BCheck%2BValve%2BSubmittal`,
  'Gruvlok:7401': 'https://www.asc-es.com/resources-and-downloads/7401-rigid-coupling-submittal',
  'Gruvlok:7401SS': `${ASC_SUBMITTALS}/7401SS%2BStainless%2BSteel%2BRigid%2BCoupling%2BSubmittal`,
  'SPF Anvil:C9-CL': `${ASC_SUBMITTALS}/SPF%20Anvil%20Fig.%20C9-CL-SL%20Rigid%20Coupling%20Submittal`,
};

export function rsfcSubmittal(part: Pick<CrossReferenceFigure, 'brand' | 'figure'>): string | undefined {
  return FIGURE_SUBMITTALS[figureKey(part)];
}

export function listCrossReferenceResults(query: string, category: string): CrossReferenceResult[] {
  const term = query.trim().toLowerCase();
  const words = term.split(/\s+/).filter(Boolean);
  const inCategory = (value: string) => category === ALL_CATEGORIES || category === value;
  const matches = (text: string) => words.every((word) => text.toLowerCase().includes(word));

  const skuResults = COMPETITOR_PARTS
    .filter((part) => inCategory(part.category) && part.equivalents.length > 0 && matches(haystack(part)))
    .map<CompetitorPartResult>((part) => ({ kind: 'competitor-sku', part, equivalents: sortEquivalents(part.equivalents) }));
  const figureResults = FIGURE_MAPPINGS.flatMap<FigureMatchResult>(({ category, competitor, rsfcFigures, productType }) => {
    const parts = [competitor, ...rsfcFigures];
    const text = parts.map((part) => `${crossReferenceFigureLabel(part)} ${part.description}`).join(' ');
    return inCategory(category) && matches(text)
      ? [{ kind: 'figure', key: figureKey(competitor), source: competitor, targets: rsfcFigures, productType }]
      : [];
  });
  if (term) {
    const exactFigure = figureResults.some(({ source }) => source.figure.toLowerCase() === term);
    return exactFigure ? [...figureResults, ...skuResults] : [...skuResults, ...figureResults];
  }

  // Introduce each competitor figure before showing additional SKUs from the same figure.
  const shown = new Set<string>();
  const first: CompetitorPartResult[] = [];
  const rest: CompetitorPartResult[] = [];
  for (const result of skuResults) {
    const key = figureKey(result.part);
    (shown.has(key) ? rest : first).push(result);
    shown.add(key);
  }
  return [...first, ...figureResults, ...rest];
}

function matchesSelection(selected: readonly string[], value: string): boolean {
  return selected.length === 0 || selected.includes(value);
}

export function filterCrossReferenceResults(
  results: CrossReferenceResult[],
  filters: CrossReferenceFilters,
): CrossReferenceResult[] {
  return results.flatMap<CrossReferenceResult>((result) => {
    if (result.kind === 'figure') {
      return matchesSelection(filters.brands, result.source.brand)
        && matchesSelection(filters.matchTypes, FIGURE_MATCH)
        && matchesSelection(filters.productTypes, result.productType)
        && filters.origins.length === 0
        && filters.sizes.length === 0
        ? [result]
        : [];
    }

    if (!matchesSelection(filters.brands, result.part.brand)) return [];
    const equivalents = result.equivalents.filter((option) =>
      matchesSelection(filters.matchTypes, option.matchType)
      && matchesSelection(filters.origins, option.origin)
      && matchesSelection(filters.productTypes, option.productType)
      && matchesSelection(filters.sizes, option.size),
    );
    return equivalents.length ? [{ ...result, equivalents }] : [];
  });
}

export type CrossReferenceFacets = Record<keyof CrossReferenceFilters, string[]>;

export function crossReferenceFacets(results: CrossReferenceResult[]): CrossReferenceFacets {
  const skuResults = results.filter((result) => result.kind === 'competitor-sku');
  const equivalents = skuResults.flatMap((result) => result.equivalents);
  const figures = results.filter((result) => result.kind === 'figure');
  const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const matchTypes = new Set<string>(equivalents.map((option) => option.matchType));
  if (figures.length) matchTypes.add(FIGURE_MATCH);
  return {
    brands: unique(results.map((result) => result.kind === 'figure' ? result.source.brand : result.part.brand)),
    matchTypes: CROSS_REFERENCE_MATCH_TYPES.filter((type) => matchTypes.has(type)),
    origins: unique(equivalents.map((option) => option.origin)),
    productTypes: unique([...equivalents.map((option) => option.productType), ...figures.map((result) => result.productType)]),
    sizes: [...new Set(equivalents.map((option) => option.size).filter(Boolean))].sort((a, b) =>
      sizeInches(a) - sizeInches(b),
    ),
  };
}

function sizeInches(size: string): number {
  const [whole, fraction = '0/1'] = size.split('-');
  const [numerator, denominator] = fraction.split('/').map(Number);
  return Number(whole) + numerator / denominator;
}

export function countForFilterValue(
  results: CrossReferenceResult[],
  filters: CrossReferenceFilters,
  key: keyof CrossReferenceFilters,
  value: string,
): number {
  return filterCrossReferenceResults(results, { ...filters, [key]: [value] }).length;
}

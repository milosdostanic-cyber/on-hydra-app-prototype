/**
 * Prototype-only BIM / product catalog hierarchy for **project Content** routes.
 * Counts mirror marketing cards; row sets are small representative fixtures.
 */

export type DemoProductLine = {
  id: string;
  name: string;
  description: string;
  directPartCount: number;
  parts: DemoLeafPart[];
};

export type DemoVariantRow = {
  id: string;
  name: string;
  figureNumber: string;
  description: string;
};

export type DemoLeafPart = {
  id: string;
  name: string;
  figureNumber: string;
  description: string;
  variants: DemoVariantRow[];
  /** When present, `/variant/:variantId` renders full detail (sizes + specs). */
  detail?: DemoPartFamilyDetail;
};

export type DemoPartFamilyDetail = {
  modelCode: string;
  productDescription: string;
  regulatory: string;
  sizeVariationIntro: string;
  sizeRows: { name: string; sku: string; fileTypes: string; downloadEnabled: boolean }[];
  technicalSpecs: { label: string; value: string }[];
};

const DEFAULT_SIZE_VARIATION_INTRO =
  'View all available product variations. All variations have the same specifications with size-specific differences.';

/** Full detail UI when `part.detail` is absent — driven by leaf part + its variant rows. */
export function buildSyntheticPartFamilyDetail(part: DemoLeafPart): DemoPartFamilyDetail {
  return {
    modelCode: part.figureNumber,
    productDescription: part.description.trim() ? part.description : part.name,
    regulatory: '—',
    sizeVariationIntro: DEFAULT_SIZE_VARIATION_INTRO,
    sizeRows: part.variants.map((v) => ({
      name: v.name,
      sku: v.figureNumber,
      fileTypes: 'No available files for download',
      downloadEnabled: false,
    })),
    technicalSpecs: [
      { label: 'UPC CODE', value: '—' },
      { label: 'PRODUCT BRAND', value: '—' },
      { label: 'SOURCE', value: 'Global' },
      { label: 'COATING / FINISH', value: '—' },
      { label: 'APPROXIMATE WEIGHT', value: '—' },
      { label: 'NOMINAL SIZE DIMENSION 1', value: '—' },
    ],
  };
}

export type DemoSubcategory = {
  id: string;
  label: string;
  partCount: number;
  productLines: DemoProductLine[];
};

export type DemoCategory = {
  id: string;
  title: string;
  totalParts: number;
  subcategories: DemoSubcategory[];
};

export const PRODUCT_CATALOG_CATEGORIES: DemoCategory[] = [
  {
    id: 'flow-control',
    title: 'Flow Control',
    totalParts: 397,
    subcategories: [
      {
        id: 'fc-industrial',
        label: 'Industrial Valves, Actuation and Controls',
        partCount: 160,
        productLines: [
          {
            id: 'pl-instrumentation-cwp',
            name: 'Instrumentation Valves, CWP Rated',
            description: '',
            directPartCount: 7,
            parts: [
              {
                id: 'lp-needle-s7166',
                name: '316 SS 6000 CWP Thrd End Needle Valve',
                figureNumber: 'S7166NV',
                description:
                  '316 Stainless Steel 6000 CWP Threaded End Needle Valve Series S7166NV 316 Stainless Steel, PTFE Seats',
                variants: [
                  {
                    id: 'v-s7166-a',
                    name: '316 SS Needle Valve — Config A',
                    figureNumber: 'S7166NV-A',
                    description: 'Stub variant row for prototype.',
                  },
                  {
                    id: 'v-s7166-b',
                    name: '316 SS Needle Valve — Config B',
                    figureNumber: 'S7166NV-B',
                    description: 'Stub variant row for prototype.',
                  },
                ],
              },
              {
                id: 'lp-ball-s76',
                name: '316 SS 1000 PSI Instrum. BV Tube Ends, Dbl Ferrule',
                figureNumber: 'S76BVH',
                description: '316 Stainless Steel instrumentation ball valve, double ferrule tube ends.',
                variants: [
                  {
                    id: 'v-s76-1',
                    name: 'S76BVH — Size 1',
                    figureNumber: 'S76BVH-1',
                    description: 'Stub.',
                  },
                ],
              },
              {
                id: 'lp-check-s76',
                name: '316SS-3000 PSI Instrum. T.E. Poppet CV, Dbl Ferr.',
                figureNumber: 'S76PCV3',
                description: '3000 psi @ 200 °F — stub copy for catalog preview.',
                variants: [
                  {
                    id: 'v-s76pcv-1',
                    name: 'S76PCV3 — Standard',
                    figureNumber: 'S76PCV3',
                    description: 'Stub.',
                  },
                ],
              },
              {
                id: 'lp-stub-4',
                name: '316 SS Gauge Valve — Stub',
                figureNumber: 'S77GV1',
                description: '',
                variants: [{ id: 'v-gv1', name: 'S77GV1', figureNumber: 'S77GV1', description: 'Stub.' }],
              },
              {
                id: 'lp-stub-5',
                name: 'High Pressure Block Valve — Stub',
                figureNumber: 'S78BLK',
                description: '',
                variants: [{ id: 'v-blk1', name: 'S78BLK', figureNumber: 'S78BLK', description: 'Stub.' }],
              },
              {
                id: 'lp-stub-6',
                name: 'Mini Needle Valve — Stub',
                figureNumber: 'S79MN',
                description: '',
                variants: [{ id: 'v-mn1', name: 'S79MN', figureNumber: 'S79MN', description: 'Stub.' }],
              },
              {
                id: 'lp-stub-7',
                name: 'Panel Mount Valve — Stub',
                figureNumber: 'S80PM',
                description: '',
                variants: [{ id: 'v-pm1', name: 'S80PM', figureNumber: 'S80PM', description: 'Stub.' }],
              },
            ],
          },
          {
            id: 'pl-butterfly-hp',
            name: 'Butterfly Valves, High Performance, Triple Offset',
            description: '',
            directPartCount: 1,
            parts: [
              {
                id: 'lp-bf-1',
                name: 'Triple Offset Butterfly — Stub',
                figureNumber: 'BF-TO-1',
                description: '',
                variants: [
                  { id: 'v-bf1', name: 'BF-TO-1 — 4 in', figureNumber: 'BF-TO-1-4', description: 'Stub.' },
                ],
              },
            ],
          },
          {
            id: 'pl-ball-unibody',
            name: 'Ball Vlv, Unibody/2-pc, Iron Steel/Alloys-ASME',
            description: '',
            directPartCount: 22,
            parts: Array.from({ length: 3 }, (_, i) => ({
              id: `lp-ball-u-${i}`,
              name: `Unibody ball valve — demo ${i + 1}`,
              figureNumber: `BVU-${100 + i}`,
              description: 'Prototype row.',
              variants: [
                {
                  id: `v-bvu-${i}`,
                  name: `BVU-${100 + i} — default`,
                  figureNumber: `BVU-${100 + i}`,
                  description: 'Stub.',
                },
              ],
            })),
          },
          {
            id: 'pl-gate-forged',
            name: 'Gate, Globe & Check Valves, Forged Steel - ASME',
            description: '',
            directPartCount: 23,
            parts: [
              {
                id: 'lp-ggc-1',
                name: 'Forged gate valve — stub',
                figureNumber: 'FGV-200',
                description: '',
                variants: [{ id: 'v-fgv1', name: 'FGV-200', figureNumber: 'FGV-200', description: 'Stub.' }],
              },
            ],
          },
          {
            id: 'pl-actuators',
            name: 'Actuators and Controls',
            description: '',
            directPartCount: 107,
            parts: [
              {
                id: 'lp-act-1',
                name: 'Electric actuator — stub',
                figureNumber: 'ACT-E-01',
                description: '',
                variants: [{ id: 'v-act1', name: 'ACT-E-01', figureNumber: 'ACT-E-01', description: 'Stub.' }],
              },
            ],
          },
        ],
      },
      {
        id: 'fc-commercial',
        label: 'Commercial and Residential Valves',
        partCount: 237,
        productLines: [
          {
            id: 'pl-cr-mix',
            name: 'Commercial valve assortment',
            description: '',
            directPartCount: 12,
            parts: [
              {
                id: 'lp-cr-1',
                name: 'Residential PRV — stub',
                figureNumber: 'CR-PRV-1',
                description: '',
                variants: [{ id: 'v-cr1', name: 'CR-PRV-1', figureNumber: 'CR-PRV-1', description: 'Stub.' }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pipe-joining',
    title: 'Pipe Joining Systems',
    totalParts: 1065,
    subcategories: [
      {
        id: 'pj-fittings',
        label: 'Pipe Fittings',
        partCount: 620,
        productLines: [
          {
            id: 'pl-pj-demo',
            name: 'Pipe fittings — demo line',
            description: '',
            directPartCount: 3,
            parts: [
              {
                id: 'lp-pj-1',
                name: 'Elbow 90° grooved — stub',
                figureNumber: 'PJ-E90',
                description: 'Prototype fitting row.',
                variants: [
                  { id: 'v-pj1', name: 'PJ-E90 — 2 in', figureNumber: 'PJ-E90-2', description: 'Stub.' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'fire-protection',
    title: 'Fire Protection and Fabrication Products',
    totalParts: 311,
    subcategories: [
      {
        id: 'fp-grooved',
        label: 'Grooved',
        partCount: 105,
        productLines: [
          {
            id: 'pl-fire-search',
            name: 'Fire-rated couplings and accessories',
            description: '',
            directPartCount: 4,
            parts: [
              {
                id: 'lp-fire-alarm-bell',
                name: 'Fire Alarm Bell',
                figureNumber: '02-200',
                description: 'Alarm device for fire protection systems.',
                variants: [
                  {
                    id: 'v-fab-1',
                    name: 'Fire Alarm Bell — 120V',
                    figureNumber: '02-200-A',
                    description: 'Stub.',
                  },
                ],
              },
              {
                id: 'lp-fp7400',
                name: 'FP 7400 Rigid Coupling - Fire rated',
                figureNumber: 'TP2450',
                description: 'Rigid coupling assembly for fire-rated piping.',
                variants: [
                  {
                    id: 'v-fp7400',
                    name: 'FP 7400 — 6 in',
                    figureNumber: 'TP2450-6',
                    description: 'Stub.',
                  },
                ],
              },
              {
                id: 'lp-fire-sealant',
                name: 'Firestop sealant — demo',
                figureNumber: 'FS-88',
                description: 'Intumescent sealant for penetrations.',
                variants: [{ id: 'v-fs88', name: 'FS-88', figureNumber: 'FS-88', description: 'Stub.' }],
              },
              {
                id: 'lp-fire-hose',
                name: 'Fire hose assembly — demo',
                figureNumber: 'FH-100',
                description: 'Lay-flat fire hose with couplings.',
                variants: [{ id: 'v-fh100', name: 'FH-100', figureNumber: 'FH-100', description: 'Stub.' }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'support-systems',
    title: 'Support Systems',
    totalParts: 690,
    subcategories: [
      {
        id: 'ss-hangers',
        label: 'Pipe Hangers and Supports',
        partCount: 661,
        productLines: [
          {
            id: 'pl-cable-hangers',
            name: 'Cable Hangers',
            description: '',
            directPartCount: 12,
            parts: [
              {
                id: 'lp-loop-clutch',
                name: 'Loop Clutch',
                figureNumber: 'C210',
                description: 'Cable designed for use with C200 series clutches to support HVAC equipment.',
                detail: {
                  modelCode: 'C210',
                  productDescription:
                    'Cable designed for use with C200 series clutches to support HVAC equipment.',
                  regulatory: '—',
                  sizeVariationIntro: DEFAULT_SIZE_VARIATION_INTRO,
                  sizeRows: [
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH B',
                      sku: '560100002',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH A',
                      sku: '560100001',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH D',
                      sku: '560100004',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH C',
                      sku: '560100003',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH — demo row 5',
                      sku: '560100005',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH — demo row 6',
                      sku: '560100006',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH — demo row 7',
                      sku: '560100007',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH — demo row 8',
                      sku: '560100008',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH — demo row 9',
                      sku: '560100009',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH — demo row 10',
                      sku: '560100010',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH — demo row 11',
                      sku: '560100011',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                    {
                      name: 'C210 IMPORTED LOOP CLUTCH — demo row 12',
                      sku: '560100012',
                      fileTypes: 'No available files for download',
                      downloadEnabled: false,
                    },
                  ],
                  technicalSpecs: [
                    {
                      label: 'UPC CODE',
                      value:
                        '653000000000, 653000000001, 653000000002, 653000000003, 653000000004, 653000000005, 653000000006, 653000000007',
                    },
                    { label: 'PRODUCT BRAND', value: 'Anvil' },
                    { label: 'SOURCE', value: 'Global' },
                    { label: 'FINISH / MATERIAL', value: 'Nickel Plated' },
                    { label: 'APPROXIMATE WEIGHT', value: '0.017 lbs - 1.265 lbs' },
                    { label: 'NOMINAL SIZE DIMENSION 1', value: '0 in' },
                    { label: 'NOMINAL SIZE DIMENSION 2', value: '0 in' },
                    { label: 'NOMINAL SIZE DIMENSION 3', value: '0 in' },
                  ],
                },
                variants: [
                  {
                    id: 'variant-loop-b',
                    name: 'C210 IMPORTED LOOP CLUTCH B',
                    figureNumber: '560100002',
                    description: 'Imported loop clutch variant B.',
                  },
                  {
                    id: 'variant-loop-a',
                    name: 'C210 IMPORTED LOOP CLUTCH A',
                    figureNumber: '560100001',
                    description: 'Imported loop clutch variant A.',
                  },
                  {
                    id: 'variant-loop-d',
                    name: 'C210 IMPORTED LOOP CLUTCH D',
                    figureNumber: '560100004',
                    description: 'Imported loop clutch variant D.',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'ss-seismic',
        label: 'Seismic Bracing',
        partCount: 29,
        productLines: [
          {
            id: 'pl-seismic-mix',
            name: 'Seismic hardware lines',
            description: '',
            directPartCount: 5,
            parts: [
              {
                id: 'lp-seis-1',
                name: 'Seismic brace rod — stub',
                figureNumber: 'SB-R-1',
                description: '',
                variants: [{ id: 'v-sb1', name: 'SB-R-1', figureNumber: 'SB-R-1', description: 'Stub.' }],
              },
            ],
          },
        ],
      },
    ],
  },
];

export function catalogCategoryById(categoryId: string): DemoCategory | undefined {
  return PRODUCT_CATALOG_CATEGORIES.find((c) => c.id === categoryId);
}

export function catalogSubcategory(
  categoryId: string,
  subcategoryId: string,
): DemoSubcategory | undefined {
  const c = catalogCategoryById(categoryId);
  return c?.subcategories.find((s) => s.id === subcategoryId);
}

export function catalogProductLine(
  categoryId: string,
  subcategoryId: string,
  productLineId: string,
): DemoProductLine | undefined {
  const s = catalogSubcategory(categoryId, subcategoryId);
  return s?.productLines.find((p) => p.id === productLineId);
}

export function catalogLeafPart(
  categoryId: string,
  subcategoryId: string,
  productLineId: string,
  partId: string,
): DemoLeafPart | undefined {
  const line = catalogProductLine(categoryId, subcategoryId, productLineId);
  return line?.parts.find((p) => p.id === partId);
}

export type ResolvedPartContext = {
  category: DemoCategory;
  subcategory: DemoSubcategory;
  productLine: DemoProductLine;
  part: DemoLeafPart;
};

/** Walk hierarchy to find a leaf part by id (unique in demo). */
export function resolveLeafPartById(partId: string): ResolvedPartContext | undefined {
  for (const category of PRODUCT_CATALOG_CATEGORIES) {
    for (const subcategory of category.subcategories) {
      for (const productLine of subcategory.productLines) {
        const part = productLine.parts.find((p) => p.id === partId);
        if (part) return { category, subcategory, productLine, part };
      }
    }
  }
  return undefined;
}

export type SearchHit = {
  categoryId: string;
  subcategoryId: string;
  productLineId: string;
  part: DemoLeafPart;
};

function searchBlob(p: DemoLeafPart): string {
  return `${p.name} ${p.figureNumber} ${p.description}`.toLowerCase();
}

export function searchCatalogParts(rawQuery: string): SearchHit[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q || q === 'all') {
    return flattenAllLeafParts();
  }
  return flattenAllLeafParts().filter((h) => searchBlob(h.part).includes(q));
}

export function flattenAllLeafParts(): SearchHit[] {
  const out: SearchHit[] = [];
  for (const category of PRODUCT_CATALOG_CATEGORIES) {
    for (const subcategory of category.subcategories) {
      for (const productLine of subcategory.productLines) {
        for (const part of productLine.parts) {
          out.push({
            categoryId: category.id,
            subcategoryId: subcategory.id,
            productLineId: productLine.id,
            part,
          });
        }
      }
    }
  }
  return out;
}

export function flattenLeafPartsInCategory(categoryId: string): SearchHit[] {
  return flattenAllLeafParts().filter((h) => h.categoryId === categoryId);
}

export function variantById(variantId: string): DemoVariantRow | undefined {
  for (const hit of flattenAllLeafParts()) {
    const v = hit.part.variants.find((x) => x.id === variantId);
    if (v) return v;
  }
  return undefined;
}

export type VariantDetailView = {
  partTitle: string;
  variant: DemoVariantRow;
  detail?: DemoPartFamilyDetail;
  resolved: ResolvedPartContext;
};

/** Detail page: family detail when defined; otherwise minimal stub from part + variant. */
export function getVariantDetailView(partId: string, variantId: string): VariantDetailView | undefined {
  const resolved = resolveLeafPartById(partId);
  if (!resolved) return undefined;
  const variant = resolved.part.variants.find((v) => v.id === variantId);
  if (!variant) return undefined;
  return {
    partTitle: resolved.part.name,
    variant,
    detail: resolved.part.detail,
    resolved,
  };
}

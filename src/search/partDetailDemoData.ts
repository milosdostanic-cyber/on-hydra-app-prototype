import type { CatalogPartRow } from '../catalog/catalogDemoData';

/** Canonical drawing file types shown in variant file rows (greyed when unavailable). */
export const ALL_DRAWING_FILE_TYPES = ['PDF', 'DWG', 'STEP'] as const;

export type PartVariationRow = {
  key: string;
  name: string;
  sku: string;
  /** Optional PIM thumbnail URL for dropdown options. */
  thumbnailUrl?: string;
  /** Display label in legacy views, e.g. "PDF, DWG". */
  fileTypes: string;
  /** File types available for this variant (queue/download). */
  drawingFileTypes: string[];
  /** Superset for greyed icon row. */
  allDrawingFileTypes: string[];
  description: string;
  specifications: PartSpecField[];
};

export type PartSpecField = {
  key: string;
  label: string;
  value: string;
};

export type PartDetailHero = {
  /** Short product family name — shown under figure / SKU in the hero panel. */
  productName: string;
  /** One scan line: manufacturer, variation count, or similar context. */
  metaLine: string;
};

export type PartDetailContent = {
  hero: PartDetailHero;
  description: string;
  regulatory: string;
  variations: PartVariationRow[];
  specifications: PartSpecField[];
};

/** 12-digit UPC-A with a valid check digit, derived from the SKU so it stays stable across renders. */
function demoUpcCode(sku: string): string {
  let hash = 7;
  for (const char of sku) hash = (hash * 31 + char.charCodeAt(0)) % 100000;
  const body = `075847${String(hash).padStart(5, '0')}`;
  const sum = [...body].reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 3 : 1), 0);
  return `${body}${(10 - (sum % 10)) % 10}`;
}

/** PIM identity fields every variant carries, in PIM order (UPC, brand, source). */
function pimIdentitySpecs(sku: string, brand: string, source = 'Global'): PartSpecField[] {
  return [
    { key: 'upc', label: 'UPC Code', value: demoUpcCode(sku) },
    { key: 'brand', label: 'Product Brand', value: brand },
    { key: 'source', label: 'Source', value: source },
  ];
}

function variantSpecs(
  sku: string,
  name: string,
  extra: PartSpecField[] = [],
  brand = 'Anvil',
): PartSpecField[] {
  return [
    { key: 'sku', label: 'SKU', value: sku },
    { key: 'configuration', label: 'Configuration', value: name },
    ...pimIdentitySpecs(sku, brand),
    ...extra,
    { key: 'connection', label: 'Connection type', value: 'Varies by figure' },
  ];
}

type ThreadedRodFinish = {
  key: string;
  label: string;
  abbrev: string;
  pimAbbrev: string;
  material: string;
};

const THREADED_ROD_FINISHES: ThreadedRodFinish[] = [
  { key: 'galv', label: 'Galvanized', abbrev: 'GAL', pimAbbrev: 'GALV', material: 'Steel' },
  { key: 'plain', label: 'Plain', abbrev: 'PLN', pimAbbrev: 'PLN', material: 'Steel' },
  { key: 'ss304', label: 'Stainless 304', abbrev: 'SS304', pimAbbrev: 'SS304', material: 'Stainless 304' },
];

const THREADED_ROD_DIAMETERS = ['1/4', '3/8', '1/2', '5/8', '3/4', '1', '1-1/4', '1-1/2'] as const;
const THREADED_ROD_LENGTHS_IN = [12, 24, 36, 48, 60, 72, 96, 120, 144] as const;

/** PIM description for C9-CL (on-hydra-app `1772539064346_seed_new_PIM_descriptions.sql`). */
const C9_CL_PRODUCT_DESCRIPTION =
  'The SPF/Anvil® Figure C9-CL and Figure C9-SL Rigid Couplings for Fire Protection Systems feature proprietary Sabertooth™ Installation Technology that allows you to SEE, FEEL and KNOW the coupling is installed properly.\nSabertooth technology provides both visual and tactile installation confirmation while reducing installation effort and providing the fastest installation available. The Figure C9-CL features new CenterLOK(TM) gasket technology that features a center pipe-stop rib for quick and easy installation.';

/**
 * SPF Anvil C9-CL — real PIM rows from on-hydra-app `1765751921837_seed_content_with_metadata.sql`
 * (content_part 2723 / b624d89c-cbfc-4b21-a45d-7b73c4be98f7). SKUs carry the leading zero the live page
 * shows (the seed stores them as numbers). The seed coating ("Orange Rust Inhibiting Paint" /
 * "Hot-Dipped Galvanized") is split into Coating + Finish Detail like the live variant picker.
 * Weight is blank where PIM stores 0. UPC is omitted: the seed holds it in Excel notation (6.53E+11).
 * STEP files exist for 1-1/4 to 6 in only (`1772728528745_seed_new_part_variant_step_files.sql`);
 * the live picker lists RFA next to STEP on the same sizes.
 */
const C9_CL_IMAGE_URL = 'https://asc-es.canto.com/direct/image/aju84ne50d6k75n4q4k4676a1a/vVZWAG82HYgtUZ18v4BszJ8ekSI/m3000/600';

const C9_CL_VARIANTS: ReadonlyArray<
  readonly [sku: string, sizeIn: string, coating: 'Painted' | 'Galvanized', weightLbs: string, displayName: string]
> = [
  ['890020600', '1', 'Painted', '', 'SPF C9-CL CENTERLOK 1 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023600', '1', 'Galvanized', '', 'SPF C9-CL CENTERLOK 1 INCH GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890020602', '1.25', 'Painted', '1.62', 'SPF C9-CL CENTERLOK 11/4 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023602', '1.25', 'Galvanized', '1.62', 'SPF C9-CL CENTERLOK 11/4 INCH GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890020604', '1.5', 'Painted', '1.77', 'SPF C9-CL CENTERLOK 11/2 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023604', '1.5', 'Galvanized', '1.77', 'SPF C9-CL CENTERLOK INCH 11/2 GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890020606', '2', 'Painted', '2.37', 'SPF C9-CL CENTERLOK 2 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023606', '2', 'Galvanized', '2.37', 'SPF C9-CL CENTERLOK 2 INCH GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890020608', '2.5', 'Painted', '2.63', 'SPF C9-CL CENTERLOK 21/2 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023608', '2.5', 'Galvanized', '2.63', 'SPF C9-CL CENTERLOK 21/2 INCH GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890020610', '3', 'Painted', '2.85', 'SPF C9-CL CENTERLOK 3 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023610', '3', 'Galvanized', '2.85', 'SPF C9-CL CENTERLOK 3 INCH GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890020612', '4', 'Painted', '3.85', 'SPF C9-CL CENTERLOK 4 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023612', '4', 'Galvanized', '3.85', 'SPF C9-CL CENTERLOK 4 INCH GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890020614', '5', 'Painted', '5.836', 'SPF C9-CL CENTERLOK 5 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023614', '5', 'Galvanized', '5.836', 'SPF C9-CL CENTERLOK 5 INCH GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890020616', '6', 'Painted', '6.934', 'SPF C9-CL CENTERLOK 6 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023616', '6', 'Galvanized', '6.934', 'SPF C9-CL CENTERLOK 6 INCH GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890020618', '8', 'Painted', '12.93', 'SPF C9-CL CENTERLOK 8 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023618', '8', 'Galvanized', '12.93', 'SPF C9-CL CENTERLOK 8 INCH GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890020620', '10', 'Painted', '', 'SPF C9-CL CENTERLOK 10 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023620', '10', 'Galvanized', '', 'SPF C9-CL CENTERLOK 10 INCH GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890020622', '12', 'Painted', '', 'SPF C9-CL CENTERLOK 12 INCH E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
  ['890023622', '12', 'Galvanized', '', 'SPF C9-CL CENTERLOK 12 INCH GALVANIZED E TYPE A GASKET RIGID READY FOR INSTALL FIRE PROTECTION COUPLING'],
];

const C9_CL_STEP_SIZES = new Set(['1.25', '1.5', '2', '2.5', '3', '4', '5', '6']);

const C9_CL_FINISH_DETAIL: Record<'Painted' | 'Galvanized', string> = {
  Painted: 'Orange Rust Inhibiting',
  Galvanized: 'Hot-Dipped',
};

function c9ClVariations(partKey: string): PartVariationRow[] {
  return C9_CL_VARIANTS.map(([pimSku, sizeIn, coating, weightLbs, displayName]) => {
    const sku = `0${pimSku}`;
    const drawingFileTypes = C9_CL_STEP_SIZES.has(sizeIn) ? ['RFA', 'STEP'] : [];
    return {
      key: `${partKey}-v-${sku}`,
      name: displayName,
      sku,
      thumbnailUrl: C9_CL_IMAGE_URL,
      fileTypes: drawingFileTypes.join(', '),
      drawingFileTypes,
      allDrawingFileTypes: [...ALL_DRAWING_FILE_TYPES],
      description: '',
      specifications: [
        { key: 'sku', label: 'SKU', value: sku },
        { key: 'configuration', label: 'Configuration', value: displayName },
        { key: 'brand', label: 'Product Brand', value: 'SPF Anvil' },
        { key: 'source', label: 'Source', value: 'Global' },
        { key: 'material', label: 'Material', value: 'Ductile Iron' },
        { key: 'coating', label: 'Coating / Finish', value: coating },
        { key: 'finishDetail', label: 'Finish Detail', value: C9_CL_FINISH_DETAIL[coating] },
        { key: 'endConnectionOne', label: 'End Connection 1', value: 'Grooved' },
        { key: 'endConnectionTwo', label: 'End Connection 2', value: 'Grooved' },
        ...(weightLbs ? [{ key: 'weight', label: 'Approximate Weight', value: `${weightLbs} lbs` }] : []),
        { key: 'sizeDimensionOne', label: 'Nominal Size Dimension 1', value: `${sizeIn} in` },
      ],
    };
  });
}

function threadedRodVariations(partKey: string, thumbnailUrl?: string): PartVariationRow[] {
  const variations: PartVariationRow[] = [];

  const pushVariation = (
    key: string,
    sku: string,
    diameter: string,
    lengthIn: number,
    finish: ThreadedRodFinish,
    name: string,
    description: string,
  ) => {
    const drawingFileTypes =
      sku === 'ATR-014-12-GALV'
        ? ['PDF', 'DWG', 'PNG', 'STEP', 'RFA', 'SAT']
        : ['PDF', 'DWG', 'PNG', 'STEP'];
    variations.push({
      key,
      name,
      sku,
      thumbnailUrl,
      fileTypes: drawingFileTypes.join(', '),
      drawingFileTypes,
      allDrawingFileTypes: drawingFileTypes,
      description,
      specifications: variantSpecs(sku, name, [
        { key: 'pipeSize', label: 'Pipe Size', value: diameter },
        { key: 'length', label: 'Length', value: `${lengthIn} in` },
        { key: 'material', label: 'Material', value: finish.material },
        { key: 'coating', label: 'Coating / Finish', value: finish.label },
      ]),
    });
  };

  // Explicit edge-case row from feedback (repetitive PIM copy).
  pushVariation(
    `${partKey}-v-ivan`,
    'ATR-025-144-GALV',
    '1/4',
    144,
    THREADED_ROD_FINISHES[0],
    '1/4X144 GAL ALL THREADED ROD',
    '1/4X144" ATR GALV ALL THREADED ROD',
  );

  for (const diameter of THREADED_ROD_DIAMETERS) {
    for (const lengthIn of THREADED_ROD_LENGTHS_IN) {
      for (const finish of THREADED_ROD_FINISHES) {
        if (variations.length >= 52) return variations;

        const sku = `ATR-${diameter.replace(/\D/g, '').padStart(3, '0')}-${lengthIn}-${finish.key.toUpperCase()}`;
        if (variations.some((v) => v.sku === sku)) continue;

        const name = `${diameter}X${lengthIn} ${finish.abbrev} ALL THREADED ROD`;
        const description = `${diameter}X${lengthIn}" ATR ${finish.pimAbbrev} ALL THREADED ROD`;

        pushVariation(`${partKey}-v-${variations.length + 1}`, sku, diameter, lengthIn, finish, name, description);
      }
    }
  }

  return variations;
}

function demoVariation(
  partKey: string,
  index: number,
  sku: string,
  name: string,
  specs: PartSpecField[],
  thumbnailUrl?: string,
  brand = 'Gruvlok',
): PartVariationRow {
  const drawingFileTypes = ['PDF', 'DWG'];
  return {
    key: `${partKey}-v-${index}`,
    name,
    sku,
    thumbnailUrl,
    fileTypes: drawingFileTypes.join(', '),
    drawingFileTypes,
    allDrawingFileTypes: [...ALL_DRAWING_FILE_TYPES],
    description: name,
    specifications: [
      { key: 'sku', label: 'SKU', value: sku },
      { key: 'configuration', label: 'Configuration', value: name },
      ...pimIdentitySpecs(sku, brand),
      ...specs,
    ],
  };
}

/**
 * End connections (weight 100) stay ahead of coating (weight 80).
 * One SKU omits End Connection 2 so that cell is an em dash.
 */
function groovedCouplingVariations(partKey: string, thumbnailUrl?: string): PartVariationRow[] {
  const rows: Array<{ sku: string; name: string; end1: string; end2?: string; coating: string }> = [
    { sku: '7001-020-GRV', name: '2 in Groove x Groove', end1: 'Groove', end2: 'Groove', coating: 'Rust-inhibiting orange' },
    { sku: '7001-020-FLG', name: '2 in Flange x Flange', end1: 'Flange', end2: 'Flange', coating: 'Hot-dip galvanized' },
    { sku: '7001-040-GRV', name: '4 in Groove, outlet not set', end1: 'Groove', coating: 'Rust-inhibiting orange' },
    { sku: '7001-040-MIX', name: '4 in Flange x Groove', end1: 'Flange', end2: 'Groove', coating: 'Hot-dip galvanized' },
  ];
  return rows.map((row, index) =>
    demoVariation(
      partKey,
      index + 1,
      row.sku,
      row.name,
      [
        { key: 'endConnectionOne', label: 'End Connection 1', value: row.end1 },
        ...(row.end2 ? [{ key: 'endConnectionTwo', label: 'End Connection 2', value: row.end2 }] : []),
        { key: 'coating', label: 'Coating / Finish', value: row.coating },
      ],
      thumbnailUrl,
    ),
  );
}

/** Class (geekblue) outranks pressure (red) and temperature (volcano). */
function valveVariations(partKey: string, thumbnailUrl?: string): PartVariationRow[] {
  const rows = [
    { sku: 'GV-150-6', name: 'Class 150, 6 in', pressureClass: 'Class 150', pressure: '175 psi', temperature: '230 °F' },
    { sku: 'GV-300-6', name: 'Class 300, 6 in', pressureClass: 'Class 300', pressure: '300 psi', temperature: '400 °F' },
    { sku: 'GV-150-4', name: 'Class 150, 4 in', pressureClass: 'Class 150', pressure: '200 psi', temperature: '230 °F' },
  ];
  return rows.map((row, index) =>
    demoVariation(
      partKey,
      index + 1,
      row.sku,
      row.name,
      [
        { key: 'pressureClass', label: 'Pressure Class', value: row.pressureClass },
        { key: 'maximumPressure', label: 'Maximum Pressure', value: row.pressure },
        { key: 'maximumTemperatureF', label: 'Maximum Temperature (°F)', value: row.temperature },
      ],
      thumbnailUrl,
      'Anvil',
    ),
  );
}

/**
 * Length and height differ on every row, but weight 40 loses to pipe size,
 * coating, and material.
 */
function elbowGeometryVariations(partKey: string, thumbnailUrl?: string): PartVariationRow[] {
  const rows = [
    { sku: 'ELB-2-GAL', name: '2 in galvanized elbow', size: '2 in', material: 'Ductile iron', coating: 'Hot-dip galvanized', length: '3.25 in', height: '2.5 in' },
    { sku: 'ELB-2-ORG', name: '2 in painted elbow', size: '2 in', material: 'Ductile iron', coating: 'Rust-inhibiting orange', length: '3.5 in', height: '2.75 in' },
    { sku: 'ELB-4-SS', name: '4 in stainless elbow', size: '4 in', material: 'Stainless 304', coating: 'Plain', length: '5 in', height: '4.25 in' },
    { sku: 'ELB-6-GAL', name: '6 in galvanized elbow', size: '6 in', material: 'Ductile iron', coating: 'Hot-dip galvanized', length: '6.5 in', height: '5.5 in' },
  ];
  return rows.map((row, index) =>
    demoVariation(
      partKey,
      index + 1,
      row.sku,
      row.name,
      [
        { key: 'pipeSize', label: 'Pipe Size', value: row.size },
        { key: 'material', label: 'Material', value: row.material },
        { key: 'coating', label: 'Coating / Finish', value: row.coating },
        { key: 'length', label: 'Length', value: row.length },
        { key: 'height', label: 'Height', value: row.height },
      ],
      thumbnailUrl,
    ),
  );
}

/** Only coating differs, so the table has a single tag column. */
function sparseCoatingVariations(partKey: string, thumbnailUrl?: string): PartVariationRow[] {
  const rows = [
    { sku: 'CLP-2-GAL', name: '2 in galvanized clamp', coating: 'Hot-dip galvanized' },
    { sku: 'CLP-2-ORG', name: '2 in painted clamp', coating: 'Rust-inhibiting orange' },
    { sku: 'CLP-2-PLN', name: '2 in plain clamp', coating: 'Plain' },
  ];
  return rows.map((row, index) =>
    demoVariation(
      partKey,
      index + 1,
      row.sku,
      row.name,
      [
        { key: 'pipeSize', label: 'Pipe Size', value: '2 in' },
        { key: 'material', label: 'Material', value: 'Ductile iron' },
        { key: 'coating', label: 'Coating / Finish', value: row.coating },
        { key: 'length', label: 'Length', value: '4 in' },
      ],
      thumbnailUrl,
      'Anvil',
    ),
  );
}

function defaultVariationsFor(part: CatalogPartRow, thumbnailUrl?: string): PartVariationRow[] {
  const baseSku = part.sku.replace(/-[A-Z]$/, '');
  const allTypes = [...ALL_DRAWING_FILE_TYPES];

  return [
    {
      key: `${part.key}-v1`,
      name: part.description,
      sku: part.sku,
      thumbnailUrl,
      fileTypes: 'PDF, DWG',
      drawingFileTypes: ['PDF', 'DWG'],
      allDrawingFileTypes: allTypes,
      description: `${part.description} — standard configuration.`,
      specifications: variantSpecs(part.sku, part.description, [
        { key: 'pipeSize', label: 'Pipe Size', value: 'Per cut sheet' },
        { key: 'material', label: 'Material', value: 'Varies by configuration' },
        { key: 'coating', label: 'Coating / Finish', value: 'Factory standard' },
      ]),
    },
    {
      key: `${part.key}-v2`,
      name: `${part.description} — alternate finish`,
      sku: `${baseSku}-ALT`,
      thumbnailUrl,
      fileTypes: 'PDF',
      drawingFileTypes: ['PDF'],
      allDrawingFileTypes: allTypes,
      description: `${part.description} with alternate factory finish.`,
      specifications: variantSpecs(`${baseSku}-ALT`, `${part.description} — alternate finish`, [
        { key: 'pipeSize', label: 'Pipe Size', value: 'Per cut sheet' },
        { key: 'material', label: 'Material', value: 'Varies by configuration' },
        { key: 'coating', label: 'Coating / Finish', value: 'Alternate factory' },
      ]),
    },
    {
      key: `${part.key}-v3`,
      name: `${part.description} — metric sizing`,
      sku: `${baseSku}-M`,
      thumbnailUrl,
      fileTypes: 'PDF, DWG, STEP',
      drawingFileTypes: ['PDF', 'DWG', 'STEP'],
      allDrawingFileTypes: allTypes,
      description: `${part.description} — metric sizing variant.`,
      specifications: variantSpecs(`${baseSku}-M`, `${part.description} — metric sizing`, [
        { key: 'pipeSize', label: 'Pipe Size', value: 'Metric' },
        { key: 'material', label: 'Material', value: 'Varies by configuration' },
        { key: 'coating', label: 'Coating / Finish', value: 'Factory standard' },
      ]),
    },
  ];
}

/** Stub part-detail content derived from catalog row shape — not tied to any single real product. */
const DEMO_VARIATION_BUILDERS: Record<
  string,
  (partKey: string, thumbnailUrl?: string) => PartVariationRow[]
> = {
  'p-200': threadedRodVariations,
  'p-400': groovedCouplingVariations,
  'p-500': valveVariations,
  'p-700': elbowGeometryVariations,
  'p-800': sparseCoatingVariations,
};

const DEMO_PRODUCT_NAMES: Record<string, string> = {
  'p-200': 'All Threaded Rod',
  'p-400': 'Gruvlok Fig. 7001 Rigid Coupling',
  'p-500': 'Class 150/300 Gate Valve',
  'p-700': '90° Grooved Elbow',
  'p-800': 'Adjustable Pipe Clamp',
};

/** Part-level facts as the live C9-CL page shows them (Information & Technical Specifications). */
function c9ClPartDetail(part: CatalogPartRow): PartDetailContent {
  const variations = c9ClVariations(part.key);
  return {
    hero: {
      productName: 'C9-CL CenterLOK™ Coupling with Sabertooth',
      metaLine: `SPF Anvil · ${variations.length} SKU variations`,
    },
    description: C9_CL_PRODUCT_DESCRIPTION,
    regulatory: '-',
    variations,
    specifications: [
      { key: 'manufacturer', label: 'Product Brand', value: 'SPF Anvil' },
      { key: 'source', label: 'Source', value: 'Global' },
      { key: 'material', label: 'Material', value: 'Ductile Iron' },
      { key: 'finish', label: 'Coating / Finish', value: 'Galvanized, Painted' },
      { key: 'endConnectionOne', label: 'End Connection 1', value: 'Grooved' },
      { key: 'endConnectionTwo', label: 'End Connection 2', value: 'Grooved' },
      { key: 'weight', label: 'Approximate Weight', value: '1.62 lbs - 12.93 lbs' },
      { key: 'size-range', label: 'Nominal Size Dimension 1', value: '1 in - 12 in' },
    ],
  };
}

export function partDetailContentFor(part: CatalogPartRow): PartDetailContent {
  if (part.key === 'p-100') return c9ClPartDetail(part);

  const customBuilder = DEMO_VARIATION_BUILDERS[part.key];
  const variations = customBuilder
    ? customBuilder(part.key, part.featuredImageUrl)
    : defaultVariationsFor(part, part.featuredImageUrl);

  const variationCount = variations.length;
  const variationLabel =
    variationCount === 1 ? '1 variation' : `${variationCount} SKU variations`;

  return {
    hero: {
      productName: DEMO_PRODUCT_NAMES[part.key] ?? part.description,
      metaLine: `ASC Engineered Solutions · ${variationLabel}`,
    },
    description: `${part.description}. This prototype entry summarizes typical catalog metadata for ASC engineered solutions parts — dimensions, ratings, and compatible systems vary by configuration.`,
    regulatory: 'Listing and approval references are shown for submittal use. Confirm the governing code and local AHJ requirements before specification.',
    variations,
    specifications: [
      { key: 'manufacturer', label: 'Manufacturer', value: 'ASC Engineered Solutions' },
      {
        key: 'product-line',
        label: 'Product line',
        value: 'Catalog demo fixture',
      },
      { key: 'material', label: 'Material', value: 'Varies by configuration' },
      { key: 'size-range', label: 'Size range', value: 'See variations' },
      { key: 'pressure-rating', label: 'Pressure rating', value: 'Per published cut sheet' },
      { key: 'temperature-rating', label: 'Temperature rating', value: 'Per published cut sheet' },
      { key: 'finish', label: 'Finish', value: 'Factory standard' },
      { key: 'approvals', label: 'Approvals', value: 'UL / FM where applicable (stub)' },
      { key: 'figure', label: 'Figure / model', value: part.sku },
    ],
  };
}

export function variationByKey(
  detail: PartDetailContent | null,
  variantKey: string | null | undefined,
): PartVariationRow | undefined {
  if (!detail || !variantKey) return undefined;
  return detail.variations.find((v) => v.key === variantKey);
}

export function variationSpecValue(variation: PartVariationRow, specKey: string): string | undefined {
  return variation.specifications.find((spec) => spec.key === specKey)?.value;
}

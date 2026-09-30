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

function variantSpecs(
  sku: string,
  name: string,
  extra: PartSpecField[] = [],
): PartSpecField[] {
  return [
    { key: 'sku', label: 'SKU', value: sku },
    { key: 'configuration', label: 'Configuration', value: name },
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

const P100_FIGMA_PRODUCT_DESCRIPTION =
  'The SPF/Anvil® Figure C9-CL and Figure C9-SL Rigid Couplings for Fire Protection Systems feature proprietary Sabertooth™ Installation Technology that allows you to SEE, FEEL and KNOW the coupling is installed properly.\nSabertooth technology provides both visual and tactile installation confirmation while reducing installation effort and providing the fastest installation available. The Figure C9-CL features new CenterLOK(TM) gasket technology that features a center pipe-stop rib for quick and easy installation.';

function threadedRodVariationsForP100(partKey: string, thumbnailUrl?: string): PartVariationRow[] {
  const allTypes = [...ALL_DRAWING_FILE_TYPES];
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
    variations.push({
      key,
      name,
      sku,
      thumbnailUrl,
      fileTypes: 'PDF',
      drawingFileTypes: ['PDF'],
      allDrawingFileTypes: allTypes,
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
  'p-100': threadedRodVariationsForP100,
  'p-400': groovedCouplingVariations,
  'p-500': valveVariations,
  'p-700': elbowGeometryVariations,
  'p-800': sparseCoatingVariations,
};

const DEMO_PRODUCT_NAMES: Record<string, string> = {
  'p-400': 'Gruvlok Fig. 7001 Rigid Coupling',
  'p-500': 'Class 150/300 Gate Valve',
  'p-700': '90° Grooved Elbow',
  'p-800': 'Adjustable Pipe Clamp',
};

export function partDetailContentFor(part: CatalogPartRow): PartDetailContent {
  const isThreadedRodDemo = part.key === 'p-100';
  const buildVariations = DEMO_VARIATION_BUILDERS[part.key] ?? defaultVariationsFor;
  const variations = buildVariations(part.key, part.featuredImageUrl);

  const variationCount = variations.length;
  const variationLabel =
    variationCount === 1 ? '1 variation' : `${variationCount} SKU variations`;

  return {
    hero: isThreadedRodDemo
      ? {
          productName: 'Unibody Barstock Ball Valve, 2000 PSI CWP',
          metaLine: `ASC Engineered Solutions · ${variationLabel} across diameters, lengths, and finishes`,
        }
      : {
          productName: DEMO_PRODUCT_NAMES[part.key] ?? part.description,
          metaLine: `ASC Engineered Solutions · ${variationLabel}`,
        },
    description: isThreadedRodDemo
      ? P100_FIGMA_PRODUCT_DESCRIPTION
      : `${part.description}. This prototype entry summarizes typical catalog metadata for ASC engineered solutions parts — dimensions, ratings, and compatible systems vary by configuration.`,
    regulatory: isThreadedRodDemo ? '-' : 'Listing and approval references are shown for submittal use. Confirm the governing code and local AHJ requirements before specification.',
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

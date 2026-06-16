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

export type PartDetailContent = {
  description: string;
  regulatory: string;
  variations: PartVariationRow[];
  specifications: PartSpecField[];
};

function variantSpecs(sku: string, name: string): PartSpecField[] {
  return [
    { key: 'sku', label: 'SKU', value: sku },
    { key: 'configuration', label: 'Configuration', value: name },
    { key: 'nominal-size', label: 'Nominal size', value: 'Per cut sheet' },
    { key: 'connection', label: 'Connection type', value: 'Varies by figure' },
  ];
}

/** Stub part-detail content derived from catalog row shape — not tied to any single real product. */
export function partDetailContentFor(part: CatalogPartRow): PartDetailContent {
  const baseSku = part.sku.replace(/-[A-Z]$/, '');
  const allTypes = [...ALL_DRAWING_FILE_TYPES];

  return {
    description: `${part.description}. This prototype entry summarizes typical catalog metadata for ASC engineered solutions parts — dimensions, ratings, and compatible systems vary by configuration.`,
    regulatory:
      'Listing and approval references are shown for submittal use. Confirm the governing code and local AHJ requirements before specification.',
    variations: [
      {
        key: `${part.key}-v1`,
        name: part.description,
        sku: part.sku,
        fileTypes: 'PDF, DWG',
        drawingFileTypes: ['PDF', 'DWG'],
        allDrawingFileTypes: allTypes,
        description: `${part.description} — standard configuration.`,
        specifications: variantSpecs(part.sku, part.description),
      },
      {
        key: `${part.key}-v2`,
        name: `${part.description} — alternate finish`,
        sku: `${baseSku}-ALT`,
        fileTypes: 'PDF',
        drawingFileTypes: ['PDF'],
        allDrawingFileTypes: allTypes,
        description: `${part.description} with alternate factory finish.`,
        specifications: variantSpecs(`${baseSku}-ALT`, `${part.description} — alternate finish`),
      },
      {
        key: `${part.key}-v3`,
        name: `${part.description} — metric sizing`,
        sku: `${baseSku}-M`,
        fileTypes: 'PDF, DWG, STEP',
        drawingFileTypes: ['PDF', 'DWG', 'STEP'],
        allDrawingFileTypes: allTypes,
        description: `${part.description} — metric sizing variant.`,
        specifications: variantSpecs(`${baseSku}-M`, `${part.description} — metric sizing`),
      },
    ],
    specifications: [
      { key: 'manufacturer', label: 'Manufacturer', value: 'ASC Engineered Solutions' },
      { key: 'product-line', label: 'Product line', value: 'Catalog demo fixture' },
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

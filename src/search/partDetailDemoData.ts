import type { CatalogPartRow } from '../catalog/catalogDemoData';

export type PartVariationRow = {
  key: string;
  name: string;
  sku: string;
  fileTypes: string;
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

/** Stub part-detail content derived from catalog row shape — not tied to any single real product. */
export function partDetailContentFor(part: CatalogPartRow): PartDetailContent {
  const baseSku = part.sku.replace(/-[A-Z]$/, '');
  return {
    description: `${part.description}. This prototype entry summarizes typical catalog metadata for ASC engineered solutions parts — dimensions, ratings, and compatible systems vary by configuration.`,
    regulatory: 'Listing and approval references are shown for submittal use. Confirm the governing code and local AHJ requirements before specification.',
    variations: [
      { key: `${part.key}-v1`, name: part.description, sku: part.sku, fileTypes: 'PDF, DWG' },
      { key: `${part.key}-v2`, name: `${part.description} — alternate finish`, sku: `${baseSku}-ALT`, fileTypes: 'PDF' },
      { key: `${part.key}-v3`, name: `${part.description} — metric sizing`, sku: `${baseSku}-M`, fileTypes: 'PDF, DWG, STEP' },
    ],
    specifications: [
      { key: 'manufacturer', label: 'Manufacturer', value: 'ASC Engineered Solutions' },
      { key: 'product-line', label: 'Product line', value: 'Catalog demo fixture' },
      { key: 'material', label: 'Material', value: 'Varies by configuration' },
      { key: 'size-range', label: 'Size range', value: 'See variations table' },
      { key: 'pressure-rating', label: 'Pressure rating', value: 'Per published cut sheet' },
      { key: 'temperature-rating', label: 'Temperature rating', value: 'Per published cut sheet' },
      { key: 'finish', label: 'Finish', value: 'Factory standard' },
      { key: 'approvals', label: 'Approvals', value: 'UL / FM where applicable (stub)' },
      { key: 'figure', label: 'Figure / model', value: part.sku },
    ],
  };
}

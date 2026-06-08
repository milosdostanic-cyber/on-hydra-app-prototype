/** Shared field-mapping constants for summary + advanced mapping screens. */

export const BOM_FIELD_SKIP_VALUE = '--Skip--';

export const BOM_SOURCE_FIELDS = [
  BOM_FIELD_SKIP_VALUE,
  'BRAND',
  'DESCRIPTION',
  'FIGURE NUM',
  'FINISH',
  'MFR NUM',
  'INSTALL TYPE',
  'MANUFACTURER',
  'MATERIAL',
  'PART NUMBER',
  'QTY',
  'SKU',
  'UNIT',
  'UPC',
] as const;

/** Figma 5202:19667 — 9 visible rows + 4 below fold; badge default "11 of 13 fields mapped". */
export const ASC_DEST_FIELDS = [
  { key: 'PART NUMBER', label: 'Part Number' },
  { key: 'DESCRIPTION', label: 'Description' },
  { key: 'SKU', label: 'SKU' },
  { key: 'UPC', label: 'UPC' },
  { key: 'FIGURE NUM', label: 'Figure Number' },
  { key: 'FINISH', label: 'Finish' },
  { key: 'MFR NUM', label: 'Mfr Number' },
  { key: 'INSTALL TYPE', label: 'Install Type' },
  { key: 'MANUFACTURER', label: 'Manufacturer' },
  { key: 'QTY', label: 'Quantity' },
  { key: 'BRAND', label: 'Brand' },
  { key: 'MATERIAL', label: 'Material' },
  { key: 'UNIT', label: 'Unit' },
] as const;

export type BomFieldAliasMap = Record<string, string | undefined>;

/** Auto-derived demo mapping applied after upload (same as prior field-mapping defaults). */
export const DEFAULT_FIELD_MAPPING: BomFieldAliasMap = {
  'PART NUMBER': 'PART NUMBER',
  DESCRIPTION: 'DESCRIPTION',
  SKU: BOM_FIELD_SKIP_VALUE,
  UPC: BOM_FIELD_SKIP_VALUE,
  'FIGURE NUM': 'FIGURE NUM',
  FINISH: 'FINISH',
  'MFR NUM': 'MFR NUM',
  'INSTALL TYPE': 'INSTALL TYPE',
  MANUFACTURER: 'MANUFACTURER',
  QTY: 'QTY',
  BRAND: 'BRAND',
  MATERIAL: 'MATERIAL',
  UNIT: 'UNIT',
};

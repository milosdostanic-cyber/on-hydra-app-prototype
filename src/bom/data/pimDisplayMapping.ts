/**
 * PIM (Syndigo) display mapping by product type — the subset Part Cross-Reference uses for filters.
 * Source: Sofija Zec-Baškarad, CON-347, Syndigo export of 16 Nov 2026
 * (`Documents/pim/2026-11-16-pim-column-mapping-by-product-type.md`).
 *
 * Rules taken from the mapping:
 * - An empty cell is hidden, so a filter only shows when at least one result has a value.
 * - Size is one field per end (Size 1, Size 2, Size 3); the unit is shown once.
 * - Reliable valves, risers and controls use Valve Size instead (decimal pipe size when Valve Size is empty).
 * - Material is `Body` (`Main Material` is the second text, shown only where the two disagree).
 * - The 16 certification columns stay separate; `Regulatory` is the legacy fallback.
 * - There is no pressure or temperature rating in PIM, so there is no pressure filter.
 * - End Connection short codes show their full value (`Gr/Gr` → `Grooved`).
 */

export type PimProductGroup =
  | 'Commercial and industrial valves'
  | 'Reliable valves, risers, and controls'
  | 'Two-opening fittings';

/** Filter attributes per group, in panel order. Keys match `CrossReferenceFilters`. */
export type PimFilterAttribute = 'productTypes' | 'sizes' | 'endConnections' | 'materials' | 'certifications' | 'brands';

export const PIM_GROUP_FILTERS: Record<PimProductGroup, PimFilterAttribute[]> = {
  'Commercial and industrial valves': ['productTypes', 'sizes', 'endConnections', 'materials', 'certifications', 'brands'],
  'Reliable valves, risers, and controls': ['productTypes', 'sizes', 'endConnections', 'certifications', 'brands'],
  'Two-opening fittings': ['productTypes', 'sizes', 'endConnections', 'materials', 'certifications', 'brands'],
};

/** Product types used by the prototype sample data, spelled as Syndigo stores them. */
export const PIM_PRODUCT_TYPE_GROUP: Record<string, PimProductGroup> = {
  'Check Valve': 'Commercial and industrial valves', // FPPI, Gruvlok, Kennedy Valve, SCI
  'Check Valves': 'Reliable valves, risers, and controls', // Reliable; stays a separate type
  'Rigid Coupling': 'Two-opening fittings',
};

/** Panel labels: the page wording for each PIM field. */
export const PIM_FILTER_LABELS: Record<PimFilterAttribute, string> = {
  productTypes: 'Product type',
  sizes: 'Size',
  endConnections: 'End connection',
  materials: 'Material',
  certifications: 'Certifications',
  brands: 'Brand',
};

/** PIM column(s) behind each filter, for hand-off notes and tooltips. */
export const PIM_FILTER_COLUMNS: Record<PimFilterAttribute, string> = {
  productTypes: 'Product Type',
  sizes: 'Size 1 (Nominal Size.Dimension 1 / Nominal Pipe Size); Valve Size on Reliable valves',
  endConnections: 'End Connection 1 and 2; Valve End Connection on Reliable valves',
  materials: 'Body',
  certifications: 'UL Listed, FM Approved and the other 14 certification columns; Regulatory as fallback',
  brands: 'Product Brand',
};

const END_CONNECTION_CODES: Record<string, string> = { 'Gr/Gr': 'Grooved' };

/** Mapping rule: the End Connection line shows the full value, never the short code. */
export function endConnectionLabel(value: string): string {
  return END_CONNECTION_CODES[value] ?? value;
}

/** Mapping rule: one unit per end, shown once. Sample sizes are in inches. */
export function sizeLabel(value: string): string {
  return `${value} in`;
}

import type { PartSpecField, PartVariationRow } from '../partDetailDemoData';
import { variationSpecValue } from '../partDetailDemoData';

export const DISTINGUISHING_SPEC_KEYS = ['nominal-size', 'length', 'material', 'finish'] as const;

function normalizePimText(text: string): string {
  return text
    .toLowerCase()
    .replace(/["'`]/g, '')
    .replace(/\b(gal|galv|galvanized)\b/g, 'galv')
    .replace(/\b(at r|atr)\b/g, 'atr')
    .replace(/[^a-z0-9]/g, '');
}

/** PIM often repeats the same product text in name and description with minor abbreviations. */
export function isRedundantPimText(name: string, description: string): boolean {
  if (!name || !description) return true;
  if (name.trim() === description.trim()) return true;

  const normalizedName = normalizePimText(name);
  const normalizedDescription = normalizePimText(description);
  if (!normalizedName || !normalizedDescription) return true;
  if (normalizedName === normalizedDescription) return true;

  const shorter =
    normalizedName.length <= normalizedDescription.length ? normalizedName : normalizedDescription;
  const longer =
    normalizedName.length <= normalizedDescription.length ? normalizedDescription : normalizedName;

  return longer.includes(shorter) && shorter.length / longer.length >= 0.7;
}

export function compactSpecLine(variation: PartVariationRow): string {
  return DISTINGUISHING_SPEC_KEYS.map((key) => variationSpecValue(variation, key))
    .filter((value): value is string => Boolean(value))
    .join(' · ');
}

export function variationCardSubtitle(variation: PartVariationRow): string {
  if (isRedundantPimText(variation.name, variation.description)) {
    return compactSpecLine(variation);
  }
  const specLine = compactSpecLine(variation);
  return specLine ? `${variation.name} · ${specLine}` : variation.name;
}

export function variationSearchHaystack(variation: PartVariationRow): string {
  const specText = variation.specifications.map((spec) => `${spec.label} ${spec.value}`).join(' ');
  return [variation.sku, variation.name, variation.description, specText].join(' ').toLowerCase();
}

/** Identity fields already shown in the figure title or the SKU column. */
const HOIST_SKIP_KEYS = new Set(['sku', 'manufacturer', 'figure', 'configuration']);

export function isPlaceholderSpecValue(value: string): boolean {
  return /see variations|varies|per published|per cut sheet|stub/i.test(value);
}

export type VariationSpecColumn = {
  key: string;
  label: string;
};

/**
 * Specs identical on every variant belong on the figure.
 * Specs that differ become table columns.
 */
export function partitionVariationSpecs(variations: PartVariationRow[]): {
  uniform: PartSpecField[];
  varying: VariationSpecColumn[];
} {
  const grouped = new Map<string, { label: string; values: Set<string> }>();

  for (const variation of variations) {
    for (const spec of variation.specifications) {
      if (HOIST_SKIP_KEYS.has(spec.key)) continue;
      const entry = grouped.get(spec.key) ?? { label: spec.label, values: new Set<string>() };
      entry.values.add(spec.value);
      grouped.set(spec.key, entry);
    }
  }

  const uniform: PartSpecField[] = [];
  const varying: VariationSpecColumn[] = [];

  for (const [key, entry] of grouped) {
    const onlyValue = [...entry.values][0];
    if (entry.values.size <= 1 && onlyValue && !isPlaceholderSpecValue(onlyValue)) {
      uniform.push({ key, label: entry.label, value: onlyValue });
      continue;
    }
    if (entry.values.size > 1) {
      varying.push({ key, label: entry.label });
    }
  }

  return { uniform, varying };
}

export type VariantFigureContext = {
  figureNumber: string;
  productName: string;
  imageUrl?: string;
  brand?: string;
  /** Category path, outer to inner. */
  breadcrumb?: string[];
  figureSpecs: PartSpecField[];
};

export type VariantSelectionAction = 'pdf' | 'dwg' | 'step' | 'bom';

export function variantSelectionActionLabel(action: VariantSelectionAction): string {
  switch (action) {
    case 'pdf':
      return 'Download PDF files';
    case 'dwg':
      return 'Download DWG files';
    case 'step':
      return 'Download STEP files';
    case 'bom':
      return 'Add to BOM';
  }
}

export function variantSelectionModalTitle(action: VariantSelectionAction): string {
  switch (action) {
    case 'pdf':
      return 'Select variants for PDF download';
    case 'dwg':
      return 'Select variants for DWG download';
    case 'step':
      return 'Select variants for STEP download';
    case 'bom':
      return 'Select variants to add to BOM';
  }
}

export function fileTypeForSelectionAction(action: VariantSelectionAction): string | null {
  if (action === 'pdf') return 'PDF';
  if (action === 'dwg') return 'DWG';
  if (action === 'step') return 'STEP';
  return null;
}

export function isVariationEligibleForAction(
  variation: PartVariationRow,
  action: VariantSelectionAction,
): boolean {
  const fileType = fileTypeForSelectionAction(action);
  if (!fileType) return true;
  return variation.drawingFileTypes.includes(fileType);
}

import type { Key } from 'react';

import {
  isHistoryFigureRow,
  type HistoryFigureRow,
  type HistoryVariantRow,
} from './downloadHistoryRows';

export type ResolvedHistoryVariant = {
  partKey: string;
  variationKey: string;
  name: string;
  sku: string;
  figureNumber: string;
};

export type UnresolvedHistoryFigure = {
  partKey: string;
  name: string;
  figureNumber: string;
  sku: string;
  /** Variant keys already present in history for this figure (surfaced first in the resolver). */
  downloadedVariationKeys: string[];
};

export type HistorySelectionResolution = {
  /** Unique parent parts for Submittal (FR-11). */
  partKeys: string[];
  /** Concrete variants for BOM (FR-12). */
  variants: ResolvedHistoryVariant[];
  /** Selected parents with no selected child — variant still to be decided. */
  unresolvedFigures: UnresolvedHistoryFigure[];
};

function selectedSet(selectedKeys: readonly Key[]): Set<string> {
  return new Set(selectedKeys.map((key) => String(key)));
}

function toResolvedVariant(child: HistoryVariantRow): ResolvedHistoryVariant {
  return {
    partKey: child.partKey,
    variationKey: child.variationKey,
    name: child.name,
    sku: child.sku,
    figureNumber: child.figureNumber,
  };
}

/**
 * Mixed-granularity selection (FR-10 / Q-2).
 * A selected child suppresses its parent. A selected parent with no selected child
 * becomes an unresolved figure. Parent + own child collapses to the child.
 */
export function resolveSelection(
  rows: HistoryFigureRow[],
  selectedKeys: readonly Key[],
): HistorySelectionResolution {
  const selected = selectedSet(selectedKeys);
  const partKeys = new Set<string>();
  const variants: ResolvedHistoryVariant[] = [];
  const unresolvedFigures: UnresolvedHistoryFigure[] = [];

  for (const row of rows) {
    const children = row.children ?? [];
    const selectedChildren = children.filter((child) => selected.has(child.key));
    const parentSelected = selected.has(row.key);

    if (selectedChildren.length > 0) {
      partKeys.add(row.partKey);
      for (const child of selectedChildren) {
        variants.push(toResolvedVariant(child));
      }
      continue;
    }

    if (parentSelected) {
      partKeys.add(row.partKey);
      unresolvedFigures.push({
        partKey: row.partKey,
        name: row.name,
        figureNumber: row.figureNumber,
        sku: row.sku,
        downloadedVariationKeys: children.map((child) => child.variationKey),
      });
    }
  }

  return {
    partKeys: [...partKeys],
    variants,
    unresolvedFigures,
  };
}

export function countSelectedGranularity(
  rows: HistoryFigureRow[],
  selectedKeys: readonly Key[],
): { figureCount: number; variationCount: number } {
  const selected = selectedSet(selectedKeys);
  let figureCount = 0;
  let variationCount = 0;
  for (const row of rows) {
    if (selected.has(row.key)) figureCount += 1;
    for (const child of row.children ?? []) {
      if (selected.has(child.key)) variationCount += 1;
    }
  }
  return { figureCount, variationCount };
}

export function figureRowByPartKey(
  rows: HistoryFigureRow[],
  partKey: string,
): HistoryFigureRow | undefined {
  return rows.find((row) => row.partKey === partKey);
}

export { isHistoryFigureRow };

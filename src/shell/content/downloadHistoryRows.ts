import { resolveLeafPartById } from '../../catalog/productCatalogHierarchy.demo';
import type { DownloadHistoryEntry } from '../../search/revitDownloadQueue';

export type HistoryDownloader = {
  name: string;
  latestAt: string;
};

export type HistoryVariantRow = {
  key: string;
  rowKind: 'variant';
  partKey: string;
  variationKey: string;
  name: string;
  sku: string;
  figureNumber: string;
  thumbnailUrl?: string;
  formats: string[];
  latestAt: string;
  firstAt: string;
  occurrenceCount: number;
  downloadedBy: string;
  downloaders: HistoryDownloader[];
};

export type HistoryFigureRow = {
  key: string;
  rowKind: 'figure';
  partKey: string;
  name: string;
  figureNumber: string;
  sku: string;
  thumbnailUrl?: string;
  /** Figure-level formats only. Empty when the figure itself was never downloaded. */
  formats: string[];
  figureLevelDownloaded: boolean;
  latestAt: string;
  firstAt: string;
  occurrenceCount: number;
  downloaders: HistoryDownloader[];
  children?: HistoryVariantRow[];
};

export type HistoryTableRow = HistoryFigureRow | HistoryVariantRow;

export function historyVariantRowKey(partKey: string, variationKey: string): string {
  return `${partKey}::${variationKey}`;
}

export function isHistoryFigureRow(row: HistoryTableRow): row is HistoryFigureRow {
  return row.rowKind === 'figure';
}

function uniquePreserve(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.trim().toUpperCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function entryFormats(entry: DownloadHistoryEntry): string[] {
  if (entry.fileFormats && entry.fileFormats.length > 0) {
    return uniquePreserve(entry.fileFormats);
  }
  if (entry.fileType) return uniquePreserve([entry.fileType]);
  return [];
}

function compareIsoDesc(a: string, b: string): number {
  return new Date(b).getTime() - new Date(a).getTime();
}

function compareIsoAsc(a: string, b: string): number {
  return new Date(a).getTime() - new Date(b).getTime();
}

function rollupDownloaders(entries: DownloadHistoryEntry[]): HistoryDownloader[] {
  const latestByName = new Map<string, string>();
  for (const entry of entries) {
    const name = entry.downloadedBy?.trim();
    if (!name) continue;
    const previous = latestByName.get(name);
    if (!previous || compareIsoDesc(entry.queuedAt, previous) < 0) {
      latestByName.set(name, entry.queuedAt);
    }
  }
  return [...latestByName.entries()]
    .map(([name, latestAt]) => ({ name, latestAt }))
    .sort((a, b) => compareIsoDesc(a.latestAt, b.latestAt));
}

function buildVariantRow(partKey: string, variationKey: string, entries: DownloadHistoryEntry[]): HistoryVariantRow {
  const sorted = [...entries].sort((a, b) => compareIsoDesc(a.queuedAt, b.queuedAt));
  const latest = sorted[0];
  const earliest = [...entries].sort((a, b) => compareIsoAsc(a.queuedAt, b.queuedAt))[0];
  const downloaders = rollupDownloaders(entries);
  return {
    key: historyVariantRowKey(partKey, variationKey),
    rowKind: 'variant',
    partKey,
    variationKey,
    name: latest.displayName?.trim() || latest.fileName,
    sku: latest.sku,
    figureNumber: latest.figureNumber?.trim() || '',
    thumbnailUrl: latest.thumbnailUrl,
    formats: uniquePreserve(entries.flatMap(entryFormats)),
    latestAt: latest.queuedAt,
    firstAt: earliest.queuedAt,
    occurrenceCount: entries.length,
    downloadedBy: downloaders[0]?.name || latest.downloadedBy?.trim() || '',
    downloaders,
  };
}

/**
 * Two-level history projection (FR-7). Every part gets a parent row; variants never appear top-level.
 * Parents sort by latest occurrence across themselves and their children.
 */
export function buildDownloadHistoryRows(entries: DownloadHistoryEntry[]): HistoryFigureRow[] {
  const byPart = new Map<string, DownloadHistoryEntry[]>();
  for (const entry of entries) {
    const list = byPart.get(entry.partKey) ?? [];
    list.push(entry);
    byPart.set(entry.partKey, list);
  }

  const rows: HistoryFigureRow[] = [];

  for (const [partKey, partEntries] of byPart) {
    const figureEntries = partEntries.filter((entry) => !entry.variationKey);
    const variantEntries = partEntries.filter((entry) => Boolean(entry.variationKey));

    const variantGroups = new Map<string, DownloadHistoryEntry[]>();
    for (const entry of variantEntries) {
      const variationKey = entry.variationKey as string;
      const list = variantGroups.get(variationKey) ?? [];
      list.push(entry);
      variantGroups.set(variationKey, list);
    }

    const children = [...variantGroups.entries()]
      .map(([variationKey, group]) => buildVariantRow(partKey, variationKey, group))
      .sort((a, b) => compareIsoDesc(a.latestAt, b.latestAt));

    const figureLevelDownloaded = figureEntries.length > 0;
    const allForRollup = partEntries;
    const latestOverall = [...allForRollup].sort((a, b) => compareIsoDesc(a.queuedAt, b.queuedAt))[0];
    const firstOverall = [...allForRollup].sort((a, b) => compareIsoAsc(a.queuedAt, b.queuedAt))[0];
    const figureLatest = figureLevelDownloaded
      ? [...figureEntries].sort((a, b) => compareIsoDesc(a.queuedAt, b.queuedAt))[0]
      : undefined;
    const catalogPart = resolveLeafPartById(partKey)?.part;
    const parentName =
      catalogPart?.name ||
      (figureLatest ?? latestOverall).displayName?.trim() ||
      (figureLatest ?? latestOverall).fileName;
    const parentFigure =
      catalogPart?.figureNumber ||
      (figureLatest ?? latestOverall).figureNumber?.trim() ||
      (figureLatest ?? latestOverall).sku;

    const row: HistoryFigureRow = {
      key: partKey,
      rowKind: 'figure',
      partKey,
      name: parentName,
      figureNumber: parentFigure,
      sku: (figureLatest ?? latestOverall).sku,
      thumbnailUrl: (figureLatest ?? latestOverall).thumbnailUrl,
      formats: uniquePreserve(figureEntries.flatMap(entryFormats)),
      figureLevelDownloaded,
      latestAt: latestOverall.queuedAt,
      firstAt: figureLevelDownloaded
        ? [...figureEntries].sort((a, b) => compareIsoAsc(a.queuedAt, b.queuedAt))[0].queuedAt
        : firstOverall.queuedAt,
      occurrenceCount: figureEntries.length,
      downloaders: rollupDownloaders(allForRollup),
      /** Variants inherit the parent figure number so the Figure Number column is never blank. */
      children:
        children.length > 0
          ? children.map((child) =>
              child.figureNumber ? child : { ...child, figureNumber: parentFigure },
            )
          : undefined,
    };

    rows.push(row);
  }

  return rows.sort((a, b) => compareIsoDesc(a.latestAt, b.latestAt));
}

export function findHistoryRow(
  rows: HistoryFigureRow[],
  key: string,
): HistoryTableRow | undefined {
  for (const row of rows) {
    if (row.key === key) return row;
    const child = row.children?.find((item) => item.key === key);
    if (child) return child;
  }
  return undefined;
}

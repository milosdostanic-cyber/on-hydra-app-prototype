import {
  FEATURED_PARTS_MAX,
  FEATURED_PARTS_MIN,
  catalogPartByKey,
  type CatalogPartRow,
} from './catalogDemoData';

const STORAGE_KEY = 'hydra.featuredPartKeys.v1';
const CHANGE_EVENT = 'hydra-featured-parts-changed';

/** Shipped demo order when admin has never saved (no `localStorage` entry). */
export const DEFAULT_FEATURED_PART_KEYS: readonly string[] = [
  'p-100',
  'p-200',
  'p-300',
  'p-400',
  'p-500',
  'p-600',
  'p-700',
  'p-800',
  'p-900',
  'p-1000',
  'p-2011',
  'p-2012',
  'p-2013',
  'p-2014',
  'p-2015',
  'p-2016',
  'p-2017',
  'p-2018',
  'p-2019',
  'p-2020',
  'p-2021',
  'p-2022',
  'p-2023',
  'p-2024',
  'p-2025',
  'p-2026',
  'p-2027',
  'p-2028',
  'p-2029',
  'p-2030',
];

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readFeaturedKeysRawSnapshot(): string {
  if (!isBrowser()) return '__default__';
  return localStorage.getItem(STORAGE_KEY) ?? '__default__';
}

/** Parse persisted or sentinel snapshot into ordered part keys (may be empty). */
export function parseFeaturedKeysFromSnapshot(raw: string): string[] {
  if (raw === '__default__') return [...DEFAULT_FEATURED_PART_KEYS];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [...DEFAULT_FEATURED_PART_KEYS];
    return v.filter((x): x is string => typeof x === 'string');
  } catch {
    return [...DEFAULT_FEATURED_PART_KEYS];
  }
}

export function resolveFeaturedCatalogRows(keys: string[]): CatalogPartRow[] {
  const seen = new Set<string>();
  const rows: CatalogPartRow[] = [];
  for (const k of keys) {
    if (rows.length >= FEATURED_PARTS_MAX) break;
    if (seen.has(k)) continue;
    const row = catalogPartByKey(k);
    if (row) {
      seen.add(k);
      rows.push(row);
    }
  }
  return rows;
}

/** Resolve public featured rows from a storage snapshot string (for React external store). */
export function getPublicFeaturedRowsForSnapshot(raw: string): CatalogPartRow[] {
  const keys = parseFeaturedKeysFromSnapshot(raw);
  const rows = resolveFeaturedCatalogRows(keys);
  if (rows.length < FEATURED_PARTS_MIN) return [];
  return rows;
}

/** Consumer catalog home: ordered featured rows; empty if fewer than PRD minimum resolve. */
export function getPublicFeaturedCatalogRows(): CatalogPartRow[] {
  return getPublicFeaturedRowsForSnapshot(readFeaturedKeysRawSnapshot());
}

export function persistFeaturedPartKeys(keys: string[]): void {
  if (!isBrowser()) return;
  const normalized = keys.slice(0, FEATURED_PARTS_MAX);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeFeaturedPartsKeys(listener: () => void): () => void {
  if (!isBrowser()) return () => {};
  const fn = () => listener();
  window.addEventListener(CHANGE_EVENT, fn);
  window.addEventListener('storage', fn);
  return () => {
    window.removeEventListener(CHANGE_EVENT, fn);
    window.removeEventListener('storage', fn);
  };
}

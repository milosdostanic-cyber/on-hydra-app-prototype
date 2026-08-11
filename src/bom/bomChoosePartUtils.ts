import {
  ASC_BROWSER_PRODUCTS,
  type AscBrowserProductRow,
} from './data/ascBrowserProducts';
import { mockAscParts } from './data/mockData';
import type { AscCatalogPart, BomItem, BomMatchResult } from './data/types';

export function ascBrowserRowToCatalogPart(row: AscBrowserProductRow): AscCatalogPart {
  const existing = mockAscParts.find((p) => p.partNumber === row.ascNumber);
  if (existing) return { ...existing, matchConfidence: 92 };
  return {
    partNumber: row.ascNumber,
    productFamily: row.partType,
    description: row.description,
    dimensions: row.size,
    pressureRating: '300 PSI',
    connectionType: 'Grooved',
    approvals: ['UL Listed'],
    matchConfidence: 85,
    matchedAttributes: [],
    ignoredAttributes: [],
    conversionRule: 'Manual catalog selection',
    substitutionRisk: 'low',
    figureNumber: row.figureNumber,
    matchLevel: 'sku',
  };
}

/** Curated ASC browser rows to orient users when no match is suggested. */
export function getBomChooseFeaturedProducts(): AscBrowserProductRow[] {
  const categories: AscBrowserProductRow['browserCategory'][] = [
    'pre-engineered',
    'individual-parts',
    'quantity-parts',
  ];
  const featured: AscBrowserProductRow[] = [];
  for (const category of categories) {
    const row = ASC_BROWSER_PRODUCTS.find((p) => p.browserCategory === category);
    if (row) featured.push(row);
  }
  return featured.slice(0, 6);
}

export function filterAscBrowserProducts(query: string): AscBrowserProductRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return ASC_BROWSER_PRODUCTS;
  return ASC_BROWSER_PRODUCTS.filter(
    (p) =>
      p.description.toLowerCase().includes(q) ||
      p.ascNumber.toLowerCase().includes(q) ||
      p.figureNumber.toLowerCase().includes(q) ||
      p.partType.toLowerCase().includes(q) ||
      p.mfr.toLowerCase().includes(q),
  );
}

/** Seed catalog search from the imported line when opening the picker. */
export function buildBomChoosePartSearchQuery(
  matchRow: BomMatchResult | null | undefined,
  parsedItem?: BomItem,
): string {
  const fromParsed =
    parsedItem?.parsedDescription?.trim() ||
    parsedItem?.figureNumber?.trim() ||
    parsedItem?.sku?.trim() ||
    parsedItem?.category?.trim();
  return fromParsed || matchRow?.originalRequest?.trim() || '';
}

/** Hide parts already shown as match suggestions on the review screen. */
export function excludeSuggestedBrowserProducts(
  products: AscBrowserProductRow[],
  suggestedParts: AscCatalogPart[],
): AscBrowserProductRow[] {
  if (suggestedParts.length === 0) return products;

  const excludeKeys = new Set<string>();
  for (const part of suggestedParts) {
    if (part.partNumber) excludeKeys.add(part.partNumber.toLowerCase());
    if (part.figureNumber) excludeKeys.add(part.figureNumber.toLowerCase());
  }

  return products.filter(
    (p) =>
      !excludeKeys.has(p.ascNumber.toLowerCase()) &&
      !excludeKeys.has(p.figureNumber.toLowerCase()),
  );
}

const CHOOSE_ALTERNATIVE_LIMIT = 3;

/** Ranked catalog alternatives for "Choose different part" — excludes review suggestions. */
export function getBomChooseAlternativeProducts(
  matchRow: BomMatchResult | null | undefined,
  parsedItem: BomItem | undefined,
  suggestedParts: AscCatalogPart[],
  limit = CHOOSE_ALTERNATIVE_LIMIT,
): AscBrowserProductRow[] {
  const seed = buildBomChoosePartSearchQuery(matchRow, parsedItem);
  const excluded = excludeSuggestedBrowserProducts(ASC_BROWSER_PRODUCTS, suggestedParts);

  let ranked = seed.trim()
    ? excludeSuggestedBrowserProducts(filterAscBrowserProducts(seed), suggestedParts)
    : excluded;

  if (ranked.length < limit) {
    const seen = new Set(ranked.map((p) => p.key));
    for (const product of excluded) {
      if (ranked.length >= limit) break;
      if (!seen.has(product.key)) {
        ranked.push(product);
        seen.add(product.key);
      }
    }
  }

  return ranked.slice(0, limit);
}

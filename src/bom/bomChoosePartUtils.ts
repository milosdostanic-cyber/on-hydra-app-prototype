import {
  ASC_BROWSER_PRODUCTS,
  type AscBrowserProductRow,
} from './data/ascBrowserProducts';
import { mockAscParts } from './data/mockData';
import type { AscCatalogPart } from './data/types';

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

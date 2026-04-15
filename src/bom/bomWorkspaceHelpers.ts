import { mockAscParts } from './data/mockData';
import type { AscCatalogPart, BomItem } from './data/types';

export function suggestedAscPartForRow(row: BomItem): AscCatalogPart {
  const text = `${row.parsedDescription} ${row.category ?? ''}`.toLowerCase();
  if (text.includes('coupling') || text.includes('firelok') || text.includes('firelock')) return mockAscParts[0];
  if (text.includes('sprinkler')) return mockAscParts[1];
  return mockAscParts[2];
}

export function isWorkspaceRowConfirmed(row: BomItem): boolean {
  return row.status === 'confirmed';
}

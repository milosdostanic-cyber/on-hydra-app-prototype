import type { BomItem, BomParsingReviewColumnProfile } from './data/types';

export type ParsingReviewAlertContent = {
  type: 'success' | 'info' | 'warning';
  message: string;
  description: string;
};

function isBlank(value: string | undefined): boolean {
  return !value?.trim();
}

function hasSizeValue(size: string | undefined): boolean {
  const trimmed = size?.trim();
  if (!trimmed) return false;
  return /\d/.test(trimmed);
}

type IssueKey =
  | 'low confidence'
  | 'missing parsed description'
  | 'missing SKU'
  | 'missing UPC'
  | 'missing figure number'
  | 'missing manufacturer'
  | 'missing size'
  | 'quantity is zero';

const ISSUE_LABEL: Record<IssueKey, string> = {
  'low confidence': 'low parse confidence',
  'missing parsed description': 'missing parsed description',
  'missing SKU': 'missing SKU',
  'missing UPC': 'missing UPC',
  'missing figure number': 'missing figure number',
  'missing manufacturer': 'missing manufacturer',
  'missing size': 'missing size',
  'quantity is zero': 'quantity is 0',
};

function issuesForRow(row: BomItem, profile: BomParsingReviewColumnProfile): IssueKey[] {
  const issues: IssueKey[] = [];

  if (row.confidence === 'low') issues.push('low confidence');

  // Original description is read-only in Figma (source file); only parsed output is corrected here.
  if (profile === 'description' && isBlank(row.parsedDescription)) {
    issues.push('missing parsed description');
  }

  if ((profile === 'description' || profile === 'sku-only' || profile === 'upc') && isBlank(row.sku)) {
    issues.push('missing SKU');
  }

  if ((profile === 'description' || profile === 'upc') && isBlank(row.upc)) {
    issues.push('missing UPC');
  }

  if (isBlank(row.figureNumber)) issues.push('missing figure number');
  if (isBlank(row.manufacturer)) issues.push('missing manufacturer');
  if (!hasSizeValue(row.size)) issues.push('missing size');
  if (!row.quantity || row.quantity <= 0) issues.push('quantity is zero');

  return issues;
}

function profileReadyMessage(profile: BomParsingReviewColumnProfile): string {
  if (profile === 'sku-only') {
    return 'SKU, size, manufacturer, and figure number are filled for every row shown below.';
  }
  if (profile === 'upc') {
    return 'UPC, SKU, and supporting attributes are filled for every row shown below.';
  }
  return 'Descriptions, SKU, UPC, and supporting fields are filled for every row shown below.';
}

function profileColumnHint(profile: BomParsingReviewColumnProfile): string {
  if (profile === 'sku-only') return 'SKU-focused columns';
  if (profile === 'upc') return 'UPC + SKU columns';
  return 'description + identifier columns';
}

/** Banner copy driven by the active parsing table profile and row values. */
export function summarizeParsingReviewAlert(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): ParsingReviewAlertContent {
  const count = rows.length;
  const message = `${count} item${count === 1 ? '' : 's'} parsed`;

  const issueCounts = new Map<IssueKey, number>();
  let rowsWithIssues = 0;

  for (const row of rows) {
    const rowIssues = issuesForRow(row, profile);
    if (rowIssues.length === 0) continue;
    rowsWithIssues += 1;
    for (const key of rowIssues) {
      issueCounts.set(key, (issueCounts.get(key) ?? 0) + 1);
    }
  }

  if (rowsWithIssues === 0) {
    return {
      type: 'success',
      message,
      description: `${profileReadyMessage(profile)} Review ${profileColumnHint(profile)} before continuing to matching.`,
    };
  }

  const issueSummary = [...issueCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key, n]) => `${ISSUE_LABEL[key]} (${n})`)
    .join(' · ');

  return {
    type: 'warning',
    message,
    description: `${rowsWithIssues} row${rowsWithIssues === 1 ? '' : 's'} may need attention in the table below (${profileColumnHint(profile)}): ${issueSummary}.`,
  };
}

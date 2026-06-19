import type { BomItem, BomParsingReviewColumnProfile } from './data/types';

export type ParsingReviewAlertContent = {
  type: 'success' | 'info' | 'warning';
  message: string;
  description: string;
};

/** Rows with enough parsed detail vs rows that may match poorly (Matt: informational, not blocking). */
export type ParsingReviewMatchOutlook = {
  total: number;
  ready: number;
  limited: number;
};

export function parsingReviewMatchOutlook(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): ParsingReviewMatchOutlook {
  const total = rows.length;
  const limited = countParsingReviewWarnings(rows, profile);
  return { total, limited, ready: total - limited };
}

export type ParsingReviewField =
  | 'parsedDescription'
  | 'sku'
  | 'upc'
  | 'size'
  | 'manufacturer'
  | 'figureNumber'
  | 'quantity';

/** True when this editable cell is empty / invalid and should show warning chrome (Figma attention state). */
export function parsingReviewFieldNeedsAttention(
  row: BomItem,
  field: ParsingReviewField,
  profile: BomParsingReviewColumnProfile,
): boolean {
  switch (field) {
    case 'parsedDescription':
      return profile === 'description' && isBlank(row.parsedDescription);
    case 'sku':
      return (profile === 'description' || profile === 'sku-only' || profile === 'upc') && isBlank(row.sku);
    case 'upc':
      return (profile === 'description' || profile === 'upc') && isBlank(row.upc);
    case 'figureNumber':
      return isBlank(row.figureNumber);
    case 'manufacturer':
      return isBlank(row.manufacturer);
    case 'size':
      return !hasSizeValue(row.size);
    case 'quantity':
      return !row.quantity || row.quantity <= 0;
    default:
      return false;
  }
}

function rowNeedsAttention(row: BomItem, profile: BomParsingReviewColumnProfile): boolean {
  if (row.confidence === 'medium' || row.confidence === 'low') return true;
  return issuesForRow(row, profile).some((issue) => issue !== 'low confidence');
}

/** Rows the user should skim on parsing review (uncertain parse or missing attributes). */
export function countParsingReviewWarnings(
  rows: BomItem[],
  profile?: BomParsingReviewColumnProfile,
): number {
  if (!profile) {
    return rows.filter((r) => r.confidence === 'medium' || r.confidence === 'low').length;
  }
  return rows.filter((r) => rowNeedsAttention(r, profile)).length;
}

/** Short tag on the upload progress bar — plain language, no spreadsheet jargon. */
export function parsingReviewProgressStatusLabel(
  rows: BomItem[],
  profile?: BomParsingReviewColumnProfile,
): string {
  const count = rows.length;
  const review = countParsingReviewWarnings(rows, profile);
  const items = `${count} item${count === 1 ? '' : 's'}`;
  if (review === 0) return `${items} ready`;
  return `${items} · ${review} to review (optional)`;
}

export type ParsingReviewQualityCounts = {
  high: number;
  medium: number;
  low: number;
  total: number;
};

export function parsingReviewQualityCounts(rows: BomItem[]): ParsingReviewQualityCounts {
  return {
    high: rows.filter((r) => r.confidence === 'high').length,
    medium: rows.filter((r) => r.confidence === 'medium').length,
    low: rows.filter((r) => r.confidence === 'low').length,
    total: rows.length,
  };
}

/** Rows with weak or incomplete parsed data (medium/low confidence or missing attributes). */
export function isParsingReviewLowConfidenceRow(
  row: BomItem,
  profile: BomParsingReviewColumnProfile,
): boolean {
  if (row.confidence === 'medium' || row.confidence === 'low') return true;
  return issuesForRow(row, profile).length > 0;
}

export function filterParsingReviewLowConfidenceRows(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): BomItem[] {
  return rows.filter((row) => isParsingReviewLowConfidenceRow(row, profile));
}

/** Human-readable issue labels for a row (drawer / row summary). */
export function parsingReviewIssueLabels(
  row: BomItem,
  profile: BomParsingReviewColumnProfile,
): string[] {
  return issuesForRow(row, profile).map((key) => ISSUE_LABEL[key]);
}

const MISSING_FIELD_TAG_LABEL: Record<string, string> = {
  'missing description': 'Description',
  'missing SKU': 'SKU',
  'missing UPC': 'UPC',
  'missing figure number': 'Figure Number',
  'missing manufacturer': 'Manufacturer',
  'missing size': 'Size',
  'quantity is 0': 'Quantity',
};

function formatEnglishList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Warning tag above edit modal alert — Figma `Tag__Status` (`5506:187527`). */
export function parsingReviewMissingFieldsTag(
  row: BomItem,
  profile: BomParsingReviewColumnProfile,
): string | null {
  const fields = parsingReviewIssueLabels(row, profile)
    .filter((label) => label !== 'low confidence')
    .map((label) => MISSING_FIELD_TAG_LABEL[label] ?? label);

  if (fields.length === 0) return null;
  return `Missing: ${formatEnglishList(fields)}`;
}

/** Primary parsing-review banner — non-blocking language per PRD / Matt transcript. */
export function parsingReviewQualityAlert(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): ParsingReviewAlertContent {
  const outlook = parsingReviewMatchOutlook(rows, profile);

  if (outlook.limited === 0) {
    return {
      type: 'success',
      message: 'Ready for matching',
      description: `All ${outlook.total} line${outlook.total === 1 ? '' : 's'} have enough detail for accurate matching. Continue when you are ready.`,
    };
  }

  return {
    type: 'warning',
    message: 'Some lines are missing detail — you can still continue without updating',
    description: `${outlook.ready} of ${outlook.total} line${outlook.total === 1 ? '' : 's'} have enough detail for accurate matching. ${outlook.limited} line${outlook.limited === 1 ? ' is' : 's are'} missing information (highlighted below) — we may not suggest a strong ASC match for those. Use Add info if you have more details, or continue and expect weaker matches on those lines.`,
  };
}

/** @deprecated Use {@link parsingReviewQualityAlert} — kept for any legacy callers. */
export function figmaParsingReviewAlert(
  rows: BomItem[],
  profile?: BomParsingReviewColumnProfile,
): ParsingReviewAlertContent {
  if (!profile) {
    const review = countParsingReviewWarnings(rows);
    const count = rows.length;
    if (review === 0) {
      return { type: 'info', message: `${count} parts found`, description: 'All rows read successfully.' };
    }
    return {
      type: 'warning',
      message: `${count} parts found`,
      description: `${review} rows may need attention.`,
    };
  }
  return parsingReviewQualityAlert(rows, profile);
}

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
  'low confidence': 'low confidence',
  'missing parsed description': 'missing description',
  'missing SKU': 'missing SKU',
  'missing UPC': 'missing UPC',
  'missing figure number': 'missing figure number',
  'missing manufacturer': 'missing manufacturer',
  'missing size': 'missing size',
  'quantity is zero': 'quantity is 0',
};

const FIELD_ISSUE_KEYS: [ParsingReviewField, IssueKey][] = [
  ['parsedDescription', 'missing parsed description'],
  ['sku', 'missing SKU'],
  ['upc', 'missing UPC'],
  ['figureNumber', 'missing figure number'],
  ['manufacturer', 'missing manufacturer'],
  ['size', 'missing size'],
  ['quantity', 'quantity is zero'],
];

function issuesForRow(row: BomItem, profile: BomParsingReviewColumnProfile): IssueKey[] {
  const issues: IssueKey[] = [];

  if (row.confidence === 'low') issues.push('low confidence');

  for (const [field, key] of FIELD_ISSUE_KEYS) {
    if (parsingReviewFieldNeedsAttention(row, field, profile)) issues.push(key);
  }

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
  const message = `${count} part${count === 1 ? '' : 's'} found`;

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

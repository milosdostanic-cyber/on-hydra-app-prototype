import type { BomItem, BomParsingReviewColumnProfile, BomParsingRowSeverity } from './data/types';

export type ParsingReviewAlertContent = {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  description: string;
};

/** Rows with enough parsed detail vs rows that may match poorly vs unusable. */
export type ParsingReviewMatchOutlook = {
  total: number;
  ready: number;
  /** Warning-only rows (degraded but still matchable). */
  limited: number;
  /** Error rows — no trustworthy identifier remains. */
  unusable: number;
  /** limited + unusable (anything that needs a look). */
  attention: number;
};

export type ParsingReviewField =
  | 'parsedDescription'
  | 'sku'
  | 'upc'
  | 'size'
  | 'manufacturer'
  | 'figureNumber'
  | 'quantity';

function isBlank(value: string | undefined): boolean {
  return !value?.trim();
}

function hasSizeValue(size: string | undefined): boolean {
  const trimmed = size?.trim();
  if (!trimmed) return false;
  return /\d/.test(trimmed);
}

/** UPC scientific-notation/invalid status is relevant only when UPC is shown. */
export function parsingReviewHasUpcIssue(
  row: BomItem,
  profile: BomParsingReviewColumnProfile,
): boolean {
  return profile !== 'sku-only' && Boolean(row.upcParseIssue);
}

/** True when this editable cell is empty/invalid or is the affected UPC cell. */
export function parsingReviewFieldNeedsAttention(
  row: BomItem,
  field: ParsingReviewField,
  profile: BomParsingReviewColumnProfile,
): boolean {
  switch (field) {
    case 'parsedDescription':
      return profile === 'description' && isBlank(row.parsedDescription);
    case 'sku':
      return isBlank(row.sku);
    case 'upc':
      return profile !== 'sku-only' && (isBlank(row.upc) || Boolean(row.upcParseIssue));
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

function hasAlternativeIdentifier(row: BomItem, profile: BomParsingReviewColumnProfile): boolean {
  if (profile === 'upc') return !isBlank(row.sku);
  if (profile === 'description') {
    return !isBlank(row.parsedDescription) || !isBlank(row.sku);
  }
  return true;
}

function rowHasExistingWarning(row: BomItem, profile: BomParsingReviewColumnProfile): boolean {
  if (row.confidence === 'medium' || row.confidence === 'low') return true;
  return issuesForRow(row, profile).some((issue) => issue !== 'low confidence');
}

/** Error is UPC-specific: partial/invalid UPC with no other usable identifier. */
export function parsingReviewRowSeverity(
  row: BomItem,
  profile: BomParsingReviewColumnProfile,
): BomParsingRowSeverity {
  if (parsingReviewHasUpcIssue(row, profile)) {
    return hasAlternativeIdentifier(row, profile) ? 'warning' : 'error';
  }
  return rowHasExistingWarning(row, profile) ? 'warning' : 'ok';
}

export function parsingReviewMatchOutlook(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): ParsingReviewMatchOutlook {
  const total = rows.length;
  let limited = 0;
  let unusable = 0;
  for (const row of rows) {
    const severity = parsingReviewRowSeverity(row, profile);
    if (severity === 'error') unusable += 1;
    else if (severity === 'warning') limited += 1;
  }
  return {
    total,
    limited,
    unusable,
    attention: limited + unusable,
    ready: total - limited - unusable,
  };
}

function rowNeedsAttention(row: BomItem, profile: BomParsingReviewColumnProfile): boolean {
  return parsingReviewRowSeverity(row, profile) !== 'ok';
}

/** Rows the user should skim on parsing review (uncertain parse, missing, or unusable). */
export function countParsingReviewWarnings(
  rows: BomItem[],
  profile?: BomParsingReviewColumnProfile,
): number {
  if (!profile) {
    return rows.filter((r) => r.confidence === 'medium' || r.confidence === 'low').length;
  }
  return rows.filter((r) => rowNeedsAttention(r, profile)).length;
}

export function countParsingReviewUnusable(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): number {
  return rows.filter((r) => parsingReviewRowSeverity(r, profile) === 'error').length;
}

export function countParsingReviewDegraded(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): number {
  return rows.filter((r) => parsingReviewRowSeverity(r, profile) === 'warning').length;
}

/** Short tag on the upload progress bar — plain language, no spreadsheet jargon. */
export function parsingReviewProgressStatusLabel(
  rows: BomItem[],
  profile?: BomParsingReviewColumnProfile,
): string {
  const count = rows.length;
  const items = `${count} item${count === 1 ? '' : 's'}`;
  if (!profile) {
    const review = countParsingReviewWarnings(rows);
    if (review === 0) return `${items} ready`;
    return `${items} · ${review} to review (optional)`;
  }
  const outlook = parsingReviewMatchOutlook(rows, profile);
  if (outlook.unusable > 0) {
    return `${items} · ${outlook.unusable} can't be matched`;
  }
  if (outlook.limited === 0) return `${items} ready`;
  return `${items} · ${outlook.limited} to review`;
}

export function parsingReviewProgressStatusTone(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): 'success' | 'warning' | 'error' {
  const outlook = parsingReviewMatchOutlook(rows, profile);
  if (outlook.unusable > 0) return 'error';
  if (outlook.limited > 0) return 'warning';
  return 'success';
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

/** Rows with weak or incomplete parsed data (warning or error severity). */
export function isParsingReviewLowConfidenceRow(
  row: BomItem,
  profile: BomParsingReviewColumnProfile,
): boolean {
  return parsingReviewRowSeverity(row, profile) !== 'ok';
}

export function isParsingReviewUnusableRow(
  row: BomItem,
  profile: BomParsingReviewColumnProfile,
): boolean {
  return parsingReviewRowSeverity(row, profile) === 'error';
}

export function filterParsingReviewLowConfidenceRows(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): BomItem[] {
  return rows.filter((row) => isParsingReviewLowConfidenceRow(row, profile));
}

export function filterParsingReviewUnusableRows(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): BomItem[] {
  return rows.filter((row) => isParsingReviewUnusableRow(row, profile));
}

export function filterParsingReviewDegradedRows(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): BomItem[] {
  return rows.filter((row) => parsingReviewRowSeverity(row, profile) === 'warning');
}

export type ParsingReviewAttentionFilter = 'all' | 'error' | 'warning';

export function filterParsingReviewByAttention(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
  filter: ParsingReviewAttentionFilter,
): BomItem[] {
  if (filter === 'error') return filterParsingReviewUnusableRows(rows, profile);
  if (filter === 'warning') return filterParsingReviewDegradedRows(rows, profile);
  return rows;
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
  'unreliable UPC': 'UPC',
};

function formatEnglishList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Tag above edit modal alert — Missing / Unreadable fields. */
export function parsingReviewMissingFieldsTag(
  row: BomItem,
  profile: BomParsingReviewColumnProfile,
): string | null {
  const fields = parsingReviewIssueLabels(row, profile)
    .filter((label) => label !== 'low confidence')
    .map((label) => MISSING_FIELD_TAG_LABEL[label] ?? label);

  if (fields.length === 0) return null;

  const severity = parsingReviewRowSeverity(row, profile);
  const unique = [...new Set(fields)];
  if (severity === 'error') {
    return `Can't match: ${formatEnglishList(unique)}`;
  }

  const hasUnreliable = parsingReviewHasUpcIssue(row, profile);
  if (hasUnreliable) {
    return `Unreadable: ${formatEnglishList(unique)}`;
  }
  return `Missing: ${formatEnglishList(unique)}`;
}

/** Primary parsing-review banner — non-blocking language per PRD / Matt transcript. */
export function parsingReviewQualityAlert(
  rows: BomItem[],
  profile: BomParsingReviewColumnProfile,
): ParsingReviewAlertContent {
  const outlook = parsingReviewMatchOutlook(rows, profile);

  if (outlook.unusable > 0) {
    const allUnusable = outlook.unusable === outlook.total;
    return {
      type: 'error',
      message: `${outlook.unusable} line${outlook.unusable === 1 ? '' : 's'} can't be matched`,
      description: allUnusable
        ? `None of the ${outlook.total} line${outlook.total === 1 ? '' : 's'} have information we can match against — the values we could read aren't complete enough to identify a part. Add a description, SKU, or UPC, or continue and they'll come through unmatched. You may also want to re-check column mapping.`
        : `${outlook.ready} of ${outlook.total} line${outlook.total === 1 ? '' : 's'} ${outlook.ready === 1 ? 'is' : 'are'} ready. ${outlook.unusable} line${outlook.unusable === 1 ? '' : 's'} don't have any information we can match against — the values we could read aren't complete enough to identify a part. Add a description, SKU, or UPC for those lines, or continue and they'll come through unmatched.`,
    };
  }

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

/** Tooltip / aria copy for the recovered or invalid UPC. */
export function parsingReviewUpcTooltip(row: BomItem): string {
  const issue = row.upcParseIssue;
  const parsed = row.upc?.trim();
  if (!issue) return parsed || 'Missing — we could not read this';
  const raw = issue.rawSource?.trim();

  if (issue.state === 'recovered') {
    if (raw && parsed) {
      return `Your file shows ${raw}. Spreadsheets shorten long numbers like this, so we could only recover ${parsed} — some digits are lost. This UPC may not identify the right part.`;
    }
    return 'This UPC is incomplete and may not identify the right part.';
  }

  return `${raw || parsed || 'This value'} isn't a valid UPC. We can't use it to identify a part.`;
}

/** Clear the parser issue only when the user changes or removes the affected UPC. */
export function clearFixedUpcParseIssue(
  row: BomItem,
  patch: Partial<BomItem>,
): BomItem['upcParseIssue'] {
  if (!('upc' in patch)) return row.upcParseIssue;
  const unchanged = (patch.upc ?? '').trim() === (row.upc ?? '').trim();
  return unchanged ? row.upcParseIssue : undefined;
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

type IssueKey =
  | 'low confidence'
  | 'missing parsed description'
  | 'missing SKU'
  | 'missing UPC'
  | 'missing figure number'
  | 'missing manufacturer'
  | 'missing size'
  | 'quantity is zero'
  | 'unreliable UPC';

const ISSUE_LABEL: Record<IssueKey, string> = {
  'low confidence': 'low confidence',
  'missing parsed description': 'missing description',
  'missing SKU': 'missing SKU',
  'missing UPC': 'missing UPC',
  'missing figure number': 'missing figure number',
  'missing manufacturer': 'missing manufacturer',
  'missing size': 'missing size',
  'quantity is zero': 'quantity is 0',
  'unreliable UPC': 'unreliable UPC',
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
    if (!parsingReviewFieldNeedsAttention(row, field, profile)) continue;
    if (field === 'upc' && row.upcParseIssue && !isBlank(row.upc)) {
      issues.push('unreliable UPC');
    } else {
      issues.push(key);
    }
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

  const hasError = rows.some((r) => parsingReviewRowSeverity(r, profile) === 'error');

  return {
    type: hasError ? 'error' : 'warning',
    message,
    description: `${rowsWithIssues} row${rowsWithIssues === 1 ? '' : 's'} may need attention in the table below (${profileColumnHint(profile)}): ${issueSummary}.`,
  };
}

